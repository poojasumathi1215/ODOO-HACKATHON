const attendanceService = require('../services/attendanceService');

/**
 * Handle employee check-in
 */
function checkIn(req, res, next) {
  try {
    if (!req.employee) {
      return res.status(400).json({
        success: false,
        message: 'No employee profile linked to this user account.'
      });
    }

    const record = attendanceService.checkIn(req.employee.id);

    return res.status(200).json({
      success: true,
      message: 'Check-in recorded successfully',
      data: record
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Handle employee check-out
 */
function checkOut(req, res, next) {
  try {
    if (!req.employee) {
      return res.status(400).json({
        success: false,
        message: 'No employee profile linked to this user account.'
      });
    }

    const record = attendanceService.checkOut(req.employee.id);

    return res.status(200).json({
      success: true,
      message: 'Check-out recorded successfully',
      data: record
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Get current employee's attendance history
 */
function getMyAttendance(req, res, next) {
  try {
    if (!req.employee) {
      return res.status(400).json({
        success: false,
        message: 'No employee profile linked to this user account.'
      });
    }

    const { startDate, endDate, page, limit } = req.query;
    const data = attendanceService.getEmployeeAttendance(req.employee.id, { startDate, endDate, page, limit });

    return res.status(200).json({
      success: true,
      message: 'Personal attendance records retrieved',
      data
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Get attendance records (HR filterable)
 */
function getAttendance(req, res, next) {
  try {
    const { date, employeeId, departmentId, teamId, status, startDate, endDate, page, limit } = req.query;
    const data = attendanceService.getAttendanceList({ date, employeeId, departmentId, teamId, status, startDate, endDate, page, limit });

    return res.status(200).json({
      success: true,
      message: 'Attendance records retrieved',
      data
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Get attendance for a specific employee ID
 */
function getEmployeeAttendanceById(req, res, next) {
  try {
    const employeeId = parseInt(req.params.employeeId, 10);
    const { startDate, endDate, page, limit } = req.query;

    const data = attendanceService.getEmployeeAttendance(employeeId, { startDate, endDate, page, limit });

    return res.status(200).json({
      success: true,
      message: 'Employee attendance retrieved',
      data
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Get attendance summary
 */
function getAttendanceSummary(req, res, next) {
  try {
    const { date } = req.query;
    const summary = attendanceService.getAttendanceSummary(date);

    return res.status(200).json({
      success: true,
      message: 'Attendance summary retrieved',
      data: summary
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  checkIn,
  checkOut,
  getMyAttendance,
  getAttendance,
  getEmployeeAttendanceById,
  getAttendanceSummary
};
