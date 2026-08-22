const express = require('express');
const router = express.Router();
const notificationController = require('../controllers/notificationController');
const authMiddleware = require('../middleware/authMiddleware');

router.use(authMiddleware);

// GET /api/notifications - User's notifications
router.get('/', notificationController.getNotifications);

// PUT /api/notifications/read-all - Mark all user notifications as read
router.put('/read-all', notificationController.markAllAsRead);

// PUT /api/notifications/:id/read - Mark specific notification as read
router.put('/:id/read', notificationController.markAsRead);

module.exports = router;
