import React, { useState } from 'react';
import Button from '../common/Button';
import { LEAVE_TYPES } from '../../utils/constants';
import { calculateDaysBetween } from '../../utils/dateUtils';

export const LeaveForm = ({ onSubmit, onCancel, loading = false }) => {
  const [formData, setFormData] = useState({
    leaveType: 'Annual Leave',
    startDate: '',
    endDate: '',
    reason: '',
  });

  const [errors, setErrors] = useState({});

  const calculatedDays =
    formData.startDate && formData.endDate
      ? calculateDaysBetween(formData.startDate, formData.endDate)
      : 0;

  const handleChange = (field, val) => {
    setFormData((prev) => ({ ...prev, [field]: val }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: null }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const newErrors = {};
    if (!formData.startDate) newErrors.startDate = 'Start date is required';
    if (!formData.endDate) newErrors.endDate = 'End date is required';
    if (formData.startDate && formData.endDate && new Date(formData.startDate) > new Date(formData.endDate)) {
      newErrors.endDate = 'End date must be on or after start date';
    }
    if (!formData.reason.trim()) newErrors.reason = 'Reason for leave is required';

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    onSubmit({ ...formData, days: calculatedDays });
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="form-group">
        <label className="form-label required">Leave Type</label>
        <select
          className="form-control"
          value={formData.leaveType}
          onChange={(e) => handleChange('leaveType', e.target.value)}
        >
          {Object.values(LEAVE_TYPES).map((type, i) => (
            <option key={i} value={type}>
              {type}
            </option>
          ))}
        </select>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
        <div className="form-group">
          <label className="form-label required">Start Date</label>
          <input
            type="date"
            className={`form-control ${errors.startDate ? 'error' : ''}`}
            value={formData.startDate}
            onChange={(e) => handleChange('startDate', e.target.value)}
          />
          {errors.startDate && <span className="form-error-msg">{errors.startDate}</span>}
        </div>

        <div className="form-group">
          <label className="form-label required">End Date</label>
          <input
            type="date"
            className={`form-control ${errors.endDate ? 'error' : ''}`}
            value={formData.endDate}
            onChange={(e) => handleChange('endDate', e.target.value)}
          />
          {errors.endDate && <span className="form-error-msg">{errors.endDate}</span>}
        </div>
      </div>

      {calculatedDays > 0 && (
        <div
          style={{
            padding: '0.625rem 0.875rem',
            backgroundColor: 'var(--primary-50)',
            borderRadius: 'var(--radius-md)',
            marginBottom: '1.25rem',
            fontSize: '0.8125rem',
            color: 'var(--primary-700)',
            fontWeight: 600,
          }}
        >
          Total Duration: {calculatedDays} {calculatedDays === 1 ? 'day' : 'days'}
        </div>
      )}

      <div className="form-group">
        <label className="form-label required">Reason / Notes</label>
        <textarea
          rows={3}
          className={`form-control ${errors.reason ? 'error' : ''}`}
          placeholder="Please explain the context for this leave request..."
          value={formData.reason}
          onChange={(e) => handleChange('reason', e.target.value)}
        />
        {errors.reason && <span className="form-error-msg">{errors.reason}</span>}
      </div>

      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem' }}>
        {onCancel && (
          <Button variant="secondary" onClick={onCancel} disabled={loading}>
            Cancel
          </Button>
        )}
        <Button variant="primary" type="submit" loading={loading}>
          Submit Leave Request
        </Button>
      </div>
    </form>
  );
};

export default LeaveForm;
