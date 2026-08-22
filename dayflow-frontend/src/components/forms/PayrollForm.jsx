import React, { useState } from 'react';
import Button from '../common/Button';
import { formatCurrency } from '../../utils/formatters';

export const PayrollForm = ({ initialData = {}, employees = [], onSubmit, onCancel, loading = false }) => {
  const [formData, setFormData] = useState({
    employeeId: initialData.employeeId || (employees[0]?.employeeId || 'DF-101'),
    employeeName: initialData.employeeName || (employees[0]?.name || 'Sarah Jenkins'),
    department: initialData.department || (employees[0]?.department || 'Engineering'),
    month: initialData.month || 'August',
    year: initialData.year || 2026,
    basicSalary: initialData.basicSalary ?? 8500,
    allowances: initialData.allowances ?? 1000,
    bonus: initialData.bonus ?? 0,
    overtime: initialData.overtime ?? 0,
    deductions: initialData.deductions ?? 500,
    status: initialData.status || 'draft',
  });

  const netSalary =
    Number(formData.basicSalary || 0) +
    Number(formData.allowances || 0) +
    Number(formData.bonus || 0) +
    Number(formData.overtime || 0) -
    Number(formData.deductions || 0);

  const handleEmployeeChange = (e) => {
    const empId = e.target.value;
    const selected = employees.find((emp) => emp.employeeId === empId);
    setFormData((prev) => ({
      ...prev,
      employeeId: empId,
      employeeName: selected?.name || '',
      department: selected?.department || '',
    }));
  };

  const handleChange = (field, val) => {
    setFormData((prev) => ({ ...prev, [field]: val }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({
      ...formData,
      netSalary,
    });
  };

  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  return (
    <form onSubmit={handleSubmit}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
        <div className="form-group">
          <label className="form-label required">Employee</label>
          <select
            className="form-control"
            value={formData.employeeId}
            onChange={handleEmployeeChange}
            disabled={!!initialData.id}
          >
            {employees.map((emp) => (
              <option key={emp.id} value={emp.employeeId}>
                {emp.name} ({emp.employeeId} - {emp.department})
              </option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label className="form-label required">Pay Period Month</label>
          <select
            className="form-control"
            value={formData.month}
            onChange={(e) => handleChange('month', e.target.value)}
          >
            {months.map((m, i) => (
              <option key={i} value={m}>
                {m}
              </option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label className="form-label required">Pay Period Year</label>
          <input
            type="number"
            className="form-control"
            value={formData.year}
            onChange={(e) => handleChange('year', e.target.value)}
          />
        </div>

        <div className="form-group">
          <label className="form-label required">Basic Salary ($)</label>
          <input
            type="number"
            className="form-control"
            value={formData.basicSalary}
            onChange={(e) => handleChange('basicSalary', Number(e.target.value))}
          />
        </div>

        <div className="form-group">
          <label className="form-label">Allowances ($)</label>
          <input
            type="number"
            className="form-control"
            value={formData.allowances}
            onChange={(e) => handleChange('allowances', Number(e.target.value))}
          />
        </div>

        <div className="form-group">
          <label className="form-label">Performance Bonus ($)</label>
          <input
            type="number"
            className="form-control"
            value={formData.bonus}
            onChange={(e) => handleChange('bonus', Number(e.target.value))}
          />
        </div>

        <div className="form-group">
          <label className="form-label">Overtime Pay ($)</label>
          <input
            type="number"
            className="form-control"
            value={formData.overtime}
            onChange={(e) => handleChange('overtime', Number(e.target.value))}
          />
        </div>

        <div className="form-group">
          <label className="form-label">Deductions (Tax, PF) ($)</label>
          <input
            type="number"
            className="form-control"
            value={formData.deductions}
            onChange={(e) => handleChange('deductions', Number(e.target.value))}
          />
        </div>

        <div className="form-group">
          <label className="form-label">Status</label>
          <select
            className="form-control"
            value={formData.status}
            onChange={(e) => handleChange('status', e.target.value)}
          >
            <option value="draft">Draft</option>
            <option value="processing">Processing</option>
            <option value="paid">Paid</option>
          </select>
        </div>
      </div>

      {/* Net Salary Summary Box */}
      <div
        style={{
          marginTop: '1rem',
          padding: '1.25rem',
          backgroundColor: 'var(--slate-50)',
          borderRadius: 'var(--radius-lg)',
          border: '1px solid var(--border-color)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <div>
          <span style={{ fontSize: '0.8125rem', color: 'var(--slate-500)', fontWeight: 600, textTransform: 'uppercase' }}>
            Calculated Net Payout
          </span>
          <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--slate-900)' }}>
            {formatCurrency(netSalary)}
          </div>
        </div>

        <span className={`badge badge-${formData.status === 'paid' ? 'success' : 'warning'}`}>
          {formData.status.toUpperCase()}
        </span>
      </div>

      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem' }}>
        {onCancel && (
          <Button variant="secondary" onClick={onCancel} disabled={loading}>
            Cancel
          </Button>
        )}
        <Button variant="primary" type="submit" loading={loading}>
          {initialData.id ? 'Update Payroll Record' : 'Create Payroll Record'}
        </Button>
      </div>
    </form>
  );
};

export default PayrollForm;
