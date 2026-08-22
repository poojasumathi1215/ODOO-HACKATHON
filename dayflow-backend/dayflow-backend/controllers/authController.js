const bcrypt = require('bcryptjs');
const { db } = require('../database/database');
const { signToken } = require('../utils/jwt');
const { logAudit } = require('../utils/auditLogger');

/**
 * Register a new user
 */
async function register(req, res, next) {
  try {
    const { name, email, password, role = 'Employee' } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Name, email, and password are required.'
      });
    }

    const normalizedEmail = email.toLowerCase().trim();

    // Check if user already exists
    const existing = db.prepare('SELECT id FROM users WHERE email = ?').get(normalizedEmail);
    if (existing) {
      return res.status(409).json({
        success: false,
        message: 'A user with this email address already exists.'
      });
    }

    const assignedRole = role === 'HR' ? 'HR' : 'Employee';
    const hashedPassword = await bcrypt.hash(password, 10);

    const stmt = db.prepare(`
      INSERT INTO users (name, email, password, role, is_active, created_at, updated_at)
      VALUES (?, ?, ?, ?, 1, DATETIME('now'), DATETIME('now'))
    `);
    const result = stmt.run(name.trim(), normalizedEmail, hashedPassword, assignedRole);
    const userId = result.lastInsertRowid;

    const user = {
      id: userId,
      name: name.trim(),
      email: normalizedEmail,
      role: assignedRole
    };

    const token = signToken({ id: user.id, email: user.email, role: user.role });

    logAudit(userId, 'REGISTER', 'USER', userId, `User registered with role ${assignedRole}`);

    return res.status(201).json({
      success: true,
      message: 'Registration successful.',
      data: {
        token,
        user
      }
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Authenticate user and return JWT
 */
async function login(req, res, next) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required.'
      });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const user = db.prepare('SELECT * FROM users WHERE email = ?').get(normalizedEmail);

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.'
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.'
      });
    }

    if (!user.is_active) {
      return res.status(403).json({
        success: false,
        message: 'Your account has been deactivated. Please contact HR.'
      });
    }

    const token = signToken({ id: user.id, email: user.email, role: user.role });

    // Fetch employee profile if exists
    const employee = db.prepare(`
      SELECT e.*, d.name as department_name, t.name as team_name
      FROM employees e
      LEFT JOIN departments d ON e.department_id = d.id
      LEFT JOIN teams t ON e.team_id = t.id
      WHERE e.user_id = ?
    `).get(user.id);

    logAudit(user.id, 'LOGIN', 'USER', user.id, 'User logged in successfully');

    return res.status(200).json({
      success: true,
      message: 'Login successful',
      data: {
        token,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role
        },
        employee: employee || null
      }
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Get current authenticated user and profile
 */
function getMe(req, res, next) {
  try {
    const user = db.prepare('SELECT id, name, email, role, is_active, created_at FROM users WHERE id = ?').get(req.user.id);
    const employee = db.prepare(`
      SELECT e.*, d.name as department_name, t.name as team_name
      FROM employees e
      LEFT JOIN departments d ON e.department_id = d.id
      LEFT JOIN teams t ON e.team_id = t.id
      WHERE e.user_id = ?
    `).get(req.user.id);

    return res.status(200).json({
      success: true,
      message: 'User profile retrieved',
      data: {
        user,
        employee: employee || null
      }
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Forgot password request handler
 */
function forgotPassword(req, res, next) {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Email is required.'
      });
    }

    const user = db.prepare('SELECT id FROM users WHERE email = ?').get(email.toLowerCase().trim());
    if (!user) {
      // Return success message to prevent user enumeration
      return res.status(200).json({
        success: true,
        message: 'If the email exists in our system, a password reset link has been dispatched.'
      });
    }

    logAudit(user.id, 'FORGOT_PASSWORD', 'USER', user.id, 'Password reset requested');

    return res.status(200).json({
      success: true,
      message: 'If the email exists in our system, a password reset link has been dispatched.',
      data: {
        resetToken: 'mock-reset-token-' + Buffer.from(email).toString('hex')
      }
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Reset password handler
 */
async function resetPassword(req, res, next) {
  try {
    const { email, newPassword } = req.body;
    if (!email || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Email and new password are required.'
      });
    }

    const user = db.prepare('SELECT id FROM users WHERE email = ?').get(email.toLowerCase().trim());
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found.'
      });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    db.prepare('UPDATE users SET password = ?, updated_at = DATETIME(\'now\') WHERE id = ?').run(hashedPassword, user.id);

    logAudit(user.id, 'RESET_PASSWORD', 'USER', user.id, 'Password reset completed');

    return res.status(200).json({
      success: true,
      message: 'Password has been reset successfully. You can now login.'
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  register,
  login,
  getMe,
  forgotPassword,
  resetPassword
};
