const bcrypt = require('bcryptjs');
const { db } = require('../database/database');
const { logAudit } = require('../utils/auditLogger');
const wellnessService = require('../services/wellnessService');

/**
 * Get list of employees with search, filter, sorting, and pagination
 */
function getAllEmployees(req, res, next) {
  try {
    const {
      search,
      departmentId,
      teamId,
      status,
      sortBy = 'e.created_at',
      sortOrder = 'DESC',
      page = 1,
      limit = 20
    } = req.query;

    let baseSql = `
      FROM employees e
      JOIN users u ON e.user_id = u.id
      LEFT JOIN departments d ON e.department_id = d.id
      LEFT JOIN teams t ON e.team_id = t.id
      LEFT JOIN users m ON e.manager_id = m.id
      WHERE 1=1
    `;
    const params = [];

    if (search) {
      baseSql += ` AND (u.name LIKE ? OR u.email LIKE ? OR e.employee_id LIKE ? OR e.designation LIKE ?)`;
      const s = `%${search}%`;
      params.push(s, s, s, s);
    }

    if (departmentId) {
      baseSql += ' AND e.department_id = ?';
      params.push(departmentId);
    }

    if (teamId) {
      baseSql += ' AND e.team_id = ?';
      params.push(teamId);
    }

    if (status) {
      baseSql += ' AND e.employment_status = ?';
      params.push(status);
    }

    const countRow = db.prepare(`SELECT COUNT(*) as count ${baseSql}`).get(...params);
    const total = countRow ? countRow.count : 0;

    const parsedLimit = Math.max(1, parseInt(limit, 10) || 20);
    const parsedPage = Math.max(1, parseInt(page, 10) || 1);
    const offset = (parsedPage - 1) * parsedLimit;

    // Sanitize sort parameters
    const allowedSortFields = ['e.created_at', 'u.name', 'e.employee_id', 'e.joining_date', 'e.employment_status', 'd.name'];
    const safeSortBy = allowedSortFields.includes(sortBy) ? sortBy : 'e.created_at';
    const safeSortOrder = sortOrder.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';

    const dataSql = `
      SELECT 
        e.id, e.user_id, e.employee_id, e.phone, e.department_id, e.team_id,
        e.designation, e.manager_id, e.joining_date, e.address, e.profile_image,
        e.employment_status, e.created_at, e.updated_at,
        u.name, u.email, u.role, u.is_active,
        d.name as department_name, t.name as team_name, m.name as manager_name
      ${baseSql}
      ORDER BY ${safeSortBy} ${safeSortOrder}
      LIMIT ? OFFSET ?
    `;

    const records = db.prepare(dataSql).all(...params, parsedLimit, offset);

    return res.status(200).json({
      success: true,
      message: 'Employees retrieved successfully',
      data: {
        records,
        total,
        page: parsedPage,
        totalPages: Math.ceil(total / parsedLimit) || 1,
        limit: parsedLimit
      }
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Get employee by ID
 */
function getEmployeeById(req, res, next) {
  try {
    const employeeId = req.params.id;

    const employee = db.prepare(`
      SELECT 
        e.id, e.user_id, e.employee_id, e.phone, e.department_id, e.team_id,
        e.designation, e.manager_id, e.joining_date, e.address, e.profile_image,
        e.employment_status, e.created_at, e.updated_at,
        u.name, u.email, u.role, u.is_active,
        d.name as department_name, t.name as team_name, m.name as manager_name
      FROM employees e
      JOIN users u ON e.user_id = u.id
      LEFT JOIN departments d ON e.department_id = d.id
      LEFT JOIN teams t ON e.team_id = t.id
      LEFT JOIN users m ON e.manager_id = m.id
      WHERE e.id = ?
    `).get(employeeId);

    if (!employee) {
      return res.status(404).json({
        success: false,
        message: 'Employee not found'
      });
    }

    // Include leave balances
    const leaveBalances = db.prepare(`
      SELECT * FROM leave_balances WHERE employee_id = ? AND year = ?
    `).all(employeeId, new Date().getFullYear());

    // Include latest wellness indicator
    const latestWellness = db.prepare(`
      SELECT * FROM wellness_indicators WHERE employee_id = ? ORDER BY calculated_at DESC LIMIT 1
    `).get(employeeId);

    return res.status(200).json({
      success: true,
      message: 'Employee details retrieved',
      data: {
        ...employee,
        leaveBalances,
        wellness: latestWellness || null
      }
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Create a new employee
 */
async function createEmployee(req, res, next) {
  try {
    const {
      name,
      email,
      password = 'Employee@123',
      employeeId,
      phone,
      departmentId,
      teamId,
      designation,
      managerId,
      joiningDate = new Date().toISOString().split('T')[0],
      address,
      profileImage,
      role = 'Employee'
    } = req.body;

    if (!name || !email || !employeeId || !designation) {
      return res.status(400).json({
        success: false,
        message: 'Name, email, employee ID, and designation are required.'
      });
    }

    const normalizedEmail = email.toLowerCase().trim();

    // Check unique email
    const existingUser = db.prepare('SELECT id FROM users WHERE email = ?').get(normalizedEmail);
    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: 'A user with this email address already exists.'
      });
    }

    // Check unique employee_id
    const existingEmpId = db.prepare('SELECT id FROM employees WHERE employee_id = ?').get(employeeId);
    if (existingEmpId) {
      return res.status(409).json({
        success: false,
        message: `Employee ID '${employeeId}' is already registered.`
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const currentYear = new Date().getFullYear();

    let createdRecord;

    const createTx = db.transaction(() => {
      // 1. Create User
      const userRes = db.prepare(`
        INSERT INTO users (name, email, password, role, is_active, created_at, updated_at)
        VALUES (?, ?, ?, ?, 1, DATETIME('now'), DATETIME('now'))
      `).run(name.trim(), normalizedEmail, hashedPassword, role);
      const userId = userRes.lastInsertRowid;

      // 2. Create Employee
      const empRes = db.prepare(`
        INSERT INTO employees (
          user_id, employee_id, phone, department_id, team_id, designation,
          manager_id, joining_date, address, profile_image, employment_status,
          created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'Active', DATETIME('now'), DATETIME('now'))
      `).run(
        userId, employeeId, phone || null, departmentId || null, teamId || null,
        designation, managerId || null, joiningDate, address || null,
        profileImage || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'
      );
      const newEmpId = empRes.lastInsertRowid;

      // 3. Initialize default leave balances
      const defaultTypes = [
        { type: 'Annual Leave', days: 18 },
        { type: 'Casual Leave', days: 12 },
        { type: 'Sick Leave', days: 10 },
        { type: 'Emergency Leave', days: 5 }
      ];

      defaultTypes.forEach(lt => {
        db.prepare(`
          INSERT INTO leave_balances (employee_id, leave_type, total_days, used_days, remaining_days, year, created_at, updated_at)
          VALUES (?, ?, ?, 0, ?, ?, DATETIME('now'), DATETIME('now'))
        `).run(newEmpId, lt.type, lt.days, lt.days, currentYear);
      });

      // 4. Initialize Baseline Wellness Indicator
      db.prepare(`
        INSERT INTO wellness_indicators (
          employee_id, attendance_score, absence_score, leave_pattern_score, trend_score,
          overall_score, indicator_level, explanation, calculated_at
        ) VALUES (?, 100, 100, 100, 100, 100, 'Stable', 'New employee baseline recorded.', DATETIME('now'))
      `).run(newEmpId);

      // 5. Log Audit
      logAudit(req.user ? req.user.id : null, 'EMPLOYEE_CREATE', 'EMPLOYEE', newEmpId, `Created employee record for ${name} (${employeeId})`);

      createdRecord = db.prepare(`
        SELECT e.*, u.name, u.email, u.role, d.name as department_name, t.name as team_name
        FROM employees e
        JOIN users u ON e.user_id = u.id
        LEFT JOIN departments d ON e.department_id = d.id
        LEFT JOIN teams t ON e.team_id = t.id
        WHERE e.id = ?
      `).get(newEmpId);
    });

    createTx();

    return res.status(201).json({
      success: true,
      message: 'Employee created successfully',
      data: createdRecord
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Update an employee record
 */
function updateEmployee(req, res, next) {
  try {
    const employeeId = req.params.id;
    const existing = db.prepare('SELECT * FROM employees WHERE id = ?').get(employeeId);

    if (!existing) {
      return res.status(404).json({
        success: false,
        message: 'Employee not found'
      });
    }

    const {
      name,
      phone,
      departmentId,
      teamId,
      designation,
      managerId,
      joiningDate,
      address,
      profileImage
    } = req.body;

    const updateTx = db.transaction(() => {
      // Update User Name if provided
      if (name) {
        db.prepare('UPDATE users SET name = ?, updated_at = DATETIME(\'now\') WHERE id = ?').run(name.trim(), existing.user_id);
      }

      db.prepare(`
        UPDATE employees
        SET phone = ?, department_id = ?, team_id = ?, designation = ?,
            manager_id = ?, joining_date = ?, address = ?, profile_image = ?,
            updated_at = DATETIME('now')
        WHERE id = ?
      `).run(
        phone !== undefined ? phone : existing.phone,
        departmentId !== undefined ? departmentId : existing.department_id,
        teamId !== undefined ? teamId : existing.team_id,
        designation !== undefined ? designation : existing.designation,
        managerId !== undefined ? managerId : existing.manager_id,
        joiningDate !== undefined ? joiningDate : existing.joining_date,
        address !== undefined ? address : existing.address,
        profileImage !== undefined ? profileImage : existing.profile_image,
        employeeId
      );

      logAudit(req.user.id, 'EMPLOYEE_UPDATE', 'EMPLOYEE', employeeId, `Updated employee profile for ID ${employeeId}`);
    });

    updateTx();

    const updated = db.prepare(`
      SELECT e.*, u.name, u.email, u.role, d.name as department_name, t.name as team_name
      FROM employees e
      JOIN users u ON e.user_id = u.id
      LEFT JOIN departments d ON e.department_id = d.id
      LEFT JOIN teams t ON e.team_id = t.id
      WHERE e.id = ?
    `).get(employeeId);

    return res.status(200).json({
      success: true,
      message: 'Employee updated successfully',
      data: updated
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Patch employee status (Active, Inactive, On Leave, Terminated)
 */
function updateEmployeeStatus(req, res, next) {
  try {
    const employeeId = req.params.id;
    const { status } = req.body;

    const allowedStatuses = ['Active', 'Inactive', 'On Leave', 'Terminated'];
    if (!status || !allowedStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Invalid status. Allowed values: ${allowedStatuses.join(', ')}`
      });
    }

    const employee = db.prepare('SELECT * FROM employees WHERE id = ?').get(employeeId);
    if (!employee) {
      return res.status(404).json({
        success: false,
        message: 'Employee not found'
      });
    }

    const isActive = status === 'Active' || status === 'On Leave' ? 1 : 0;

    const patchTx = db.transaction(() => {
      db.prepare(`UPDATE employees SET employment_status = ?, updated_at = DATETIME('now') WHERE id = ?`).run(status, employeeId);
      db.prepare(`UPDATE users SET is_active = ?, updated_at = DATETIME('now') WHERE id = ?`).run(isActive, employee.user_id);
      logAudit(req.user.id, 'EMPLOYEE_STATUS_CHANGE', 'EMPLOYEE', employeeId, `Changed status of employee ${employee.employee_id} to ${status}`);
    });

    patchTx();

    return res.status(200).json({
      success: true,
      message: `Employee status updated to ${status}`,
      data: {
        id: parseInt(employeeId, 10),
        employmentStatus: status,
        isActive: isActive === 1
      }
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Delete an employee
 */
function deleteEmployee(req, res, next) {
  try {
    const employeeId = req.params.id;
    const employee = db.prepare('SELECT * FROM employees WHERE id = ?').get(employeeId);

    if (!employee) {
      return res.status(404).json({
        success: false,
        message: 'Employee not found'
      });
    }

    const deleteTx = db.transaction(() => {
      // Deleting user cascades to employee and all linked records
      db.prepare('DELETE FROM users WHERE id = ?').run(employee.user_id);
      logAudit(req.user.id, 'EMPLOYEE_DELETE', 'EMPLOYEE', employeeId, `Deleted employee ${employee.employee_id}`);
    });

    deleteTx();

    return res.status(200).json({
      success: true,
      message: 'Employee deleted successfully'
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getAllEmployees,
  getEmployeeById,
  createEmployee,
  updateEmployee,
  updateEmployeeStatus,
  deleteEmployee
};
