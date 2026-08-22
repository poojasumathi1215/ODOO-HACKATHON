const { db } = require('../database/database');
const { logAudit } = require('../utils/auditLogger');

class AlertService {
  /**
   * Creates a smart HR alert with duplicate check (prevents identical unresolved alerts)
   */
  createAlert({ employeeId, alertType, title, message, severity = 'Medium' }) {
    // Check if an unresolved alert of the same type already exists for this employee
    const existing = db.prepare(`
      SELECT id FROM smart_alerts 
      WHERE (employee_id = ? OR (employee_id IS NULL AND ? IS NULL)) 
        AND alert_type = ? 
        AND is_resolved = 0
    `).get(employeeId || null, employeeId || null, alertType);

    if (existing) {
      // Alert already active, return existing
      return db.prepare('SELECT * FROM smart_alerts WHERE id = ?').get(existing.id);
    }

    const stmt = db.prepare(`
      INSERT INTO smart_alerts (employee_id, alert_type, title, message, severity, is_resolved, created_at)
      VALUES (?, ?, ?, ?, ?, 0, DATETIME('now'))
    `);
    const res = stmt.run(employeeId || null, alertType, title, message, severity);
    const alertId = res.lastInsertRowid;

    // Send notification to HR
    const hrUsers = db.prepare(`SELECT id FROM users WHERE role = 'HR'`).all();
    hrUsers.forEach(hr => {
      db.prepare(`
        INSERT INTO notifications (user_id, title, message, type, is_read, created_at)
        VALUES (?, ?, ?, 'Alert', 0, DATETIME('now'))
      `).run(hr.id, `Smart Alert: ${title}`, message);
    });

    return db.prepare('SELECT * FROM smart_alerts WHERE id = ?').get(alertId);
  }

  /**
   * Retrieves alerts with HR filtering & pagination
   */
  getAlerts({ alertType, severity, isResolved, departmentId, employeeId, page = 1, limit = 20 } = {}) {
    let baseSql = `
      FROM smart_alerts a
      LEFT JOIN employees e ON a.employee_id = e.id
      LEFT JOIN users u ON e.user_id = u.id
      LEFT JOIN departments d ON e.department_id = d.id
      LEFT JOIN users res ON a.resolved_by = res.id
      WHERE 1=1
    `;
    const params = [];

    if (alertType) {
      baseSql += ' AND a.alert_type = ?';
      params.push(alertType);
    }
    if (severity) {
      baseSql += ' AND a.severity = ?';
      params.push(severity);
    }
    if (isResolved !== undefined && isResolved !== '') {
      baseSql += ' AND a.is_resolved = ?';
      params.push(isResolved === 'true' || isResolved === 1 || isResolved === '1' ? 1 : 0);
    }
    if (departmentId) {
      baseSql += ' AND e.department_id = ?';
      params.push(departmentId);
    }
    if (employeeId) {
      baseSql += ' AND a.employee_id = ?';
      params.push(employeeId);
    }

    const countRow = db.prepare(`SELECT COUNT(*) as count ${baseSql}`).get(...params);
    const total = countRow ? countRow.count : 0;

    const parsedLimit = parseInt(limit, 10);
    const parsedPage = parseInt(page, 10);
    const offset = (parsedPage - 1) * parsedLimit;

    const dataSql = `
      SELECT a.*, e.employee_id as emp_code, u.name as employee_name, u.email as employee_email,
             d.name as department_name, res.name as resolved_by_name
      ${baseSql}
      ORDER BY a.is_resolved ASC, 
        CASE a.severity WHEN 'High' THEN 1 WHEN 'Medium' THEN 2 WHEN 'Low' THEN 3 ELSE 4 END,
        a.created_at DESC
      LIMIT ? OFFSET ?
    `;

    const records = db.prepare(dataSql).all(...params, parsedLimit, offset);

    return {
      records,
      total,
      page: parsedPage,
      totalPages: Math.ceil(total / parsedLimit) || 1,
      limit: parsedLimit
    };
  }

  /**
   * Retrieves single alert by ID
   */
  getAlertById(id) {
    return db.prepare(`
      SELECT a.*, e.employee_id as emp_code, u.name as employee_name, u.email as employee_email,
             d.name as department_name, res.name as resolved_by_name
      FROM smart_alerts a
      LEFT JOIN employees e ON a.employee_id = e.id
      LEFT JOIN users u ON e.user_id = u.id
      LEFT JOIN departments d ON e.department_id = d.id
      LEFT JOIN users res ON a.resolved_by = res.id
      WHERE a.id = ?
    `).get(id);
  }

  /**
   * Resolves an alert
   */
  resolveAlert(alertId, resolvedByUserId) {
    const alert = db.prepare('SELECT * FROM smart_alerts WHERE id = ?').get(alertId);
    if (!alert) {
      const err = new Error('Alert not found.');
      err.status = 404;
      throw err;
    }

    if (alert.is_resolved) {
      const err = new Error('Alert is already marked as resolved.');
      err.status = 400;
      throw err;
    }

    db.prepare(`
      UPDATE smart_alerts
      SET is_resolved = 1, resolved_by = ?, resolved_at = DATETIME('now')
      WHERE id = ?
    `).run(resolvedByUserId, alertId);

    logAudit(resolvedByUserId, 'ALERT_RESOLVE', 'SMART_ALERT', alertId, `Resolved ${alert.alert_type} alert: ${alert.title}`);

    return db.prepare('SELECT * FROM smart_alerts WHERE id = ?').get(alertId);
  }

  /**
   * Automated scan to detect patterns and generate smart alerts
   */
  scanAndGenerateSmartAlerts() {
    const activeEmployees = db.prepare(`SELECT id, employee_id FROM employees WHERE employment_status = 'Active'`).all();
    const past14Days = new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

    activeEmployees.forEach(emp => {
      // 1. Check Repeated Absences in past 14 days (>= 2)
      const absCount = db.prepare(`
        SELECT COUNT(*) as count FROM attendance
        WHERE employee_id = ? AND date >= ? AND status = 'Absent'
      `).get(emp.id, past14Days).count;

      if (absCount >= 2) {
        this.createAlert({
          employeeId: emp.id,
          alertType: 'Repeated Absences',
          title: `Repeated Absences Detected (${absCount} days)`,
          message: `Employee ${emp.employee_id} has logged ${absCount} unexcused absences in the last 14 days.`,
          severity: absCount >= 3 ? 'High' : 'Medium'
        });
      }

      // 2. Check Late Arrival Pattern (>= 3 in 14 days)
      const lateCount = db.prepare(`
        SELECT COUNT(*) as count FROM attendance
        WHERE employee_id = ? AND date >= ? AND status = 'Late'
      `).get(emp.id, past14Days).count;

      if (lateCount >= 3) {
        this.createAlert({
          employeeId: emp.id,
          alertType: 'Late Arrival Pattern',
          title: `Frequent Late Arrivals (${lateCount} times)`,
          message: `Employee ${emp.employee_id} recorded ${lateCount} late arrivals in the past 14 days.`,
          severity: 'Medium'
        });
      }
    });

    return { success: true, message: 'Smart alerts scan completed.' };
  }
}

module.exports = new AlertService();
