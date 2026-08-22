const { db } = require('../database/database');
const { logAudit } = require('../utils/auditLogger');

class PayrollService {
  /**
   * Calculates net salary from component values
   */
  calculateNetSalary({ basicSalary = 0, allowances = 0, bonus = 0, overtime = 0, deductions = 0 }) {
    const basic = parseFloat(basicSalary) || 0;
    const allow = parseFloat(allowances) || 0;
    const bon = parseFloat(bonus) || 0;
    const ot = parseFloat(overtime) || 0;
    const ded = parseFloat(deductions) || 0;

    const net = basic + allow + bon + ot - ded;
    return parseFloat(net.toFixed(2));
  }

  /**
   * Creates a new payroll record
   */
  createPayroll({ employeeId, basicSalary, allowances = 0, bonus = 0, overtime = 0, deductions = 0, payMonth, payYear, status = 'Processed' }, hrUserId) {
    const month = parseInt(payMonth, 10);
    const year = parseInt(payYear, 10);

    if (month < 1 || month > 12) {
      const err = new Error('Invalid pay month (must be between 1 and 12).');
      err.status = 400;
      throw err;
    }

    const employee = db.prepare(`
      SELECT e.*, u.name, u.id as user_id 
      FROM employees e 
      JOIN users u ON e.user_id = u.id 
      WHERE e.id = ?
    `).get(employeeId);

    if (!employee) {
      const err = new Error('Employee not found.');
      err.status = 404;
      throw err;
    }

    // Check duplicate
    const existing = db.prepare('SELECT id FROM payroll WHERE employee_id = ? AND pay_month = ? AND pay_year = ?').get(employeeId, month, year);
    if (existing) {
      const err = new Error(`Payroll record for employee ID ${employee.employee_id} already exists for ${month}/${year}.`);
      err.status = 409;
      throw err;
    }

    const netSalary = this.calculateNetSalary({ basicSalary, allowances, bonus, overtime, deductions });

    const stmt = db.prepare(`
      INSERT INTO payroll (employee_id, basic_salary, allowances, bonus, overtime, deductions, net_salary, pay_month, pay_year, status, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, DATETIME('now'), DATETIME('now'))
    `);
    const res = stmt.run(employeeId, basicSalary, allowances, bonus, overtime, deductions, netSalary, month, year, status);
    const payrollId = res.lastInsertRowid;

    // Send Notification to Employee
    db.prepare(`
      INSERT INTO notifications (user_id, title, message, type, is_read, created_at)
      VALUES (?, ?, ?, 'Payroll', 0, DATETIME('now'))
    `).run(
      employee.user_id,
      'New Payroll Slip Generated',
      `Your payroll slip for ${month}/${year} has been generated with net salary of $${netSalary.toLocaleString()}.`
    );

    logAudit(hrUserId, 'PAYROLL_CREATE', 'PAYROLL', payrollId, `Created payroll for ${employee.name} (${month}/${year})`);

    return db.prepare('SELECT * FROM payroll WHERE id = ?').get(payrollId);
  }

  /**
   * Updates an existing payroll record
   */
  updatePayroll(payrollId, updateData, hrUserId) {
    const existing = db.prepare('SELECT * FROM payroll WHERE id = ?').get(payrollId);
    if (!existing) {
      const err = new Error('Payroll record not found.');
      err.status = 404;
      throw err;
    }

    const basicSalary = updateData.basicSalary !== undefined ? updateData.basicSalary : existing.basic_salary;
    const allowances = updateData.allowances !== undefined ? updateData.allowances : existing.allowances;
    const bonus = updateData.bonus !== undefined ? updateData.bonus : existing.bonus;
    const overtime = updateData.overtime !== undefined ? updateData.overtime : existing.overtime;
    const deductions = updateData.deductions !== undefined ? updateData.deductions : existing.deductions;
    const status = updateData.status !== undefined ? updateData.status : existing.status;

    const netSalary = this.calculateNetSalary({ basicSalary, allowances, bonus, overtime, deductions });

    db.prepare(`
      UPDATE payroll
      SET basic_salary = ?, allowances = ?, bonus = ?, overtime = ?, deductions = ?, net_salary = ?, status = ?, updated_at = DATETIME('now')
      WHERE id = ?
    `).run(basicSalary, allowances, bonus, overtime, deductions, netSalary, status, payrollId);

    const updated = db.prepare('SELECT * FROM payroll WHERE id = ?').get(payrollId);

    // Notify employee of update
    const emp = db.prepare('SELECT user_id, employee_id FROM employees WHERE id = ?').get(updated.employee_id);
    if (emp) {
      db.prepare(`
        INSERT INTO notifications (user_id, title, message, type, is_read, created_at)
        VALUES (?, ?, ?, 'Payroll', 0, DATETIME('now'))
      `).run(
        emp.user_id,
        'Payroll Updated',
        `Your payroll slip for ${updated.pay_month}/${updated.pay_year} was updated. Status: ${status}, Net: $${netSalary.toLocaleString()}.`
      );
    }

    logAudit(hrUserId, 'PAYROLL_UPDATE', 'PAYROLL', payrollId, `Updated payroll ID ${payrollId}`);

    return updated;
  }

  /**
   * Retrieves payroll list with HR filters
   */
  getPayrolls({ employeeId, departmentId, payMonth, payYear, status, page = 1, limit = 20 } = {}) {
    let baseSql = `
      FROM payroll p
      JOIN employees e ON p.employee_id = e.id
      JOIN users u ON e.user_id = u.id
      LEFT JOIN departments d ON e.department_id = d.id
      WHERE 1=1
    `;
    const params = [];

    if (employeeId) {
      baseSql += ' AND p.employee_id = ?';
      params.push(employeeId);
    }
    if (departmentId) {
      baseSql += ' AND e.department_id = ?';
      params.push(departmentId);
    }
    if (payMonth) {
      baseSql += ' AND p.pay_month = ?';
      params.push(parseInt(payMonth, 10));
    }
    if (payYear) {
      baseSql += ' AND p.pay_year = ?';
      params.push(parseInt(payYear, 10));
    }
    if (status) {
      baseSql += ' AND p.status = ?';
      params.push(status);
    }

    const countRow = db.prepare(`SELECT COUNT(*) as count ${baseSql}`).get(...params);
    const total = countRow ? countRow.count : 0;

    const parsedLimit = parseInt(limit, 10);
    const parsedPage = parseInt(page, 10);
    const offset = (parsedPage - 1) * parsedLimit;

    const dataSql = `
      SELECT p.*, e.employee_id as emp_code, u.name as employee_name, u.email as employee_email,
             e.designation, d.name as department_name
      ${baseSql}
      ORDER BY p.pay_year DESC, p.pay_month DESC, e.employee_id ASC
      LIMIT ? OFFSET ?
    `;

    const records = db.prepare(dataSql).all(...params, parsedLimit, offset);

    return {
      records,
      total,
      page: parsedPage,
      totalPages: Math.ceil(total / parsedLimit) || 1,
      limit: parsedLimit
    };
  }

  /**
   * Retrieves a single payroll record by ID
   */
  getPayrollById(id) {
    return db.prepare(`
      SELECT p.*, e.employee_id as emp_code, u.name as employee_name, u.email as employee_email,
             e.designation, d.name as department_name, e.joining_date, e.user_id
      FROM payroll p
      JOIN employees e ON p.employee_id = e.id
      JOIN users u ON e.user_id = u.id
      LEFT JOIN departments d ON e.department_id = d.id
      WHERE p.id = ?
    `).get(id);
  }
}

module.exports = new PayrollService();
