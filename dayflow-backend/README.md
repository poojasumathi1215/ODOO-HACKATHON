# DayFlow – Professional HRMS Backend REST API

DayFlow is a high-performance Human Resource Management System (HRMS) backend built with **Node.js**, **Express.js**, and **SQLite (`better-sqlite3`)**. It delivers enterprise-grade REST APIs designed to seamlessly power modern React frontend applications.

---

## 🌟 Key Features

1. **Role-Based Access Control (RBAC)**: Strict separation between `HR` and `Employee` roles.
2. **Attendance Engine**: One record per date per employee, automated check-in/out, late minutes calculation, working hours, overtime, and leave sync.
3. **Leave Management & Auto-Deductions**: Leave application validation, overlapping date checks, balance verification, auto-deductions upon HR approval, and instant notifications.
4. **Payroll Engine**: Accurate salary computation (`net_salary = basic + allowances + bonus + overtime - deductions`), employee self-service view, and HR batch controls.
5. **DayFlow Wellness Indicator**: Objective, transparent scoring analyzing attendance percentage, absence frequency, leave patterns, and attendance trends (categorized into `Stable`, `Monitor`, and `Needs Attention`) with zero medical/clinical diagnoses.
6. **Smart HR Alerts**: Automated anomaly detection for attendance decline, repeated absences, frequent late check-ins, unusual leave clustering, and team availability drops with deduplication.
7. **Analytics & Recharts Support**: Ready-to-render JSON data structures for Dashboard KPIs, attendance trends, leave distributions, workforce headcounts, and wellness scores.
8. **Export-Ready Reports**: Tabular data endpoints for Employees, Attendance, Leaves, Payroll, and Wellness.
9. **Audit Trail & Documents**: Action logging for sensitive HR events and secure employee document management.

---

## 🚀 Quick Start

### 1. Prerequisites
- **Node.js**: v18.0+ or v20.0+ LTS
- **npm**: v9.0+

### 2. Environment Setup
Copy `.env.example` to `.env`:

```bash
cp .env.example .env
```

Configuration variables in `.env`:
```env
PORT=5000
JWT_SECRET=dayflow_super_secure_jwt_secret_key_2026_production
DATABASE_PATH=./database/dayflow.db
FRONTEND_URL=http://localhost:5173
```

### 3. Install Dependencies
```bash
npm install
```

### 4. Run Development Server
```bash
npm run dev
```

### 5. Run Production Server
```bash
npm start
```

### 6. Run Automated Integration Test Suite
```bash
npm test
```

---

## 👥 Demo Accounts (Pre-Seeded)

The database automatically initializes and seeds realistic demo data on the first run.

| Role | Email | Password | Details |
| :--- | :--- | :--- | :--- |
| **HR Admin** | `admin@dayflow.com` | `Admin@123` | Full HR administrator privileges |
| **Employee** | `alex.turner@dayflow.com` | `Employee@123` | Senior Backend Engineer (`EMP-1001`) |
| **Employee** | `sarah.jenkins@dayflow.com` | `Employee@123` | Lead Frontend Architect (`EMP-1002`) |
| **Employee** | `michael.chen@dayflow.com` | `Employee@123` | Product Designer (`EMP-1003`) |
| **Employee** | `priya.sharma@dayflow.com` | `Employee@123` | HR Business Partner (`EMP-1004`) |
| **Employee** | `david.miller@dayflow.com` | `Employee@123` | Growth Marketing Manager (`EMP-1005`) |
| **Employee** | `emily.watson@dayflow.com` | `Employee@123` | DevOps Engineer (`EMP-1006`) |

---

## 🛡️ Authentication & Authorization

All protected endpoints require a JWT token passed in the `Authorization` header:

```http
Authorization: Bearer <your_jwt_token>
```

### Standard Response Format

#### Success (200, 201)
```json
{
  "success": true,
  "message": "Operation successful",
  "data": { ... }
}
```

#### Error (400, 401, 403, 404, 409, 422, 500)
```json
{
  "success": false,
  "message": "Detailed error message"
}
```

---

## 📡 REST API Reference

Base URL: `http://localhost:5000/api`

### Health Check
- `GET /api/health` — Check server status

---

