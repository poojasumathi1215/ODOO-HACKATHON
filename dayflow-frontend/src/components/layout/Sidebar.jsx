import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  CalendarCheck,
  CalendarRange,
  DollarSign,
  HeartPulse,
  AlertTriangle,
  BarChart3,
  FileSpreadsheet,
  Bell,
  Settings,
  LogOut,
  UserCheck,
  X,
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';

export const Sidebar = ({ isMobileOpen, onCloseMobile }) => {
  const { user, isHR, logout, switchRole } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const employeeLinks = [
    { title: 'Dashboard', path: '/employee/dashboard', icon: LayoutDashboard },
    { title: 'My Profile', path: '/employee/profile', icon: UserCheck },
    { title: 'Attendance', path: '/employee/attendance', icon: CalendarCheck },
    { title: 'Leave', path: '/employee/leave', icon: CalendarRange },
    { title: 'Payroll', path: '/employee/payroll', icon: DollarSign },
    { title: 'Wellness', path: '/employee/wellness', icon: HeartPulse, badge: 'Smart' },
    { title: 'Notifications', path: '/employee/notifications', icon: Bell },
    { title: 'Settings', path: '/employee/settings', icon: Settings },
  ];

  const hrLinks = [
    { title: 'Dashboard', path: '/hr/dashboard', icon: LayoutDashboard },
    { title: 'Employees', path: '/hr/employees', icon: Users },
    { title: 'Attendance', path: '/hr/attendance', icon: CalendarCheck },
    { title: 'Leave Requests', path: '/hr/leaves', icon: CalendarRange, badge: '4 New' },
    { title: 'Payroll', path: '/hr/payroll', icon: DollarSign },
    { title: 'Wellness Monitor', path: '/hr/wellness', icon: HeartPulse, badge: 'Live' },
    { title: 'Smart Alerts', path: '/hr/alerts', icon: AlertTriangle, badge: '3', badgeColor: 'danger' },
    { title: 'Analytics', path: '/hr/analytics', icon: BarChart3 },
    { title: 'Reports', path: '/hr/reports', icon: FileSpreadsheet },
    { title: 'Notifications', path: '/hr/notifications', icon: Bell },
    { title: 'Settings', path: '/hr/settings', icon: Settings },
  ];

  const links = isHR ? hrLinks : employeeLinks;

  return (
    <>
      {/* Mobile Backdrop */}
      {isMobileOpen && (
        <div
          onClick={onCloseMobile}
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(15, 23, 42, 0.5)',
            zIndex: 40,
            backdropFilter: 'blur(2px)',
          }}
        />
      )}

      <aside
        className={`sidebar-wrapper ${isMobileOpen ? 'mobile-open' : ''}`}
        style={{
          width: 'var(--sidebar-width)',
          backgroundColor: '#ffffff',
          borderRight: '1px solid var(--border-color)',
          height: '100vh',
          position: 'sticky',
          top: 0,
          display: 'flex',
          flexDirection: 'column',
          zIndex: 45,
          transition: 'transform 0.25s ease',
        }}
      >
        {/* Sidebar Brand Header */}
        <div
          style={{
            padding: '1.25rem 1.5rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderBottom: '1px solid var(--border-light)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '10px',
                background: 'linear-gradient(135deg, var(--primary-600) 0%, var(--accent-600) 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#ffffff',
                fontWeight: '800',
                fontSize: '1.125rem',
                boxShadow: '0 2px 8px rgba(79, 70, 229, 0.25)',
              }}
            >
              D
            </div>
            <div>
              <div style={{ fontSize: '1.125rem', fontWeight: 800, color: 'var(--slate-900)', letterSpacing: '-0.02em' }}>
                DayFlow
              </div>
              <div style={{ fontSize: '0.6875rem', fontWeight: 600, color: 'var(--primary-600)', letterSpacing: '0.04em', textTransform: 'uppercase' }}>
                {isHR ? 'HR Command' : 'Employee Portal'}
              </div>
            </div>
          </div>

          {/* Close button for mobile */}
          <button
            onClick={onCloseMobile}
            className="mobile-close-btn"
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: 'var(--slate-400)',
              padding: '0.25rem',
            }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Navigation Links List */}
        <div style={{ flex: 1, padding: '1rem 0.75rem', overflowY: 'auto' }}>
          <div
            style={{
              fontSize: '0.6875rem',
              fontWeight: 700,
              color: 'var(--slate-400)',
              textTransform: 'uppercase',
              letterSpacing: '0.06em',
              padding: '0 0.75rem 0.5rem',
            }}
          >
            {isHR ? 'HR Operations' : 'Workspace'}
          </div>

          <nav style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
            {links.map((link) => {
              const Icon = link.icon;
              return (
                <NavLink
                  key={link.path}
                  to={link.path}
                  onClick={onCloseMobile}
                  style={({ isActive }) => ({
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '0.625rem 0.875rem',
                    borderRadius: 'var(--radius-md)',
                    textDecoration: 'none',
                    fontSize: '0.875rem',
                    fontWeight: isActive ? 600 : 500,
                    color: isActive ? 'var(--primary-600)' : 'var(--slate-600)',
                    backgroundColor: isActive ? 'var(--primary-50)' : 'transparent',
                    transition: 'all 0.15s ease',
                  })}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <Icon size={18} />
                    <span>{link.title}</span>
                  </div>
                  {link.badge && (
                    <span
                      style={{
                        fontSize: '0.6875rem',
                        fontWeight: 700,
                        padding: '0.125rem 0.5rem',
                        borderRadius: '9999px',
                        backgroundColor:
                          link.badgeColor === 'danger' ? 'var(--danger-50)' : 'var(--primary-100)',
                        color:
                          link.badgeColor === 'danger' ? 'var(--danger-700)' : 'var(--primary-700)',
                      }}
                    >
                      {link.badge}
                    </span>
                  )}
                </NavLink>
              );
            })}
          </nav>
        </div>

        {/* Demo Role Switcher & User Footer */}
        <div
          style={{
            padding: '1rem',
            borderTop: '1px solid var(--border-light)',
            backgroundColor: 'var(--slate-50)',
          }}
        >
          {/* Quick role toggle for preview */}
          <div
            style={{
              padding: '0.5rem 0.75rem',
              backgroundColor: '#ffffff',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border-color)',
              marginBottom: '0.75rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <span style={{ fontSize: '0.75rem', color: 'var(--slate-500)', fontWeight: 500 }}>
              Mode: <strong style={{ color: 'var(--slate-900)' }}>{isHR ? 'HR' : 'Employee'}</strong>
            </span>
            <button
              onClick={() => {
                const nextRole = isHR ? 'employee' : 'hr';
                switchRole(nextRole);
                navigate(nextRole === 'hr' ? '/hr/dashboard' : '/employee/dashboard');
              }}
              style={{
                fontSize: '0.6875rem',
                color: 'var(--primary-600)',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                fontWeight: 600,
                padding: '0.125rem 0.375rem',
                borderRadius: '4px',
              }}
            >
              Switch ⇄
            </button>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', overflow: 'hidden' }}>
              <img
                src={user?.avatar || 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150'}
                alt={user?.name || 'User'}
                style={{ width: '32px', height: '32px', borderRadius: '50%', objectFit: 'cover' }}
              />
              <div style={{ overflow: 'hidden' }}>
                <div style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--slate-900)' }} className="truncate">
                  {user?.name || 'Sarah Jenkins'}
                </div>
                <div style={{ fontSize: '0.6875rem', color: 'var(--slate-500)' }} className="truncate">
                  {user?.email || 'sarah.jenkins@dayflow.io'}
                </div>
              </div>
            </div>

            <button
              onClick={handleLogout}
              title="Log Out"
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                color: 'var(--slate-400)',
                padding: '0.375rem',
                borderRadius: '6px',
                display: 'flex',
                alignItems: 'center',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--danger-600)')}
              onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--slate-400)')}
            >
              <LogOut size={16} />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
