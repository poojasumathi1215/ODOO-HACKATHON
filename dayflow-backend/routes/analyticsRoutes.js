const express = require('express');
const router = express.Router();
const analyticsController = require('../controllers/analyticsController');
const authMiddleware = require('../middleware/authMiddleware');
const { requireHR } = require('../middleware/roleMiddleware');

router.use(authMiddleware);
router.use(requireHR);

// GET /api/analytics/dashboard - Overall KPI summary
router.get('/dashboard', analyticsController.getDashboardAnalytics);

// GET /api/analytics/attendance - Attendance trends & metrics for Recharts
router.get('/attendance', analyticsController.getAttendanceAnalytics);

// GET /api/analytics/leaves - Leave analytics & metrics for Recharts
router.get('/leaves', analyticsController.getLeaveAnalytics);

// GET /api/analytics/workforce - Workforce demographic & headcount analytics
router.get('/workforce', analyticsController.getWorkforceAnalytics);

// GET /api/analytics/wellness - Organization wellness scores for charts
router.get('/wellness', analyticsController.getWellnessAnalytics);

module.exports = router;
