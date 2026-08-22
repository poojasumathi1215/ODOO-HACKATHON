const express = require('express');
const router = express.Router();
const attendanceController = require('../controllers/attendanceController');
const authMiddleware = require('../middleware/authMiddleware');
const { requireHR, requireSelfOrHR } = require('../middleware/roleMiddleware');

router.use(authMiddleware);

// POST /api/attendance/check-in
router.post('/check-in', attendanceController.checkIn);

// POST /api/attendance/check-out
router.post('/check-out', attendanceController.checkOut);

// GET /api/attendance/my
router.get('/my', attendanceController.getMyAttendance);

// GET /api/attendance/summary (HR summary dashboard)
router.get('/summary', attendanceController.getAttendanceSummary);

// GET /api/attendance (HR filtered workforce list)
router.get('/', requireHR, attendanceController.getAttendance);

// GET /api/attendance/:employeeId (HR or self)
router.get('/:employeeId', requireSelfOrHR('employeeId'), attendanceController.getEmployeeAttendanceById);

module.exports = router;
