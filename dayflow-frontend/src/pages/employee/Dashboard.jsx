import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  CalendarCheck,
  CalendarRange,
  DollarSign,
  HeartPulse,
  Clock,
  ArrowRight,
  CheckCircle,
  LogIn,
  LogOut,
  PlusCircle,
  TrendingUp,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';
import PageHeader from '../../components/layout/PageHeader';
import StatCard from '../../components/dashboard/StatCard';
import ChartCard from '../../components/dashboard/ChartCard';
import ActivityFeed from '../../components/dashboard/ActivityFeed';
import QuickActions from '../../components/dashboard/QuickActions';
import WellnessScore from '../../components/wellness/WellnessScore';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import { useAuth } from '../../hooks/useAuth';
import { useToast } from '../../hooks/useToast';
import attendanceApi from '../../api/attendanceApi';
import leaveApi from '../../api/leaveApi';
import payrollApi from '../../api/payrollApi';
import wellnessApi from '../../api/wellnessApi';
import { formatCurrency } from '../../utils/formatters';
import { mockAuditActivities } from '../../utils/mockData';

export const EmployeeDashboard = () => {
  const { user } = useAuth();
  const { success, error } = useToast();
  const navigate = useNavigate();

  const [currentTime, setCurrentTime] = useState(new Date());
  const [isCheckedIn, setIsCheckedIn] = useState(true);
  const [checkInTime, setCheckInTime] = useState('09:02 AM');
  const [checkOutTime, setCheckOutTime] = useState('—');
  const [actionLoading, setActionLoading] = useState(false);

  const [leaveBalances, setLeaveBalances] = useState({ available: 35, pending: 1 });
  const [wellnessData, setWellnessData] = useState({ score: 88, indicator: 'stable' });
  const [weeklyAttendance, setWeeklyAttendance] = useState([
    { day: 'Mon', hours: 8.5, expected: 8 },
    { day: 'Tue', hours: 8.7, expected: 8 },
    { day: 'Wed', hours: 8.2, expected: 8 },
    { day: 'Thu', hours: 8.6, expected: 8 },
    { day: 'Fri (Today)', hours: 5.4, expected: 8 },
  ]);

  // Live Clock
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const handlePunchIn = async () => {
    setActionLoading(true);
    try {
      const res = await attendanceApi.checkIn();
      setIsCheckedIn(true);
      setCheckInTime(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
      success(res.message || 'Punched in successfully!');
    } catch (err) {
      error(err.message || 'Failed to punch in');
    } finally {
      setActionLoading(false);
    }
  };

  const handlePunchOut = async () => {
    setActionLoading(true);
    try {
      const res = await attendanceApi.checkOut();
      setIsCheckedIn(false);
      setCheckOutTime(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
      success(res.message || 'Punched out successfully!');
    } catch (err) {
      error(err.message || 'Failed to punch out');
    } finally {
      setActionLoading(false);
    }
  };

  const firstName = user?.name ? user.name.split(' ')[0] : 'Colleague';

  const quickActionsList = [
    {
      label: isCheckedIn ? 'Punch Out' : 'Punch In',
      icon: isCheckedIn ? LogOut : LogIn,
      accentBg: isCheckedIn ? 'var(--warning-50)' : 'var(--success-50)',
      accentColor: isCheckedIn ? 'var(--warning-600)' : 'var(--success-600)',
      onClick: isCheckedIn ? handlePunchOut : handlePunchIn,
    },
    {
      label: 'Apply Leave',
      icon: PlusCircle,
      accentBg: 'var(--primary-50)',
      accentColor: 'var(--primary-600)',
      onClick: () => navigate('/employee/leave'),
    },
    {
      label: 'My Payslips',
      icon: DollarSign,
      accentBg: 'var(--accent-50)',
      accentColor: 'var(--accent-600)',
      onClick: () => navigate('/employee/payroll'),
    },
    {
      label: 'Wellness Stats',
      icon: HeartPulse,
      accentBg: 'var(--info-50)',
      accentColor: 'var(--info-600)',
      onClick: () => navigate('/employee/wellness'),
    },
  ];

  return (
    <div>
      <PageHeader
        title={`Good morning, ${firstName} 👋`}
        subtitle="Here is your daily attendance, leave balances, and workplace insights overview."
        actions={
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
              backgroundColor: '#ffffff',
              padding: '0.5rem 1rem',
              borderRadius: 'var(--radius-lg)',
              border: '1px solid var(--border-color)',
              boxShadow: 'var(--shadow-xs)',
            }}
          >
            <Clock size={18} className="text-primary" />
            <div>
              <div style={{ fontSize: '0.75rem', color: 'var(--slate-400)', fontWeight: 600 }}>LIVE CLOCK</div>
              <div style={{ fontSize: '0.9375rem', fontWeight: 800, color: 'var(--slate-900)' }}>
                {currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
              </div>
            </div>
          </div>
        }
      />

      {/* KPI Top Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(230px, 1fr))', gap: '1.25rem', marginBottom: '1.75rem' }}>
        <StatCard
          title="Attendance (August)"
          value="96.2%"
          trend="+1.5%"
          trendDirection="up"
          description="vs last month"
          icon={CalendarCheck}
          accentColor="success"
          onClick={() => navigate('/employee/attendance')}
        />

        <StatCard
          title="Available Leave Days"
          value="35 Days"
          description="1 pending approval"
          icon={CalendarRange}
          accentColor="primary"
          onClick={() => navigate('/employee/leave')}
        />

        <StatCard
          title="Monthly Base Pay"
          value={formatCurrency(user?.salary ? user.salary / 12 : 11250)}
          description="Paid on 31st July"
          icon={DollarSign}
          accentColor="info"
          onClick={() => navigate('/employee/payroll')}
        />

        <StatCard
          title="Workplace Wellness"
          value="88 / 100"
          description="🟢 Stable work pattern"
          icon={HeartPulse}
          accentColor="success"
          onClick={() => navigate('/employee/wellness')}
        />
      </div>

      {/* Main Grid: Today's Punch Card & Attendance Analytics */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(12, 1fr)', gap: '1.5rem', marginBottom: '1.75rem' }}>
        {/* Today's Punch Status Card */}
        <div style={{ gridColumn: 'span 12' }} className="lg:col-span-4 col-span-12">
          <div className="card" style={{ height: '100%', padding: '1.5rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
                <div>
                  <h3 style={{ fontSize: '1.0625rem', fontWeight: 700, color: 'var(--slate-900)' }}>
                    Today's Attendance
                  </h3>
                  <span style={{ fontSize: '0.75rem', color: 'var(--slate-500)' }}>
                    {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric', year: 'numeric' })}
                  </span>
                </div>
                <Badge variant={isCheckedIn ? 'success' : 'neutral'}>
                  {isCheckedIn ? 'Punched In' : 'Punched Out'}
                </Badge>
              </div>

              {/* Punch Timers */}
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  gap: '1rem',
                  padding: '1rem',
                  backgroundColor: 'var(--slate-50)',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--border-light)',
                  marginBottom: '1.5rem',
                }}
              >
                <div>
                  <span style={{ fontSize: '0.6875rem', color: 'var(--slate-400)', fontWeight: 700, textTransform: 'uppercase' }}>
                    Punch In
                  </span>
                  <div style={{ fontSize: '1.125rem', fontWeight: 800, color: 'var(--slate-900)', marginTop: '0.25rem' }}>
                    {checkInTime}
                  </div>
                </div>
                <div>
                  <span style={{ fontSize: '0.6875rem', color: 'var(--slate-400)', fontWeight: 700, textTransform: 'uppercase' }}>
                    Punch Out
                  </span>
                  <div style={{ fontSize: '1.125rem', fontWeight: 800, color: 'var(--slate-900)', marginTop: '0.25rem' }}>
                    {checkOutTime}
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Punch Button */}
            <div>
              {isCheckedIn ? (
                <Button
                  variant="secondary"
                  size="lg"
                  className="w-full"
                  icon={LogOut}
                  loading={actionLoading}
                  onClick={handlePunchOut}
                  style={{ borderColor: 'var(--slate-300)', color: 'var(--slate-800)' }}
                >
                  Punch Out for the Day
                </Button>
              ) : (
                <Button
                  variant="primary"
                  size="lg"
                  className="w-full"
                  icon={LogIn}
                  loading={actionLoading}
                  onClick={handlePunchIn}
                >
                  Punch In Now
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Weekly Hours Recharts Visualization */}
        <div style={{ gridColumn: 'span 12' }} className="lg:col-span-8 col-span-12">
          <ChartCard
            title="Weekly Work Hours"
            subtitle="Calculated from your verified daily punch logs"
            height={260}
            actions={
              <Button variant="ghost" size="sm" icon={ArrowRight} onClick={() => navigate('/employee/attendance')}>
                Full Log
              </Button>
            }
          >
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={weeklyAttendance} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis dataKey="day" stroke="#94a3b8" fontSize={12} tickLine={false} />
                <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} unit="h" />
                <Tooltip
                  contentStyle={{ backgroundColor: '#ffffff', borderRadius: '8px', border: '1px solid #e2e8f0', boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }}
                  formatter={(val) => [`${val} hrs`, 'Logged Hours']}
                />
                <Bar dataKey="hours" fill="#4f46e5" radius={[6, 6, 0, 0]} maxBarSize={48} />
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>
        </div>
      </div>

      {/* Bottom Grid: Quick Actions, Wellness Preview & Activity Feed */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(12, 1fr)', gap: '1.5rem' }}>
        {/* Quick Actions & Wellness Summary */}
        <div style={{ gridColumn: 'span 12' }} className="lg:col-span-6 col-span-12">
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {/* Quick Actions Panel */}
            <div className="card" style={{ padding: '1.5rem' }}>
              <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--slate-900)', marginBottom: '1rem' }}>
                Quick Operations
              </h3>
              <QuickActions actions={quickActionsList} />
            </div>

            {/* Wellness Preview Card */}
            <div className="card" style={{ padding: '1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1.5rem', flexWrap: 'wrap' }}>
              <div>
                <span className="badge badge-success" style={{ marginBottom: '0.5rem' }}>
                  Smart Workforce Signal
                </span>
                <h4 style={{ fontSize: '1.125rem', fontWeight: 700, color: 'var(--slate-900)' }}>
                  Workplace Wellness Indicator
                </h4>
                <p style={{ fontSize: '0.8125rem', color: 'var(--slate-600)', marginTop: '0.25rem', maxWidth: '320px', lineHeight: '1.4' }}>
                  Your attendance regularity and leave pace indicate a balanced and steady work rhythm.
                </p>
                <div style={{ marginTop: '0.875rem' }}>
                  <Button variant="outline" size="sm" onClick={() => navigate('/employee/wellness')}>
                    View Indicator Breakdown →
                  </Button>
                </div>
              </div>
              <div style={{ shrink: 0 }}>
                <WellnessScore score={88} indicator="stable" size="md" />
              </div>
            </div>
          </div>
        </div>

        {/* Recent Activity Audit */}
        <div style={{ gridColumn: 'span 12' }} className="lg:col-span-6 col-span-12">
          <div className="card" style={{ padding: '1.5rem', height: '100%' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--slate-900)' }}>
                Recent Workspace Activity
              </h3>
              <span style={{ fontSize: '0.75rem', color: 'var(--slate-400)' }}>Live Event Stream</span>
            </div>
            <ActivityFeed activities={mockAuditActivities} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmployeeDashboard;
