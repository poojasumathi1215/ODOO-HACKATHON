const { db } = require('../database/database');

/**
 * Generate tabular Employee Report
 */
function getEmployeeReport(req, res, next) {
  try {
    const { departmentId, teamId, status, joiningStartDate, joiningEndDate } = req.query;

    let query = `
      SELECT 
        e.employee_id as "Employee ID",
        u.name as "Full Name",
        u.email as "Email",
        e.phone as "Phone",
        d.name as "Department",
        t.name as "Team",
        e.designation as "Designation",
        e.joining_date as "Joining Date",
        e.employment_status as "Status",
        e.address as "Address"
      FROM employees e
      JOIN users u ON e.user_id = u.id
      LEFT JOIN departments d ON e.department_id = d.id
      LEFT JOIN teams t ON e.team_id = t.id
      WHERE 1=1
    `;
    const params = [];

    if (departmentId) {
      query += ' AND e.department_id = ?';
      params.push(departmentId);
    }
    if (teamId) {
      query += ' AND e.team_id = ?';
      params.push(teamId);
    }
    if (status) {
      query += ' AND e.employment_status = ?';
      params.push(status);
    }
    if (joiningStartDate) {
      query += ' AND e.joining_date >= ?';
      params.push(joiningStartDate);
    }
    if (joiningEndDate) {
      query += ' AND e.joining_date <= ?';
      params.push(joiningEndDate);
    }

    query += ' ORDER BY e.employee_id ASC';

    const rows = db.prepare(query).all(...params);

    return res.status(200).json({
      success: true,
      message: 'Employee report generated',
      data: {
        totalRecords: rows.length,
        generatedAt: new Date().toISOString(),
        rows
      }
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Generate tabular Attendance Report
 */
function getAttendanceReport(req, res, next) {
  try {
    const { startDate, endDate, departmentId, employeeId, status } = req.query;

    let query = `
      SELECT 
        a.date as "Date",
        e.employee_id as "Employee ID",
        u.name as "Employee Name",
        d.name as "Department",
        a.status as "Status",
        a.check_in as "Check In",
        a.check_out as "Check Out",
        a.working_hours as "Working Hours",
        a.late_minutes as "Late Minutes",
        a.overtime_hours as "Overtime Hours"
      FROM attendance a
      JOIN employees e ON a.employee_id = e.id
      JOIN users u ON e.user_id = u.id
      LEFT JOIN departments d ON e.department_id = d.id
      WHERE 1=1
    `;
    const params = [];

    if (startDate) {
      query += ' AND a.date >= ?';
      params.push(startDate);
    }
    if (endDate) {
      query += ' AND a.date <= ?';
      params.push(endDate);
    }
    if (departmentId) {
      query += ' AND e.department_id = ?';
      params.push(departmentId);
    }
    if (employeeId) {
      query += ' AND a.employee_id = ?';
      params.push(employeeId);
    }
    if (status) {
      query += ' AND a.status = ?';
      params.push(status);
    }

    query += ' ORDER BY a.date DESC, e.employee_id ASC';

    const rows = db.prepare(query).all(...params);

    return res.status(200).json({
      success: true,
      message: 'Attendance report generated',
      data: {
        totalRecords: rows.length,
        generatedAt: new Date().toISOString(),
        rows
      }
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Generate tabular Leaves Report
 */
function getLeaveReport(req, res, next) {
  try {
    const { startDate, endDate, departmentId, employeeId, leaveType, status } = req.query;

    let query = `
      SELECT 
        l.id as "Leave ID",
        e.employee_id as "Employee ID",
        u.name as "Employee Name",
        d.name as "Department",
        l.leave_type as "Leave Type",
        l.start_date as "Start Date",
        l.end_date as "End Date",
        l.status as "Status",
        l.reason as "Reason",
        rev.name as "Reviewed By",
        l.reviewed_at as "Reviewed At"
      FROM leaves l
      JOIN employees e ON l.employee_id = e.id
      JOIN users u ON e.user_id = u.id
      LEFT JOIN departments d ON e.department_id = d.id
      LEFT JOIN users rev ON l.reviewed_by = rev.id
      WHERE 1=1
    `;
    const params = [];

    if (startDate) {
      query += ' AND l.start_date >= ?';
      params.push(startDate);
    }
    if (endDate) {
      query += ' AND l.end_date <= ?';
      params.push(endDate);
    }
    if (departmentId) {
      query += ' AND e.department_id = ?';
      params.push(departmentId);
    }
    if (employeeId) {
      query += ' AND l.employee_id = ?';
      params.push(employeeId);
    }
    if (leaveType) {
      query += ' AND l.leave_type = ?';
      params.push(leaveType);
    }
    if (status) {
      query += ' AND l.status = ?';
      params.push(status);
    }

    query += ' ORDER BY l.start_date DESC';

    const rows = db.prepare(query).all(...params);

    return res.status(200).json({
      success: true,
      message: 'Leave report generated',
      data: {
        totalRecords: rows.length,
        generatedAt: new Date().toISOString(),
        rows
      }
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Generate tabular Payroll Report
 */
function getPayrollReport(req, res, next) {
  try {
    const { payMonth, payYear, departmentId, status } = req.query;

    let query = `
      SELECT 
        p.id as "Payroll ID",
        e.employee_id as "Employee ID",
        u.name as "Employee Name",
        d.name as "Department",
        p.pay_month as "Month",
        p.pay_year as "Year",
        p.basic_salary as "Basic Salary",
        p.allowances as "Allowances",
        p.bonus as "Bonus",
        p.overtime as "Overtime",
        p.deductions as "Deductions",
        p.net_salary as "Net Salary",
        p.status as "Status"
      FROM payroll p
      JOIN employees e ON p.employee_id = e.id
      JOIN users u ON e.user_id = u.id
      LEFT JOIN departments d ON e.department_id = d.id
      WHERE 1=1
    `;
    const params = [];

    if (payMonth) {
      query += ' AND p.pay_month = ?';
      params.push(parseInt(payMonth, 10));
    }
    if (payYear) {
      query += ' AND p.pay_year = ?';
      params.push(parseInt(payYear, 10));
    }
    if (departmentId) {
      query += ' AND e.department_id = ?';
      params.push(departmentId);
    }
    if (status) {
      query += ' AND p.status = ?';
      params.push(status);
    }

    query += ' ORDER BY p.pay_year DESC, p.pay_month DESC, e.employee_id ASC';

    const rows = db.prepare(query).all(...params);

    return res.status(200).json({
      success: true,
      message: 'Payroll report generated',
      data: {
        totalRecords: rows.length,
        generatedAt: new Date().toISOString(),
        rows
      }
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Generate tabular Wellness Report
 */
function getWellnessReport(req, res, next) {
  try {
    const { departmentId, indicatorLevel } = req.query;

    let query = `
      SELECT 
        e.employee_id as "Employee ID",
        u.name as "Employee Name",
        d.name as "Department",
        w.overall_score as "Overall Score",
        w.indicator_level as "Wellness Level",
        w.attendance_score as "Attendance Score",
        w.absence_score as "Absence Score",
        w.leave_pattern_score as "Leave Pattern Score",
        w.trend_score as "Trend Score",
        w.explanation as "Explanation",
        w.calculated_at as "Calculated Date"
      FROM (
        SELECT *, ROW_NUMBER() OVER (PARTITION BY employee_id ORDER BY calculated_at DESC) as rn
        FROM wellness_indicators
      ) w
      JOIN employees e ON w.employee_id = e.id
      JOIN users u ON e.user_id = u.id
      LEFT JOIN departments d ON e.department_id = d.id
      WHERE w.rn = 1 AND e.employment_status = 'Active'
    `;
    const params = [];

    if (departmentId) {
      query += ' AND e.department_id = ?';
      params.push(departmentId);
    }
    if (indicatorLevel) {
      query += ' AND w.indicator_level = ?';
      params.push(indicatorLevel);
    }

    query += ' ORDER BY w.overall_score ASC';

    const rows = db.prepare(query).all(...params);

    return res.status(200).json({
      success: true,
      message: 'Wellness report generated',
      data: {
        totalRecords: rows.length,
        generatedAt: new Date().toISOString(),
        rows
      }
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getEmployeeReport,
  getAttendanceReport,
  getLeaveReport,
  getPayrollReport,
  getWellnessReport
};
