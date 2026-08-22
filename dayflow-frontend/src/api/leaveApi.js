import api from './api';
import { mockLeaveRequests, mockLeaveBalances } from '../utils/mockData';

export const leaveApi = {
  apply: async (leaveData) => {
    try {
      return await api.post('/leaves', leaveData);
    } catch (err) {
      if (err.isNetworkError) {
        const newLeave = {
          id: 'lv-' + Date.now(),
          employeeId: 'DF-101',
          employeeName: 'Sarah Jenkins',
          department: 'Engineering',
          leaveType: leaveData.leaveType,
          startDate: leaveData.startDate,
          endDate: leaveData.endDate,
          days: leaveData.days || 1,
          reason: leaveData.reason,
          status: 'pending',
          appliedAt: new Date().toISOString().split('T')[0],
        };
        mockLeaveRequests.unshift(newLeave);
        return {
          success: true,
          message: 'Leave application submitted successfully',
          data: newLeave,
        };
      }
      throw err;
    }
  },

  getMyLeaves: async (params = {}) => {
    try {
      return await api.get('/leaves/my', { params });
    } catch (err) {
      if (err.isNetworkError) {
        return {
          success: true,
          data: mockLeaveRequests.filter((l) => l.employeeId === 'DF-101'),
          balances: mockLeaveBalances,
        };
      }
      throw err;
    }
  },

  getAllLeaves: async (params = {}) => {
    try {
      return await api.get('/leaves', { params });
    } catch (err) {
      if (err.isNetworkError) {
        let list = [...mockLeaveRequests];
        if (params.status && params.status !== 'all') {
          list = list.filter((l) => l.status === params.status);
        }
        if (params.search) {
          const s = params.search.toLowerCase();
          list = list.filter(
            (l) =>
              l.employeeName.toLowerCase().includes(s) ||
              l.department.toLowerCase().includes(s) ||
              l.leaveType.toLowerCase().includes(s)
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

  getById: async (id) => {
    try {
      return await api.get(`/leaves/${id}`);
    } catch (err) {
      if (err.isNetworkError) {
        const leave = mockLeaveRequests.find((l) => l.id === id) || mockLeaveRequests[0];
        return {
          success: true,
          data: leave,
        };
      }
      throw err;
    }
  },

  approve: async (id, comments = '') => {
    try {
      return await api.put(`/leaves/${id}/approve`, { comments });
    } catch (err) {
      if (err.isNetworkError) {
        const item = mockLeaveRequests.find((l) => l.id === id);
        if (item) item.status = 'approved';
        return {
          success: true,
          message: 'Leave request approved successfully',
        };
      }
      throw err;
    }
  },

  reject: async (id, reason = '') => {
    try {
      return await api.put(`/leaves/${id}/reject`, { reason });
    } catch (err) {
      if (err.isNetworkError) {
        const item = mockLeaveRequests.find((l) => l.id === id);
        if (item) item.status = 'rejected';
        return {
          success: true,
          message: 'Leave request rejected',
        };
      }
      throw err;
    }
  },

  cancel: async (id) => {
    try {
      return await api.put(`/leaves/${id}/cancel`);
    } catch (err) {
      if (err.isNetworkError) {
        const item = mockLeaveRequests.find((l) => l.id === id);
        if (item) item.status = 'cancelled';
        return {
          success: true,
          message: 'Leave request cancelled',
        };
      }
      throw err;
    }
  },

  getBalances: async () => {
    try {
      return await api.get('/leaves/balances');
    } catch (err) {
      if (err.isNetworkError) {
        return {
          success: true,
          data: mockLeaveBalances,
        };
      }
      throw err;
    }
  },
};

export default leaveApi;
