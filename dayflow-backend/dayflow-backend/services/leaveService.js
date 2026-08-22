const { db } = require('../database/database');
const { calculateWorkingDays } = require('../utils/dateUtils');
const { logAudit } = require('../utils/auditLogger');

class LeaveService {
  /**
   * Applies for a new leave
   */
  applyLeave({ employeeId, leaveType, startDate, endDate, reason }) {
    if (new Date(startDate) > new Date(endDate)) {
      const err = new Error('Start date cannot be after end date.');
      err.status = 400;
      throw err;
    }

    const currentYear = new Date(startDate).getFullYear();
    const daysRequested = calculateWorkingDays(startDate, endDate);

    if (daysRequested <= 0) {
      const err = new Error('Leave request must contain at least 1 working day.');
      err.status = 400;
      throw err;
    }

    // Check Leave Balance
    let balance = db.prepare(`
      SELECT * FROM leave_balances 
      WHERE employee_id = ? AND leave_type = ? AND year = ?
    `).get(employeeId, leaveType, currentYear);

    // If balance record does not exist for this year, create default
    if (!balance) {
      const defaultTotal = leaveType === 'Annual Leave' ? 18 : leaveType === 'Casual Leave' ? 12 : leaveType === 'Sick Leave' ? 10 : 5;
      const initBal = db.prepare(`
        INSERT INTO leave_balances (employee_id, leave_type, total_days, used_days, remaining_days, year, created_at, updated_at)
        VALUES (?, ?, ?, 0, ?, ?, DATETIME('now'), DATETIME('now'))
      `).run(employeeId, leaveType, defaultTotal, defaultTotal, currentYear);
      balance = db.prepare('SELECT * FROM leave_balances WHERE id = ?').get(initBal.lastInsertRowid);
    }

    if (balance.remaining_days < daysRequested) {
      const err = new Error(`Insufficient leave balance. You have ${balance.remaining_days} days remaining for ${leaveType}, but requested ${daysRequested} days.`);
      err.status = 400;
      throw err;
    }

    // Check for overlapping leaves
    const overlap = db.prepare(`
      SELECT id FROM leaves 
      WHERE employee_id = ? 
        AND status IN ('Pending', 'Approved')
        AND NOT (end_date < ? OR start_date > ?)
    `).get(employeeId, startDate, endDate);

    if (overlap) {
      const err = new Error('You already have a pending or approved leave request overlapping these dates.');
      err.status = 400;
      throw err;
    }

    const insertStmt = db.prepare(`
      INSERT INTO leaves (employee_id, leave_type, start_date, end_date, reason, status, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, 'Pending', DATETIME('now'), DATETIME('now'))
    `);
    const res = insertStmt.run(employeeId, leaveType, startDate, endDate, reason);
    const leaveId = res.lastInsertRowid;

    // Send Notification to HR admins
    const hrUsers = db.prepare(`SELECT id FROM users WHERE role = 'HR'`).all();
    const empInfo = db.prepare(`
      SELECT u.name, e.employee_id FROM employees e JOIN users u ON e.user_id = u.id WHERE e.id = ?
    `).get(employeeId);

    hrUsers.forEach(hr => {
      db.prepare(`
        INSERT INTO notifications (user_id, title, message, type, is_read, created_at)
        VALUES (?, ?, ?, 'Leave', 0, DATETIME('now'))
      `).run(
        hr.id,
        'New Leave Request',
        `${empInfo.name} (${empInfo.employee_id}) requested ${daysRequested} day(s) of ${leaveType} from ${startDate} to ${endDate}.`
      );
    });

    return db.prepare('SELECT * FROM leaves WHERE id = ?').get(leaveId);
  }