### Authentication (`/api/auth`)
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/auth/register` | Public | Register new user |
| `POST` | `/api/auth/login` | Public | Login and receive JWT token |
| `GET` | `/api/auth/me` | Authenticated | Get current user and employee profile |
| `POST` | `/api/auth/forgot-password` | Public | Request password reset token |
| `POST` | `/api/auth/reset-password` | Public | Reset password with token |

#### `POST /api/auth/login` Request Body:
```json
{
  "email": "admin@dayflow.com",
  "password": "Admin@123"
}
```

---

### Employees (`/api/employees`)
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/employees` | Authenticated | List employees with search, filter, pagination |
| `GET` | `/api/employees/:id` | Self / HR | Get complete employee profile |
| `POST` | `/api/employees` | HR | Create new employee profile and user account |
| `PUT` | `/api/employees/:id` | HR | Update employee details |
| `PATCH` | `/api/employees/:id/status` | HR | Change status (`Active`, `Inactive`, `On Leave`, `Terminated`) |
| `DELETE` | `/api/employees/:id` | HR | Delete employee and cascaded records |

---

### Attendance (`/api/attendance`)
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/attendance/check-in` | Employee | Clock in for today |
| `POST` | `/api/attendance/check-out` | Employee | Clock out for today |
| `GET` | `/api/attendance/my` | Employee | Get personal attendance history |
| `GET` | `/api/attendance/summary` | Authenticated | Get daily attendance statistics |
| `GET` | `/api/attendance` | HR | List workforce attendance with filters |
| `GET` | `/api/attendance/:employeeId` | Self / HR | Get specific employee attendance records |

---

### Leaves (`/api/leaves`)
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/leaves` | Employee | Apply for leave (`Casual`, `Sick`, `Annual`, `Emergency`) |
| `GET` | `/api/leaves/my` | Employee | Get personal leaves and leave balances |
| `GET` | `/api/leaves/balances` | Employee | Get personal remaining balances |
| `GET` | `/api/leaves/balances/:employeeId` | HR | Get specific employee leave balances |
| `GET` | `/api/leaves` | HR | List all leave requests |
| `GET` | `/api/leaves/:id` | Self / HR | Get leave request details |
| `PUT` | `/api/leaves/:id/approve` | HR | Approve leave (auto-deducts balance & syncs attendance) |
| `PUT` | `/api/leaves/:id/reject` | HR | Reject leave request |
| `PUT` | `/api/leaves/:id/cancel` | Employee | Cancel pending leave request |

---

### Payroll (`/api/payroll`)
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/payroll/my` | Employee | View personal payroll history |
| `GET` | `/api/payroll` | HR | List workforce payroll records |
| `GET` | `/api/payroll/record/:id` | Self / HR | Get specific payroll slip |
| `GET` | `/api/payroll/:employeeId` | Self / HR | Get employee payroll history |
| `POST` | `/api/payroll` | HR | Create new monthly payroll slip |
| `PUT` | `/api/payroll/:id` | HR | Update payroll slip components |

---

### Wellness Indicator (`/api/wellness`)
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/wellness/my` | Employee | Get personal wellness score and level |
| `GET` | `/api/wellness` | HR | Get workforce wellness overview & distribution |
| `GET` | `/api/wellness/:employeeId` | Self / HR | Get employee wellness indicator |
| `GET` | `/api/wellness/:employeeId/history` | Self / HR | Get historical wellness trajectory |
| `POST` | `/api/wellness/:employeeId/recalculate` | HR | Trigger on-demand wellness recalculation |

---

### Smart HR Alerts (`/api/alerts`)
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/alerts` | HR | List smart HR alerts (filtered by severity/status) |
| `GET` | `/api/alerts/:id` | HR | Get alert details |
| `PUT` | `/api/alerts/:id/resolve` | HR | Resolve smart alert |
| `POST` | `/api/alerts/scan` | HR | Run automated pattern detection scan |

---

### Analytics (`/api/analytics`)
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/analytics/dashboard` | HR | Dashboard KPI cards summary |
| `GET` | `/api/analytics/attendance` | HR | Time-series attendance metrics for Recharts |
| `GET` | `/api/analytics/leaves` | HR | Leave distribution and monthly trends |
| `GET` | `/api/analytics/workforce` | HR | Department and team headcount breakdown |
| `GET` | `/api/analytics/wellness` | HR | Department wellness comparisons |

---

### Reports (`/api/reports`)
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/reports/employees` | HR | Tabular employee directory report |
| `GET` | `/api/reports/attendance` | HR | Tabular attendance log report |
| `GET` | `/api/reports/leaves` | HR | Tabular leave history report |
| `GET` | `/api/reports/payroll` | HR | Tabular payroll summary report |
| `GET` | `/api/reports/wellness` | HR | Tabular wellness overview report |

---

### Notifications (`/api/notifications`)
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/notifications` | Authenticated | Get user notifications & unread count |
| `PUT` | `/api/notifications/read-all` | Authenticated | Mark all notifications as read |
| `PUT` | `/api/notifications/:id/read` | Authenticated | Mark single notification as read |

---

