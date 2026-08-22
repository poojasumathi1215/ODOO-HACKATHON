-- ============================================================================
-- DAYFLOW HRMS - DATABASE SCHEMA (SQLite 3)
-- Production-Ready Schema Definition with Constraints, Foreign Keys & Indexes
-- ============================================================================

-- Ensure Foreign Keys are enforced
PRAGMA foreign_keys = ON;

-- ----------------------------------------------------------------------------
-- 1. USERS TABLE
-- Authentication and base role management (Employee vs HR)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    password TEXT NOT NULL, -- Bcrypt hash (Never plain text)
    role TEXT NOT NULL CHECK(role IN ('Employee', 'HR')),
    is_active INTEGER NOT NULL DEFAULT 1 CHECK(is_active IN (0, 1)),
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- ----------------------------------------------------------------------------
-- 2. DEPARTMENTS TABLE
-- Organizational divisions
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS departments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL UNIQUE,
    description TEXT,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- ----------------------------------------------------------------------------
-- 3. TEAMS TABLE
-- Departmental teams and reporting hierarchy
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS teams (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    department_id INTEGER NOT NULL REFERENCES departments(id) ON DELETE RESTRICT,
    name TEXT NOT NULL,
    manager_id INTEGER REFERENCES employees(id) ON DELETE SET NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- ----------------------------------------------------------------------------
-- 4. EMPLOYEES TABLE
-- Employee profile records, operational metadata and reporting line
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS employees (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL UNIQUE REFERENCES users(id) ON DELETE RESTRICT,
    employee_id TEXT NOT NULL UNIQUE, -- e.g., EMP001, EMP002
    phone TEXT,
    department_id INTEGER REFERENCES departments(id) ON DELETE RESTRICT,
    team_id INTEGER REFERENCES teams(id) ON DELETE RESTRICT,
    designation TEXT,
    manager_id INTEGER REFERENCES employees(id) ON DELETE SET NULL,
    joining_date DATE,
    address TEXT,
    profile_image TEXT,
    employment_status TEXT NOT NULL DEFAULT 'Active' CHECK(employment_status IN ('Active', 'Inactive', 'On Leave', 'Terminated')),
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- ----------------------------------------------------------------------------
-- 5. ATTENDANCE TABLE
-- Daily work logs, check-in/out timestamps, hours and status
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS attendance (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    employee_id INTEGER NOT NULL REFERENCES employees(id) ON DELETE RESTRICT,
    date DATE NOT NULL,
    check_in DATETIME,
    check_out DATETIME,
    working_hours REAL NOT NULL DEFAULT 0,
    status TEXT NOT NULL CHECK(status IN ('Present', 'Absent', 'Late', 'Half-day', 'Leave')),
    late_minutes INTEGER NOT NULL DEFAULT 0,
    overtime_hours REAL NOT NULL DEFAULT 0,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(employee_id, date)
);

-- ----------------------------------------------------------------------------
-- 6. LEAVE BALANCES TABLE
-- Yearly leave allocations, consumption and balance per type
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS leave_balances (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    employee_id INTEGER NOT NULL REFERENCES employees(id) ON DELETE RESTRICT,
    leave_type TEXT NOT NULL CHECK(leave_type IN ('Casual Leave', 'Sick Leave', 'Annual Leave', 'Emergency Leave')),
    total_days REAL NOT NULL DEFAULT 0,
    used_days REAL NOT NULL DEFAULT 0,
    remaining_days REAL NOT NULL DEFAULT 0,
    year INTEGER NOT NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(employee_id, leave_type, year)
);

-- ----------------------------------------------------------------------------
-- 7. LEAVES TABLE
-- Time-off requests, reasons and approval workflow
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS leaves (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    employee_id INTEGER NOT NULL REFERENCES employees(id) ON DELETE RESTRICT,
    leave_type TEXT NOT NULL CHECK(leave_type IN ('Casual Leave', 'Sick Leave', 'Annual Leave', 'Emergency Leave')),
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    reason TEXT,
    status TEXT NOT NULL DEFAULT 'Pending' CHECK(status IN ('Pending', 'Approved', 'Rejected', 'Cancelled')),
    reviewed_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
    reviewed_at DATETIME,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- ----------------------------------------------------------------------------
-- 8. PAYROLL TABLE
-- Monthly compensation calculation, breakdown and payment status
-- Formula: net_salary = basic_salary + allowances + bonus + overtime - deductions
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS payroll (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    employee_id INTEGER NOT NULL REFERENCES employees(id) ON DELETE RESTRICT,
    basic_salary REAL NOT NULL DEFAULT 0,
    allowances REAL NOT NULL DEFAULT 0,
    bonus REAL NOT NULL DEFAULT 0,
    overtime REAL NOT NULL DEFAULT 0,
    deductions REAL NOT NULL DEFAULT 0,
    net_salary REAL NOT NULL DEFAULT 0,
    pay_month INTEGER NOT NULL CHECK(pay_month BETWEEN 1 AND 12),
    pay_year INTEGER NOT NULL,
    status TEXT NOT NULL DEFAULT 'Draft' CHECK(status IN ('Draft', 'Processed', 'Paid')),
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(employee_id, pay_month, pay_year)
);

-- ----------------------------------------------------------------------------
-- 9. NOTIFICATIONS TABLE
-- User notification dispatch for leaves, payroll, attendance, alerts & system
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS notifications (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    type TEXT NOT NULL CHECK(type IN ('Leave', 'Payroll', 'Attendance', 'Alert', 'System')),
    is_read INTEGER NOT NULL DEFAULT 0 CHECK(is_read IN (0, 1)),
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- ----------------------------------------------------------------------------
-- 10. WELLNESS INDICATORS TABLE
-- Work-related wellness assessment (strictly attendance, leave patterns, trends)
-- NOTE: Contains NO medical, psychological or health information
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS wellness_indicators (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    employee_id INTEGER NOT NULL REFERENCES employees(id) ON DELETE RESTRICT,
    attendance_score REAL NOT NULL DEFAULT 0,
    absence_score REAL NOT NULL DEFAULT 0,
    leave_pattern_score REAL NOT NULL DEFAULT 0,
    trend_score REAL NOT NULL DEFAULT 0,
    overall_score REAL NOT NULL DEFAULT 0,
    indicator_level TEXT NOT NULL CHECK(indicator_level IN ('Stable', 'Monitor', 'Needs Attention')),
    explanation TEXT,
    calculated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- ----------------------------------------------------------------------------
-- 11. SMART ALERTS TABLE
-- Automated HR notifications for anomalous work patterns
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS smart_alerts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    employee_id INTEGER REFERENCES employees(id) ON DELETE SET NULL,
    alert_type TEXT NOT NULL CHECK(alert_type IN (
        'Attendance Decline',
        'Repeated Absences',
        'Late Arrival Pattern',
        'Unusual Leave Pattern',
        'High Leave Concentration',
        'Reduced Team Availability'
    )),
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    severity TEXT NOT NULL CHECK(severity IN ('Low', 'Medium', 'High')),
    is_resolved INTEGER NOT NULL DEFAULT 0 CHECK(is_resolved IN (0, 1)),
    resolved_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
    resolved_at DATETIME,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- ----------------------------------------------------------------------------
-- 12. AUDIT LOGS TABLE
-- Immutable compliance & activity logs (Never stores passwords or tokens)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS audit_logs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
    action TEXT NOT NULL,
    entity_type TEXT,
    entity_id INTEGER,
    description TEXT,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- ----------------------------------------------------------------------------
-- 13. DOCUMENTS TABLE
-- Employee document metadata storage (files stored securely on server disk)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS documents (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    employee_id INTEGER NOT NULL REFERENCES employees(id) ON DELETE RESTRICT,
    document_name TEXT NOT NULL,
    document_type TEXT,
    file_path TEXT NOT NULL,
    uploaded_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- ----------------------------------------------------------------------------
-- 14. HOLIDAYS TABLE
-- Official company/calendar holidays
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS holidays (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    date DATE NOT NULL UNIQUE,
    description TEXT,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- ----------------------------------------------------------------------------
-- 15. TASKS TABLE
-- HR and departmental assignment tasks
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS tasks (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    description TEXT,
    assigned_to INTEGER REFERENCES employees(id) ON DELETE SET NULL,
    priority TEXT NOT NULL DEFAULT 'Medium' CHECK(priority IN ('Low', 'Medium', 'High')),
    due_date DATE,
    status TEXT NOT NULL DEFAULT 'Pending' CHECK(status IN ('Pending', 'In Progress', 'Completed')),
    created_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================================
-- PERFORMANCE & INTEGRITY INDEXES
-- ============================================================================

-- Users Indexes
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

-- Employees Indexes
CREATE INDEX IF NOT EXISTS idx_employees_employee_id ON employees(employee_id);
CREATE INDEX IF NOT EXISTS idx_employees_department_id ON employees(department_id);
CREATE INDEX IF NOT EXISTS idx_employees_team_id ON employees(team_id);

-- Attendance Indexes
CREATE INDEX IF NOT EXISTS idx_attendance_employee_id ON attendance(employee_id);
CREATE INDEX IF NOT EXISTS idx_attendance_date ON attendance(date);
CREATE INDEX IF NOT EXISTS idx_attendance_status ON attendance(status);

-- Leaves Indexes
CREATE INDEX IF NOT EXISTS idx_leaves_employee_id ON leaves(employee_id);
CREATE INDEX IF NOT EXISTS idx_leaves_status ON leaves(status);
CREATE INDEX IF NOT EXISTS idx_leaves_start_date ON leaves(start_date);

-- Payroll Indexes
CREATE INDEX IF NOT EXISTS idx_payroll_employee_id ON payroll(employee_id);
CREATE INDEX IF NOT EXISTS idx_payroll_pay_year ON payroll(pay_year);
CREATE INDEX IF NOT EXISTS idx_payroll_pay_month ON payroll(pay_month);

-- Notifications Indexes
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_is_read ON notifications(is_read);

-- Wellness Indicators Indexes
CREATE INDEX IF NOT EXISTS idx_wellness_employee_id ON wellness_indicators(employee_id);
CREATE INDEX IF NOT EXISTS idx_wellness_indicator_level ON wellness_indicators(indicator_level);

-- Smart Alerts Indexes
CREATE INDEX IF NOT EXISTS idx_smart_alerts_employee_id ON smart_alerts(employee_id);
CREATE INDEX IF NOT EXISTS idx_smart_alerts_severity ON smart_alerts(severity);
CREATE INDEX IF NOT EXISTS idx_smart_alerts_is_resolved ON smart_alerts(is_resolved);

-- Audit Logs Indexes
CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_entity_type ON audit_logs(entity_type);
