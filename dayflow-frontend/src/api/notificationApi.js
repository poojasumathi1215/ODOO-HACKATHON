import api from './api';
import { mockNotifications } from '../utils/mockData';

export const notificationApi = {
  getAll: async () => {
    try {
      return await api.get('/notifications');
    } catch (err) {
      if (err.isNetworkError) {
        return {
          success: true,
          data: mockNotifications,
        };
      }
      throw err;
    }
  },

  markAsRead: async (id) => {
    try {
      return await api.put(`/notifications/${id}/read`);
    } catch (err) {
      if (err.isNetworkError) {
        const item = mockNotifications.find((n) => n.id === id);
        if (item) item.read = true;
        return {
          success: true,
          message: 'Notification marked as read',
        };
      }
      throw err;
    }
  },

  markAllAsRead: async () => {
    try {
      return await api.put('/notifications/read-all');
    } catch (err) {
      if (err.isNetworkError) {
        mockNotifications.forEach((n) => {
          n.read = true;
        });
        return {
          success: true,
          message: 'All notifications marked as read',
        };
      }
      throw err;
    }
  },
};

export default notificationApi;
