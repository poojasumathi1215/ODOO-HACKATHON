import React from 'react';
import { Info, TrendingDown, TrendingUp, Calendar, AlertCircle } from 'lucide-react';
import { WELLNESS_DISCLAIMER } from '../../utils/constants';

export const WellnessExplanation = ({
  attendancePercentage = 95,
  absenceCount = 1,
  leavePattern = 'Evenly distributed across quarters',
  trend = '+2% over last 30 days',
  explanation = 'Attendance has remained consistently steady with balanced leave distribution.',
}) => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      {/* Metric Breakdown Grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
          gap: '0.75rem',
        }}
      >
        <div
          style={{
            padding: '0.875rem',
            backgroundColor: 'var(--slate-50)',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--border-light)',
          }}
        >
          <span style={{ fontSize: '0.75rem', color: 'var(--slate-500)', fontWeight: 600 }}>Attendance Rate</span>
          <div style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--slate-900)', marginTop: '0.25rem' }}>
            {attendancePercentage}%
          </div>
        </div>

        <div
          style={{
            padding: '0.875rem',
            backgroundColor: 'var(--slate-50)',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--border-light)',
          }}
        >
          <span style={{ fontSize: '0.75rem', color: 'var(--slate-500)', fontWeight: 600 }}>Absence Count</span>
          <div style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--slate-900)', marginTop: '0.25rem' }}>
            {absenceCount} {absenceCount === 1 ? 'day' : 'days'}
          </div>
        </div>

        <div
          style={{
            padding: '0.875rem',
            backgroundColor: 'var(--slate-50)',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--border-light)',
          }}
        >
          <span style={{ fontSize: '0.75rem', color: 'var(--slate-500)', fontWeight: 600 }}>30-Day Trend</span>
          <div
            style={{
              fontSize: '1.125rem',
              fontWeight: 700,
              color: trend.includes('-') ? 'var(--danger-600)' : 'var(--success-600)',
              marginTop: '0.25rem',
            }}
          >
            {trend}
          </div>
        </div>
      </div>

      {/* Pattern Breakdown */}
      <div
        style={{
          padding: '1rem',
          backgroundColor: '#ffffff',
          borderRadius: 'var(--radius-md)',
          border: '1px solid var(--border-color)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
          <Calendar size={16} className="text-primary" />
          <span style={{ fontSize: '0.8125rem', fontWeight: 700, color: 'var(--slate-800)' }}>
            Observed Work Pattern
          </span>
        </div>
        <p style={{ fontSize: '0.8125rem', color: 'var(--slate-600)', lineHeight: '1.4' }}>
          {leavePattern}
        </p>

        <div style={{ marginTop: '0.75rem', paddingTop: '0.75rem', borderTop: '1px solid var(--border-light)' }}>
          <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--slate-500)', textTransform: 'uppercase' }}>
            Insight Synthesis
          </span>
          <p style={{ fontSize: '0.875rem', color: 'var(--slate-800)', marginTop: '0.25rem', lineHeight: '1.45' }}>
            {explanation}
          </p>
        </div>
      </div>

      {/* Mandatory Non-Medical Disclaimer Alert */}
      <div
        style={{
          padding: '0.75rem 1rem',
          backgroundColor: 'var(--info-50)',
          borderRadius: 'var(--radius-md)',
          border: '1px solid var(--info-100)',
          display: 'flex',
          gap: '0.625rem',
          alignItems: 'flex-start',
        }}
      >
        <Info size={16} style={{ color: 'var(--info-600)', flexShrink: 0, marginTop: '2px' }} />
        <p style={{ fontSize: '0.75rem', color: 'var(--info-700)', lineHeight: '1.4' }}>
          <strong>Compliance Disclaimer:</strong> {WELLNESS_DISCLAIMER}
        </p>
      </div>
    </div>
  );
};

export default WellnessExplanation;
