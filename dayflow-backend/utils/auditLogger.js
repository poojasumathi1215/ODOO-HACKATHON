const { db } = require('../database/database');

/**
 * Logs an action to the audit_logs table
 * Security note: Never logs passwords or sensitive credentials
 * @param {number|null} userId - The user ID performing the action
 * @param {string} action - e.g. 'LOGIN', 'EMPLOYEE_CREATE', 'LEAVE_APPROVE'
 * @param {string} entityType - e.g. 'USER', 'EMPLOYEE', 'LEAVE', 'PAYROLL', 'ALERT'
 * @param {number|null} entityId - Target entity ID
 * @param {string} description - Human-readable description
 */
function logAudit(userId, action, entityType, entityId, description) {
  try {
    const stmt = db.prepare(`
      INSERT INTO audit_logs (user_id, action, entity_type, entity_id, description, created_at)
      VALUES (?, ?, ?, ?, ?, DATETIME('now'))
    `);
    stmt.run(userId || null, action, entityType, entityId || null, description);
  } catch (err) {
    console.error('[AuditLog Error]', err.message);
  }
}

module.exports = {
  logAudit
};
