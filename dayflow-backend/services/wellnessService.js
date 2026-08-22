const { db } = require('../database/database');
const { getTodayString } = require('../utils/dateUtils');

class WellnessService {
  /**
   * Calculates wellness metrics for a given employee based on the last 30 days
   * @param {number} employeeId 
   * @returns {object} Calculated wellness indicator
   */
  calculateEmployeeWellness(employeeId) {
    const today = new Date();
    const past30Date = new Date();
    past30Date.setDate(today.getDate() - 30);
    const past30Str = past30Date.toISOString().split('T')[0];
    const todayStr = getTodayString(today);

    // Retrieve attendance records for the last 30 calendar days
    const attendances = db.prepare(`
      SELECT * FROM attendance 
      WHERE employee_id = ? AND date >= ? AND date <= ?
      ORDER BY date ASC
    `).all(employeeId, past30Str, todayStr);

    // 1. Attendance Percentage & Score (30% weight)
    const totalRecords = attendances.length;
    let presentCount = 0;
    let lateCount = 0;
    let halfDayCount = 0;
    let absentCount = 0;
    let leaveCount = 0;

    attendances.forEach(a => {
      if (a.status === 'Present') presentCount++;
      else if (a.status === 'Late') lateCount++;
      else if (a.status === 'Half-day') halfDayCount++;
      else if (a.status === 'Absent') absentCount++;
      else if (a.status === 'Leave') leaveCount++;
    });

    const expectedWorkdays = totalRecords > 0 ? totalRecords : 1;
    const effectiveAttended = presentCount + lateCount + (halfDayCount * 0.5);
    const attendancePercentage = Math.round((effectiveAttended / expectedWorkdays) * 100);

    let attendanceScore = 100;
    if (attendancePercentage >= 90) attendanceScore = 100;
    else if (attendancePercentage >= 80) attendanceScore = 80;
    else if (attendancePercentage >= 70) attendanceScore = 60;
    else attendanceScore = 40;

    // 2. Absence Score (25% weight)
    let absenceScore = 100;
    if (absentCount === 0) absenceScore = 100;
    else if (absentCount === 1) absenceScore = 85;
    else if (absentCount === 2) absenceScore = 70;
    else if (absentCount === 3) absenceScore = 50;
    else absenceScore = 30;

    // 3. Leave Pattern Score (20% weight)
    // Check for unusual patterns such as weekend clustering or high emergency leaves
    const recentLeaves = db.prepare(`
      SELECT leave_type, start_date, end_date FROM leaves
      WHERE employee_id = ? AND start_date >= ? AND status = 'Approved'
    `).all(employeeId, past30Str);

    let emergencyLeaves = 0;
    recentLeaves.forEach(l => {
      if (l.leave_type === 'Emergency Leave') emergencyLeaves++;
    });

    let leavePatternScore = 100;
    if (emergencyLeaves >= 2) leavePatternScore = 60;
    else if (emergencyLeaves === 1) leavePatternScore = 80;
    else if (recentLeaves.length > 4) leavePatternScore = 75;

    // 4. Trend Score (25% weight)
    // Compare first 15 days vs last 15 days within the 30-day window
    const midDate = new Date();
    midDate.setDate(today.getDate() - 15);
    const midStr = midDate.toISOString().split('T')[0];

    const firstHalf = attendances.filter(a => a.date < midStr);
    const secondHalf = attendances.filter(a => a.date >= midStr);

    const firstHalfAttended = firstHalf.filter(a => a.status === 'Present' || a.status === 'Late' || a.status === 'Half-day').length;
    const secondHalfAttended = secondHalf.filter(a => a.status === 'Present' || a.status === 'Late' || a.status === 'Half-day').length;

    const firstHalfRate = firstHalf.length > 0 ? (firstHalfAttended / firstHalf.length) * 100 : 100;
    const secondHalfRate = secondHalf.length > 0 ? (secondHalfAttended / secondHalf.length) * 100 : 100;

    const drop = firstHalfRate - secondHalfRate;

    let trendScore = 100;
    if (drop > 15) trendScore = 45;
    else if (drop > 5) trendScore = 70;
    else trendScore = 95;

    // Combined Weighted Overall Score
    const overallScore = Math.round(
      (attendanceScore * 0.30) + 
      (absenceScore * 0.25) + 
      (leavePatternScore * 0.20) + 
      (trendScore * 0.25)
    );

    // Indicator Level
    let indicatorLevel = 'Stable';
    if (overallScore >= 80) indicatorLevel = 'Stable';
    else if (overallScore >= 60) indicatorLevel = 'Monitor';
    else indicatorLevel = 'Needs Attention';

    // Objective, Non-diagnostic Explanation
    let explanationParts = [];
    if (indicatorLevel === 'Stable') {
      explanationParts.push(`Attendance remains consistent at ${attendancePercentage}% over the last 30 days.`);
      if (lateCount > 0) explanationParts.push(`${lateCount} late arrival(s) logged.`);
      if (absentCount === 0) explanationParts.push('Zero unexcused absences recorded.');
    } else if (indicatorLevel === 'Monitor') {
      explanationParts.push(`Attendance rate is currently at ${attendancePercentage}%.`);
      if (lateCount > 0) explanationParts.push(`${lateCount} late arrival(s) observed.`);
      if (drop > 5) explanationParts.push(`Attendance showed a ${Math.round(drop)}% decline in the recent 14-day window.`);
    } else {
      explanationParts.push(`Attendance dropped to ${attendancePercentage}% with ${absentCount} absence(s) and ${lateCount} late check-in(s) in the past 30 days.`);
      if (drop > 15) explanationParts.push(`Significant downward trend of ${Math.round(drop)}% from earlier period.`);
    }

    const explanation = explanationParts.join(' ');

    // Store in wellness_indicators table
    const stmt = db.prepare(`
      INSERT INTO wellness_indicators (
        employee_id, attendance_score, absence_score, leave_pattern_score, trend_score,
        overall_score, indicator_level, explanation, calculated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, DATETIME('now'))
    `);
    const res = stmt.run(
      employeeId, attendanceScore, absenceScore, leavePatternScore, trendScore,
      overallScore, indicatorLevel, explanation
    );

    return db.prepare('SELECT * FROM wellness_indicators WHERE id = ?').get(res.lastInsertRowid);
  }

