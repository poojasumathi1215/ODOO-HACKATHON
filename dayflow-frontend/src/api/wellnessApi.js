import api from './api';
import { mockWellnessScores } from '../utils/mockData';

export const wellnessApi = {
  getMyWellness: async () => {
    try {
      return await api.get('/wellness/my');
    } catch (err) {
      if (err.isNetworkError) {
        return {
          success: true,
          data: mockWellnessScores[0],
        };
      }
      throw err;
    }
  },

  getAllWellness: async (params = {}) => {
    try {
      return await api.get('/wellness', { params });
    } catch (err) {
      if (err.isNetworkError) {
        let list = [...mockWellnessScores];
        if (params.indicator) {
          list = list.filter((w) => w.indicator === params.indicator);
        }
        if (params.department) {
          list = list.filter((w) => w.department === params.department);
        }
        if (params.search) {
          const s = params.search.toLowerCase();
          list = list.filter(
            (w) =>
              w.employeeName.toLowerCase().includes(s) ||
              w.employeeId.toLowerCase().includes(s)
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

  getByEmployeeId: async (employeeId) => {
    try {
      return await api.get(`/wellness/${employeeId}`);
    } catch (err) {
      if (err.isNetworkError) {
        const item = mockWellnessScores.find((w) => w.employeeId === employeeId) || mockWellnessScores[0];
        return {
          success: true,
          data: item,
        };
      }
      throw err;
    }
  },

  getHistory: async (employeeId) => {
    try {
      return await api.get(`/wellness/${employeeId}/history`);
    } catch (err) {
      if (err.isNetworkError) {
        const item = mockWellnessScores.find((w) => w.employeeId === employeeId) || mockWellnessScores[0];
        return {
          success: true,
          data: item.history || [],
        };
      }
      throw err;
    }
  },
};

export default wellnessApi;
