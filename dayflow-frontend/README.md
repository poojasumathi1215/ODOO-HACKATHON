# DayFlow – Human Resource Management System (HRMS) Frontend

**DayFlow** is a modern, commercial-grade Human Resource Management System built with **React**, **Vite**, **React Router**, **Axios**, **Recharts**, and **Lucide React**.

It delivers role-based portals for **Employees** and **HR Administrators**, connecting to a separate backend REST API running on `http://localhost:5000`.

---

## 🚀 Key Modules & Architecture

### 1. Public & Authentication
- **Landing Page**: Commercial SaaS presentation with feature showcase, how it works, pricing/modules, and interactive preview.
- **Authentication**: Form validation, error feedback, loading states, and quick one-click demo logins for both HR and Employees.
- **Forgot Password**: Password reset request flow.

### 2. Employee Portal (`/employee/*`)
- **Dashboard**: Live punch clock, shift overview, monthly attendance %, leave quotas, payroll summary, workplace wellness indicator, weekly hours chart, and recent events.
- **My Profile**: Identity card, organization information (read-only HR-managed badge tags), and editable contact details.
- **Attendance**: Daily punch-in / punch-out with live timer, late/overtime detection, tabular history, calendar view, and attendance regularization workflow.
- **Leave**: Casual, Sick, Annual, and Emergency balances, apply leave modal with automatic duration calculations, and status history.
- **Payroll**: Itemized payslip breakdowns (basic, allowances, bonus, overtime, deductions), printable digital payslip modal, and CSV downloads.
- **Workplace Wellness**: Objective work regularity score (🟢 Stable, 🟡 Monitor, 🔴 Needs Attention), 6-month trendline, absence pattern breakdown, and non-medical compliance disclaimer.
- **Notifications & Settings**: Unread badges, mark all read, notification frequencies, and password security.

### 3. HR Command Center (`/hr/*`)
- **Executive Dashboard**: Top 7 KPI cards, weekly attendance trend area chart, department headcount distribution, company wellness health matrix, leave category breakdown, live alerts, and pending approvals.
- **Employee Directory**: Searchable, filterable, and paginated employee roster with add/edit modals and account activation toggles.
- **Employee 360° Profile**: Tabbed view (Overview, Attendance, Leave, Payroll, Wellness, Documents, and Activity Audit Log).
- **Workforce Attendance**: Real-time daily attendance grid, status counters, and CSV exports.
- **Leave Approvals**: Workflow approval queue with reason review and manager notes.
- **Payroll Management**: Create, edit, and generate itemized employee payroll records with automatic net salary calculation.
- **Wellness Monitor**: Company-wide regularity score table, risk filters, and drill-down insight modals.
- **Smart HR Alerts**: Predictive alert center for attendance drops, repeated absences, late arrival clusters, and team availability risks with acknowledge/resolve workflows.
- **Executive Analytics**: Recharts visualizations for attendance, headcount, leave allocation, team availability ratios, and payroll budgets.
- **Custom Reports Generator**: Multi-filter report generator for Employees, Attendance, Leaves, Payroll, and Wellness with CSV export and print view.

---

## 🛠️ Technology Stack

- **Framework**: React 18 + Vite (ESM)
- **Routing**: React Router v6
- **HTTP Client**: Axios (with centralized JWT interceptor and offline fallback)
- **Data Visualization**: Recharts (Area, Bar, Line, Pie)
- **Icons**: Lucide React
- **Design System**: Modern SaaS CSS system with CSS variables, accessible color tokens, and responsive drawers

---

## ⚙️ Setup & Running

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment
Create `.env` or use `.env.example`:
```env
VITE_API_URL=http://localhost:5000/api
```

### 3. Start Development Server
```bash
npm run dev
```

The frontend will run on `http://localhost:5173`.

---

## 🛡️ Role Switching & Live Preview

You can test both roles instantaneously:
- **Employee Demo**: Sarah Jenkins (Senior Staff Engineer)
- **HR Demo**: Marcus Vance (HR Lead & Talent Director)
- Use the **Quick Demo Fill** buttons on the `/login` page or the **Mode Switcher** located at the bottom of the sidebar.
- Global Search can be invoked anywhere via **`⌘K`** / **`Ctrl+K`**.