### Departments & Teams (`/api/departments`)
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/departments` | Authenticated | List all departments |
| `POST` | `/api/departments` | HR | Create new department |
| `GET` | `/api/departments/teams` | Authenticated | List all teams |
| `POST` | `/api/departments/teams` | HR | Create new team |

---

### Holidays (`/api/holidays`)
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/holidays` | Authenticated | List company holidays |
| `POST` | `/api/holidays` | HR | Create company holiday |
| `PUT` | `/api/holidays/:id` | HR | Update holiday |
| `DELETE` | `/api/holidays/:id` | HR | Delete holiday |

---

### Tasks (`/api/tasks`)
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/tasks` | Authenticated | List assigned or created tasks |
| `POST` | `/api/tasks` | Authenticated | Create and assign task |
| `PATCH` | `/api/tasks/:id/status` | Assigned / HR | Update task status (`Pending`, `In Progress`, `Completed`) |
| `DELETE` | `/api/tasks/:id` | Creator / HR | Delete task |

---

### Documents (`/api/documents`)
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/documents` | Self / HR | Upload employee document (multipart/form-data) |
| `GET` | `/api/documents/:employeeId?` | Self / HR | List employee documents |
| `GET` | `/api/documents/download/:id` | Self / HR | Securely download document |
| `DELETE` | `/api/documents/:id` | Owner / HR | Delete document |

---

## 🧮 DayFlow Wellness Indicator Formula

The Wellness Indicator is an algorithmic, data-driven workforce analytics model designed to highlight attendance consistency and pattern stability without any invasive or clinical claims.

### Factor Breakdown:
1. **Attendance Score (Weight: 30%)**:
   - $\ge 90\% \rightarrow 100$ points
   - $80 - 89\% \rightarrow 80$ points
   - $70 - 79\% \rightarrow 60$ points
   - $< 70\% \rightarrow 40$ points
2. **Absence Score (Weight: 25%)**:
   - $0\text{ absences} \rightarrow 100$ points
   - $1\text{ absence} \rightarrow 85$ points
   - $2\text{ absences} \rightarrow 70$ points
   - $3\text{ absences} \rightarrow 50$ points
   - $> 3\text{ absences} \rightarrow 30$ points
3. **Leave Pattern Score (Weight: 20%)**:
   - Analyzes frequency of unplanned emergency leaves and weekend clustering.
   - Balanced usage $\rightarrow 100$ points
   - Moderate clustering $\rightarrow 80$ points
   - Frequent emergency/unplanned leaves $\rightarrow 60$ points
4. **Attendance Trend Score (Weight: 25%)**:
   - Compares attendance rate in the first 15 days vs. the last 15 days of the 30-day window.
   - Steady or improving $\rightarrow 95 - 100$ points
   - Mild drop ($5 - 15\%$) $\rightarrow 70$ points
   - High drop ($> 15\%$) $\rightarrow 45$ points

### Overall Score & Levels:
$$\text{Overall Score} = (0.30 \times \text{Attendance}) + (0.25 \times \text{Absence}) + (0.20 \times \text{Leave Pattern}) + (0.25 \times \text{Trend})$$

- **$80 - 100$**: `Stable`
- **$60 - 79$**: `Monitor`
- **$0 - 59$**: `Needs Attention`

---

## 📁 Database Architecture

SQLite relational database with foreign keys and optimized B-Tree indexes:

```
users (id, name, email, password, role, is_active, created_at, updated_at)
departments (id, name, description, created_at)
teams (id, department_id, name, manager_id, created_at)
employees (id, user_id, employee_id, phone, department_id, team_id, designation, manager_id, joining_date, address, profile_image, employment_status, created_at, updated_at)
attendance (id, employee_id, date, check_in, check_out, working_hours, status, late_minutes, overtime_hours, created_at, updated_at)
leaves (id, employee_id, leave_type, start_date, end_date, reason, status, reviewed_by, reviewed_at, created_at, updated_at)
leave_balances (id, employee_id, leave_type, total_days, used_days, remaining_days, year, created_at, updated_at)
payroll (id, employee_id, basic_salary, allowances, bonus, overtime, deductions, net_salary, pay_month, pay_year, status, created_at, updated_at)
notifications (id, user_id, title, message, type, is_read, created_at)
wellness_indicators (id, employee_id, attendance_score, absence_score, leave_pattern_score, trend_score, overall_score, indicator_level, explanation, calculated_at)
smart_alerts (id, employee_id, alert_type, title, message, severity, is_resolved, resolved_by, resolved_at, created_at)
audit_logs (id, user_id, action, entity_type, entity_id, description, created_at)
documents (id, employee_id, document_name, document_type, file_path, uploaded_by, created_at)
holidays (id, name, date, description, created_at)
tasks (id, title, description, assigned_to, priority, due_date, status, created_by, created_at)
```
