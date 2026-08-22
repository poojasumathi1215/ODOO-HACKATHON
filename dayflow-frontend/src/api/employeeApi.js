import api from './api';
import { mockEmployees } from '../utils/mockData';

export const employeeApi = {
  getAll: async (params = {}) => {
    try {
      return await api.get('/employees', { params });
    } catch (err) {
      if (err.isNetworkError) {
        let list = [...mockEmployees];
        if (params.search) {
          const s = params.search.toLowerCase();
          list = list.filter(
            (e) =>
              e.name.toLowerCase().includes(s) ||
              e.email.toLowerCase().includes(s) ||
              e.employeeId.toLowerCase().includes(s) ||
              e.department.toLowerCase().includes(s)
          );
        }
        if (params.department) {
          list = list.filter((e) => e.department === params.department);
        }
        if (params.status) {
          list = list.filter((e) => e.status === params.status);
        }
        return {
          success: true,
          data: list,
          total: list.length,
        };
      }
      throw err;
    }
  },

  getById: async (id) => {
    try {
      return await api.get(`/employees/${id}`);
    } catch (err) {
      if (err.isNetworkError) {
        const emp = mockEmployees.find((e) => e.id === id || e.employeeId === id) || mockEmployees[0];
        return {
          success: true,
          data: emp,
        };
      }
      throw err;
    }
  },

  create: async (data) => {
    try {
      return await api.post('/employees', data);
    } catch (err) {
      if (err.isNetworkError) {
        const newEmp = {
          ...data,
          id: 'emp-' + Date.now(),
          employeeId: 'DF-' + Math.floor(100 + Math.random() * 900),
          status: 'active',
          avatar: data.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
        };
        mockEmployees.unshift(newEmp);
        return {
          success: true,
          message: 'Employee created successfully',
          data: newEmp,
        };
      }
      throw err;
    }
  },

  update: async (id, data) => {
    try {
      return await api.put(`/employees/${id}`, data);
    } catch (err) {
      if (err.isNetworkError) {
        const index = mockEmployees.findIndex((e) => e.id === id || e.employeeId === id);
        if (index !== -1) {
          mockEmployees[index] = { ...mockEmployees[index], ...data };
          return {
            success: true,
            message: 'Employee profile updated successfully',
            data: mockEmployees[index],
          };
        }
        return {
          success: true,
          message: 'Employee profile updated',
          data: { id, ...data },
        };
      }
      throw err;
    }
  },

  updateStatus: async (id, status) => {
    try {
      return await api.patch(`/employees/${id}/status`, { status });
    } catch (err) {
      if (err.isNetworkError) {
        const index = mockEmployees.findIndex((e) => e.id === id || e.employeeId === id);
        if (index !== -1) {
          mockEmployees[index].status = status;
        }
        return {
          success: true,
          message: `Employee status changed to ${status}`,
        };
      }
      throw err;
    }
  },
};

export default employeeApi;
