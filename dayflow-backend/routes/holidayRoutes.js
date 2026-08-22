const express = require('express');
const router = express.Router();
const holidayController = require('../controllers/holidayController');
const authMiddleware = require('../middleware/authMiddleware');
const { requireHR } = require('../middleware/roleMiddleware');

router.use(authMiddleware);

// GET /api/holidays
router.get('/', holidayController.getHolidays);

// POST /api/holidays (HR only)
router.post('/', requireHR, holidayController.createHoliday);

// PUT /api/holidays/:id (HR only)
router.put('/:id', requireHR, holidayController.updateHoliday);

// DELETE /api/holidays/:id (HR only)
router.delete('/:id', requireHR, holidayController.deleteHoliday);

module.exports = router;
