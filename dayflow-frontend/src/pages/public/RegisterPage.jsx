import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { UserPlus, AlertCircle, ArrowRight } from 'lucide-react';
import Button from '../../components/common/Button';
import { useAuth } from '../../hooks/useAuth';
import { useToast } from '../../hooks/useToast';
import { validateEmail, validatePassword } from '../../utils/validators';

export const RegisterPage = () => {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'employee',
    department: 'Engineering',
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState(null);

  const { register } = useAuth();
  const { success } = useToast();
  const navigate = useNavigate();

  const handleChange = (field, val) => {
    setFormData((prev) => ({ ...prev, [field]: val }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: null }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setApiError(null);

    const newErrors = {};
    if (!formData.fullName.trim()) newErrors.fullName = 'Full name is required';
    const emailErr = validateEmail(formData.email);
    if (emailErr) newErrors.email = emailErr;
    const passErr = validatePassword(formData.password);
    if (passErr) newErrors.password = passErr;
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setLoading(true);
    try {
      const res = await register(formData);
      if (res.success) {
        success('Account created successfully!');
        if (formData.role === 'hr') {
          navigate('/hr/dashboard');
        } else {
          navigate('/employee/dashboard');
        }
      } else {
        setApiError(res.message || 'Registration failed');
      }
    } catch (err) {
      setApiError(err.message || 'An error occurred during registration');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: '85vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '2.5rem 1rem',
      }}
    >
      <div
        className="card"
        style={{
          width: '100%',
          maxWidth: '480px',
          padding: '2.5rem 2rem',
          boxShadow: 'var(--shadow-lg)',
        }}
      >
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div
            style={{
              width: '44px',
              height: '44px',
              borderRadius: '12px',
              background: 'linear-gradient(135deg, var(--primary-600) 0%, var(--accent-600) 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#ffffff',
              fontWeight: 800,
              fontSize: '1.25rem',
              margin: '0 auto 1rem',
            }}
          >
            D
          </div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--slate-900)' }}>
            Get started with DayFlow
          </h2>
          <p style={{ fontSize: '0.875rem', color: 'var(--slate-500)', marginTop: '0.25rem' }}>
            Create your account to access the modern workforce hub
          </p>
        </div>

        {apiError && (
          <div
            style={{
              padding: '0.75rem',
              backgroundColor: 'var(--danger-50)',
              border: '1px solid var(--danger-100)',
              borderRadius: 'var(--radius-md)',
              color: 'var(--danger-600)',
              fontSize: '0.8125rem',
              marginBottom: '1.25rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
            }}
          >
            <AlertCircle size={16} />
            <span>{apiError}</span>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label required">Full Name</label>
            <input
              type="text"
              className={`form-control ${errors.fullName ? 'error' : ''}`}
              placeholder="e.g. Alex Morgan"
              value={formData.fullName}
              onChange={(e) => handleChange('fullName', e.target.value)}
            />
            {errors.fullName && <span className="form-error-msg">{errors.fullName}</span>}
          </div>

          <div className="form-group">
            <label className="form-label required">Work Email Address</label>
            <input
              type="email"
              className={`form-control ${errors.email ? 'error' : ''}`}
              placeholder="alex.morgan@company.com"
              value={formData.email}
              onChange={(e) => handleChange('email', e.target.value)}
            />
            {errors.email && <span className="form-error-msg">{errors.email}</span>}
          </div>

          <div className="form-group">
            <label className="form-label required">Select Account Role</label>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
              <div
                onClick={() => handleChange('role', 'employee')}
                style={{
                  padding: '0.75rem',
                  border: `2px solid ${formData.role === 'employee' ? 'var(--primary-600)' : 'var(--border-color)'}`,
                  backgroundColor: formData.role === 'employee' ? 'var(--primary-50)' : '#ffffff',
                  borderRadius: 'var(--radius-md)',
                  cursor: 'pointer',
                  textAlign: 'center',
                  transition: 'all 0.15s ease',
                }}
              >
                <div style={{ fontWeight: 700, fontSize: '0.875rem', color: 'var(--slate-900)' }}>Employee</div>
                <div style={{ fontSize: '0.6875rem', color: 'var(--slate-500)' }}>Self-Service Hub</div>
              </div>

              <div
                onClick={() => handleChange('role', 'hr')}
                style={{
                  padding: '0.75rem',
                  border: `2px solid ${formData.role === 'hr' ? 'var(--primary-600)' : 'var(--border-color)'}`,
                  backgroundColor: formData.role === 'hr' ? 'var(--primary-50)' : '#ffffff',
                  borderRadius: 'var(--radius-md)',
                  cursor: 'pointer',
                  textAlign: 'center',
                  transition: 'all 0.15s ease',
                }}
              >
                <div style={{ fontWeight: 700, fontSize: '0.875rem', color: 'var(--slate-900)' }}>HR / Admin</div>
                <div style={{ fontSize: '0.6875rem', color: 'var(--slate-500)' }}>Command Center</div>
              </div>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
            <div className="form-group">
              <label className="form-label required">Password</label>
              <input
                type="password"
                className={`form-control ${errors.password ? 'error' : ''}`}
                placeholder="••••••••"
                value={formData.password}
                onChange={(e) => handleChange('password', e.target.value)}
              />
              {errors.password && <span className="form-error-msg">{errors.password}</span>}
            </div>

            <div className="form-group">
              <label className="form-label required">Confirm</label>
              <input
                type="password"
                className={`form-control ${errors.confirmPassword ? 'error' : ''}`}
                placeholder="••••••••"
                value={formData.confirmPassword}
                onChange={(e) => handleChange('confirmPassword', e.target.value)}
              />
              {errors.confirmPassword && <span className="form-error-msg">{errors.confirmPassword}</span>}
            </div>
          </div>

          <Button type="submit" variant="primary" size="lg" className="w-full" loading={loading} icon={UserPlus} style={{ marginTop: '0.75rem' }}>
            Create DayFlow Account
          </Button>
        </form>

        <div style={{ textAlign: 'center', marginTop: '1.75rem', fontSize: '0.8125rem', color: 'var(--slate-500)' }}>
          Already have an account?{' '}
          <Link to="/login" style={{ color: 'var(--primary-600)', fontWeight: 600, textDecoration: 'none' }}>
            Sign in
          </Link>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
