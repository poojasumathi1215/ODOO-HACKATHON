const express = require('express');
const router = express.Router();
const payrollController = require('../controllers/payrollController');
const authMiddleware = require('../middleware/authMiddleware');
const { requireHR, requireSelfOrHR } = require('../middleware/roleMiddleware');
const { body, handleValidationErrors } = require('../utils/validation');

router.use(authMiddleware);

// GET /api/payroll/my - Current employee's payroll
router.get('/my', payrollController.getMyPayroll);

// GET /api/payroll - All payroll records (HR only)
router.get('/', requireHR, payrollController.getAllPayrolls);

// GET /api/payroll/record/:id - Specific payroll slip by record ID
router.get('/record/:id', payrollController.getPayrollById);

// GET /api/payroll/:employeeId - Payroll history for employee ID (HR or self)
router.get('/:employeeId', requireSelfOrHR('employeeId'), payrollController.getPayrollByEmployeeId);

// POST /api/payroll - Create payroll record (HR only)
router.post(
  '/',
  requireHR,
  [
    body('employeeId').isNumeric().withMessage('Valid employee ID is required'),
    body('basicSalary').isFloat({ min: 0 }).withMessage('Basic salary must be a positive number'),
    body('payMonth').isInt({ min: 1, max: 12 }).withMessage('Pay month must be between 1 and 12'),
    body('payYear').isInt({ min: 2000, max: 2100 }).withMessage('Valid pay year is required'),
    handleValidationErrors
  ],
  payrollController.createPayroll
);

// PUT /api/payroll/:id - Update payroll record (HR only)
router.put('/:id', requireHR, payrollController.updatePayroll);

module.exports = router;
