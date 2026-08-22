/**
 * ============================================================================
 * DAYFLOW HRMS - DATABASE MODULE
 * SQLite Database Connection, Lifecycle, Safe Query Wrappers & Transactions
 * ============================================================================
 */

const fs = require('fs');
const path = require('path');

// Target database and schema file paths
const DB_DIR = __dirname;
const DB_PATH = path.join(DB_DIR, 'dayflow.db');
const SCHEMA_PATH = path.join(DB_DIR, 'schema.sql');

let dbInstance = null;
let dbDriverType = null; // 'better-sqlite3' | 'node:sqlite'

/**
 * Universal Database Adapter wrapper providing consistent synchronous API
 */
class UniversalDbAdapter {
    constructor(driver, rawDb) {
        this.driver = driver;
        this.rawDb = rawDb;
    }

    exec(sql) {
        if (this.driver === 'better-sqlite3') {
            return this.rawDb.exec(sql);
        } else {
            // node:sqlite DatabaseSync
            return this.rawDb.exec(sql);
        }
    }

    prepare(sql) {
        const stmt = this.rawDb.prepare(sql);
        if (this.driver === 'better-sqlite3') {
            return stmt;
        } else {
            // Adapt node:sqlite StatementSync to match better-sqlite3 API
            return {
                run: (...params) => {
                    const flattened = params.length === 1 && Array.isArray(params[0]) ? params[0] : params;
                    const res = stmt.run(...flattened);
                    return {
                        changes: res.changes,
                        lastInsertRowid: Number(res.lastInsertRowid)
                    };
                },
                get: (...params) => {
                    const flattened = params.length === 1 && Array.isArray(params[0]) ? params[0] : params;
                    return stmt.get(...flattened);
                },
                all: (...params) => {
                    const flattened = params.length === 1 && Array.isArray(params[0]) ? params[0] : params;
                    return stmt.all(...flattened);
                }
            };
        }
    }

    transaction(fn) {
        if (this.driver === 'better-sqlite3') {
            return this.rawDb.transaction(fn);
        } else {
            return (...args) => {
                this.exec('BEGIN TRANSACTION;');
                try {
                    const result = fn(...args);
                    this.exec('COMMIT;');
                    return result;
                } catch (err) {
                    this.exec('ROLLBACK;');
                    throw err;
                }
            };
        }
    }

    pragma(pragmaStr) {
        if (this.driver === 'better-sqlite3') {
            return this.rawDb.pragma(pragmaStr);
        } else {
            return this.rawDb.exec(`PRAGMA ${pragmaStr};`);
        }
    }

    close() {
        if (this.rawDb) {
            this.rawDb.close();
            this.rawDb = null;
        }
    }
}

/**
 * Initializes and establishes the SQLite connection
 */
function initDatabase(customPath = DB_PATH) {
    if (dbInstance) {
        return dbInstance;
    }

    const dbDirectory = path.dirname(customPath);
    if (!fs.existsSync(dbDirectory)) {
        fs.mkdirSync(dbDirectory, { recursive: true });
    }

    let rawDb = null;

    // 1. Attempt loading better-sqlite3
    try {
        const Database = require('better-sqlite3');
        rawDb = new Database(customPath, {
            verbose: process.env.NODE_ENV === 'development' ? console.log : null,
            fileMustExist: false
        });
        dbDriverType = 'better-sqlite3';
    } catch (err) {
        // 2. Fallback to Node.js native sqlite (Node 22.5+)
        try {
            const { DatabaseSync } = require('node:sqlite');
            rawDb = new DatabaseSync(customPath);
            dbDriverType = 'node:sqlite';
        } catch (innerErr) {
            throw new Error(
                `Failed to initialize SQLite database. Please install 'better-sqlite3' (npm install better-sqlite3) or run Node.js 22.5+. Details: ${err.message}`
            );
        }
    }

    dbInstance = new UniversalDbAdapter(dbDriverType, rawDb);

    // Enforce Foreign Keys and Performance Pragmas
    dbInstance.exec('PRAGMA foreign_keys = ON;');
    dbInstance.exec('PRAGMA journal_mode = WAL;');
    dbInstance.exec('PRAGMA synchronous = NORMAL;');
    dbInstance.exec('PRAGMA busy_timeout = 5000;');

    // Run Schema Definition if needed
    if (fs.existsSync(SCHEMA_PATH)) {
        const schemaSql = fs.readFileSync(SCHEMA_PATH, 'utf-8');
        dbInstance.exec(schemaSql);
    }

    return dbInstance;
}

