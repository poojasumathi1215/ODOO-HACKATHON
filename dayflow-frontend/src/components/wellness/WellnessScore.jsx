import React from 'react';

export const WellnessScore = ({ score = 85, indicator = 'stable', size = 'md' }) => {
  const isLg = size === 'lg';
  const radius = isLg ? 54 : 38;
  const stroke = isLg ? 8 : 6;
  const normalizedRadius = radius - stroke * 2;
  const circumference = normalizedRadius * 2 * Math.PI;
  const strokeDashoffset = circumference - (score / 100) * circumference;

  const getColor = () => {
    if (indicator === 'stable' || score >= 80) return '#16a34a'; // green
    if (indicator === 'monitor' || score >= 60) return '#d97706'; // amber
    return '#dc2626'; // red
  };

  const getLabel = () => {
    if (indicator === 'stable' || score >= 80) return '🟢 Stable';
    if (indicator === 'monitor' || score >= 60) return '🟡 Monitor';
    return '🔴 Needs Attention';
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ position: 'relative', width: radius * 2, height: radius * 2 }}>
        <svg height={radius * 2} width={radius * 2} style={{ transform: 'rotate(-90deg)' }}>
          <circle
            stroke="#e2e8f0"
            fill="transparent"
            strokeWidth={stroke}
            r={normalizedRadius}
            cx={radius}
            cy={radius}
          />
          <circle
            stroke={getColor()}
            fill="transparent"
            strokeWidth={stroke}
            strokeDasharray={`${circumference} ${circumference}`}
            style={{ strokeDashoffset, transition: 'stroke-dashoffset 0.8s ease' }}
            strokeLinecap="round"
            r={normalizedRadius}
            cx={radius}
            cy={radius}
          />
        </svg>
        <div
          style={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <span
            style={{
              fontSize: isLg ? '1.75rem' : '1.25rem',
              fontWeight: 800,
              color: 'var(--slate-900)',
              lineHeight: 1,
            }}
          >
            {score}
          </span>
          <span style={{ fontSize: '0.625rem', color: 'var(--slate-400)', fontWeight: 600 }}>/100</span>
        </div>
      </div>

      <div
        style={{
          marginTop: '0.5rem',
          fontSize: isLg ? '0.875rem' : '0.75rem',
          fontWeight: 700,
          color: getColor(),
          textAlign: 'center',
        }}
      >
        {getLabel()}
      </div>
    </div>
  );
};

export default WellnessScore;