  /**
   * Retrieves the latest wellness indicator for an employee
   */
  getEmployeeWellness(employeeId) {
    const latest = db.prepare(`
      SELECT w.*, e.employee_id as emp_code, u.name as employee_name, d.name as department_name
      FROM wellness_indicators w
      JOIN employees e ON w.employee_id = e.id
      JOIN users u ON e.user_id = u.id
      LEFT JOIN departments d ON e.department_id = d.id
      WHERE w.employee_id = ?
      ORDER BY w.calculated_at DESC
      LIMIT 1
    `).get(employeeId);

    if (!latest) {
      // Calculate on-demand if not present
      return this.calculateEmployeeWellness(employeeId);
    }
    return latest;
  }

  /**
   * Retrieves historical wellness metrics for an employee
   */
  getEmployeeWellnessHistory(employeeId, limit = 10) {
    return db.prepare(`
      SELECT * FROM wellness_indicators 
      WHERE employee_id = ? 
      ORDER BY calculated_at DESC 
      LIMIT ?
    `).all(employeeId, parseInt(limit, 10));
  }

  /**
   * Retrieves workforce wellness indicators across the organization
   */
  getWorkforceWellness({ departmentId, indicatorLevel, page = 1, limit = 20 } = {}) {
    let baseSql = `
      FROM (
        SELECT w.*, ROW_NUMBER() OVER (PARTITION BY w.employee_id ORDER BY w.calculated_at DESC) as rn
        FROM wellness_indicators w
      ) w
      JOIN employees e ON w.employee_id = e.id
      JOIN users u ON e.user_id = u.id
      LEFT JOIN departments d ON e.department_id = d.id
      WHERE w.rn = 1 AND e.employment_status = 'Active'
    `;
    const params = [];

    if (departmentId) {
      baseSql += ' AND e.department_id = ?';
      params.push(departmentId);
    }
    if (indicatorLevel) {
      baseSql += ' AND w.indicator_level = ?';
      params.push(indicatorLevel);
    }

    const countRow = db.prepare(`SELECT COUNT(*) as count ${baseSql}`).get(...params);
    const total = countRow ? countRow.count : 0;

    const parsedLimit = parseInt(limit, 10);
    const parsedPage = parseInt(page, 10);
    const offset = (parsedPage - 1) * parsedLimit;

    const dataSql = `
      SELECT w.id, w.employee_id, w.attendance_score, w.absence_score, w.leave_pattern_score,
             w.trend_score, w.overall_score, w.indicator_level, w.explanation, w.calculated_at,
             e.employee_id as emp_code, u.name as employee_name, u.email as employee_email,
             e.designation, d.name as department_name
      ${baseSql}
      ORDER BY w.overall_score ASC
      LIMIT ? OFFSET ?
    `;

    const records = db.prepare(dataSql).all(...params, parsedLimit, offset);

    // Distribution stats
    const stats = db.prepare(`
      SELECT w.indicator_level, COUNT(*) as count
      FROM (
        SELECT employee_id, indicator_level, ROW_NUMBER() OVER (PARTITION BY employee_id ORDER BY calculated_at DESC) as rn
        FROM wellness_indicators
      ) w
      JOIN employees e ON w.employee_id = e.id
      WHERE w.rn = 1 AND e.employment_status = 'Active'
      GROUP BY w.indicator_level
    `).all();

    const summary = {
      stable: 0,
      monitor: 0,
      needsAttention: 0
    };

    stats.forEach(s => {
      if (s.indicator_level === 'Stable') summary.stable = s.count;
      else if (s.indicator_level === 'Monitor') summary.monitor = s.count;
      else if (s.indicator_level === 'Needs Attention') summary.needsAttention = s.count;
    });

    return {
      records,
      summary,
      total,
      page: parsedPage,
      totalPages: Math.ceil(total / parsedLimit) || 1,
      limit: parsedLimit
    };
  }
}

module.exports = new WellnessService();
