import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FileQuestion, ArrowLeft, Home } from 'lucide-react';
import Button from '../../components/common/Button';
import { useAuth } from '../../hooks/useAuth';

export const NotFoundPage = () => {
  const navigate = useNavigate();
  const { isAuthenticated, isHR } = useAuth();

  return (
    <div
      style={{
        minHeight: '75vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        padding: '2rem',
      }}
    >
      <div
        style={{
          width: '72px',
          height: '72px',
          borderRadius: '50%',
          backgroundColor: 'var(--slate-100)',
          color: 'var(--slate-500)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: '1.5rem',
        }}
      >
        <FileQuestion size={36} />
      </div>

      <h1 style={{ fontSize: '2.5rem', fontWeight: 800, color: 'var(--slate-900)' }}>
        404 – Page Not Found
      </h1>
      <p style={{ fontSize: '1rem', color: 'var(--slate-600)', maxWidth: '480px', marginTop: '0.5rem', marginBottom: '2rem' }}>
        The page you are looking for does not exist, has been moved, or is temporarily unavailable.
      </p>

      <div style={{ display: 'flex', gap: '0.75rem' }}>
        <Button variant="secondary" icon={ArrowLeft} onClick={() => navigate(-1)}>
          Go Back
        </Button>
        <Button
          variant="primary"
          icon={Home}
          onClick={() => navigate(isAuthenticated ? (isHR ? '/hr/dashboard' : '/employee/dashboard') : '/')}
        >
          Return to Dashboard
        </Button>
      </div>
    </div>
  );
};

export default NotFoundPage;
