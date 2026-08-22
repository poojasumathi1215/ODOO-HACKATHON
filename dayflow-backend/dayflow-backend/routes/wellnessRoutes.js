const express = require('express');
const router = express.Router();
const wellnessController = require('../controllers/wellnessController');
const authMiddleware = require('../middleware/authMiddleware');
const { requireHR, requireSelfOrHR } = require('../middleware/roleMiddleware');

router.use(authMiddleware);

// GET /api/wellness/my - Employee's own wellness indicator
router.get('/my', wellnessController.getMyWellness);

// GET /api/wellness - Workforce wellness overview (HR only)
router.get('/', requireHR, wellnessController.getWorkforceWellness);

// GET /api/wellness/:employeeId/history - Wellness score history
router.get('/:employeeId/history', requireSelfOrHR('employeeId'), wellnessController.getEmployeeWellnessHistory);

// GET /api/wellness/:employeeId - Employee wellness by ID
router.get('/:employeeId', requireSelfOrHR('employeeId'), wellnessController.getEmployeeWellnessById);

// POST /api/wellness/:employeeId/recalculate - Trigger recalculation (HR only)
router.post('/:employeeId/recalculate', requireHR, wellnessController.recalculateWellness);

module.exports = router;
