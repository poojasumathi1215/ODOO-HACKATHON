import React, { useState, useEffect } from 'react';
import {
  CalendarCheck,
  Clock,
  LogIn,
  LogOut,
  Calendar,
  AlertCircle,
  FilePlus,
  Filter,
  CheckCircle2,
} from 'lucide-react';
import PageHeader from '../../components/layout/PageHeader';
import DataTable from '../../components/tables/DataTable';
import FilterBar from '../../components/tables/FilterBar';
import Modal from '../../components/common/Modal';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import { useAuth } from '../../hooks/useAuth';
import { useToast } from '../../hooks/useToast';
import attendanceApi from '../../api/attendanceApi';
import { formatDate } from '../../utils/dateUtils';

export const Attendance = () => {
  const { user } = useAuth();
  const { success, error } = useToast();

  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('all');
  const [viewMode, setViewMode] = useState('table'); // table or calendar

  // Regularization Modal State
  const [isRegModalOpen, setIsRegModalOpen] = useState(false);
  const [regForm, setRegForm] = useState({
    date: new Date().toISOString().split('T')[0],
    checkIn: '09:00',
    checkOut: '17:30',
    reason: '',
  });
  const [regLoading, setRegLoading] = useState(false);

  // Punch actions
  const [isCheckedIn, setIsCheckedIn] = useState(true);
  const [punchLoading, setPunchLoading] = useState(false);

  useEffect(() => {
    fetchAttendance();
  }, []);

  const fetchAttendance = async () => {
    setLoading(true);
    try {
      const res = await attendanceApi.getMyAttendance();
      setRecords(res.data || []);
    } catch (err) {
      error('Failed to load attendance logs');
    } finally {
      setLoading(false);
    }
  };

  const handlePunchIn = async () => {
    setPunchLoading(true);
    try {
      const res = await attendanceApi.checkIn();
      setIsCheckedIn(true);
      success(res.message || 'Punched in successfully!');
      fetchAttendance();
    } catch (err) {
      error(err.message || 'Check-in failed');
    } finally {
      setPunchLoading(false);
    }
  };

  const handlePunchOut = async () => {
    setPunchLoading(true);
    try {
      const res = await attendanceApi.checkOut();
      setIsCheckedIn(false);
      success(res.message || 'Punched out successfully!');
      fetchAttendance();
    } catch (err) {
      error(err.message || 'Check-out failed');
    } finally {
      setPunchLoading(false);
    }
  };

  const handleRegularizationSubmit = async (e) => {
    e.preventDefault();
    if (!regForm.reason.trim()) {
      error('Please specify a reason for regularization');
      return;
    }
    setRegLoading(true);
    try {
      await attendanceApi.requestRegularization(regForm);
      success('Regularization request submitted to your reporting manager.');
      setIsRegModalOpen(false);
      setRegForm({
        date: new Date().toISOString().split('T')[0],
        checkIn: '09:00',
        checkOut: '17:30',
        reason: '',
      });
    } catch (err) {
      error(err.message || 'Failed to submit regularization');
    } finally {
      setRegLoading(false);
    }
  };

  const filteredRecords = records.filter((r) => {
    if (filterStatus !== 'all' && r.status !== filterStatus) return false;
    return true;
  });

  const columns = [
    {
      header: 'Date',
      accessor: 'date',
      render: (val) => (
        <span style={{ fontWeight: 600, color: 'var(--slate-900)' }}>
          {formatDate(val)}
        </span>
      ),
    },
    {
      header: 'Check In',
      accessor: 'checkIn',
      render: (val) => (
        <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
          <Clock size={13} className="text-slate-400" /> {val}
        </span>
      ),
    },
    {
      header: 'Check Out',
      accessor: 'checkOut',
      render: (val) => (
        <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
          <Clock size={13} className="text-slate-400" /> {val}
        </span>
      ),
    },
    {
      header: 'Logged Hours',
      accessor: 'hours',
      render: (val) => <strong style={{ color: 'var(--slate-800)' }}>{val} hrs</strong>,
    },
    {
      header: 'Status',
      accessor: 'status',
      render: (val) => <Badge variant={val}>{val.toUpperCase()}</Badge>,
    },
    {
      header: 'Late / Overtime',
      accessor: 'lateMinutes',
      render: (_, row) => (
        <div style={{ fontSize: '0.75rem', color: 'var(--slate-500)' }}>
          {row.lateMinutes > 0 && <span style={{ color: 'var(--danger-600)' }}>{row.lateMinutes}m Late</span>}
          {row.overtimeMinutes > 0 && <span style={{ color: 'var(--success-600)' }}> +{row.overtimeMinutes}m OT</span>}
          {row.lateMinutes === 0 && row.overtimeMinutes === 0 && '—'}
        </div>
      ),
    },
  ];

  return (
    <div>
      <PageHeader
        title="Attendance & Time Log"
        subtitle="Track daily punch records, hours, and submit attendance regularization."
        breadcrumbs={['Workspace', 'Attendance']}
        actions={
          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <Button variant="secondary" size="sm" icon={FilePlus} onClick={() => setIsRegModalOpen(true)}>
              Request Regularization
            </Button>
          </div>
        }
      />

      {/* Today's Punch & Real-time Metrics Card */}
      <div
        className="card"
        style={{
          padding: '1.5rem',
          marginBottom: '1.75rem',
          backgroundColor: '#ffffff',
          boxShadow: 'var(--shadow-sm)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1.5rem' }}>
          <div>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--primary-600)', textTransform: 'uppercase' }}>
              TODAY'S SHIFT SUMMARY
            </span>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--slate-900)', marginTop: '0.125rem' }}>
              {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
            </h3>
          </div>

          <div style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap' }}>
            <div>
              <span style={{ fontSize: '0.75rem', color: 'var(--slate-400)', fontWeight: 600 }}>CHECK-IN</span>
              <div style={{ fontSize: '1.125rem', fontWeight: 800, color: 'var(--slate-900)' }}>09:02 AM</div>
            </div>
            <div>
              <span style={{ fontSize: '0.75rem', color: 'var(--slate-400)', fontWeight: 600 }}>CHECK-OUT</span>
              <div style={{ fontSize: '1.125rem', fontWeight: 800, color: 'var(--slate-900)' }}>
                {isCheckedIn ? '—' : '05:45 PM'}
              </div>
            </div>
            <div>
              <span style={{ fontSize: '0.75rem', color: 'var(--slate-400)', fontWeight: 600 }}>WORK DURATION</span>
              <div style={{ fontSize: '1.125rem', fontWeight: 800, color: 'var(--slate-900)' }}>8.7 hrs</div>
            </div>
            <div>
              <span style={{ fontSize: '0.75rem', color: 'var(--slate-400)', fontWeight: 600 }}>STATUS</span>
              <div><Badge variant="present">PRESENT</Badge></div>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '0.5rem' }}>
            {isCheckedIn ? (
              <Button variant="secondary" icon={LogOut} loading={punchLoading} onClick={handlePunchOut}>
                Punch Out
              </Button>
            ) : (
              <Button variant="primary" icon={LogIn} loading={punchLoading} onClick={handlePunchIn}>
                Punch In
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* History Table with Filters & View Switcher */}
      <div className="card" style={{ padding: '1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--slate-900)' }}>
              Attendance History
            </h3>
            <span style={{ fontSize: '0.75rem', color: 'var(--slate-500)' }}>
              Detailed breakdown of daily punches and statuses
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            {/* View Mode Toggle */}
            <div style={{ display: 'flex', backgroundColor: 'var(--slate-100)', padding: '2px', borderRadius: 'var(--radius-md)' }}>
              <button
                onClick={() => setViewMode('table')}
                style={{
                  padding: '0.375rem 0.75rem',
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  border: 'none',
                  borderRadius: 'var(--radius-sm)',
                  backgroundColor: viewMode === 'table' ? '#ffffff' : 'transparent',
                  color: viewMode === 'table' ? 'var(--slate-900)' : 'var(--slate-500)',
                  boxShadow: viewMode === 'table' ? 'var(--shadow-xs)' : 'none',
                  cursor: 'pointer',
                }}
              >
                Table View
              </button>
              <button
                onClick={() => setViewMode('calendar')}
                style={{
                  padding: '0.375rem 0.75rem',
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  border: 'none',
                  borderRadius: 'var(--radius-sm)',
                  backgroundColor: viewMode === 'calendar' ? '#ffffff' : 'transparent',
                  color: viewMode === 'calendar' ? 'var(--slate-900)' : 'var(--slate-500)',
                  boxShadow: viewMode === 'calendar' ? 'var(--shadow-xs)' : 'none',
                  cursor: 'pointer',
                }}
              >
                Monthly Calendar
              </button>
            </div>

            <FilterBar
              filters={[
                {
                  key: 'status',
                  label: 'Status',
                  options: [
                    { label: 'Present', value: 'present' },
                    { label: 'Late', value: 'late' },
                    { label: 'Absent', value: 'absent' },
                    { label: 'Leave', value: 'leave' },
                  ],
                },
              ]}
              values={{ status: filterStatus }}
              onChange={(key, val) => setFilterStatus(val)}
              onReset={() => setFilterStatus('all')}
            />
          </div>
        </div>

        {viewMode === 'table' ? (
          <DataTable columns={columns} data={filteredRecords} loading={loading} />
        ) : (
          /* Calendar Grid View */
          <div style={{ padding: '1rem 0' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '0.5rem', textAlign: 'center' }}>
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((d, i) => (
                <div key={i} style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--slate-400)', padding: '0.5rem' }}>
                  {d}
                </div>
              ))}
              {/* Simulated Month Calendar Days */}
              {Array.from({ length: 31 }).map((_, day) => {
                const dayNum = day + 1;
                const isWeekend = (dayNum % 7 === 0) || (dayNum % 7 === 1);
                return (
                  <div
                    key={day}
                    style={{
                      minHeight: '80px',
                      backgroundColor: isWeekend ? 'var(--slate-100)' : '#ffffff',
                      border: '1px solid var(--border-color)',
                      borderRadius: 'var(--radius-md)',
                      padding: '0.5rem',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between',
                      textAlign: 'left',
                    }}
                  >
                    <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--slate-700)' }}>{dayNum}</span>
                    {!isWeekend && dayNum <= 22 && (
                      <span
                        style={{
                          fontSize: '0.6875rem',
                          fontWeight: 700,
                          padding: '0.125rem 0.375rem',
                          borderRadius: '4px',
                          backgroundColor: dayNum === 20 ? 'var(--warning-50)' : 'var(--success-50)',
                          color: dayNum === 20 ? 'var(--warning-700)' : 'var(--success-700)',
                          border: `1px solid ${dayNum === 20 ? 'var(--warning-100)' : 'var(--success-100)'}`,
                        }}
                      >
                        {dayNum === 20 ? 'Late (8.5h)' : 'Present (8.7h)'}
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Attendance Regularization Modal */}
      <Modal
        isOpen={isRegModalOpen}
        onClose={() => setIsRegModalOpen(false)}
        title="Request Attendance Regularization"
        subtitle="Submit missing punch or timestamp corrections for manager authorization."
      >
        <form onSubmit={handleRegularizationSubmit}>
          <div className="form-group">
            <label className="form-label required">Date of Record</label>
            <input
              type="date"
              className="form-control"
              value={regForm.date}
              onChange={(e) => setRegForm({ ...regForm, date: e.target.value })}
              required
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="form-group">
              <label className="form-label required">Corrected Check In</label>
              <input
                type="time"
                className="form-control"
                value={regForm.checkIn}
                onChange={(e) => setRegForm({ ...regForm, checkIn: e.target.value })}
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label required">Corrected Check Out</label>
              <input
                type="time"
                className="form-control"
                value={regForm.checkOut}
                onChange={(e) => setRegForm({ ...regForm, checkOut: e.target.value })}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label required">Reason for Regularization</label>
            <textarea
              rows={3}
              className="form-control"
              placeholder="e.g. Biometric reader was offline / Client on-site meeting"
              value={regForm.reason}
              onChange={(e) => setRegForm({ ...regForm, reason: e.target.value })}
              required
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem' }}>
            <Button variant="secondary" onClick={() => setIsRegModalOpen(false)} disabled={regLoading}>
              Cancel
            </Button>
            <Button variant="primary" type="submit" loading={regLoading}>
              Submit Request
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Attendance;
