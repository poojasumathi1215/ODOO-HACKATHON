const express = require('express');
const router = express.Router();
const reportController = require('../controllers/reportController');
const authMiddleware = require('../middleware/authMiddleware');
const { requireHR } = require('../middleware/roleMiddleware');

router.use(authMiddleware);
router.use(requireHR);

// GET /api/reports/employees
router.get('/employees', reportController.getEmployeeReport);

// GET /api/reports/attendance
router.get('/attendance', reportController.getAttendanceReport);

// GET /api/reports/leaves
router.get('/leaves', reportController.getLeaveReport);

// GET /api/reports/payroll
router.get('/payroll', reportController.getPayrollReport);

// GET /api/reports/wellness
router.get('/wellness', reportController.getWellnessReport);

module.exports = router;
