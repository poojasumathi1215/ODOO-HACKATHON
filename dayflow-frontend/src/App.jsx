import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

// Layouts
import PublicLayout from './layouts/PublicLayout';
import EmployeeLayout from './layouts/EmployeeLayout';
import HRLayout from './layouts/HRLayout';

// Public Pages
import LandingPage from './pages/public/LandingPage';
import LoginPage from './pages/public/LoginPage';
import RegisterPage from './pages/public/RegisterPage';
import ForgotPasswordPage from './pages/public/ForgotPasswordPage';
import NotFoundPage from './pages/public/NotFoundPage';
import UnauthorizedPage from './pages/public/UnauthorizedPage';

// Employee Pages
import EmployeeDashboard from './pages/employee/Dashboard';
import EmployeeProfile from './pages/employee/Profile';
import EmployeeAttendance from './pages/employee/Attendance';
import EmployeeLeave from './pages/employee/Leave';
import EmployeePayroll from './pages/employee/Payroll';
import EmployeeWellness from './pages/employee/Wellness';
import EmployeeNotifications from './pages/employee/Notifications';
import EmployeeSettings from './pages/employee/Settings';

// HR Pages
import HRDashboard from './pages/hr/Dashboard';
import HREmployees from './pages/hr/Employees';
import HREmployeeDetails from './pages/hr/EmployeeDetails';
import HRAttendance from './pages/hr/Attendance';
import HRLeaveRequests from './pages/hr/LeaveRequests';
import HRPayroll from './pages/hr/Payroll';
import HRWellnessMonitor from './pages/hr/WellnessMonitor';
import HRSmartAlerts from './pages/hr/SmartAlerts';
import HRAnalytics from './pages/hr/Analytics';
import HRReports from './pages/hr/Reports';
import HRNotifications from './pages/hr/Notifications';
import HRSettings from './pages/hr/Settings';

export function App() {
  return (
    <Routes>
      {/* Public Pages */}
      <Route element={<PublicLayout />}>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/unauthorized" element={<UnauthorizedPage />} />
      </Route>

      {/* Employee Portal Routes */}
      <Route path="/employee" element={<EmployeeLayout />}>
        <Route index element={<Navigate to="/employee/dashboard" replace />} />
        <Route path="dashboard" element={<EmployeeDashboard />} />
        <Route path="profile" element={<EmployeeProfile />} />
        <Route path="attendance" element={<EmployeeAttendance />} />
        <Route path="leave" element={<EmployeeLeave />} />
        <Route path="payroll" element={<EmployeePayroll />} />
        <Route path="wellness" element={<EmployeeWellness />} />
        <Route path="notifications" element={<EmployeeNotifications />} />
        <Route path="settings" element={<EmployeeSettings />} />
      </Route>

      {/* HR Command Center Routes */}
      <Route path="/hr" element={<HRLayout />}>
        <Route index element={<Navigate to="/hr/dashboard" replace />} />
        <Route path="dashboard" element={<HRDashboard />} />
        <Route path="employees" element={<HREmployees />} />
        <Route path="employees/:id" element={<HREmployeeDetails />} />
        <Route path="attendance" element={<HRAttendance />} />
        <Route path="leaves" element={<HRLeaveRequests />} />
        <Route path="payroll" element={<HRPayroll />} />
        <Route path="wellness" element={<HRWellnessMonitor />} />
        <Route path="alerts" element={<HRSmartAlerts />} />
        <Route path="analytics" element={<HRAnalytics />} />
        <Route path="reports" element={<HRReports />} />
        <Route path="notifications" element={<HRNotifications />} />
        <Route path="settings" element={<HRSettings />} />
      </Route>

      {/* 404 Catch-All */}
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}

export default App;
