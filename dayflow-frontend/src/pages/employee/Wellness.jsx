import React, { useState, useEffect } from 'react';
import {
  HeartPulse,
  Info,
  Calendar,
  TrendingUp,
  Activity,
  ShieldCheck,
  Award,
} from 'lucide-react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';
import PageHeader from '../../components/layout/PageHeader';
import ChartCard from '../../components/dashboard/ChartCard';
import WellnessScore from '../../components/wellness/WellnessScore';
import WellnessExplanation from '../../components/wellness/WellnessExplanation';
import wellnessApi from '../../api/wellnessApi';
import { useToast } from '../../hooks/useToast';
import { WELLNESS_DISCLAIMER } from '../../utils/constants';

export const Wellness = () => {
  const { error } = useToast();
  const [wellnessData, setWellnessData] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchWellness();
  }, []);

  const fetchWellness = async () => {
    setLoading(true);
    try {
      const res = await wellnessApi.getMyWellness();
      setWellnessData(res.data);
      if (res.data?.history) {
        setHistory(res.data.history);
      }
    } catch (err) {
      error('Failed to load wellness metrics');
    } finally {
      setLoading(false);
    }
  };

  const current = wellnessData || {
    score: 88,
    indicator: 'stable',
    attendancePercentage: 96,
    absenceCount: 1,
    leavePattern: 'Evenly distributed across quarters',
    trend: '+2% over last 30 days',
    explanation: 'Attendance has remained consistently steady. Regular punch-in habits observed with balanced leave distribution.',
    history: [
      { month: 'Mar', score: 85 },
      { month: 'Apr', score: 87 },
      { month: 'May', score: 86 },
      { month: 'Jun', score: 89 },
      { month: 'Jul', score: 87 },
      { month: 'Aug', score: 88 },
    ],
  };

  return (
    <div>
      <PageHeader
        title="Workplace Wellness & Availability"
        subtitle="Objective workforce pattern insights derived strictly from verified attendance and leave distribution."
        breadcrumbs={['Workspace', 'Wellness Indicator']}
      />

      {/* Innovation Banner */}
      <div
        className="card"
        style={{
          padding: '1.5rem',
          marginBottom: '1.75rem',
          backgroundColor: 'var(--primary-50)',
          borderColor: 'var(--primary-200)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '1rem',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.875rem' }}>
          <div
            style={{
              width: '40px',
              height: '40px',
              borderRadius: '10px',
              backgroundColor: 'var(--primary-600)',
              color: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <HeartPulse size={22} />
          </div>
          <div>
            <h3 style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--primary-900)' }}>
              DayFlow Workplace Health Intelligence
            </h3>
            <p style={{ fontSize: '0.8125rem', color: 'var(--primary-700)' }}>
              A modern, objective scoring system designed to help managers understand team availability rhythms without invasive monitoring.
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span className="badge badge-success" style={{ fontSize: '0.8125rem', padding: '0.375rem 0.75rem' }}>
            🟢 Status: Stable Rhythm
          </span>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(12, 1fr)', gap: '1.5rem', marginBottom: '1.75rem' }}>
        {/* Score Gauge Card */}
        <div style={{ gridColumn: 'span 12' }} className="lg:col-span-4 col-span-12">
          <div className="card" style={{ padding: '2rem', textAlign: 'center', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
            <span style={{ fontSize: '0.8125rem', fontWeight: 700, color: 'var(--slate-400)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Workforce Regularity Score
            </span>

            <div style={{ margin: '1.5rem 0' }}>
              <WellnessScore score={current.score} indicator={current.indicator} size="lg" />
            </div>

            <p style={{ fontSize: '0.8125rem', color: 'var(--slate-500)', lineHeight: '1.4' }}>
              Synthesized from 180 consecutive work calendar days.
            </p>
          </div>
        </div>

        {/* Breakdown & Explanation */}
        <div style={{ gridColumn: 'span 12' }} className="lg:col-span-8 col-span-12">
          <div className="card" style={{ padding: '1.75rem' }}>
            <h3 style={{ fontSize: '1.0625rem', fontWeight: 700, color: 'var(--slate-900)', marginBottom: '1rem' }}>
              Pattern Factors & Diagnostic Synthesis
            </h3>
            <WellnessExplanation
              attendancePercentage={current.attendancePercentage}
              absenceCount={current.absenceCount}
              leavePattern={current.leavePattern}
              trend={current.trend}
              explanation={current.explanation}
            />
          </div>
        </div>
      </div>

      {/* Recharts 6-Month Wellness Trend Chart */}
      <div className="card" style={{ padding: '1.5rem', marginBottom: '1.75rem' }}>
        <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--slate-900)', marginBottom: '0.25rem' }}>
          6-Month Regularity Trendline
        </h3>
        <p style={{ fontSize: '0.75rem', color: 'var(--slate-500)', marginBottom: '1.5rem' }}>
          Track consistency across rolling quarterly periods
        </p>

        <ResponsiveContainer width="100%" height={260}>
          <LineChart data={current.history || history} margin={{ top: 10, right: 20, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
            <XAxis dataKey="month" stroke="#94a3b8" fontSize={12} tickLine={false} />
            <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} domain={[40, 100]} />
            <Tooltip
              contentStyle={{ backgroundColor: '#ffffff', borderRadius: '8px', border: '1px solid #e2e8f0' }}
              formatter={(val) => [`${val} / 100`, 'Wellness Score']}
            />
            <Line
              type="monotone"
              dataKey="score"
              stroke="#4f46e5"
              strokeWidth={3}
              dot={{ fill: '#4f46e5', r: 5, strokeWidth: 2, stroke: '#ffffff' }}
              activeDot={{ r: 7 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default Wellness;
