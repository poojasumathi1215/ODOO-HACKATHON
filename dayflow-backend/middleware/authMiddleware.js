const { verifyToken } = require('../utils/jwt');
const { db } = require('../database/database');

/**
 * Authentication Middleware: Validates JWT token from Authorization header
 */
function authMiddleware(req, res, next) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required. No Bearer token provided.'
      });
    }

    const token = authHeader.split(' ')[1];
    let decoded;
    try {
      decoded = verifyToken(token);
    } catch (err) {
      return res.status(401).json({
        success: false,
        message: 'Invalid or expired authentication token.'
      });
    }

    // Retrieve user from database to ensure user is active and exists
    const user = db.prepare('SELECT id, name, email, role, is_active FROM users WHERE id = ?').get(decoded.id);

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'User account not found.'
      });
    }

    if (!user.is_active) {
      return res.status(403).json({
        success: false,
        message: 'Your account has been deactivated. Please contact HR.'
      });
    }

    // Attach user to request
    req.user = user;

    // If user has an associated employee profile, attach it as well
    const employee = db.prepare('SELECT * FROM employees WHERE user_id = ?').get(user.id);
    if (employee) {
      req.employee = employee;
    }

    next();
  } catch (error) {
    next(error);
  }
}

module.exports = authMiddleware;
