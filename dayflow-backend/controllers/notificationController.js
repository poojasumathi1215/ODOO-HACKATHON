const { db } = require('../database/database');

/**
 * Get notifications for current authenticated user
 */
function getNotifications(req, res, next) {
  try {
    const userId = req.user.id;
    const limit = parseInt(req.query.limit, 10) || 50;

    const notifications = db.prepare(`
      SELECT * FROM notifications 
      WHERE user_id = ? 
      ORDER BY created_at DESC 
      LIMIT ?
    `).all(userId, limit);

    const unreadCount = db.prepare(`
      SELECT COUNT(*) as count FROM notifications 
      WHERE user_id = ? AND is_read = 0
    `).get(userId).count;

    return res.status(200).json({
      success: true,
      message: 'Notifications retrieved',
      data: {
        notifications,
        unreadCount
      }
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Mark a single notification as read
 */
function markAsRead(req, res, next) {
  try {
    const notificationId = parseInt(req.params.id, 10);
    const userId = req.user.id;

    const notif = db.prepare('SELECT id FROM notifications WHERE id = ? AND user_id = ?').get(notificationId, userId);
    if (!notif) {
      return res.status(404).json({
        success: false,
        message: 'Notification not found'
      });
    }

    db.prepare('UPDATE notifications SET is_read = 1 WHERE id = ?').run(notificationId);

    return res.status(200).json({
      success: true,
      message: 'Notification marked as read'
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Mark all notifications for the current user as read
 */
function markAllAsRead(req, res, next) {
  try {
    const userId = req.user.id;
    db.prepare('UPDATE notifications SET is_read = 1 WHERE user_id = ?').run(userId);

    return res.status(200).json({
      success: true,
      message: 'All notifications marked as read'
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getNotifications,
  markAsRead,
  markAllAsRead
};
