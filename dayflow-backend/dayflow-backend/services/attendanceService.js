const { db } = require('../database/database');
const { getTodayString, calculateLateMinutes, calculateHoursAndStatus } = require('../utils/dateUtils');

class AttendanceService {
  /**
   * Records employee check-in for today
   * @param {number} employeeId 
   * @returns {object} Attendance record
   */
  checkIn(employeeId) {
    const today = getTodayString();
    const existing = db.prepare('SELECT * FROM attendance WHERE employee_id = ? AND date = ?').get(employeeId, today);

    if (existing && existing.check_in) {
      const error = new Error('You have already checked in for today.');
      error.status = 400;
      throw error;
    }

    const checkInTime = new Date().toISOString();
    const lateMinutes = calculateLateMinutes(checkInTime, '09:00:00');
    const status = lateMinutes > 15 ? 'Late' : 'Present';

    if (existing) {
      const stmt = db.prepare(`
        UPDATE attendance 
        SET check_in = ?, status = ?, late_minutes = ?, updated_at = DATETIME('now')
        WHERE id = ?
      `);
      stmt.run(checkInTime, status, lateMinutes, existing.id);
      return db.prepare('SELECT * FROM attendance WHERE id = ?').get(existing.id);
    } else {
      const stmt = db.prepare(`
        INSERT INTO attendance (employee_id, date, check_in, status, late_minutes, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, DATETIME('now'), DATETIME('now'))
      `);
      const res = stmt.run(employeeId, today, checkInTime, status, lateMinutes);
      return db.prepare('SELECT * FROM attendance WHERE id = ?').get(res.lastInsertRowid);
    }
  }

  /**
   * Records employee check-out for today
   * @param {number} employeeId 
   * @returns {object} Updated attendance record
   */
  checkOut(employeeId) {
    const today = getTodayString();
    const existing = db.prepare('SELECT * FROM attendance WHERE employee_id = ? AND date = ?').get(employeeId, today);

    if (!existing || !existing.check_in) {
      const error = new Error('Cannot check out without checking in first.');
      error.status = 400;
      throw error;
    }

    const checkOutTime = new Date().toISOString();
    const { workingHours, overtimeHours, status } = calculateHoursAndStatus(existing.check_in, checkOutTime, existing.late_minutes);

    const stmt = db.prepare(`
      UPDATE attendance 
      SET check_out = ?, working_hours = ?, overtime_hours = ?, status = ?, updated_at = DATETIME('now')
      WHERE id = ?
    `);
    stmt.run(checkOutTime, workingHours, overtimeHours, status, existing.id);

    return db.prepare('SELECT * FROM attendance WHERE id = ?').get(existing.id);
  }

  /**
   * Retrieves attendance history for a specific employee
   */
  getEmployeeAttendance(employeeId, { startDate, endDate, limit = 30, page = 1 } = {}) {
    let query = `
      SELECT a.*, e.employee_id as emp_code, u.name as employee_name, d.name as department_name
      FROM attendance a
      JOIN employees e ON a.employee_id = e.id
      JOIN users u ON e.user_id = u.id
      LEFT JOIN departments d ON e.department_id = d.id
      WHERE a.employee_id = ?
    `;
    const params = [employeeId];

    if (startDate) {
      query += ' AND a.date >= ?';
      params.push(startDate);
    }
    if (endDate) {
      query += ' AND a.date <= ?';
      params.push(endDate);
    }

    query += ' ORDER BY a.date DESC LIMIT ? OFFSET ?';
    params.push(parseInt(limit, 10), (parseInt(page, 10) - 1) * parseInt(limit, 10));

    const records = db.prepare(query).all(...params);

    // Get count
    let countQuery = 'SELECT COUNT(*) as count FROM attendance WHERE employee_id = ?';
    const countParams = [employeeId];
    if (startDate) {
      countQuery += ' AND date >= ?';
      countParams.push(startDate);
    }
    if (endDate) {
      countQuery += ' AND date <= ?';
      countParams.push(endDate);
    }
    const total = db.prepare(countQuery).get(...countParams).count;

    return { records, total, page: parseInt(page, 10), limit: parseInt(limit, 10) };
  }

  /**
   * Retrieves attendance records with rich HR filters
   */
  getAttendanceList({ date, employeeId, departmentId, teamId, status, startDate, endDate, page = 1, limit = 20 } = {}) {
    let baseSql = `
      FROM attendance a
      JOIN employees e ON a.employee_id = e.id
      JOIN users u ON e.user_id = u.id
      LEFT JOIN departments d ON e.department_id = d.id
      LEFT JOIN teams t ON e.team_id = t.id
      WHERE 1=1
    `;
    const params = [];

    if (date) {
      baseSql += ' AND a.date = ?';
      params.push(date);
    } else {
      if (startDate) {
        baseSql += ' AND a.date >= ?';
        params.push(startDate);
      }
      if (endDate) {
        baseSql += ' AND a.date <= ?';
        params.push(endDate);
      }
    }

    if (employeeId) {
      baseSql += ' AND a.employee_id = ?';
      params.push(employeeId);
    }

    if (departmentId) {
      baseSql += ' AND e.department_id = ?';
      params.push(departmentId);
    }

    if (teamId) {
      baseSql += ' AND e.team_id = ?';
      params.push(teamId);
    }

    if (status) {
      baseSql += ' AND a.status = ?';
      params.push(status);
    }

    const countRow = db.prepare(`SELECT COUNT(*) as count ${baseSql}`).get(...params);
    const total = countRow ? countRow.count : 0;

    const parsedLimit = parseInt(limit, 10);
    const parsedPage = parseInt(page, 10);
    const offset = (parsedPage - 1) * parsedLimit;

    const dataSql = `
      SELECT a.*, e.employee_id as emp_code, u.name as employee_name, u.email as employee_email, 
             e.designation, d.name as department_name, t.name as team_name
      ${baseSql}
      ORDER BY a.date DESC, a.check_in DESC
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
   * Retrieves overall attendance summary for a given date
   */
  getAttendanceSummary(targetDate = getTodayString()) {
    const totalEmployees = db.prepare(`SELECT COUNT(*) as count FROM employees WHERE employment_status = 'Active'`).get().count;

    const stats = db.prepare(`
      SELECT 
        status, 
        COUNT(*) as count
      FROM attendance 
      WHERE date = ?
      GROUP BY status
    `).all(targetDate);

    const breakdown = {
      present: 0,
      late: 0,
      halfDay: 0,
      leave: 0,
      absent: 0
    };

    let loggedEmployees = 0;

    stats.forEach(s => {
      loggedEmployees += s.count;
      if (s.status === 'Present') breakdown.present = s.count;
      else if (s.status === 'Late') breakdown.late = s.count;
      else if (s.status === 'Half-day') breakdown.halfDay = s.count;
      else if (s.status === 'Leave') breakdown.leave = s.count;
      else if (s.status === 'Absent') breakdown.absent = s.count;
    });

    // Unaccounted active employees are deemed absent for the day
    const unaccounted = Math.max(0, totalEmployees - loggedEmployees);
    breakdown.absent += unaccounted;

    const effectivePresent = breakdown.present + breakdown.late + (breakdown.halfDay * 0.5);
    const attendancePercentage = totalEmployees > 0 
      ? parseFloat(((effectivePresent / totalEmployees) * 100).toFixed(1)) 
      : 100;

    return {
      date: targetDate,
      totalEmployees,
      presentToday: breakdown.present + breakdown.late,
      absentToday: breakdown.absent,
      breakdown,
      attendancePercentage
    };
  }
}

module.exports = new AttendanceService();
