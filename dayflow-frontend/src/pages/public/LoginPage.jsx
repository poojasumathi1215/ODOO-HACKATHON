import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Mail, Lock, LogIn, AlertCircle, ArrowRight } from 'lucide-react';
import Button from '../../components/common/Button';
import { useAuth } from '../../hooks/useAuth';
import { useToast } from '../../hooks/useToast';
import { validateEmail, validatePassword } from '../../utils/validators';

export const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState(null);

  const { login } = useAuth();
  const { success } = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  const isExpired = new URLSearchParams(location.search).get('expired');

  const fillDemo = (role) => {
    if (role === 'hr') {
      setEmail('marcus.vance@dayflow.io');
      setPassword('password123');
    } else {
      setEmail('sarah.jenkins@dayflow.io');
      setPassword('password123');
    }
    setErrors({});
    setApiError(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setApiError(null);

    const emailErr = validateEmail(email);
    const passErr = validatePassword(password);

    if (emailErr || passErr) {
      setErrors({ email: emailErr, password: passErr });
      return;
    }

    setLoading(true);
    try {
      const res = await login({ email, password, rememberMe });
      if (res.success) {
        success('Welcome back to DayFlow!');
        if (res.user.role === 'hr') {
          navigate('/hr/dashboard');
        } else {
          navigate('/employee/dashboard');
        }
      } else {
        setApiError(res.message || 'Invalid email or password');
      }
    } catch (err) {
      setApiError(err.message || 'Authentication error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: '80vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '2rem 1rem',
      }}
    >
      <div
        className="card"
        style={{
          width: '100%',
          maxWidth: '440px',
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
            Sign in to DayFlow
          </h2>
          <p style={{ fontSize: '0.875rem', color: 'var(--slate-500)', marginTop: '0.25rem' }}>
            Enter your credentials to access your workspace
          </p>
        </div>

        {/* Demo Fast Logins */}
        <div
          style={{
            padding: '0.75rem',
            backgroundColor: 'var(--primary-50)',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--primary-100)',
            marginBottom: '1.5rem',
          }}
        >
          <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--primary-700)', marginBottom: '0.5rem', textTransform: 'uppercase' }}>
            Quick Demo Fill
          </div>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button
              type="button"
              onClick={() => fillDemo('employee')}
              style={{
                flex: 1,
                padding: '0.375rem',
                fontSize: '0.75rem',
                fontWeight: 600,
                backgroundColor: '#ffffff',
                border: '1px solid var(--primary-200)',
                borderRadius: '4px',
                color: 'var(--primary-700)',
                cursor: 'pointer',
              }}
            >
              👤 Employee Demo
            </button>
            <button
              type="button"
              onClick={() => fillDemo('hr')}
              style={{
                flex: 1,
                padding: '0.375rem',
                fontSize: '0.75rem',
                fontWeight: 600,
                backgroundColor: '#ffffff',
                border: '1px solid var(--primary-200)',
                borderRadius: '4px',
                color: 'var(--primary-700)',
                cursor: 'pointer',
              }}
            >
              ⚡ HR Demo
            </button>
          </div>
        </div>

        {isExpired && (
          <div
            style={{
              padding: '0.75rem',
              backgroundColor: 'var(--warning-50)',
              border: '1px solid var(--warning-100)',
              borderRadius: 'var(--radius-md)',
              color: 'var(--warning-700)',
              fontSize: '0.8125rem',
              marginBottom: '1.25rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
            }}
          >
            <AlertCircle size={16} />
            <span>Your session has expired. Please sign in again.</span>
          </div>
        )}

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
            <label className="form-label required">Email Address</label>
            <div style={{ position: 'relative' }}>
              <input
                type="email"
                className={`form-control ${errors.email ? 'error' : ''}`}
                placeholder="name@dayflow.io"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (errors.email) setErrors((prev) => ({ ...prev, email: null }));
                }}
              />
            </div>
            {errors.email && <span className="form-error-msg">{errors.email}</span>}
          </div>

          <div className="form-group">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <label className="form-label required m-0">Password</label>
              <Link
                to="/forgot-password"
                style={{ fontSize: '0.75rem', color: 'var(--primary-600)', textDecoration: 'none', fontWeight: 600 }}
              >
                Forgot password?
              </Link>
            </div>
            <div style={{ position: 'relative' }}>
              <input
                type="password"
                className={`form-control ${errors.password ? 'error' : ''}`}
                placeholder="••••••••"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (errors.password) setErrors((prev) => ({ ...prev, password: null }));
                }}
              />
            </div>
            {errors.password && <span className="form-error-msg">{errors.password}</span>}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem' }}>
            <input
              type="checkbox"
              id="remember"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              style={{ cursor: 'pointer', accentColor: 'var(--primary-600)' }}
            />
            <label htmlFor="remember" style={{ fontSize: '0.8125rem', color: 'var(--slate-600)', cursor: 'pointer' }}>
              Remember this device for 30 days
            </label>
          </div>

          <Button type="submit" variant="primary" size="lg" className="w-full" loading={loading} icon={LogIn}>
            Sign In
          </Button>
        </form>

        <div style={{ textAlign: 'center', marginTop: '1.75rem', fontSize: '0.8125rem', color: 'var(--slate-500)' }}>
          Don't have an account?{' '}
          <Link to="/register" style={{ color: 'var(--primary-600)', fontWeight: 600, textDecoration: 'none' }}>
            Register organization
          </Link>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
