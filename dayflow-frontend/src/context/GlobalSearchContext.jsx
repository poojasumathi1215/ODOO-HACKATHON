import React, { createContext, useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Users, Calendar, DollarSign, AlertCircle, FileText, X, ArrowRight } from 'lucide-react';
import { mockEmployees, mockLeaveRequests, mockSmartAlerts } from '../utils/mockData';
import { useAuth } from '../hooks/useAuth';

export const GlobalSearchContext = createContext(null);

export const GlobalSearchProvider = ({ children }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const navigate = useNavigate();
  const { isHR } = useAuth();

  // Keyboard shortcut listener: Cmd+K or Ctrl+K
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsOpen((prev) => !prev);
      } else if (e.key === 'Escape' && isOpen) {
        setIsOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  const openSearch = () => {
    setQuery('');
    setIsOpen(true);
  };

  const closeSearch = () => {
    setIsOpen(false);
    setQuery('');
  };

  const handleSelect = (path) => {
    closeSearch();
    navigate(path);
  };

  // Filtered Results
  const q = query.trim().toLowerCase();

  const matchingEmployees = q
    ? mockEmployees.filter(
        (e) =>
          e.name.toLowerCase().includes(q) ||
          e.email.toLowerCase().includes(q) ||
          e.employeeId.toLowerCase().includes(q) ||
          e.department.toLowerCase().includes(q)
      )
    : [];

  const matchingLeaves = q
    ? mockLeaveRequests.filter(
        (l) =>
          l.employeeName.toLowerCase().includes(q) ||
          l.leaveType.toLowerCase().includes(q) ||
          l.reason.toLowerCase().includes(q)
      )
    : [];

  const matchingAlerts = (q && isHR)
    ? mockSmartAlerts.filter(
        (a) =>
          a.title.toLowerCase().includes(q) ||
          a.message.toLowerCase().includes(q) ||
          a.target.toLowerCase().includes(q)
      )
    : [];

  const quickPages = [
    { title: 'My Dashboard', path: isHR ? '/hr/dashboard' : '/employee/dashboard', icon: FileText },
    { title: 'Attendance Log', path: isHR ? '/hr/attendance' : '/employee/attendance', icon: Calendar },
    { title: 'Leave Center', path: isHR ? '/hr/leaves' : '/employee/leave', icon: Calendar },
    { title: 'Payroll & Compensation', path: isHR ? '/hr/payroll' : '/employee/payroll', icon: DollarSign },
    ...(isHR
      ? [
          { title: 'Employee Directory', path: '/hr/employees', icon: Users },
          { title: 'Smart HR Alerts', path: '/hr/alerts', icon: AlertCircle },
          { title: 'Executive Reports', path: '/hr/reports', icon: FileText },
        ]
      : []),
  ].filter((p) => !q || p.title.toLowerCase().includes(q));

  return (
    <GlobalSearchContext.Provider value={{ openSearch, closeSearch, isOpen }}>
      {children}
      {isOpen && (
        <div className="modal-backdrop" onClick={closeSearch}>
          <div
            className="modal-content"
            style={{ maxWidth: '640px', marginTop: '5vh' }}
            onClick={(e) => e.stopPropagation()}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                padding: '1rem 1.25rem',
                borderBottom: '1px solid var(--border-color)',
              }}
            >
              <Search size={20} className="text-slate-500" />
              <input
                type="text"
                autoFocus
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search employees, leaves, payroll, alerts, or jump to page..."
                style={{
                  width: '100%',
                  border: 'none',
                  outline: 'none',
                  fontSize: '1rem',
                  color: 'var(--slate-900)',
                }}
              />
              <button
                onClick={closeSearch}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--slate-400)' }}
              >
                <X size={18} />
              </button>
            </div>

            <div style={{ maxHeight: '420px', overflowY: 'auto', padding: '0.75rem' }}>
              {/* Quick Navigation Pages */}
              <div style={{ marginBottom: '1rem' }}>
                <div
                  style={{
                    fontSize: '0.75rem',
                    fontWeight: '700',
                    color: 'var(--slate-400)',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                    padding: '0.25rem 0.5rem',
                  }}
                >
                  Quick Navigation
                </div>
                {quickPages.map((page, idx) => {
                  const Icon = page.icon;
                  return (
                    <div
                      key={idx}
                      onClick={() => handleSelect(page.path)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '0.625rem 0.75rem',
                        borderRadius: 'var(--radius-md)',
                        cursor: 'pointer',
                        transition: 'background-color 0.15s',
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'var(--slate-100)')}
                      onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
                        <Icon size={16} className="text-primary" />
                        <span style={{ fontSize: '0.875rem', fontWeight: 500 }}>{page.title}</span>
                      </div>
                      <ArrowRight size={14} className="text-slate-400" />
                    </div>
                  );
                })}
              </div>

              {/* Matching Employees */}
              {matchingEmployees.length > 0 && (
                <div style={{ marginBottom: '1rem' }}>
                  <div
                    style={{
                      fontSize: '0.75rem',
                      fontWeight: '700',
                      color: 'var(--slate-400)',
                      textTransform: 'uppercase',
                      letterSpacing: '0.05em',
                      padding: '0.25rem 0.5rem',
                    }}
                  >
                    Employees
                  </div>
                  {matchingEmployees.map((emp) => (
                    <div
                      key={emp.id}
                      onClick={() => handleSelect(isHR ? `/hr/employees/${emp.id}` : '/employee/profile')}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '0.625rem 0.75rem',
                        borderRadius: 'var(--radius-md)',
                        cursor: 'pointer',
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'var(--slate-100)')}
                      onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <img
                          src={emp.avatar}
                          alt={emp.name}
                          style={{ width: '28px', height: '28px', borderRadius: '50%', objectFit: 'cover' }}
                        />
                        <div>
                          <div style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--slate-900)' }}>
                            {emp.name} <span style={{ color: 'var(--slate-400)', fontWeight: 400 }}>({emp.employeeId})</span>
                          </div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--slate-500)' }}>
                            {emp.designation} • {emp.department}
                          </div>
                        </div>
                      </div>
                      <ArrowRight size={14} className="text-slate-400" />
                    </div>
                  ))}
                </div>
              )}

              {/* Matching Smart Alerts */}
              {matchingAlerts.length > 0 && (
                <div style={{ marginBottom: '1rem' }}>
                  <div
                    style={{
                      fontSize: '0.75rem',
                      fontWeight: '700',
                      color: 'var(--slate-400)',
                      textTransform: 'uppercase',
                      letterSpacing: '0.05em',
                      padding: '0.25rem 0.5rem',
                    }}
                  >
                    Smart HR Alerts
                  </div>
                  {matchingAlerts.map((alert) => (
                    <div
                      key={alert.id}
                      onClick={() => handleSelect('/hr/alerts')}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '0.625rem 0.75rem',
                        borderRadius: 'var(--radius-md)',
                        cursor: 'pointer',
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'var(--slate-100)')}
                      onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <AlertCircle size={16} className="text-danger" />
                        <div>
                          <div style={{ fontSize: '0.875rem', fontWeight: 600 }}>{alert.title}</div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--slate-500)' }}>{alert.target}</div>
                        </div>
                      </div>
                      <span className={`badge badge-${alert.severity === 'high' ? 'danger' : 'warning'}`}>
                        {alert.severity}
                      </span>
                    </div>
                  ))}
                </div>
              )}

              {/* Matching Leaves */}
              {matchingLeaves.length > 0 && (
                <div>
                  <div
                    style={{
                      fontSize: '0.75rem',
                      fontWeight: '700',
                      color: 'var(--slate-400)',
                      textTransform: 'uppercase',
                      letterSpacing: '0.05em',
                      padding: '0.25rem 0.5rem',
                    }}
                  >
                    Leave Requests
                  </div>
                  {matchingLeaves.map((lv) => (
                    <div
                      key={lv.id}
                      onClick={() => handleSelect(isHR ? '/hr/leaves' : '/employee/leave')}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '0.625rem 0.75rem',
                        borderRadius: 'var(--radius-md)',
                        cursor: 'pointer',
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'var(--slate-100)')}
                      onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                    >
                      <div>
                        <div style={{ fontSize: '0.875rem', fontWeight: 600 }}>
                          {lv.employeeName} – {lv.leaveType}
                        </div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--slate-500)' }}>
                          {lv.startDate} to {lv.endDate} ({lv.days} days)
                        </div>
                      </div>
                      <span className={`badge badge-${lv.status === 'approved' ? 'success' : lv.status === 'pending' ? 'warning' : 'danger'}`}>
                        {lv.status}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div
              style={{
                padding: '0.75rem 1.25rem',
                backgroundColor: 'var(--slate-50)',
                borderTop: '1px solid var(--border-color)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                fontSize: '0.75rem',
                color: 'var(--slate-500)',
              }}
            >
              <span>Tip: Press <kbd style={{ padding: '2px 4px', background: '#e2e8f0', borderRadius: '3px' }}>Esc</kbd> to close</span>
              <span>DayFlow Global Search</span>
            </div>
          </div>
        </div>
      )}
    </GlobalSearchContext.Provider>
  );
};

export const useGlobalSearch = () => {
  const context = useContext(GlobalSearchContext);
  if (!context) {
    throw new Error('useGlobalSearch must be used within GlobalSearchProvider');
  }
  return context;
};
