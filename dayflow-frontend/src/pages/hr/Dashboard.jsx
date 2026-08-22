import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Users,
  UserCheck,
  CalendarCheck,
  CalendarX,
  CalendarRange,
  AlertTriangle,
  HeartPulse,
  DollarSign,
  TrendingUp,
  ArrowRight,
  ShieldCheck,
  PlusCircle,
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
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
import AlertCard from '../../components/alerts/AlertCard';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import { useAuth } from '../../hooks/useAuth';
import { useToast } from '../../hooks/useToast';
import analyticsApi from '../../api/analyticsApi';
import alertsApi from '../../api/alertsApi';
import leaveApi from '../../api/leaveApi';
import { mockAuditActivities, mockSmartAlerts, mockLeaveRequests, mockAnalyticsData } from '../../utils/mockData';

export const HRDashboard = () => {
  const { user } = useAuth();
  const { success } = useToast();
  const navigate = useNavigate();

  const [kpiData, setKpiData] = useState({
    totalEmployees: 48,
    activeEmployees: 46,
    presentToday: 41,
    absentToday: 3,
    pendingLeaves: 4,
    activeAlerts: 3,
    averageAttendance: '94.6%',
  });

  const [alerts, setAlerts] = useState(mockSmartAlerts.slice(0, 2));
  const [leaves, setLeaves] = useState(mockLeaveRequests.filter((l) => l.status === 'pending'));

  const COLORS = ['#4f46e5', '#3b82f6', '#10b981', '#f59e0b', '#ef4444'];
  const WELLNESS_COLORS = ['#16a34a', '#d97706', '#dc2626'];

  return (
    <div>
      <PageHeader
        title="HR Command Center"
        subtitle="Workforce analytics, real-time attendance, proactive alerts, and operational management."
        breadcrumbs={['HR Operations', 'Executive Dashboard']}
        actions={
          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <Button variant="secondary" size="sm" onClick={() => navigate('/hr/reports')}>
              Export Reports
            </Button>
            <Button variant="primary" size="sm" icon={PlusCircle} onClick={() => navigate('/hr/employees')}>
              Add Employee
            </Button>
          </div>
        }
      />

      {/* Top KPI Cards (7 Key Workforce Metrics) */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
          gap: '1rem',
          marginBottom: '1.75rem',
        }}
      >
        <StatCard
          title="Total Headcount"
          value={kpiData.totalEmployees}
          description="46 Active / 2 Leave"
          icon={Users}
          accentColor="primary"
          onClick={() => navigate('/hr/employees')}
        />

        <StatCard
          title="Present Today"
          value={kpiData.presentToday}
          trend="+3"
          trendDirection="up"
          description="89% check-in rate"
          icon={CalendarCheck}
          accentColor="success"
          onClick={() => navigate('/hr/attendance')}
        />

        <StatCard
          title="Unscheduled Absences"
          value={kpiData.absentToday}
          trend="-1"
          trendDirection="down"
          description="3 employees absent"
          icon={CalendarX}
          accentColor="danger"
          onClick={() => navigate('/hr/attendance')}
        />

        <StatCard
          title="Pending Leaves"
          value={kpiData.pendingLeaves}
          description="Requires approval"
          icon={CalendarRange}
          accentColor="warning"
          onClick={() => navigate('/hr/leaves')}
        />

        <StatCard
          title="Active Smart Alerts"
          value={kpiData.activeAlerts}
          description="1 High / 2 Medium"
          icon={AlertTriangle}
          accentColor="danger"
          onClick={() => navigate('/hr/alerts')}
        />

        <StatCard
          title="Avg Attendance Rate"
          value={kpiData.averageAttendance}
          trend="+0.8%"
          trendDirection="up"
          description="30-day average"
          icon={TrendingUp}
          accentColor="info"
          onClick={() => navigate('/hr/analytics')}
        />
      </div>

      {/* Charts Section: Attendance Trend & Department Headcount */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(12, 1fr)', gap: '1.5rem', marginBottom: '1.75rem' }}>
        {/* Attendance Area Trend */}
        <div style={{ gridColumn: 'span 12' }} className="lg:col-span-8 col-span-12">
          <ChartCard
            title="Weekly Attendance & Punctuality Trend"
            subtitle="Real-time attendance rates (%) vs late arrival fluctuations across all departments"
            height={280}
            actions={
              <Button variant="ghost" size="sm" icon={ArrowRight} onClick={() => navigate('/hr/attendance')}>
                Full Attendance Log
              </Button>
            }
          >
            <ResponsiveContainer width="100%" height={260}>
              <AreaChart data={mockAnalyticsData.attendanceTrend} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="attendanceGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#4f46e5" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis dataKey="day" stroke="#94a3b8" fontSize={12} tickLine={false} />
                <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} domain={[80, 100]} unit="%" />
                <Tooltip
                  contentStyle={{ backgroundColor: '#ffffff', borderRadius: '8px', border: '1px solid #e2e8f0' }}
                  formatter={(val) => [`${val}%`, 'Attendance Rate']}
                />
                <Area
                  type="monotone"
                  dataKey="attendanceRate"
                  stroke="#4f46e5"
                  strokeWidth={3}
                  fillOpacity={1}
                  fill="url(#attendanceGradient)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </ChartCard>
        </div>

        {/* Department Headcount Bar Chart */}
        <div style={{ gridColumn: 'span 12' }} className="lg:col-span-4 col-span-12">
          <ChartCard
            title="Department Headcount"
            subtitle="Staffing distribution across pods"
            height={280}
          >
            <ResponsiveContainer width="100%" height={260}>
              <BarChart
                layout="vertical"
                data={mockAnalyticsData.departmentHeadcount}
                margin={{ top: 10, right: 20, left: 30, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" horizontal={false} />
                <XAxis type="number" stroke="#94a3b8" fontSize={11} />
                <YAxis dataKey="name" type="category" stroke="#64748b" fontSize={11} width={80} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#ffffff', borderRadius: '8px', border: '1px solid #e2e8f0' }}
                  formatter={(val) => [`${val} Members`, 'Headcount']}
                />
                <Bar dataKey="count" fill="#3b82f6" radius={[0, 6, 6, 0]} maxBarSize={20} />
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>
        </div>
      </div>

      {/* Second Chart Row: Wellness Distribution & Leave Breakdown */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(12, 1fr)', gap: '1.5rem', marginBottom: '1.75rem' }}>
        {/* Wellness Distribution Donut */}
        <div style={{ gridColumn: 'span 12' }} className="lg:col-span-6 col-span-12">
          <ChartCard
            title="Company Workforce Wellness Health Matrix"
            subtitle="Proactive pattern tier breakdown across 48 employees"
            height={240}
            actions={
              <Button variant="ghost" size="sm" icon={ArrowRight} onClick={() => navigate('/hr/wellness')}>
                Monitor Matrix
              </Button>
            }
          >
            <div style={{ display: 'flex', alignItems: 'center', height: '100%', justifyContent: 'space-around', flexWrap: 'wrap' }}>
              <div style={{ width: '180px', height: '180px' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={mockAnalyticsData.wellnessDistribution}
                      innerRadius={50}
                      outerRadius={75}
                      paddingAngle={4}
                      dataKey="value"
                    >
                      {mockAnalyticsData.wellnessDistribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', minWidth: '180px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: '0.8125rem', color: 'var(--slate-700)', display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
                    <span style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#16a34a' }} />
                    Stable (🟢)
                  </span>
                  <strong>72%</strong>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: '0.8125rem', color: 'var(--slate-700)', display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
                    <span style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#d97706' }} />
                    Monitor (🟡)
                  </span>
                  <strong>20%</strong>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: '0.8125rem', color: 'var(--slate-700)', display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
                    <span style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#dc2626' }} />
                    Needs Attention (🔴)
                  </span>
                  <strong>8%</strong>
                </div>
              </div>
            </div>
          </ChartCard>
        </div>

        {/* Leave Category Distribution */}
        <div style={{ gridColumn: 'span 12' }} className="lg:col-span-6 col-span-12">
          <ChartCard
            title="Leave Type Distribution"
            subtitle="Current quarter total leave volume distribution"
            height={240}
          >
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={mockAnalyticsData.leaveDistribution} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} tickLine={false} />
                <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} unit="%" />
                <Tooltip
                  contentStyle={{ backgroundColor: '#ffffff', borderRadius: '8px', border: '1px solid #e2e8f0' }}
                  formatter={(val) => [`${val}% of total requests`, 'Distribution']}
                />
                <Bar dataKey="value" fill="#6366f1" radius={[6, 6, 0, 0]} maxBarSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>
        </div>
      </div>

      {/* Bottom Row: Smart Alerts Preview, Pending Leaves Queue & Audit Stream */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(12, 1fr)', gap: '1.5rem' }}>
        {/* Smart HR Alerts Live Feed */}
        <div style={{ gridColumn: 'span 12' }} className="lg:col-span-6 col-span-12">
          <div className="card" style={{ padding: '1.5rem', height: '100%' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <AlertTriangle size={18} className="text-danger" />
                <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--slate-900)' }}>
                  Smart HR Alerts Feed
                </h3>
              </div>
              <Button variant="ghost" size="sm" icon={ArrowRight} onClick={() => navigate('/hr/alerts')}>
                All Alerts ({mockSmartAlerts.length})
              </Button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {alerts.map((alt) => (
                <AlertCard
                  key={alt.id}
                  alert={alt}
                  onView={() => navigate('/hr/alerts')}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Pending Leave Approvals & Recent Audits */}
        <div style={{ gridColumn: 'span 12' }} className="lg:col-span-6 col-span-12">
          <div className="card" style={{ padding: '1.5rem', height: '100%' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <CalendarRange size={18} className="text-primary" />
                <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--slate-900)' }}>
                  Pending Leave Queue
                </h3>
              </div>
              <Button variant="ghost" size="sm" icon={ArrowRight} onClick={() => navigate('/hr/leaves')}>
                Manage Queue
              </Button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '1.5rem' }}>
              {leaves.slice(0, 3).map((lv) => (
                <div
                  key={lv.id}
                  style={{
                    padding: '0.875rem 1rem',
                    backgroundColor: 'var(--slate-50)',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--border-light)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  }}
                >
                  <div>
                    <div style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--slate-900)' }}>
                      {lv.employeeName} <span style={{ fontWeight: 400, color: 'var(--slate-500)' }}>({lv.department})</span>
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--slate-600)', marginTop: '0.125rem' }}>
                      {lv.leaveType} • {lv.startDate} to {lv.endDate} ({lv.days} days)
                    </div>
                  </div>
                  <Button variant="primary" size="sm" onClick={() => navigate('/hr/leaves')}>
                    Review
                  </Button>
                </div>
              ))}
            </div>

            <h4 style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--slate-800)', marginBottom: '0.75rem' }}>
              Live System Activity Stream
            </h4>
            <ActivityFeed activities={mockAuditActivities.slice(0, 2)} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default HRDashboard;
