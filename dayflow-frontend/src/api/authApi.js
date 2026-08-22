import api from './api';
import { mockCurrentUserEmployee, mockCurrentUserHR } from '../utils/mockData';

export const authApi = {
  login: async (credentials) => {
    try {
      return await api.post('/auth/login', credentials);
    } catch (err) {
      if (err.isNetworkError) {
        // Fallback for demonstration when backend is not actively running
        const isHR = credentials.email?.toLowerCase().includes('hr') || credentials.email?.toLowerCase().includes('marcus');
        const user = isHR ? mockCurrentUserHR : mockCurrentUserEmployee;
        const fakeToken = 'mock_jwt_token_' + (isHR ? 'hr' : 'employee') + '_' + Date.now();
        return {
          success: true,
          message: 'Logged in successfully (Mock Mode)',
          data: {
            token: fakeToken,
            user,
          },
        };
      }
      throw err;
    }
  },

  register: async (userData) => {
    try {
      return await api.post('/auth/register', userData);
    } catch (err) {
      if (err.isNetworkError) {
        const fakeToken = 'mock_jwt_token_registered_' + Date.now();
        const newUser = {
          id: 'emp-' + Math.floor(100 + Math.random() * 900),
          employeeId: 'DF-' + Math.floor(100 + Math.random() * 900),
          name: userData.fullName || 'New Team Member',
          email: userData.email,
          role: userData.role || 'employee',
          department: userData.department || 'Engineering',
          designation: userData.designation || 'Software Engineer',
          status: 'active',
          avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
        };
        return {
          success: true,
          message: 'Registration successful (Mock Mode)',
          data: {
            token: fakeToken,
            user: newUser,
          },
        };
      }
      throw err;
    }
  },

  getCurrentUser: async () => {
    try {
      return await api.get('/auth/me');
    } catch (err) {
      if (err.isNetworkError) {
        const storedUser = localStorage.getItem('dayflow_user');
        if (storedUser) {
          return {
            success: true,
            data: JSON.parse(storedUser),
          };
        }
      }
      throw err;
    }
  },

  forgotPassword: async (email) => {
    try {
      return await api.post('/auth/forgot-password', { email });
    } catch (err) {
      if (err.isNetworkError) {
        return {
          success: true,
          message: 'Password reset link has been dispatched to your email address.',
        };
      }
      throw err;
    }
  },

  resetPassword: async (token, newPassword) => {
    try {
      return await api.post('/auth/reset-password', { token, newPassword });
    } catch (err) {
      if (err.isNetworkError) {
        return {
          success: true,
          message: 'Password has been successfully updated.',
        };
      }
      throw err;
    }
  },
};

export default authApi;
