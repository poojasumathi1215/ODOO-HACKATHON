import React from 'react';
import { Outlet, Link, useNavigate } from 'react-router-dom';
import Button from '../components/common/Button';
import { useAuth } from '../hooks/useAuth';

export const PublicLayout = () => {
  const { isAuthenticated, isHR } = useAuth();
  const navigate = useNavigate();

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: '#ffffff' }}>
      {/* Navigation Header */}
      <header
        style={{
          borderBottom: '1px solid var(--border-light)',
          backgroundColor: 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(8px)',
          position: 'sticky',
          top: 0,
          zIndex: 50,
        }}
      >
        <div
          style={{
            maxWidth: '1280px',
            margin: '0 auto',
            padding: '1rem 2rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          {/* Brand */}
          <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', textDecoration: 'none' }}>
            <div
              style={{
                width: '38px',
                height: '38px',
                borderRadius: '10px',
                background: 'linear-gradient(135deg, var(--primary-600) 0%, var(--accent-600) 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#ffffff',
                fontWeight: 800,
                fontSize: '1.25rem',
                boxShadow: '0 2px 10px rgba(79, 70, 229, 0.25)',
              }}
            >
              D
            </div>
            <div>
              <span style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--slate-900)', letterSpacing: '-0.02em' }}>
                DayFlow
              </span>
            </div>
          </Link>

          {/* Center Nav Links */}
          <nav style={{ display: 'flex', alignItems: 'center', gap: '1.75rem' }} className="public-nav-links">
            <a href="/#features" style={{ fontSize: '0.875rem', fontWeight: 500, color: 'var(--slate-600)', textDecoration: 'none' }}>
              Features
            </a>
            <a href="/#attendance" style={{ fontSize: '0.875rem', fontWeight: 500, color: 'var(--slate-600)', textDecoration: 'none' }}>
              Attendance & Leave
            </a>
            <a href="/#wellness" style={{ fontSize: '0.875rem', fontWeight: 500, color: 'var(--slate-600)', textDecoration: 'none' }}>
              Wellness Intelligence
            </a>
            <a href="/#alerts" style={{ fontSize: '0.875rem', fontWeight: 500, color: 'var(--slate-600)', textDecoration: 'none' }}>
              Smart HR Alerts
            </a>
          </nav>

          {/* Right CTAs */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            {isAuthenticated ? (
              <Button
                variant="primary"
                size="sm"
                onClick={() => navigate(isHR ? '/hr/dashboard' : '/employee/dashboard')}
              >
                Go to Workspace →
              </Button>
            ) : (
              <>
                <Link to="/login" style={{ textDecoration: 'none' }}>
                  <Button variant="ghost" size="sm">
                    Log In
                  </Button>
                </Link>
                <Link to="/register" style={{ textDecoration: 'none' }}>
                  <Button variant="primary" size="sm">
                    Get Started
                  </Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Main Outlet */}
      <main style={{ flex: 1 }}>
        <Outlet />
      </main>

      {/* Global Footer */}
      <footer style={{ backgroundColor: 'var(--slate-900)', color: 'var(--slate-400)', padding: '3.5rem 2rem 2rem' }}>
        <div style={{ maxWidth: '1280px', margin: '0 auto' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '2.5rem', marginBottom: '3rem' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
                <div
                  style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '8px',
                    background: 'linear-gradient(135deg, var(--primary-500) 0%, var(--accent-500) 100%)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#ffffff',
                    fontWeight: 800,
                  }}
                >
                  D
                </div>
                <span style={{ fontSize: '1.125rem', fontWeight: 800, color: '#ffffff' }}>DayFlow</span>
              </div>
              <p style={{ fontSize: '0.8125rem', lineHeight: '1.6', color: 'var(--slate-400)' }}>
                Smart HR Management for Modern Workplaces. Turning everyday HR data into proactive workforce insights.
              </p>
            </div>

            <div>
              <div style={{ fontSize: '0.875rem', fontWeight: 700, color: '#ffffff', marginBottom: '1rem' }}>Product Modules</div>
              <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.8125rem' }}>
                <li>Attendance & Time Tracking</li>
                <li>Leave Approvals Engine</li>
                <li>Payroll & Compensation</li>
                <li>Workforce Wellness Indicator</li>
                <li>Smart HR Predictive Alerts</li>
              </ul>
            </div>

            <div>
              <div style={{ fontSize: '0.875rem', fontWeight: 700, color: '#ffffff', marginBottom: '1rem' }}>Portals</div>
              <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.8125rem' }}>
                <li><Link to="/login" style={{ color: 'var(--slate-400)', textDecoration: 'none' }}>Employee Self-Service</Link></li>
                <li><Link to="/login" style={{ color: 'var(--slate-400)', textDecoration: 'none' }}>HR Command Center</Link></li>
                <li><Link to="/register" style={{ color: 'var(--slate-400)', textDecoration: 'none' }}>Create Account</Link></li>
              </ul>
            </div>

            <div>
              <div style={{ fontSize: '0.875rem', fontWeight: 700, color: '#ffffff', marginBottom: '1rem' }}>Trust & Compliance</div>
              <p style={{ fontSize: '0.75rem', lineHeight: '1.5', color: 'var(--slate-400)' }}>
                DayFlow indicators are strictly based on work-related attendance, leave and availability metrics. Medical non-diagnosis compliant.
              </p>
            </div>
          </div>

          <div
            style={{
              paddingTop: '2rem',
              borderTop: '1px solid var(--slate-800)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              fontSize: '0.75rem',
              color: 'var(--slate-400)',
              flexWrap: 'wrap',
              gap: '1rem',
            }}
          >
            <div>© {new Date().getFullYear()} DayFlow HR Technologies Inc. All rights reserved.</div>
            <div style={{ display: 'flex', gap: '1.5rem' }}>
              <span>Privacy Policy</span>
              <span>Terms of Service</span>
              <span>Security</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default PublicLayout;
