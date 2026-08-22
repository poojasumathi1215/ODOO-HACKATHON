import api from './api';
import { mockSmartAlerts } from '../utils/mockData';

export const alertsApi = {
  getAll: async (params = {}) => {
    try {
      return await api.get('/alerts', { params });
    } catch (err) {
      if (err.isNetworkError) {
        let list = [...mockSmartAlerts];
        if (params.severity && params.severity !== 'all') {
          list = list.filter((a) => a.severity === params.severity);
        }
        if (params.status && params.status !== 'all') {
          list = list.filter((a) => a.status === params.status);
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
      return await api.get(`/alerts/${id}`);
    } catch (err) {
      if (err.isNetworkError) {
        const alert = mockSmartAlerts.find((a) => a.id === id) || mockSmartAlerts[0];
        return {
          success: true,
          data: alert,
        };
      }
      throw err;
    }
  },

  acknowledge: async (id) => {
    try {
      return await api.put(`/alerts/${id}/acknowledge`);
    } catch (err) {
      if (err.isNetworkError) {
        const item = mockSmartAlerts.find((a) => a.id === id);
        if (item) item.status = 'acknowledged';
        return {
          success: true,
          message: 'Smart Alert marked as acknowledged',
        };
      }
      throw err;
    }
  },

  resolve: async (id, resolutionNotes = '') => {
    try {
      return await api.put(`/alerts/${id}/resolve`, { resolutionNotes });
    } catch (err) {
      if (err.isNetworkError) {
        const item = mockSmartAlerts.find((a) => a.id === id);
        if (item) item.status = 'resolved';
        return {
          success: true,
          message: 'Smart Alert marked as resolved',
        };
      }
      throw err;
    }
  },
};

export default alertsApi;