  /**
   * Approves a pending leave
   */
  approveLeave(leaveId, reviewedByUserId) {
    const leave = db.prepare(`
      SELECT l.*, e.user_id, u.name as employee_name, e.id as emp_id
      FROM leaves l
      JOIN employees e ON l.employee_id = e.id
      JOIN users u ON e.user_id = u.id
      WHERE l.id = ?
    `).get(leaveId);

    if (!leave) {
      const err = new Error('Leave request not found.');
      err.status = 404;
      throw err;
    }

    if (leave.status !== 'Pending') {
      const err = new Error(`Cannot approve leave with status '${leave.status}'.`);
      err.status = 400;
      throw err;
    }

    const year = new Date(leave.start_date).getFullYear();
    const requestedDays = calculateWorkingDays(leave.start_date, leave.end_date);

    const approveTx = db.transaction(() => {
      // 1. Update Leave Record
      db.prepare(`
        UPDATE leaves 
        SET status = 'Approved', reviewed_by = ?, reviewed_at = DATETIME('now'), updated_at = DATETIME('now')
        WHERE id = ?
      `).run(reviewedByUserId, leaveId);

      // 2. Deduct Balance
      db.prepare(`
        UPDATE leave_balances 
        SET used_days = used_days + ?, remaining_days = remaining_days - ?, updated_at = DATETIME('now')
        WHERE employee_id = ? AND leave_type = ? AND year = ?
      `).run(requestedDays, requestedDays, leave.employee_id, leave.leave_type, year);

      // 3. Synchronize with attendance for working days in range
      const start = new Date(leave.start_date);
      const end = new Date(leave.end_date);
      const cur = new Date(start);

      while (cur <= end) {
        const day = cur.getDay();
        if (day !== 0 && day !== 6) {
          const dateStr = cur.toISOString().split('T')[0];
          const existingAtt = db.prepare('SELECT id FROM attendance WHERE employee_id = ? AND date = ?').get(leave.employee_id, dateStr);
          if (existingAtt) {
            db.prepare(`
              UPDATE attendance 
              SET status = 'Leave', working_hours = 0, overtime_hours = 0, late_minutes = 0, updated_at = DATETIME('now')
              WHERE id = ?
            `).run(existingAtt.id);
          } else {
            db.prepare(`
              INSERT INTO attendance (employee_id, date, status, working_hours, late_minutes, overtime_hours, created_at, updated_at)
              VALUES (?, ?, 'Leave', 0, 0, 0, DATETIME('now'), DATETIME('now'))
            `).run(leave.employee_id, dateStr);
          }
        }
        cur.setDate(cur.getDate() + 1);
      }

      // 4. Create Employee Notification
      db.prepare(`
        INSERT INTO notifications (user_id, title, message, type, is_read, created_at)
        VALUES (?, ?, ?, 'Leave', 0, DATETIME('now'))
      `).run(
        leave.user_id,
        'Leave Request Approved',
        `Your ${leave.leave_type} request for ${leave.start_date} to ${leave.end_date} has been approved.`
      );

      // 5. Audit Log
      logAudit(reviewedByUserId, 'LEAVE_APPROVE', 'LEAVE', leaveId, `Approved ${leave.leave_type} for ${leave.employee_name}`);
    });

    approveTx();

    return db.prepare('SELECT * FROM leaves WHERE id = ?').get(leaveId);
  }

