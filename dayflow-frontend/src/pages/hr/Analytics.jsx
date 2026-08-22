import React, { useState } from 'react';
import {
  BarChart3,
  TrendingUp,
  Calendar,
  DollarSign,
  PieChart as PieIcon,
  HeartPulse,
  Filter,
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
} from 'recharts';
import PageHeader from '../../components/layout/PageHeader';
import ChartCard from '../../components/dashboard/ChartCard';
import FilterBar from '../../components/tables/FilterBar';
import { mockAnalyticsData } from '../../utils/mockData';
import { DEPARTMENTS } from '../../utils/constants';

export const Analytics = () => {
  const [timeRange, setTimeRange] = useState('monthly'); // weekly, monthly, yearly
  const [deptFilter, setDeptFilter] = useState('all');

  const teamAvailabilityData = [
    { team: 'Frontend', available: 80, onLeave: 20 },
    { team: 'Backend', available: 92, onLeave: 8 },
    { team: 'Cloud DevOps', available: 85, onLeave: 15 },
    { team: 'Design UX', available: 100, onLeave: 0 },
    { team: 'HR & Ops', available: 90, onLeave: 10 },
  ];

  return (
    <div>
      <PageHeader
        title="Executive HR Workforce Analytics"
        subtitle="Holistic visibility into attendance trends, leave patterns, payroll expenditures, and availability metrics."
        breadcrumbs={['HR Operations', 'Analytics']}
        actions={
          <FilterBar
            filters={[
              {
                key: 'range',
                label: 'Timeframe',
                options: [
                  { label: 'Weekly View', value: 'weekly' },
                  { label: 'Monthly View', value: 'monthly' },
                  { label: 'Yearly View', value: 'yearly' },
                ],
              },
              {
                key: 'department',
                label: 'Department',
                options: DEPARTMENTS.map((d) => ({ label: d, value: d })),
              },
            ]}
            values={{ range: timeRange, department: deptFilter }}
            onChange={(key, val) => {
              if (key === 'range') setTimeRange(val);
              if (key === 'department') setDeptFilter(val);
            }}
          />
        }
      />

      {/* Row 1: Attendance Area Trend & Monthly Payroll Budget Trend */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(12, 1fr)', gap: '1.5rem', marginBottom: '1.75rem' }}>
        <div style={{ gridColumn: 'span 12' }} className="lg:col-span-6 col-span-12">
          <ChartCard
            title="Attendance & Punctuality Fluctuation"
            subtitle="Daily verified attendance rates across company departments"
            height={260}
          >
            <ResponsiveContainer width="100%" height={240}>
              <AreaChart data={mockAnalyticsData.attendanceTrend} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorAtt" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#4f46e5" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis dataKey="day" stroke="#94a3b8" fontSize={12} tickLine={false} />
                <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} domain={[80, 100]} unit="%" />
                <Tooltip
                  contentStyle={{ backgroundColor: '#ffffff', borderRadius: '8px', border: '1px solid #e2e8f0' }}
                  formatter={(v) => [`${v}%`, 'Attendance Rate']}
                />
                <Area type="monotone" dataKey="attendanceRate" stroke="#4f46e5" strokeWidth={3} fill="url(#colorAtt)" />
              </AreaChart>
            </ResponsiveContainer>
          </ChartCard>
        </div>

        <div style={{ gridColumn: 'span 12' }} className="lg:col-span-6 col-span-12">
          <ChartCard
            title="Monthly Payroll Expense Trend"
            subtitle="Gross monthly compensation budget disbursement"
            height={260}
          >
            <ResponsiveContainer width="100%" height={240}>
              <LineChart data={mockAnalyticsData.monthlyPayrollTrend} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis dataKey="month" stroke="#94a3b8" fontSize={12} tickLine={false} />
                <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} tickFormatter={(v) => `$${v / 1000}k`} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#ffffff', borderRadius: '8px', border: '1px solid #e2e8f0' }}
                  formatter={(v) => [`$${Number(v).toLocaleString()}`, 'Payroll Budget']}
                />
                <Line type="monotone" dataKey="amount" stroke="#10b981" strokeWidth={3} dot={{ r: 5 }} />
              </LineChart>
            </ResponsiveContainer>
          </ChartCard>
        </div>
      </div>

      {/* Row 2: Team Availability Stacked & Headcount Distribution */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(12, 1fr)', gap: '1.5rem', marginBottom: '1.75rem' }}>
        <div style={{ gridColumn: 'span 12' }} className="lg:col-span-6 col-span-12">
          <ChartCard
            title="Team Availability Ratios (%)"
            subtitle="Percentage of active staffing vs concurrent approved leaves"
            height={260}
          >
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={teamAvailabilityData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis dataKey="team" stroke="#94a3b8" fontSize={12} tickLine={false} />
                <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} unit="%" />
                <Tooltip
                  contentStyle={{ backgroundColor: '#ffffff', borderRadius: '8px', border: '1px solid #e2e8f0' }}
                  formatter={(v, name) => [`${v}%`, name === 'available' ? 'Available Staff' : 'On Leave']}
                />
                <Legend />
                <Bar dataKey="available" name="Available Staff" stackId="a" fill="#3b82f6" radius={[0, 0, 4, 4]} />
                <Bar dataKey="onLeave" name="On Leave" stackId="a" fill="#cbd5e1" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>
        </div>

        <div style={{ gridColumn: 'span 12' }} className="lg:col-span-6 col-span-12">
          <ChartCard
            title="Department Personnel Allocation"
            subtitle="Total staffing distribution by department"
            height={260}
          >
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={mockAnalyticsData.departmentHeadcount} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} tickLine={false} />
                <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#ffffff', borderRadius: '8px', border: '1px solid #e2e8f0' }}
                  formatter={(v) => [`${v} Members`, 'Headcount']}
                />
                <Bar dataKey="count" fill="#6366f1" radius={[6, 6, 0, 0]} maxBarSize={36} />
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>
        </div>
      </div>
    </div>
  );
};

export default Analytics;
