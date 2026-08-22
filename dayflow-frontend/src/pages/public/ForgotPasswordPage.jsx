import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, ArrowLeft, CheckCircle2, AlertCircle } from 'lucide-react';
import Button from '../../components/common/Button';
import authApi from '../../api/authApi';
import { validateEmail } from '../../utils/validators';

export const ForgotPasswordPage = () => {
  const [email, setEmail] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const err = validateEmail(email);
    if (err) {
      setError(err);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      await authApi.forgotPassword(email);
      setSubmitted(true);
    } catch (apiErr) {
      setError(apiErr.message || 'Failed to send reset link');
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
        <Link
          to="/login"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.375rem',
            fontSize: '0.8125rem',
            color: 'var(--slate-500)',
            textDecoration: 'none',
            marginBottom: '1.5rem',
            fontWeight: 500,
          }}
        >
          <ArrowLeft size={16} /> Back to Sign In
        </Link>

        {submitted ? (
          <div style={{ textAlign: 'center', padding: '1rem 0' }}>
            <div
              style={{
                width: '52px',
                height: '52px',
                borderRadius: '50%',
                backgroundColor: 'var(--success-50)',
                color: 'var(--success-600)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 1rem',
              }}
            >
              <CheckCircle2 size={32} />
            </div>
            <h2 style={{ fontSize: '1.375rem', fontWeight: 800, color: 'var(--slate-900)' }}>
              Check your inbox
            </h2>
            <p style={{ fontSize: '0.875rem', color: 'var(--slate-600)', marginTop: '0.5rem', lineHeight: '1.5' }}>
              We have sent password reset instructions to <strong>{email}</strong>.
            </p>
            <Button
              variant="secondary"
              size="md"
              className="w-full"
              style={{ marginTop: '1.75rem' }}
              onClick={() => setSubmitted(false)}
            >
              Resend Link
            </Button>
          </div>
        ) : (
          <div>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--slate-900)' }}>
              Reset Password
            </h2>
            <p style={{ fontSize: '0.875rem', color: 'var(--slate-500)', marginTop: '0.25rem', marginBottom: '1.75rem' }}>
              Enter your work email address and we will send a secure reset link.
            </p>

            {error && (
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
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label className="form-label required">Work Email Address</label>
                <input
                  type="email"
                  className="form-control"
                  placeholder="name@company.com"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (error) setError(null);
                  }}
                />
              </div>

              <Button type="submit" variant="primary" size="lg" className="w-full" loading={loading} icon={Mail} style={{ marginTop: '0.75rem' }}>
                Send Reset Link
              </Button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};

export default ForgotPasswordPage;
