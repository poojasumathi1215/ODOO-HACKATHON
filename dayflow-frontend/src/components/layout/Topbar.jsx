import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Menu, Search, Bell, User, Check, Settings, LogOut, ChevronDown, ExternalLink } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { useGlobalSearch } from '../../context/GlobalSearchContext';
import { mockNotifications } from '../../utils/mockData';

export const Topbar = ({ onToggleMobile }) => {
  const { user, isHR, logout } = useAuth();
  const { openSearch } = useGlobalSearch();
  const navigate = useNavigate();

  const [notifications, setNotifications] = useState(mockNotifications);
  const [showNotifs, setShowNotifs] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);

  const notifRef = useRef(null);
  const userRef = useRef(null);

  const unreadCount = notifications.filter((n) => !n.read).length;

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setShowNotifs(false);
      }
      if (userRef.current && !userRef.current.contains(e.target)) {
        setShowUserMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const markAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header
      style={{
        height: 'var(--topbar-height)',
        backgroundColor: '#ffffff',
        borderBottom: '1px solid var(--border-color)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 1.75rem',
        position: 'sticky',
        top: 0,
        zIndex: 30,
      }}
    >
      {/* Left: Mobile toggle & Global Search bar */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flex: 1, maxWidth: '480px' }}>
        <button
          onClick={onToggleMobile}
          style={{
            display: 'none',
            background: 'none',
            border: 'none',
            padding: '0.375rem',
            cursor: 'pointer',
            color: 'var(--slate-600)',
          }}
          className="mobile-hamburger"
          aria-label="Toggle Navigation Menu"
        >
          <Menu size={22} />
        </button>

        {/* Global Search Trigger Bar */}
        <div
          onClick={openSearch}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            backgroundColor: 'var(--slate-100)',
            borderRadius: 'var(--radius-md)',
            padding: '0.5rem 0.875rem',
            width: '100%',
            cursor: 'pointer',
            border: '1px solid transparent',
            transition: 'all 0.15s ease',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = '#ffffff';
            e.currentTarget.style.borderColor = 'var(--slate-300)';
            e.currentTarget.style.boxShadow = 'var(--shadow-xs)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'var(--slate-100)';
            e.currentTarget.style.borderColor = 'transparent';
            e.currentTarget.style.boxShadow = 'none';
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', color: 'var(--slate-400)' }}>
            <Search size={16} />
            <span style={{ fontSize: '0.875rem', color: 'var(--slate-500)' }}>
              Search records, employees, leaves...
            </span>
          </div>
          <kbd
            style={{
              fontSize: '0.6875rem',
              backgroundColor: '#ffffff',
              border: '1px solid var(--slate-300)',
              borderRadius: '4px',
              padding: '0.125rem 0.375rem',
              color: 'var(--slate-500)',
              fontWeight: 600,
            }}
          >
            ⌘K
          </kbd>
        </div>
      </div>

      {/* Right Actions: Notifications & User Profile */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        {/* Notifications Dropdown */}
        <div style={{ position: 'relative' }} ref={notifRef}>
          <button
            onClick={() => setShowNotifs(!showNotifs)}
            style={{
              width: '38px',
              height: '38px',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border-color)',
              backgroundColor: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              color: 'var(--slate-600)',
              position: 'relative',
            }}
            aria-label="Notifications"
          >
            <Bell size={18} />
            {unreadCount > 0 && (
              <span
                style={{
                  position: 'absolute',
                  top: '-4px',
                  right: '-4px',
                  backgroundColor: 'var(--danger-500)',
                  color: '#ffffff',
                  fontSize: '0.6875rem',
                  fontWeight: 700,
                  width: '18px',
                  height: '18px',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  border: '2px solid #ffffff',
                }}
              >
                {unreadCount}
              </span>
            )}
          </button>

          {showNotifs && (
            <div
              style={{
                position: 'absolute',
                top: 'calc(100% + 8px)',
                right: 0,
                width: '360px',
                backgroundColor: '#ffffff',
                borderRadius: 'var(--radius-lg)',
                boxShadow: 'var(--shadow-xl)',
                border: '1px solid var(--border-color)',
                zIndex: 50,
                overflow: 'hidden',
                animation: 'slideUp 0.15s ease-out',
              }}
            >
              <div
                style={{
                  padding: '1rem 1.25rem',
                  borderBottom: '1px solid var(--border-light)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}
              >
                <div style={{ fontWeight: 600, fontSize: '0.9375rem', color: 'var(--slate-900)' }}>
                  Notifications
                </div>
                {unreadCount > 0 && (
                  <button
                    onClick={markAllRead}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: 'var(--primary-600)',
                      fontSize: '0.75rem',
                      fontWeight: 600,
                      cursor: 'pointer',
                    }}
                  >
                    Mark all read
                  </button>
                )}
              </div>

              <div style={{ maxHeight: '340px', overflowY: 'auto' }}>
                {notifications.map((n) => (
                  <div
                    key={n.id}
                    onClick={() => {
                      setShowNotifs(false);
                      navigate(n.link || (isHR ? '/hr/notifications' : '/employee/notifications'));
                    }}
                    style={{
                      padding: '0.875rem 1.25rem',
                      borderBottom: '1px solid var(--border-light)',
                      backgroundColor: n.read ? '#ffffff' : 'var(--primary-50)',
                      cursor: 'pointer',
                      transition: 'background-color 0.15s',
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'var(--slate-100)')}
                    onMouseLeave={(e) =>
                      (e.currentTarget.style.backgroundColor = n.read ? '#ffffff' : 'var(--primary-50)')
                    }
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.25rem' }}>
                      <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--slate-900)' }}>
                        {n.title}
                      </span>
                      <span style={{ fontSize: '0.6875rem', color: 'var(--slate-400)' }}>{n.timestamp}</span>
                    </div>
                    <p style={{ fontSize: '0.75rem', color: 'var(--slate-600)', lineHeight: '1.4' }}>
                      {n.message}
                    </p>
                  </div>
                ))}
              </div>

              <div
                style={{
                  padding: '0.75rem',
                  textAlign: 'center',
                  backgroundColor: 'var(--slate-50)',
                  borderTop: '1px solid var(--border-light)',
                }}
              >
                <Link
                  to={isHR ? '/hr/notifications' : '/employee/notifications'}
                  onClick={() => setShowNotifs(false)}
                  style={{
                    fontSize: '0.8125rem',
                    fontWeight: 600,
                    color: 'var(--primary-600)',
                    textDecoration: 'none',
                  }}
                >
                  View all notifications →
                </Link>
              </div>
            </div>
          )}
        </div>

        {/* User Profile Menu */}
        <div style={{ position: 'relative' }} ref={userRef}>
          <div
            onClick={() => setShowUserMenu(!showUserMenu)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.625rem',
              cursor: 'pointer',
              padding: '0.375rem 0.625rem',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border-color)',
            }}
          >
            <img
              src={user?.avatar || 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150'}
              alt={user?.name || 'Profile'}
              style={{ width: '32px', height: '32px', borderRadius: '50%', objectFit: 'cover' }}
            />
            <div style={{ textAlign: 'left', display: 'none' }} className="user-text-label">
              <div style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--slate-900)', lineHeight: 1.2 }}>
                {user?.name || 'Sarah Jenkins'}
              </div>
              <div style={{ fontSize: '0.6875rem', color: 'var(--slate-500)', textTransform: 'capitalize' }}>
                {user?.role || 'Employee'}
              </div>
            </div>
            <ChevronDown size={14} className="text-slate-400" />
          </div>

          {showUserMenu && (
            <div
              style={{
                position: 'absolute',
                top: 'calc(100% + 8px)',
                right: 0,
                width: '220px',
                backgroundColor: '#ffffff',
                borderRadius: 'var(--radius-lg)',
                boxShadow: 'var(--shadow-xl)',
                border: '1px solid var(--border-color)',
                zIndex: 50,
                padding: '0.5rem',
                animation: 'slideUp 0.15s ease-out',
              }}
            >
              <div style={{ padding: '0.5rem 0.75rem', borderBottom: '1px solid var(--border-light)', marginBottom: '0.25rem' }}>
                <div style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--slate-900)' }}>
                  {user?.name}
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--slate-500)' }}>
                  {user?.email}
                </div>
              </div>

              <Link
                to={isHR ? '/hr/dashboard' : '/employee/profile'}
                onClick={() => setShowUserMenu(false)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.625rem',
                  padding: '0.5rem 0.75rem',
                  fontSize: '0.8125rem',
                  color: 'var(--slate-700)',
                  textDecoration: 'none',
                  borderRadius: 'var(--radius-sm)',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'var(--slate-100)')}
                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
              >
                <User size={15} />
                <span>My Profile</span>
              </Link>

              <Link
                to={isHR ? '/hr/settings' : '/employee/settings'}
                onClick={() => setShowUserMenu(false)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.625rem',
                  padding: '0.5rem 0.75rem',
                  fontSize: '0.8125rem',
                  color: 'var(--slate-700)',
                  textDecoration: 'none',
                  borderRadius: 'var(--radius-sm)',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'var(--slate-100)')}
                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
              >
                <Settings size={15} />
                <span>Account Settings</span>
              </Link>

              <div style={{ borderTop: '1px solid var(--border-light)', margin: '0.25rem 0' }} />

              <button
                onClick={handleLogout}
                style={{
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.625rem',
                  padding: '0.5rem 0.75rem',
                  fontSize: '0.8125rem',
                  color: 'var(--danger-600)',
                  background: 'none',
                  border: 'none',
                  borderRadius: 'var(--radius-sm)',
                  cursor: 'pointer',
                  textAlign: 'left',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'var(--danger-50)')}
                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
              >
                <LogOut size={15} />
                <span>Sign Out</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Topbar;
