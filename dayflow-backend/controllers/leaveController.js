const leaveService = require('../services/leaveService');

/**
 * Apply for leave
 */
function applyLeave(req, res, next) {
  try {
    if (!req.employee) {
      return res.status(400).json({
        success: false,
        message: 'No employee profile linked to this user account.'
      });
    }

    const { leaveType, startDate, endDate, reason } = req.body;
    if (!leaveType || !startDate || !endDate || !reason) {
      return res.status(400).json({
        success: false,
        message: 'Leave type, start date, end date, and reason are required.'
      });
    }

    const leave = leaveService.applyLeave({
      employeeId: req.employee.id,
      leaveType,
      startDate,
      endDate,
      reason
    });

    return res.status(201).json({
      success: true,
      message: 'Leave application submitted successfully',
      data: leave
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Get current employee's leaves
 */
function getMyLeaves(req, res, next) {
  try {
    if (!req.employee) {
      return res.status(400).json({
        success: false,
        message: 'No employee profile linked to this user account.'
      });
    }

    const { status, leaveType, startDate, endDate, page, limit } = req.query;
    const data = leaveService.getLeaves({
      employeeId: req.employee.id,
      status,
      leaveType,
      startDate,
      endDate,
      page,
      limit
    });

    const balances = leaveService.getLeaveBalances(req.employee.id);

    return res.status(200).json({
      success: true,
      message: 'Personal leave applications retrieved',
      data: {
        ...data,
        balances
      }
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Get all leaves (HR view)
 */
function getAllLeaves(req, res, next) {
  try {
    const { employeeId, departmentId, status, leaveType, startDate, endDate, page, limit } = req.query;
    const data = leaveService.getLeaves({
      employeeId,
      departmentId,
      status,
      leaveType,
      startDate,
      endDate,
      page,
      limit
    });

    return res.status(200).json({
      success: true,
      message: 'Leave applications retrieved',
      data
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Get leave details by ID
 */
function getLeaveById(req, res, next) {
  try {
    const leaveId = req.params.id;
    const { db } = require('../database/database');
    const leave = db.prepare(`
      SELECT l.*, e.employee_id as emp_code, u.name as employee_name, u.email as employee_email,
             d.name as department_name, rev.name as reviewer_name
      FROM leaves l
      JOIN employees e ON l.employee_id = e.id
      JOIN users u ON e.user_id = u.id
      LEFT JOIN departments d ON e.department_id = d.id
      LEFT JOIN users rev ON l.reviewed_by = rev.id
      WHERE l.id = ?
    `).get(leaveId);

    if (!leave) {
      return res.status(404).json({
        success: false,
        message: 'Leave request not found'
      });
    }

    // Permission check: if employee role, can only see own leave
    if (req.user.role !== 'HR' && (!req.employee || req.employee.id !== leave.employee_id)) {
      return res.status(403).json({
        success: false,
        message: 'Forbidden. You do not have permission to view this leave record.'
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Leave details retrieved',
      data: leave
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Approve leave (HR)
 */
function approveLeave(req, res, next) {
  try {
    const leaveId = req.params.id;
    const updatedLeave = leaveService.approveLeave(leaveId, req.user.id);

    return res.status(200).json({
      success: true,
      message: 'Leave approved successfully',
      data: updatedLeave
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Reject leave (HR)
 */
function rejectLeave(req, res, next) {
  try {
    const leaveId = req.params.id;
    const { reason } = req.body;
    const updatedLeave = leaveService.rejectLeave(leaveId, req.user.id, reason);

    return res.status(200).json({
      success: true,
      message: 'Leave rejected',
      data: updatedLeave
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Cancel leave (Employee)
 */
function cancelLeave(req, res, next) {
  try {
    if (!req.employee) {
      return res.status(400).json({
        success: false,
        message: 'No employee profile linked to this user account.'
      });
    }

    const leaveId = req.params.id;
    const cancelled = leaveService.cancelLeave(leaveId, req.employee.id);

    return res.status(200).json({
      success: true,
      message: 'Leave request cancelled successfully',
      data: cancelled
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Get leave balances for current employee or specified employee (HR)
 */
function getLeaveBalances(req, res, next) {
  try {
    const targetEmpId = req.params.employeeId ? parseInt(req.params.employeeId, 10) : (req.employee ? req.employee.id : null);
    if (!targetEmpId) {
      return res.status(400).json({
        success: false,
        message: 'Employee ID required.'
      });
    }

    const year = req.query.year ? parseInt(req.query.year, 10) : new Date().getFullYear();
    const balances = leaveService.getLeaveBalances(targetEmpId, year);

    return res.status(200).json({
      success: true,
      message: 'Leave balances retrieved',
      data: balances
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  applyLeave,
  getMyLeaves,
  getAllLeaves,
  getLeaveById,
  approveLeave,
  rejectLeave,
  cancelLeave,
  getLeaveBalances
};
