const { db } = require('../database/database');
const { logAudit } = require('../utils/auditLogger');

/**
 * Get all departments with team and employee count
 */
function getDepartments(req, res, next) {
  try {
    const departments = db.prepare(`
      SELECT 
        d.id, d.name, d.description, d.created_at,
        COUNT(DISTINCT e.id) as employee_count,
        COUNT(DISTINCT t.id) as team_count
      FROM departments d
      LEFT JOIN employees e ON d.id = e.department_id
      LEFT JOIN teams t ON d.id = t.department_id
      GROUP BY d.id, d.name
      ORDER BY d.name ASC
    `).all();

    return res.status(200).json({
      success: true,
      message: 'Departments retrieved',
      data: departments
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Create a new department (HR only)
 */
function createDepartment(req, res, next) {
  try {
    const { name, description } = req.body;
    if (!name) {
      return res.status(400).json({
        success: false,
        message: 'Department name is required.'
      });
    }

    const stmt = db.prepare('INSERT INTO departments (name, description, created_at) VALUES (?, ?, DATETIME(\'now\'))');
    const result = stmt.run(name.trim(), description || null);

    logAudit(req.user.id, 'DEPARTMENT_CREATE', 'DEPARTMENT', result.lastInsertRowid, `Created department ${name}`);

    const dept = db.prepare('SELECT * FROM departments WHERE id = ?').get(result.lastInsertRowid);

    return res.status(201).json({
      success: true,
      message: 'Department created successfully',
      data: dept
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Get teams list
 */
function getTeams(req, res, next) {
  try {
    const { departmentId } = req.query;
    let query = `
      SELECT t.*, d.name as department_name, m.name as manager_name, COUNT(e.id) as member_count
      FROM teams t
      JOIN departments d ON t.department_id = d.id
      LEFT JOIN users m ON t.manager_id = m.id
      LEFT JOIN employees e ON t.id = e.team_id
      WHERE 1=1
    `;
    const params = [];
    if (departmentId) {
      query += ' AND t.department_id = ?';
      params.push(departmentId);
    }
    query += ' GROUP BY t.id, t.name ORDER BY t.name ASC';

    const teams = db.prepare(query).all(...params);

    return res.status(200).json({
      success: true,
      message: 'Teams retrieved',
      data: teams
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Create a new team (HR only)
 */
function createTeam(req, res, next) {
  try {
    const { departmentId, name, managerId } = req.body;
    if (!departmentId || !name) {
      return res.status(400).json({
        success: false,
        message: 'Department ID and team name are required.'
      });
    }

    const stmt = db.prepare('INSERT INTO teams (department_id, name, manager_id, created_at) VALUES (?, ?, ?, DATETIME(\'now\'))');
    const result = stmt.run(departmentId, name.trim(), managerId || null);

    logAudit(req.user.id, 'TEAM_CREATE', 'TEAM', result.lastInsertRowid, `Created team ${name}`);

    const team = db.prepare('SELECT * FROM teams WHERE id = ?').get(result.lastInsertRowid);

    return res.status(201).json({
      success: true,
      message: 'Team created successfully',
      data: team
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getDepartments,
  createDepartment,
  getTeams,
  createTeam
};
