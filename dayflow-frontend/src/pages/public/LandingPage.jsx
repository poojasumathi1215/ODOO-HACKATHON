import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Sparkles,
  ShieldCheck,
  CalendarCheck,
  CalendarRange,
  DollarSign,
  HeartPulse,
  AlertTriangle,
  BarChart3,
  ArrowRight,
  CheckCircle2,
  Users,
  Zap,
  Clock,
  Layers,
} from 'lucide-react';
import Button from '../../components/common/Button';
import WellnessScore from '../../components/wellness/WellnessScore';
import { useAuth } from '../../hooks/useAuth';

export const LandingPage = () => {
  const { isAuthenticated, isHR, switchRole } = useAuth();
  const navigate = useNavigate();

  const handleDemoLogin = (role) => {
    switchRole(role);
    navigate(role === 'hr' ? '/hr/dashboard' : '/employee/dashboard');
  };

  return (
    <div style={{ overflowX: 'hidden' }}>
      {/* 1. HERO SECTION */}
      <section
        style={{
          padding: '5rem 2rem 4rem',
          background: 'radial-gradient(ellipse at 50% 0%, rgba(99, 102, 241, 0.12) 0%, rgba(248, 250, 252, 0) 70%)',
          textAlign: 'center',
          maxWidth: '1280px',
          margin: '0 auto',
        }}
      >
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.375rem 1rem',
            backgroundColor: 'var(--primary-50)',
            border: '1px solid var(--primary-200)',
            borderRadius: '9999px',
            color: 'var(--primary-700)',
            fontSize: '0.8125rem',
            fontWeight: 600,
            marginBottom: '1.5rem',
          }}
        >
          <Sparkles size={16} />
          <span>Next-Generation Intelligent Workforce Operations</span>
        </div>

        <h1
          style={{
            fontSize: 'clamp(2.25rem, 5vw, 3.75rem)',
            fontWeight: 800,
            color: 'var(--slate-900)',
            letterSpacing: '-0.03em',
            lineHeight: '1.15',
            maxWidth: '900px',
            margin: '0 auto 1.5rem',
          }}
        >
          Smart HR Management for{' '}
          <span
            style={{
              background: 'linear-gradient(135deg, var(--primary-600) 0%, var(--accent-600) 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            Modern Workplaces
          </span>
        </h1>

        <p
          style={{
            fontSize: 'clamp(1rem, 2vw, 1.25rem)',
            color: 'var(--slate-600)',
            maxWidth: '740px',
            margin: '0 auto 2.5rem',
            lineHeight: '1.6',
          }}
        >
          DayFlow doesn't just store HR data — it turns everyday HR data into useful workforce insights that help HR teams act proactively.
        </p>

        {/* Hero Actions */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '1rem', flexWrap: 'wrap', marginBottom: '3rem' }}>
          <Link to="/register" style={{ textDecoration: 'none' }}>
            <Button variant="primary" size="lg" icon={ArrowRight}>
              Get Started Free
            </Button>
          </Link>
          <Link to="/login" style={{ textDecoration: 'none' }}>
            <Button variant="secondary" size="lg">
              Sign In to Workspace
            </Button>
          </Link>
        </div>

        {/* Demo Fast-Switch Buttons for Reviewers */}
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.75rem',
            padding: '0.75rem 1.25rem',
            backgroundColor: '#ffffff',
            borderRadius: 'var(--radius-xl)',
            border: '1px solid var(--border-color)',
            boxShadow: 'var(--shadow-md)',
          }}
        >
          <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--slate-500)' }}>
            Instant Live Preview:
          </span>
          <Button variant="outline" size="sm" onClick={() => handleDemoLogin('employee')}>
            👤 Employee View
          </Button>
          <Button variant="primary" size="sm" onClick={() => handleDemoLogin('hr')}>
            ⚡ HR Command Center
          </Button>
        </div>
      </section>

      {/* 2. INTERACTIVE PRODUCT HIGHLIGHT PREVIEW */}
      <section style={{ maxWidth: '1200px', margin: '0 auto 5rem', padding: '0 1.5rem' }}>
        <div
          className="card"
          style={{
            borderRadius: 'var(--radius-xl)',
            overflow: 'hidden',
            border: '1px solid var(--border-color)',
            boxShadow: '0 25px 50px -12px rgba(15, 23, 42, 0.15)',
            backgroundColor: '#ffffff',
          }}
        >
          <div
            style={{
              padding: '1rem 1.5rem',
              backgroundColor: 'var(--slate-900)',
              color: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: '#ef4444' }} />
              <span style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: '#f59e0b' }} />
              <span style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: '#22c55e' }} />
              <span style={{ fontSize: '0.8125rem', color: 'var(--slate-400)', marginLeft: '0.5rem' }}>
                dayflow.app/command-center
              </span>
            </div>
            <span style={{ fontSize: '0.75rem', color: 'var(--slate-400)' }}>DayFlow Cloud OS</span>
          </div>

          <div style={{ padding: '2rem', backgroundColor: 'var(--slate-50)' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1.25rem' }}>
              <div className="card" style={{ padding: '1.25rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                  <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--slate-500)' }}>ACTIVE EMPLOYEES</span>
                  <Users size={18} className="text-primary" />
                </div>
                <div style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--slate-900)' }}>48 / 50</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--success-600)', marginTop: '0.25rem', fontWeight: 600 }}>
                  96% Workforce Attendance Today
                </div>
              </div>

              <div className="card" style={{ padding: '1.25rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                  <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--slate-500)' }}>WORKFORCE WELLNESS</span>
                  <HeartPulse size={18} style={{ color: '#16a34a' }} />
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <div style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--slate-900)' }}>88/100</div>
                  <span className="badge badge-success">🟢 Stable</span>
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--slate-500)', marginTop: '0.25rem' }}>
                  Work pattern integrity steady
                </div>
              </div>

              <div className="card" style={{ padding: '1.25rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                  <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--slate-500)' }}>SMART HR ALERTS</span>
                  <AlertTriangle size={18} className="text-warning" />
                </div>
                <div style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--slate-900)' }}>3 Active</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--danger-600)', marginTop: '0.25rem', fontWeight: 600 }}>
                  1 High severity (Attendance Decline)
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. CORE FEATURES SECTION */}
      <section id="features" style={{ padding: '4rem 2rem', backgroundColor: '#ffffff' }}>
        <div style={{ maxWidth: '1280px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '3.5rem' }}>
            <span style={{ fontSize: '0.8125rem', fontWeight: 700, color: 'var(--primary-600)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              Full Suite Architecture
            </span>
            <h2 style={{ fontSize: '2.25rem', fontWeight: 800, color: 'var(--slate-900)', marginTop: '0.5rem' }}>
              Engineered for People Leaders and High-Growth Teams
            </h2>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '2rem' }}>
            <div className="card" style={{ padding: '2rem' }}>
              <div style={{ width: '48px', height: '48px', borderRadius: '12px', backgroundColor: 'var(--primary-50)', color: 'var(--primary-600)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.25rem' }}>
                <CalendarCheck size={24} />
              </div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--slate-900)', marginBottom: '0.5rem' }}>
                Precision Attendance Tracking
              </h3>
              <p style={{ fontSize: '0.875rem', color: 'var(--slate-600)', lineHeight: '1.6' }}>
                Real-time punch clock, automatic late calculation, overtime reconciliation, and automated attendance regularization requests.
              </p>
            </div>

            <div className="card" style={{ padding: '2rem' }}>
              <div style={{ width: '48px', height: '48px', borderRadius: '12px', backgroundColor: 'var(--accent-50)', color: 'var(--accent-600)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.25rem' }}>
                <CalendarRange size={24} />
              </div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--slate-900)', marginBottom: '0.5rem' }}>
                Smart Leave Approvals
              </h3>
              <p style={{ fontSize: '0.875rem', color: 'var(--slate-600)', lineHeight: '1.6' }}>
                Multi-tier leave buckets (Casual, Sick, Annual, Emergency), real-time team calendar overlap detection, and one-click approvals.
              </p>
            </div>

            <div className="card" style={{ padding: '2rem' }}>
              <div style={{ width: '48px', height: '48px', borderRadius: '12px', backgroundColor: 'var(--success-50)', color: 'var(--success-600)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.25rem' }}>
                <DollarSign size={24} />
              </div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--slate-900)', marginBottom: '0.5rem' }}>
                Automated Payroll & Payslips
              </h3>
              <p style={{ fontSize: '0.875rem', color: 'var(--slate-600)', lineHeight: '1.6' }}>
                Calculates gross, allowances, overtime, tax, and deductions. Employees can view breakdowns and download digital payslips instantly.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 4. INNOVATION HIGHLIGHT: WELLNESS INDICATOR & SMART ALERTS */}
      <section id="wellness" style={{ padding: '5rem 2rem', backgroundColor: 'var(--slate-50)' }}>
        <div style={{ maxWidth: '1280px', margin: '0 auto' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '3rem', alignItems: 'center' }}>
            <div>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', padding: '0.25rem 0.75rem', backgroundColor: 'var(--primary-100)', color: 'var(--primary-700)', borderRadius: '9999px', fontSize: '0.75rem', fontWeight: 700, marginBottom: '1rem' }}>
                <HeartPulse size={14} />
                <span>DayFlow Innovation</span>
              </div>
              <h2 style={{ fontSize: '2.25rem', fontWeight: 800, color: 'var(--slate-900)', lineHeight: '1.25', marginBottom: '1rem' }}>
                Proactive Workforce Wellness & Early Risk Indicators
              </h2>
              <p style={{ fontSize: '1rem', color: 'var(--slate-600)', lineHeight: '1.6', marginBottom: '1.5rem' }}>
                DayFlow analyzes work-related attendance, sudden leave clusters, and team availability shifts to provide objective workforce health scores without invasive medical assumptions.
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
                  <CheckCircle2 size={18} className="text-success" style={{ shrink: 0, marginTop: '2px' }} />
                  <span style={{ fontSize: '0.875rem', color: 'var(--slate-700)' }}>
                    <strong>Objective Work Signals:</strong> Synthesizes attendance percentages, late trends, and absence frequency.
                  </span>
                </div>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
                  <CheckCircle2 size={18} className="text-success" style={{ shrink: 0, marginTop: '2px' }} />
                  <span style={{ fontSize: '0.875rem', color: 'var(--slate-700)' }}>
                    <strong>Actionable Tiers:</strong> Categorized as 🟢 Stable, 🟡 Monitor, or 🔴 Needs Attention.
                  </span>
                </div>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
                  <CheckCircle2 size={18} className="text-success" style={{ shrink: 0, marginTop: '2px' }} />
                  <span style={{ fontSize: '0.875rem', color: 'var(--slate-700)' }}>
                    <strong>Strict Compliance:</strong> Free of medical and mental-health diagnostic overreach.
                  </span>
                </div>
              </div>
            </div>

            <div className="card" style={{ padding: '2rem', backgroundColor: '#ffffff', boxShadow: 'var(--shadow-lg)' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid var(--border-light)', paddingBottom: '1rem', marginBottom: '1.5rem' }}>
                <span style={{ fontWeight: 700, fontSize: '0.9375rem', color: 'var(--slate-900)' }}>Workforce Indicator Sample</span>
                <span className="badge badge-success">Live Metric</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1.5rem' }}>
                <WellnessScore score={88} indicator="stable" size="lg" />
              </div>
              <div style={{ padding: '1rem', backgroundColor: 'var(--slate-50)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-light)', fontSize: '0.8125rem', color: 'var(--slate-600)' }}>
                "Attendance has remained consistently steady. Regular punch-in habits observed with balanced leave distribution."
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 5. SMART ALERTS & ANALYTICS */}
      <section id="alerts" style={{ padding: '5rem 2rem', backgroundColor: '#ffffff' }}>
        <div style={{ maxWidth: '1280px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '3.5rem' }}>
            <span style={{ fontSize: '0.8125rem', fontWeight: 700, color: 'var(--primary-600)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              Automated Intelligence
            </span>
            <h2 style={{ fontSize: '2.25rem', fontWeight: 800, color: 'var(--slate-900)', marginTop: '0.5rem' }}>
              Smart HR Alerts That Keep You Ahead
            </h2>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem' }}>
            <div className="card" style={{ padding: '1.5rem', borderLeft: '4px solid var(--danger-500)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                <h4 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--slate-900)' }}>Attendance Decline Alert</h4>
                <span className="badge badge-danger">High</span>
              </div>
              <p style={{ fontSize: '0.8125rem', color: 'var(--slate-600)', lineHeight: '1.5' }}>
                Triggers when an employee's monthly attendance drops precipitously (>15%) over a rolling 30-day period.
              </p>
            </div>

            <div className="card" style={{ padding: '1.5rem', borderLeft: '4px solid var(--warning-500)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                <h4 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--slate-900)' }}>Team Availability Risk</h4>
                <span className="badge badge-warning">Medium</span>
              </div>
              <p style={{ fontSize: '0.8125rem', color: 'var(--slate-600)', lineHeight: '1.5' }}>
                Notifies managers when concurrent leave requests exceed 40% of team capacity during key release windows.
              </p>
            </div>

            <div className="card" style={{ padding: '1.5rem', borderLeft: '4px solid var(--info-500)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                <h4 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--slate-900)' }}>Late Arrival Pattern</h4>
                <span className="badge badge-info">Low</span>
              </div>
              <p style={{ fontSize: '0.8125rem', color: 'var(--slate-600)', lineHeight: '1.5' }}>
                Flags recurring late arrivals so HR and team leads can address commuting hurdles or shift preferences early.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 6. CALL TO ACTION */}
      <section
        style={{
          padding: '5rem 2rem',
          background: 'linear-gradient(135deg, var(--primary-700) 0%, var(--accent-700) 100%)',
          color: '#ffffff',
          textAlign: 'center',
        }}
      >
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
          <h2 style={{ fontSize: '2.5rem', fontWeight: 800, marginBottom: '1rem', letterSpacing: '-0.02em' }}>
            Elevate Your Workforce Operations Today
          </h2>
          <p style={{ fontSize: '1.125rem', opacity: 0.9, lineHeight: '1.6', marginBottom: '2rem' }}>
            Connect DayFlow to your organization and experience modern, insight-driven human resource management.
          </p>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '1rem', flexWrap: 'wrap' }}>
            <Link to="/register" style={{ textDecoration: 'none' }}>
              <Button
                variant="secondary"
                size="lg"
                style={{ backgroundColor: '#ffffff', color: 'var(--primary-700)', fontWeight: 700 }}
              >
                Create Account
              </Button>
            </Link>
            <Link to="/login" style={{ textDecoration: 'none' }}>
              <Button
                variant="ghost"
                size="lg"
                style={{ color: '#ffffff', border: '1px solid rgba(255, 255, 255, 0.4)' }}
              >
                Sign In
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default LandingPage;
