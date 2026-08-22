import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldAlert, ArrowLeft, Home } from 'lucide-react';
import Button from '../../components/common/Button';
import { useAuth } from '../../hooks/useAuth';

export const UnauthorizedPage = () => {
  const navigate = useNavigate();
  const { switchRole } = useAuth();

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
          backgroundColor: 'var(--danger-50)',
          color: 'var(--danger-600)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: '1.5rem',
        }}
      >
        <ShieldAlert size={36} />
      </div>

      <h1 style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--slate-900)' }}>
        403 – Access Restricted
      </h1>
      <p style={{ fontSize: '1rem', color: 'var(--slate-600)', maxWidth: '480px', marginTop: '0.5rem', marginBottom: '2rem' }}>
        You do not have permissions to view this administrative resource. This section requires HR Administrator privileges.
      </p>

      <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', justifyContent: 'center' }}>
        <Button variant="secondary" icon={ArrowLeft} onClick={() => navigate('/employee/dashboard')}>
          Go to Employee Hub
        </Button>
        <Button
          variant="primary"
          onClick={() => {
            switchRole('hr');
            navigate('/hr/dashboard');
          }}
        >
          Switch to HR Administrator Demo Mode
        </Button>
      </div>
    </div>
  );
};

export default UnauthorizedPage;
