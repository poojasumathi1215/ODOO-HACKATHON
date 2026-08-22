import api from './api';
import { mockAnalyticsData } from '../utils/mockData';

export const analyticsApi = {
  getDashboardKPIs: async () => {
    try {
      return await api.get('/analytics/dashboard');
    } catch (err) {
      if (err.isNetworkError) {
        return {
          success: true,
          data: {
            totalEmployees: 48,
            activeEmployees: 46,
            presentToday: 41,
            absentToday: 3,
            pendingLeaves: 4,
            activeAlerts: 3,
            averageAttendance: '94.6%',
            payrollMonthlyTotal: 448000,
          },
        };
      }
      throw err;
    }
  },

  getAttendanceAnalytics: async (period = 'weekly') => {
    try {
      return await api.get('/analytics/attendance', { params: { period } });
    } catch (err) {
      if (err.isNetworkError) {
        return {
          success: true,
          data: mockAnalyticsData.attendanceTrend,
        };
      }
      throw err;
    }
  },

  getLeaveAnalytics: async () => {
    try {
      return await api.get('/analytics/leaves');
    } catch (err) {
      if (err.isNetworkError) {
        return {
          success: true,
          data: mockAnalyticsData.leaveDistribution,
        };
      }
      throw err;
    }
  },

  getWorkforceAnalytics: async () => {
    try {
      return await api.get('/analytics/workforce');
    } catch (err) {
      if (err.isNetworkError) {
        return {
          success: true,
          data: {
            departmentHeadcount: mockAnalyticsData.departmentHeadcount,
            payrollTrend: mockAnalyticsData.monthlyPayrollTrend,
          },
        };
      }
      throw err;
    }
  },

  getWellnessAnalytics: async () => {
    try {
      return await api.get('/analytics/wellness');
    } catch (err) {
      if (err.isNetworkError) {
        return {
          success: true,
          data: mockAnalyticsData.wellnessDistribution,
        };
      }
      throw err;
    }
  },
};

export default analyticsApi;
