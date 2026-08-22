const express = require('express');
const router = express.Router();
const employeeController = require('../controllers/employeeController');
const authMiddleware = require('../middleware/authMiddleware');
const { requireHR, requireSelfOrHR } = require('../middleware/roleMiddleware');
const { body, handleValidationErrors } = require('../utils/validation');

// All employee endpoints require authentication
router.use(authMiddleware);

// GET /api/employees - Get all employees (Search, Filter, Sort, Pagination)
router.get('/', employeeController.getAllEmployees);

// GET /api/employees/:id - Get employee details
router.get('/:id', requireSelfOrHR('id'), employeeController.getEmployeeById);

// POST /api/employees - Create new employee (HR only)
router.post(
  '/',
  requireHR,
  [
    body('name').trim().notEmpty().withMessage('Name is required'),
    body('email').isEmail().withMessage('Valid email is required'),
    body('employeeId').trim().notEmpty().withMessage('Employee ID is required'),
    body('designation').trim().notEmpty().withMessage('Designation is required'),
    handleValidationErrors
  ],
  employeeController.createEmployee
);

// PUT /api/employees/:id - Update employee (HR only)
router.put('/:id', requireHR, employeeController.updateEmployee);

// PATCH /api/employees/:id/status - Update employee employment status (HR only)
router.patch(
  '/:id/status',
  requireHR,
  [
    body('status').isIn(['Active', 'Inactive', 'On Leave', 'Terminated']).withMessage('Status must be Active, Inactive, On Leave, or Terminated'),
    handleValidationErrors
  ],
  employeeController.updateEmployeeStatus
);

// DELETE /api/employees/:id - Delete employee (HR only)
router.delete('/:id', requireHR, employeeController.deleteEmployee);

module.exports = router;