/**
 * Returns the active database instance
 */
function getDb() {
    if (!dbInstance) {
        return initDatabase();
    }
    return dbInstance;
}

/**
 * Safe Parameterized Query Helper: Fetch Multiple Rows
 */
function query(sql, params = []) {
    const db = getDb();
    const stmt = db.prepare(sql);
    return Array.isArray(params) ? stmt.all(...params) : stmt.all(params);
}

/**
 * Safe Parameterized Query Helper: Fetch Single Row
 */
function get(sql, params = []) {
    const db = getDb();
    const stmt = db.prepare(sql);
    return Array.isArray(params) ? stmt.get(...params) : stmt.get(params);
}

/**
 * Safe Parameterized Query Helper: Run INSERT / UPDATE / DELETE
 */
function run(sql, params = []) {
    const db = getDb();
    const stmt = db.prepare(sql);
    return Array.isArray(params) ? stmt.run(...params) : stmt.run(params);
}

/**
 * Execute arbitrary SQL script
 */
function exec(sql) {
    const db = getDb();
    return db.exec(sql);
}

/**
 * Executes a callback within an isolated ACID transaction
 */
function runTransaction(fn) {
    const db = getDb();
    const tx = db.transaction(fn);
    return tx();
}

/**
 * ============================================================================
 * SPECIALIZED BUSINESS TRANSACTIONS
 * ============================================================================
 */

/**
 * Transaction: Leave Approval / Rejection Workflow
 * 
 * Steps:
 * 1. Verify leave existence & pending state.
 * 2. Verify sufficient leave balance (if approving).
 * 3. Update leave request status & reviewed_by / reviewed_at.
 * 4. Deduct leave balance (used_days += requested_days, remaining_days -= requested_days).
 * 5. Update/Insert attendance logs for date range as 'Leave'.
 * 6. Generate in-app Notification.
 * 7. Append immutable Audit Log record.
 * 
 * Automatically rolls back all state if any step fails.
 */
