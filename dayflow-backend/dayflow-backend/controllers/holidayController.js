const { db } = require('../database/database');
const { logAudit } = require('../utils/auditLogger');

/**
 * Get list of holidays
 */
function getHolidays(req, res, next) {
  try {
    const year = req.query.year || new Date().getFullYear();
    const holidays = db.prepare(`
      SELECT * FROM holidays 
      WHERE strftime('%Y', date) = ?
      ORDER BY date ASC
    `).all(String(year));

    return res.status(200).json({
      success: true,
      message: 'Holidays retrieved',
      data: holidays
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Create a new holiday (HR only)
 */
function createHoliday(req, res, next) {
  try {
    const { name, date, description } = req.body;
    if (!name || !date) {
      return res.status(400).json({
        success: false,
        message: 'Holiday name and date (YYYY-MM-DD) are required.'
      });
    }

    const stmt = db.prepare('INSERT INTO holidays (name, date, description, created_at) VALUES (?, ?, ?, DATETIME(\'now\'))');
    const result = stmt.run(name.trim(), date, description || null);

    logAudit(req.user.id, 'HOLIDAY_CREATE', 'HOLIDAY', result.lastInsertRowid, `Created holiday ${name} on ${date}`);

    const holiday = db.prepare('SELECT * FROM holidays WHERE id = ?').get(result.lastInsertRowid);

    return res.status(201).json({
      success: true,
      message: 'Holiday created successfully',
      data: holiday
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Update holiday (HR only)
 */
function updateHoliday(req, res, next) {
  try {
    const holidayId = parseInt(req.params.id, 10);
    const { name, date, description } = req.body;

    const existing = db.prepare('SELECT * FROM holidays WHERE id = ?').get(holidayId);
    if (!existing) {
      return res.status(404).json({
        success: false,
        message: 'Holiday not found'
      });
    }

    db.prepare(`
      UPDATE holidays 
      SET name = ?, date = ?, description = ?
      WHERE id = ?
    `).run(
      name !== undefined ? name.trim() : existing.name,
      date !== undefined ? date : existing.date,
      description !== undefined ? description : existing.description,
      holidayId
    );

    const updated = db.prepare('SELECT * FROM holidays WHERE id = ?').get(holidayId);

    return res.status(200).json({
      success: true,
      message: 'Holiday updated successfully',
      data: updated
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Delete holiday (HR only)
 */
function deleteHoliday(req, res, next) {
  try {
    const holidayId = parseInt(req.params.id, 10);
    const existing = db.prepare('SELECT * FROM holidays WHERE id = ?').get(holidayId);
    if (!existing) {
      return res.status(404).json({
        success: false,
        message: 'Holiday not found'
      });
    }

    db.prepare('DELETE FROM holidays WHERE id = ?').run(holidayId);

    return res.status(200).json({
      success: true,
      message: 'Holiday deleted successfully'
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getHolidays,
  createHoliday,
  updateHoliday,
  deleteHoliday
};
