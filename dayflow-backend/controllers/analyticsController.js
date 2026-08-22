const { db } = require('../database/database');
const { getTodayString } = require('../utils/dateUtils');
const attendanceService = require('../services/attendanceService');

/**
 * Get top-level dashboard metrics
 */
function getDashboardAnalytics(req, res, next) {
  try {
    const today = getTodayString();

    const totalEmployees = db.prepare(`SELECT COUNT(*) as count FROM employees`).get().count;
    const activeEmployees = db.prepare(`SELECT COUNT(*) as count FROM employees WHERE employment_status = 'Active'`).get().count;

    const summary = attendanceService.getAttendanceSummary(today);

    const pendingLeaves = db.prepare(`SELECT COUNT(*) as count FROM leaves WHERE status = 'Pending'`).get().count;
    const activeAlerts = db.prepare(`SELECT COUNT(*) as count FROM smart_alerts WHERE is_resolved = 0`).get().count;

    // Average attendance rate over the last 30 days
    const past30Days = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    const avgAttRow = db.prepare(`
      SELECT 
        COUNT(*) as totalDaysLogged,
        SUM(CASE WHEN status IN ('Present', 'Late') THEN 1 WHEN status = 'Half-day' THEN 0.5 ELSE 0 END) as attendedCount
      FROM attendance
      WHERE date >= ?
    `).get(past30Days);

    const averageAttendance = avgAttRow.totalDaysLogged > 0
      ? parseFloat(((avgAttRow.attendedCount / avgAttRow.totalDaysLogged) * 100).toFixed(1))
      : 95.0;

    // Quick stats on Wellness
    const wellnessCounts = db.prepare(`
      SELECT indicator_level, COUNT(*) as count
      FROM (
        SELECT employee_id, indicator_level, ROW_NUMBER() OVER (PARTITION BY employee_id ORDER BY calculated_at DESC) as rn
        FROM wellness_indicators
      ) w
      JOIN employees e ON w.employee_id = e.id
      WHERE w.rn = 1 AND e.employment_status = 'Active'
      GROUP BY indicator_level
    `).all();

    const wellnessSummary = { stable: 0, monitor: 0, needsAttention: 0 };
    wellnessCounts.forEach(w => {
      if (w.indicator_level === 'Stable') wellnessSummary.stable = w.count;
      else if (w.indicator_level === 'Monitor') wellnessSummary.monitor = w.count;
      else if (w.indicator_level === 'Needs Attention') wellnessSummary.needsAttention = w.count;
    });

    return res.status(200).json({
      success: true,
      message: 'Dashboard analytics retrieved',
      data: {
        totalEmployees,
        activeEmployees,
        presentToday: summary.presentToday,
        absentToday: summary.absentToday,
        pendingLeaves,
        activeAlerts,
        averageAttendance,
        wellnessSummary
      }
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Get attendance analytics formatted for Recharts
 */
function getAttendanceAnalytics(req, res, next) {
  try {
    const days = parseInt(req.query.days, 10) || 14;
    const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

    const trendRows = db.prepare(`
      SELECT 
        date,
        SUM(CASE WHEN status = 'Present' THEN 1 ELSE 0 END) as present,
        SUM(CASE WHEN status = 'Late' THEN 1 ELSE 0 END) as late,
        SUM(CASE WHEN status = 'Half-day' THEN 1 ELSE 0 END) as halfDay,
        SUM(CASE WHEN status = 'Leave' THEN 1 ELSE 0 END) as onLeave,
        SUM(CASE WHEN status = 'Absent' THEN 1 ELSE 0 END) as absent
      FROM attendance
      WHERE date >= ?
      GROUP BY date
      ORDER BY date ASC
    `).all(startDate);

    // Department-wise average attendance rate
    const deptAttendance = db.prepare(`
      SELECT 
        d.name as department,
        COUNT(a.id) as totalLogs,
        SUM(CASE WHEN a.status IN ('Present', 'Late') THEN 1 WHEN a.status = 'Half-day' THEN 0.5 ELSE 0 END) as attended
      FROM departments d
      JOIN employees e ON d.id = e.department_id
      JOIN attendance a ON e.id = a.employee_id
      WHERE a.date >= ?
      GROUP BY d.id, d.name
    `).all(startDate).map(d => ({
      department: d.department,
      attendanceRate: d.totalLogs > 0 ? parseFloat(((d.attended / d.totalLogs) * 100).toFixed(1)) : 100
    }));

    return res.status(200).json({
      success: true,
      message: 'Attendance analytics retrieved',
      data: {
        trend: trendRows,
        departmentBreakdown: deptAttendance
      }
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Get leave analytics formatted for Recharts
 */
function getLeaveAnalytics(req, res, next) {
  try {
    const currentYear = new Date().getFullYear();

    // Leave Types Distribution
    const typeDistribution = db.prepare(`
      SELECT leave_type as name, COUNT(*) as count
      FROM leaves
      WHERE strftime('%Y', start_date) = ? AND status = 'Approved'
      GROUP BY leave_type
    `).all(String(currentYear));

    // Monthly Leave requests trend
    const monthlyTrend = db.prepare(`
      SELECT 
        strftime('%m', start_date) as month,
        COUNT(*) as totalLeaves,
        SUM(CASE WHEN status = 'Approved' THEN 1 ELSE 0 END) as approved,
        SUM(CASE WHEN status = 'Rejected' THEN 1 ELSE 0 END) as rejected
      FROM leaves
      WHERE strftime('%Y', start_date) = ?
      GROUP BY month
      ORDER BY month ASC
    `).all(String(currentYear));

    const statusCounts = db.prepare(`
      SELECT status, COUNT(*) as count
      FROM leaves
      WHERE strftime('%Y', start_date) = ?
      GROUP BY status
    `).all(String(currentYear));

    return res.status(200).json({
      success: true,
      message: 'Leave analytics retrieved',
      data: {
        byType: typeDistribution,
        monthlyTrend,
        byStatus: statusCounts
      }
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Get workforce analytics formatted for Recharts
 */
function getWorkforceAnalytics(req, res, next) {
  try {
    // Department Distribution
    const departmentDistribution = db.prepare(`
      SELECT d.name, COUNT(e.id) as employeeCount
      FROM departments d
      LEFT JOIN employees e ON d.id = e.department_id
      GROUP BY d.id, d.name
    `).all();

    // Employment Status Distribution
    const statusDistribution = db.prepare(`
      SELECT employment_status as status, COUNT(*) as count
      FROM employees
      GROUP BY employment_status
    `).all();

    // Team Distribution
    const teamDistribution = db.prepare(`
      SELECT t.name, d.name as department, COUNT(e.id) as memberCount
      FROM teams t
      JOIN departments d ON t.department_id = d.id
      LEFT JOIN employees e ON t.id = e.team_id
      GROUP BY t.id, t.name
    `).all();

    return res.status(200).json({
      success: true,
      message: 'Workforce analytics retrieved',
      data: {
        departments: departmentDistribution,
        statuses: statusDistribution,
        teams: teamDistribution
      }
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Get wellness analytics formatted for Recharts
 */
function getWellnessAnalytics(req, res, next) {
  try {
    // Distribution by indicator level
    const levelDistribution = db.prepare(`
      SELECT w.indicator_level as name, COUNT(*) as value
      FROM (
        SELECT employee_id, indicator_level, ROW_NUMBER() OVER (PARTITION BY employee_id ORDER BY calculated_at DESC) as rn
        FROM wellness_indicators
      ) w
      JOIN employees e ON w.employee_id = e.id
      WHERE w.rn = 1 AND e.employment_status = 'Active'
      GROUP BY w.indicator_level
    `).all();

    // Department-wise average wellness score
    const deptWellness = db.prepare(`
      SELECT 
        d.name as department,
        ROUND(AVG(w.overall_score), 1) as averageScore,
        ROUND(AVG(w.attendance_score), 1) as avgAttendanceScore,
        ROUND(AVG(w.trend_score), 1) as avgTrendScore
      FROM (
        SELECT employee_id, overall_score, attendance_score, trend_score,
               ROW_NUMBER() OVER (PARTITION BY employee_id ORDER BY calculated_at DESC) as rn
        FROM wellness_indicators
      ) w
      JOIN employees e ON w.employee_id = e.id
      JOIN departments d ON e.department_id = d.id
      WHERE w.rn = 1 AND e.employment_status = 'Active'
      GROUP BY d.id, d.name
    `).all();

    return res.status(200).json({
      success: true,
      message: 'Wellness analytics retrieved',
      data: {
        levels: levelDistribution,
        departments: deptWellness
      }
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getDashboardAnalytics,
  getAttendanceAnalytics,
  getLeaveAnalytics,
  getWorkforceAnalytics,
  getWellnessAnalytics
};
