const express = require('express');
const router = express.Router();
const alertController = require('../controllers/alertController');
const authMiddleware = require('../middleware/authMiddleware');
const { requireHR } = require('../middleware/roleMiddleware');

router.use(authMiddleware);
router.use(requireHR);

// GET /api/alerts - List smart HR alerts
router.get('/', alertController.getAlerts);

// POST /api/alerts/scan - Scan and detect pattern triggers
router.post('/scan', alertController.scanAlerts);

// GET /api/alerts/:id - Get alert details
router.get('/:id', alertController.getAlertById);

// PUT /api/alerts/:id/resolve - Resolve alert
router.put('/:id/resolve', alertController.resolveAlert);

module.exports = router;
