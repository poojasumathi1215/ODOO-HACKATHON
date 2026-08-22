import React, { useState } from 'react';
import Button from '../common/Button';
import { DEPARTMENTS } from '../../utils/constants';

export const EmployeeForm = ({ initialData = {}, onSubmit, onCancel, loading = false }) => {
  const [formData, setFormData] = useState({
    name: initialData.name || '',
    email: initialData.email || '',
    phone: initialData.phone || '',
    department: initialData.department || 'Engineering',
    team: initialData.team || '',
    designation: initialData.designation || '',
    manager: initialData.manager || '',
    salary: initialData.salary || '',
    address: initialData.address || '',
    role: initialData.role || 'employee',
  });

  const [errors, setErrors] = useState({});

  const handleChange = (field, val) => {
    setFormData((prev) => ({ ...prev, [field]: val }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: null }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = 'Full name is required';
    if (!formData.email.trim()) newErrors.email = 'Work email is required';
    if (!formData.designation.trim()) newErrors.designation = 'Job designation is required';

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
        <div className="form-group">
          <label className="form-label required">Full Name</label>
          <input
            type="text"
            className={`form-control ${errors.name ? 'error' : ''}`}
            placeholder="e.g. Sarah Jenkins"
            value={formData.name}
            onChange={(e) => handleChange('name', e.target.value)}
          />
          {errors.name && <span className="form-error-msg">{errors.name}</span>}
        </div>

        <div className="form-group">
          <label className="form-label required">Work Email</label>
          <input
            type="email"
            className={`form-control ${errors.email ? 'error' : ''}`}
            placeholder="e.g. sarah.jenkins@dayflow.io"
            value={formData.email}
            onChange={(e) => handleChange('email', e.target.value)}
          />
          {errors.email && <span className="form-error-msg">{errors.email}</span>}
        </div>

        <div className="form-group">
          <label className="form-label">Phone Number</label>
          <input
            type="tel"
            className="form-control"
            placeholder="e.g. +1 (555) 234-5678"
            value={formData.phone}
            onChange={(e) => handleChange('phone', e.target.value)}
          />
        </div>

        <div className="form-group">
          <label className="form-label required">Department</label>
          <select
            className="form-control"
            value={formData.department}
            onChange={(e) => handleChange('department', e.target.value)}
          >
            {DEPARTMENTS.map((dept, i) => (
              <option key={i} value={dept}>
                {dept}
              </option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label className="form-label">Team / Pod</label>
          <input
            type="text"
            className="form-control"
            placeholder="e.g. Frontend Platform"
            value={formData.team}
            onChange={(e) => handleChange('team', e.target.value)}
          />
        </div>

        <div className="form-group">
          <label className="form-label required">Designation / Title</label>
          <input
            type="text"
            className={`form-control ${errors.designation ? 'error' : ''}`}
            placeholder="e.g. Senior Software Engineer"
            value={formData.designation}
            onChange={(e) => handleChange('designation', e.target.value)}
          />
          {errors.designation && <span className="form-error-msg">{errors.designation}</span>}
        </div>

        <div className="form-group">
          <label className="form-label">Reporting Manager</label>
          <input
            type="text"
            className="form-control"
            placeholder="e.g. David Miller"
            value={formData.manager}
            onChange={(e) => handleChange('manager', e.target.value)}
          />
        </div>

        <div className="form-group">
          <label className="form-label">Annual Base Compensation ($)</label>
          <input
            type="number"
            className="form-control"
            placeholder="e.g. 120000"
            value={formData.salary}
            onChange={(e) => handleChange('salary', e.target.value)}
          />
        </div>

        <div className="form-group">
          <label className="form-label">Access Role</label>
          <select
            className="form-control"
            value={formData.role}
            onChange={(e) => handleChange('role', e.target.value)}
          >
            <option value="employee">Employee Portal</option>
            <option value="hr">HR Administrator</option>
          </select>
        </div>
      </div>

      <div className="form-group" style={{ marginTop: '0.5rem' }}>
        <label className="form-label">Residential Address</label>
        <textarea
          className="form-control"
          rows={2}
          placeholder="Street, City, State, ZIP"
          value={formData.address}
          onChange={(e) => handleChange('address', e.target.value)}
        />
      </div>

      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem' }}>
        {onCancel && (
          <Button variant="secondary" onClick={onCancel} disabled={loading}>
            Cancel
          </Button>
        )}
        <Button variant="primary" type="submit" loading={loading}>
          {initialData.id ? 'Save Changes' : 'Create Employee'}
        </Button>
      </div>
    </form>
  );
};

export default EmployeeForm;