function executeLeaveApprovalTransaction({ leaveId, reviewerId, status, rejectionReason = null }) {
    if (!['Approved', 'Rejected'].includes(status)) {
        throw new Error(`Invalid status "${status}". Must be 'Approved' or 'Rejected'.`);
    }

    const db = getDb();

    const tx = db.transaction(() => {
        // Step 1: Verify leave
        const leave = db.prepare('SELECT * FROM leaves WHERE id = ?').get(leaveId);
        if (!leave) {
            throw new Error(`Leave request with ID ${leaveId} not found.`);
        }
        if (leave.status !== 'Pending') {
            throw new Error(`Leave request ID ${leaveId} is already '${leave.status}'.`);
        }

        // Fetch employee & associated user info
        const employee = db.prepare('SELECT id, user_id, employee_id FROM employees WHERE id = ?').get(leave.employee_id);
        if (!employee) {
            throw new Error(`Employee ID ${leave.employee_id} not found.`);
        }

        const startDate = new Date(leave.start_date);
        const endDate = new Date(leave.end_date);
        const leaveYear = startDate.getFullYear();
        
        // Calculate duration in days (inclusive)
        const diffTime = Math.abs(endDate.getTime() - startDate.getTime());
        const requestedDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;

        if (status === 'Approved') {
            // Step 2: Verify leave balance
            const balance = db.prepare(`
                SELECT * FROM leave_balances 
                WHERE employee_id = ? AND leave_type = ? AND year = ?
            `).get(leave.employee_id, leave.leave_type, leaveYear);

            if (!balance) {
                throw new Error(`No leave balance record found for ${leave.leave_type} in year ${leaveYear}.`);
            }

            if (balance.remaining_days < requestedDays) {
                throw new Error(
                    `Insufficient leave balance. Available: ${balance.remaining_days} days, Requested: ${requestedDays} days.`
                );
            }

            // Step 3: Update leave status
            db.prepare(`
                UPDATE leaves 
                SET status = 'Approved', reviewed_by = ?, reviewed_at = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP
                WHERE id = ?
            `).run(reviewerId, leaveId);

            // Step 4: Update leave balance
            db.prepare(`
                UPDATE leave_balances 
                SET used_days = used_days + ?, remaining_days = remaining_days - ?, updated_at = CURRENT_TIMESTAMP
                WHERE id = ?
            `).run(requestedDays, requestedDays, balance.id);

            // Step 5: Mark attendance for the approved leave duration
            const curr = new Date(startDate);
            while (curr <= endDate) {
                const dateStr = curr.toISOString().split('T')[0];
                // Check if attendance row exists for date
                const existingAttendance = db.prepare('SELECT id FROM attendance WHERE employee_id = ? AND date = ?').get(leave.employee_id, dateStr);
                if (existingAttendance) {
                    db.prepare(`
                        UPDATE attendance 
                        SET status = 'Leave', working_hours = 0, check_in = NULL, check_out = NULL, updated_at = CURRENT_TIMESTAMP
                        WHERE id = ?
                    `).run(existingAttendance.id);
                } else {
                    db.prepare(`
                        INSERT INTO attendance (employee_id, date, status, working_hours, late_minutes, overtime_hours)
                        VALUES (?, ?, 'Leave', 0, 0, 0)
                    `).run(leave.employee_id, dateStr);
                }
                curr.setDate(curr.getDate() + 1);
            }
        } else {
            // Rejection flow
            db.prepare(`
                UPDATE leaves 
                SET status = 'Rejected', reason = COALESCE(?, reason), reviewed_by = ?, reviewed_at = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP
                WHERE id = ?
            `).run(rejectionReason ? `${leave.reason || ''} [Rejection Note: ${rejectionReason}]` : leave.reason, reviewerId, leaveId);
        }

        // Step 6: Create Notification
        const notificationTitle = `Leave Request ${status}`;
        const notificationMsg = `Your ${leave.leave_type} request from ${leave.start_date} to ${leave.end_date} has been ${status.toLowerCase()}.`;
        db.prepare(`
            INSERT INTO notifications (user_id, title, message, type, is_read)
            VALUES (?, ?, ?, 'Leave', 0)
        `).run(employee.user_id, notificationTitle, notificationMsg);

        // Step 7: Create Audit Log
        db.prepare(`
            INSERT INTO audit_logs (user_id, action, entity_type, entity_id, description)
            VALUES (?, ?, 'leaves', ?, ?)
        `).run(
            reviewerId,
            status === 'Approved' ? 'Leave Approved' : 'Leave Rejected',
            leaveId,
            `Leave request #${leaveId} (${leave.leave_type}, ${requestedDays} days) ${status.toLowerCase()} by reviewer #${reviewerId}`
        );

        return {
            success: true,
            leaveId,
            status,
            requestedDays
        };
    });

    return tx();
}

/**
 * Transaction: Payroll Processing & Generation
 * 
 * Formula:
 * net_salary = basic_salary + allowances + bonus + overtime - deductions
 */
