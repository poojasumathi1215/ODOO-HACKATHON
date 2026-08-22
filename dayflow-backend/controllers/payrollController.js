const payrollService = require('../services/payrollService');

/**
 * Get logged-in employee's payroll history
 */
function getMyPayroll(req, res, next) {
  try {
    if (!req.employee) {
      return res.status(400).json({
        success: false,
        message: 'No employee profile linked to this user account.'
      });
    }

    const { payYear, page, limit } = req.query;
    const data = payrollService.getPayrolls({
      employeeId: req.employee.id,
      payYear,
      page,
      limit
    });

    return res.status(200).json({
      success: true,
      message: 'Personal payroll records retrieved',
      data
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Get all payrolls (HR only)
 */
function getAllPayrolls(req, res, next) {
  try {
    const { employeeId, departmentId, payMonth, payYear, status, page, limit } = req.query;
    const data = payrollService.getPayrolls({
      employeeId,
      departmentId,
      payMonth,
      payYear,
      status,
      page,
      limit
    });

    return res.status(200).json({
      success: true,
      message: 'Workforce payroll records retrieved',
      data
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Get payroll records for a specific employee ID
 */
function getPayrollByEmployeeId(req, res, next) {
  try {
    const employeeId = parseInt(req.params.employeeId, 10);
    const { payYear, page, limit } = req.query;

    const data = payrollService.getPayrolls({
      employeeId,
      payYear,
      page,
      limit
    });

    return res.status(200).json({
      success: true,
      message: 'Employee payroll records retrieved',
      data
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Create a new payroll record (HR only)
 */
function createPayroll(req, res, next) {
  try {
    const {
      employeeId,
      basicSalary,
      allowances = 0,
      bonus = 0,
      overtime = 0,
      deductions = 0,
      payMonth,
      payYear = new Date().getFullYear(),
      status = 'Processed'
    } = req.body;

    if (!employeeId || basicSalary === undefined || !payMonth) {
      return res.status(400).json({
        success: false,
        message: 'Employee ID, basic salary, and pay month are required.'
      });
    }

    const payroll = payrollService.createPayroll({
      employeeId: parseInt(employeeId, 10),
      basicSalary,
      allowances,
      bonus,
      overtime,
      deductions,
      payMonth,
      payYear,
      status
    }, req.user.id);

    return res.status(201).json({
      success: true,
      message: 'Payroll record created successfully',
      data: payroll
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Update an existing payroll record (HR only)
 */
function updatePayroll(req, res, next) {
  try {
    const payrollId = parseInt(req.params.id, 10);
    const updated = payrollService.updatePayroll(payrollId, req.body, req.user.id);

    return res.status(200).json({
      success: true,
      message: 'Payroll record updated successfully',
      data: updated
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Get payroll record details by ID
 */
function getPayrollById(req, res, next) {
  try {
    const payrollId = parseInt(req.params.id, 10);
    const record = payrollService.getPayrollById(payrollId);

    if (!record) {
      return res.status(404).json({
        success: false,
        message: 'Payroll record not found.'
      });
    }

    // Access check: HR or the employee themselves
    if (req.user.role !== 'HR' && (!req.employee || req.employee.id !== record.employee_id)) {
      return res.status(403).json({
        success: false,
        message: 'Forbidden. You do not have permission to view this payroll record.'
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Payroll details retrieved',
      data: record
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getMyPayroll,
  getAllPayrolls,
  getPayrollByEmployeeId,
  createPayroll,
  updatePayroll,
  getPayrollById
};
