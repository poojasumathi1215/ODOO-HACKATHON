import api from './api';
import { mockPayrolls } from '../utils/mockData';

export const payrollApi = {
  getMyPayroll: async (params = {}) => {
    try {
      return await api.get('/payroll/my', { params });
    } catch (err) {
      if (err.isNetworkError) {
        return {
          success: true,
          data: mockPayrolls.filter((p) => p.employeeId === 'DF-101'),
        };
      }
      throw err;
    }
  },

  getAllPayroll: async (params = {}) => {
    try {
      return await api.get('/payroll', { params });
    } catch (err) {
      if (err.isNetworkError) {
        let list = [...mockPayrolls];
        if (params.month) {
          list = list.filter((p) => p.month === params.month);
        }
        if (params.year) {
          list = list.filter((p) => String(p.year) === String(params.year));
        }
        if (params.search) {
          const s = params.search.toLowerCase();
          list = list.filter(
            (p) =>
              p.employeeName.toLowerCase().includes(s) ||
              p.employeeId.toLowerCase().includes(s)
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
      return await api.get(`/payroll/${employeeId}`, { params });
    } catch (err) {
      if (err.isNetworkError) {
        const list = mockPayrolls.filter((p) => p.employeeId === employeeId);
        return {
          success: true,
          data: list.length ? list : mockPayrolls,
        };
      }
      throw err;
    }
  },

  create: async (data) => {
    try {
      return await api.post('/payroll', data);
    } catch (err) {
      if (err.isNetworkError) {
        const newPayroll = {
          ...data,
          id: 'pr-' + Date.now(),
          status: data.status || 'draft',
          netSalary:
            Number(data.basicSalary || 0) +
            Number(data.allowances || 0) +
            Number(data.bonus || 0) +
            Number(data.overtime || 0) -
            Number(data.deductions || 0),
        };
        mockPayrolls.unshift(newPayroll);
        return {
          success: true,
          message: 'Payroll generated successfully',
          data: newPayroll,
        };
      }
      throw err;
    }
  },

  update: async (id, data) => {
    try {
      return await api.put(`/payroll/${id}`, data);
    } catch (err) {
      if (err.isNetworkError) {
        const idx = mockPayrolls.findIndex((p) => p.id === id);
        if (idx !== -1) {
          mockPayrolls[idx] = {
            ...mockPayrolls[idx],
            ...data,
            netSalary:
              Number(data.basicSalary ?? mockPayrolls[idx].basicSalary) +
              Number(data.allowances ?? mockPayrolls[idx].allowances) +
              Number(data.bonus ?? mockPayrolls[idx].bonus) +
              Number(data.overtime ?? mockPayrolls[idx].overtime) -
              Number(data.deductions ?? mockPayrolls[idx].deductions),
          };
        }
        return {
          success: true,
          message: 'Payroll record updated successfully',
        };
      }
      throw err;
    }
  },
};

export default payrollApi;