function processPayrollTransaction({
    employeeId,
    payMonth,
    payYear,
    basicSalary = 0,
    allowances = 0,
    bonus = 0,
    overtime = 0,
    deductions = 0,
    status = 'Draft',
    processedBy = null
}) {
    const db = getDb();

    const tx = db.transaction(() => {
        const employee = db.prepare('SELECT id, user_id, employee_id FROM employees WHERE id = ?').get(employeeId);
        if (!employee) {
            throw new Error(`Employee ID ${employeeId} not found.`);
        }

        const netSalary = Number(basicSalary) + Number(allowances) + Number(bonus) + Number(overtime) - Number(deductions);

        // Check if payroll record exists
        const existing = db.prepare(`
            SELECT id FROM payroll WHERE employee_id = ? AND pay_month = ? AND pay_year = ?
        `).get(employeeId, payMonth, payYear);

        let payrollId = null;
        let action = 'Payroll Created';

        if (existing) {
            payrollId = existing.id;
            action = 'Payroll Updated';
            db.prepare(`
                UPDATE payroll 
                SET basic_salary = ?, allowances = ?, bonus = ?, overtime = ?, deductions = ?,
                    net_salary = ?, status = ?, updated_at = CURRENT_TIMESTAMP
                WHERE id = ?
            `).run(basicSalary, allowances, bonus, overtime, deductions, netSalary, status, payrollId);
        } else {
            const res = db.prepare(`
                INSERT INTO payroll (
                    employee_id, basic_salary, allowances, bonus, overtime, deductions, net_salary, pay_month, pay_year, status
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            `).run(employeeId, basicSalary, allowances, bonus, overtime, deductions, netSalary, payMonth, payYear, status);
            payrollId = res.lastInsertRowid;
        }

        // Notification if processed/paid
        if (['Processed', 'Paid'].includes(status)) {
            const monthNames = ['', 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
            db.prepare(`
                INSERT INTO notifications (user_id, title, message, type, is_read)
                VALUES (?, ?, ?, 'Payroll', 0)
            `).run(
                employee.user_id,
                `Payroll ${status} for ${monthNames[payMonth]} ${payYear}`,
                `Your payslip for ${monthNames[payMonth]} ${payYear} has been marked as ${status}. Net Pay: $${netSalary.toFixed(2)}.`
            );
        }

        // Audit Log
        db.prepare(`
            INSERT INTO audit_logs (user_id, action, entity_type, entity_id, description)
            VALUES (?, ?, 'payroll', ?, ?)
        `).run(
            processedBy,
            action,
            payrollId,
            `${action} for employee #${employee.employee_id} for period ${payMonth}/${payYear} with net salary $${netSalary.toFixed(2)} (Status: ${status})`
        );

        return {
            payrollId,
            employeeId,
            payMonth,
            payYear,
            netSalary,
            status
        };
    });

    return tx();
}

/**
 * Transaction: Smart Alert Resolution
 */
function resolveSmartAlertTransaction({ alertId, resolvedBy, notes = null }) {
    const db = getDb();

    const tx = db.transaction(() => {
        const alert = db.prepare('SELECT * FROM smart_alerts WHERE id = ?').get(alertId);
        if (!alert) {
            throw new Error(`Smart alert #${alertId} not found.`);
        }
        if (alert.is_resolved === 1) {
            throw new Error(`Smart alert #${alertId} is already resolved.`);
        }

        db.prepare(`
            UPDATE smart_alerts 
            SET is_resolved = 1, resolved_by = ?, resolved_at = CURRENT_TIMESTAMP
            WHERE id = ?
        `).run(resolvedBy, alertId);

        db.prepare(`
            INSERT INTO audit_logs (user_id, action, entity_type, entity_id, description)
            VALUES (?, 'Alert Resolved', 'smart_alerts', ?, ?)
        `).run(
            resolvedBy,
            alertId,
            `Resolved alert "${alert.title}" (Type: ${alert.alert_type}, Severity: ${alert.severity})${notes ? ` - Notes: ${notes}` : ''}`
        );

        return { success: true, alertId, resolvedBy };
    });

    return tx();
}

/**
 * Graceful connection teardown
 */
function closeDatabase() {
    if (dbInstance) {
        dbInstance.close();
        dbInstance = null;
        dbDriverType = null;
    }
}

module.exports = {
    initDatabase,
    getDb,
    query,
    get,
    run,
    exec,
    runTransaction,
    executeLeaveApprovalTransaction,
    processPayrollTransaction,
    resolveSmartAlertTransaction,
    closeDatabase,
    DB_PATH,
    SCHEMA_PATH
};
