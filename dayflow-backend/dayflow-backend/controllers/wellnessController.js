const wellnessService = require('../services/wellnessService');

/**
 * Get logged-in employee's wellness indicator
 */
function getMyWellness(req, res, next) {
  try {
    if (!req.employee) {
      return res.status(400).json({
        success: false,
        message: 'No employee profile linked to this user account.'
      });
    }

    const data = wellnessService.getEmployeeWellness(req.employee.id);
    const history = wellnessService.getEmployeeWellnessHistory(req.employee.id, 6);

    return res.status(200).json({
      success: true,
      message: 'Personal wellness indicator retrieved',
      data: {
        current: data,
        history
      }
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Get workforce wellness (HR only)
 */
function getWorkforceWellness(req, res, next) {
  try {
    const { departmentId, indicatorLevel, page, limit } = req.query;
    const data = wellnessService.getWorkforceWellness({ departmentId, indicatorLevel, page, limit });

    return res.status(200).json({
      success: true,
      message: 'Workforce wellness indicators retrieved',
      data
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Get wellness indicator for a specific employee ID
 */
function getEmployeeWellnessById(req, res, next) {
  try {
    const employeeId = parseInt(req.params.employeeId, 10);
    const data = wellnessService.getEmployeeWellness(employeeId);

    return res.status(200).json({
      success: true,
      message: 'Employee wellness indicator retrieved',
      data
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Get wellness history for a specific employee ID
 */
function getEmployeeWellnessHistory(req, res, next) {
  try {
    const employeeId = parseInt(req.params.employeeId, 10);
    const limit = req.query.limit || 12;
    const history = wellnessService.getEmployeeWellnessHistory(employeeId, limit);

    return res.status(200).json({
      success: true,
      message: 'Employee wellness history retrieved',
      data: history
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Trigger on-demand wellness recalculation for an employee
 */
function recalculateWellness(req, res, next) {
  try {
    const employeeId = parseInt(req.params.employeeId, 10);
    const result = wellnessService.calculateEmployeeWellness(employeeId);

    return res.status(200).json({
      success: true,
      message: 'Wellness indicator recalculated successfully',
      data: result
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getMyWellness,
  getWorkforceWellness,
  getEmployeeWellnessById,
  getEmployeeWellnessHistory,
  recalculateWellness
};
