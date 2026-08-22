const express = require('express');
const router = express.Router();
const leaveController = require('../controllers/leaveController');
const authMiddleware = require('../middleware/authMiddleware');
const { requireHR } = require('../middleware/roleMiddleware');
const { body, handleValidationErrors } = require('../utils/validation');

router.use(authMiddleware);

// POST /api/leaves - Apply for leave
router.post(
  '/',
  [
    body('leaveType').isIn(['Casual Leave', 'Sick Leave', 'Annual Leave', 'Emergency Leave']).withMessage('Invalid leave type'),
    body('startDate').isDate({ format: 'YYYY-MM-DD' }).withMessage('Start date must be YYYY-MM-DD'),
    body('endDate').isDate({ format: 'YYYY-MM-DD' }).withMessage('End date must be YYYY-MM-DD'),
    body('reason').trim().notEmpty().withMessage('Reason is required'),
    handleValidationErrors
  ],
  leaveController.applyLeave
);

// GET /api/leaves/my - Employee's own leaves & balances
router.get('/my', leaveController.getMyLeaves);

// GET /api/leaves/balances/:employeeId? - Leave balances
router.get('/balances', leaveController.getLeaveBalances);
router.get('/balances/:employeeId', requireHR, leaveController.getLeaveBalances);

// GET /api/leaves - All leaves (HR)
router.get('/', requireHR, leaveController.getAllLeaves);

// GET /api/leaves/:id - Leave detail
router.get('/:id', leaveController.getLeaveById);

// PUT /api/leaves/:id/approve - Approve leave (HR)
router.put('/:id/approve', requireHR, leaveController.approveLeave);

// PUT /api/leaves/:id/reject - Reject leave (HR)
router.put('/:id/reject', requireHR, leaveController.rejectLeave);

// PUT /api/leaves/:id/cancel - Cancel pending leave (Employee)
router.put('/:id/cancel', leaveController.cancelLeave);

module.exports = router;
