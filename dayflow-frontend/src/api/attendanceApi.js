import api from './api';
import { mockAttendanceRecords } from '../utils/mockData';

export const attendanceApi = {
  checkIn: async () => {
    try {
      return await api.post('/attendance/check-in');
    } catch (err) {
      if (err.isNetworkError) {
        const now = new Date();
        const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        const newRecord = {
          id: 'att-' + Date.now(),
          employeeId: 'DF-101',
          employeeName: 'Sarah Jenkins',
          department: 'Engineering',
          date: now.toISOString().split('T')[0],
          checkIn: timeStr,
          checkOut: '—',
          hours: '0.1',
          status: 'present',
          lateMinutes: 0,
          overtimeMinutes: 0,
        };
        mockAttendanceRecords.unshift(newRecord);
        return {
          success: true,
          message: 'Punched in successfully at ' + timeStr,
          data: newRecord,
        };
      }
      throw err;
    }
  },

  checkOut: async () => {
    try {
      return await api.post('/attendance/check-out');
    } catch (err) {
      if (err.isNetworkError) {
        const now = new Date();
        const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        if (mockAttendanceRecords.length > 0) {
          mockAttendanceRecords[0].checkOut = timeStr;
          mockAttendanceRecords[0].hours = '8.5';
        }
        return {
          success: true,
          message: 'Punched out successfully at ' + timeStr,
          data: mockAttendanceRecords[0],
        };
      }
      throw err;
    }
  },

  getMyAttendance: async (params = {}) => {
    try {
      return await api.get('/attendance/my', { params });
    } catch (err) {
      if (err.isNetworkError) {
        return {
          success: true,
          data: mockAttendanceRecords.filter((r) => r.employeeId === 'DF-101'),
        };
      }
      throw err;
    }
  },

  getAllAttendance: async (params = {}) => {
    try {
      return await api.get('/attendance', { params });
    } catch (err) {
      if (err.isNetworkError) {
        let list = [...mockAttendanceRecords];
        if (params.status) {
          list = list.filter((r) => r.status === params.status);
        }
        if (params.department) {
          list = list.filter((r) => r.department === params.department);
        }
        if (params.search) {
          const s = params.search.toLowerCase();
          list = list.filter(
            (r) =>
              r.employeeName.toLowerCase().includes(s) ||
              r.employeeId.toLowerCase().includes(s)
          );
        }
        return {
          success: true,
          data: list,
        };
      }
      throw err;
    }
  },

  getByEmployeeId: async (employeeId, params = {}) => {
    try {
      return await api.get(`/attendance/${employeeId}`, { params });
    } catch (err) {
      if (err.isNetworkError) {
        const records = mockAttendanceRecords.filter((r) => r.employeeId === employeeId);
        return {
          success: true,
          data: records.length ? records : mockAttendanceRecords,
        };
      }
      throw err;
    }
  },

  getSummary: async (params = {}) => {
    try {
      return await api.get('/attendance/summary', { params });
    } catch (err) {
      if (err.isNetworkError) {
        return {
          success: true,
          data: {
            present: 42,
            absent: 3,
            late: 4,
            halfDay: 1,
            onLeave: 2,
            averageHours: '8.4 hrs',
            monthlyRate: 94.8,
          },
        };
      }
      throw err;
    }
  },

  requestRegularization: async (data) => {
    try {
      return await api.post('/attendance/regularize', data);
    } catch (err) {
      if (err.isNetworkError) {
        return {
          success: true,
          message: 'Attendance regularization request submitted for manager review.',
        };
      }
      throw err;
    }
  },
};

export default attendanceApi;