  /**
   * Rejects a pending leave
   */
  rejectLeave(leaveId, reviewedByUserId, reason = '') {
    const leave = db.prepare(`
      SELECT l.*, e.user_id, u.name as employee_name
      FROM leaves l
      JOIN employees e ON l.employee_id = e.id
      JOIN users u ON e.user_id = u.id
      WHERE l.id = ?
    `).get(leaveId);

    if (!leave) {
      const err = new Error('Leave request not found.');
      err.status = 404;
      throw err;
    }

    if (leave.status !== 'Pending') {
      const err = new Error(`Cannot reject leave with status '${leave.status}'.`);
      err.status = 400;
      throw err;
    }

    const rejectTx = db.transaction(() => {
      db.prepare(`
        UPDATE leaves 
        SET status = 'Rejected', reviewed_by = ?, reviewed_at = DATETIME('now'), updated_at = DATETIME('now')
        WHERE id = ?
      `).run(reviewedByUserId, leaveId);

      // Create Employee Notification
      const msg = reason 
        ? `Your ${leave.leave_type} request for ${leave.start_date} to ${leave.end_date} was rejected. Reason: ${reason}`
        : `Your ${leave.leave_type} request for ${leave.start_date} to ${leave.end_date} was rejected.`;

      db.prepare(`
        INSERT INTO notifications (user_id, title, message, type, is_read, created_at)
        VALUES (?, ?, ?, 'Leave', 0, DATETIME('now'))
      `).run(leave.user_id, 'Leave Request Rejected', msg);

      // Audit Log
      logAudit(reviewedByUserId, 'LEAVE_REJECT', 'LEAVE', leaveId, `Rejected ${leave.leave_type} for ${leave.employee_name}. Reason: ${reason || 'N/A'}`);
    });

    rejectTx();

    return db.prepare('SELECT * FROM leaves WHERE id = ?').get(leaveId);
  }

  /**
   * Cancels a pending leave by the employee
   */
  cancelLeave(leaveId, employeeId) {
    const leave = db.prepare('SELECT * FROM leaves WHERE id = ? AND employee_id = ?').get(leaveId, employeeId);

    if (!leave) {
      const err = new Error('Leave request not found or you do not have permission.');
      err.status = 404;
      throw err;
    }

    if (leave.status !== 'Pending') {
      const err = new Error('Only pending leave requests can be cancelled.');
      err.status = 400;
      throw err;
    }

    db.prepare(`
      UPDATE leaves 
      SET status = 'Cancelled', updated_at = DATETIME('now')
      WHERE id = ?
    `).run(leaveId);

    return db.prepare('SELECT * FROM leaves WHERE id = ?').get(leaveId);
  }

  /**
   * Retrieves leaves with filtering & pagination
   */
  getLeaves({ employeeId, departmentId, status, leaveType, startDate, endDate, page = 1, limit = 20 } = {}) {
    let baseSql = `
      FROM leaves l
      JOIN employees e ON l.employee_id = e.id
      JOIN users u ON e.user_id = u.id
      LEFT JOIN departments d ON e.department_id = d.id
      LEFT JOIN users rev ON l.reviewed_by = rev.id
      WHERE 1=1
    `;
    const params = [];

    if (employeeId) {
      baseSql += ' AND l.employee_id = ?';
      params.push(employeeId);
    }
    if (departmentId) {
      baseSql += ' AND e.department_id = ?';
      params.push(departmentId);
    }
    if (status) {
      baseSql += ' AND l.status = ?';
      params.push(status);
    }
    if (leaveType) {
      baseSql += ' AND l.leave_type = ?';
      params.push(leaveType);
    }
    if (startDate) {
      baseSql += ' AND l.end_date >= ?';
      params.push(startDate);
    }
    if (endDate) {
      baseSql += ' AND l.start_date <= ?';
      params.push(endDate);
    }

    const countRow = db.prepare(`SELECT COUNT(*) as count ${baseSql}`).get(...params);
    const total = countRow ? countRow.count : 0;

    const parsedLimit = parseInt(limit, 10);
    const parsedPage = parseInt(page, 10);
    const offset = (parsedPage - 1) * parsedLimit;

    const dataSql = `
      SELECT l.*, e.employee_id as emp_code, u.name as employee_name, u.email as employee_email,
             d.name as department_name, rev.name as reviewer_name
      ${baseSql}
      ORDER BY l.created_at DESC
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
   * Retrieves leave balances for an employee
   */
  getLeaveBalances(employeeId, year = new Date().getFullYear()) {
    return db.prepare(`
      SELECT * FROM leave_balances 
      WHERE employee_id = ? AND year = ?
      ORDER BY leave_type ASC
    `).all(employeeId, year);
  }
}

module.exports = new LeaveService();
