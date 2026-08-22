import api from './api';
import {
  mockEmployees,
  mockAttendanceRecords,
  mockLeaveRequests,
  mockPayrolls,
  mockWellnessScores,
} from '../utils/mockData';

export const reportApi = {
  getEmployeeReport: async (filters = {}) => {
    try {
      return await api.get('/reports/employees', { params: filters });
    } catch (err) {
      if (err.isNetworkError) {
        return {
          success: true,
          data: mockEmployees.map((e) => ({
            EmployeeID: e.employeeId,
            Name: e.name,
            Department: e.department,
            Designation: e.designation,
            Manager: e.manager,
            Status: e.status,
            JoiningDate: e.joiningDate,
          })),
        };
      }
      throw err;
    }
  },

  getAttendanceReport: async (filters = {}) => {
    try {
      return await api.get('/reports/attendance', { params: filters });
    } catch (err) {
      if (err.isNetworkError) {
        return {
          success: true,
          data: mockAttendanceRecords.map((a) => ({
            Date: a.date,
            EmployeeID: a.employeeId,
            EmployeeName: a.employeeName,
            Department: a.department,
            CheckIn: a.checkIn,
            CheckOut: a.checkOut,
            Hours: a.hours,
            Status: a.status,
          })),
        };
      }
      throw err;
    }
  },

  getLeaveReport: async (filters = {}) => {
    try {
      return await api.get('/reports/leaves', { params: filters });
    } catch (err) {
      if (err.isNetworkError) {
        return {
          success: true,
          data: mockLeaveRequests.map((l) => ({
            EmployeeID: l.employeeId,
            EmployeeName: l.employeeName,
            Department: l.department,
            LeaveType: l.leaveType,
            StartDate: l.startDate,
            EndDate: l.endDate,
            Days: l.days,
            Status: l.status,
          })),
        };
      }
      throw err;
    }
  },

  getPayrollReport: async (filters = {}) => {
    try {
      return await api.get('/reports/payroll', { params: filters });
    } catch (err) {
      if (err.isNetworkError) {
        return {
          success: true,
          data: mockPayrolls.map((p) => ({
            PayrollID: p.id,
            EmployeeID: p.employeeId,
            EmployeeName: p.employeeName,
            Month: p.month,
            Year: p.year,
            BasicSalary: p.basicSalary,
            Allowances: p.allowances,
            Bonus: p.bonus,
            Deductions: p.deductions,
            NetSalary: p.netSalary,
            Status: p.status,
          })),
        };
      }
      throw err;
    }
  },

  getWellnessReport: async (filters = {}) => {
    try {
      return await api.get('/reports/wellness', { params: filters });
    } catch (err) {
      if (err.isNetworkError) {
        return {
          success: true,
          data: mockWellnessScores.map((w) => ({
            EmployeeID: w.employeeId,
            EmployeeName: w.employeeName,
            Department: w.department,
            Score: w.score,
            Indicator: w.indicator,
            AttendanceRate: `${w.attendancePercentage}%`,
            AbsenceCount: w.absenceCount,
            LeavePattern: w.leavePattern,
          })),
        };
      }
      throw err;
    }
  },
};

export default reportApi;
