import React from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';

export const StatCard = ({
  title,
  value,
  icon: Icon,
  trend,
  trendDirection = 'up', // up, down, neutral
  description,
  accentColor = 'primary', // primary, success, warning, danger, info
  onClick,
}) => {
  const getAccentBg = () => {
    switch (accentColor) {
      case 'success': return 'var(--success-50)';
      case 'warning': return 'var(--warning-50)';
      case 'danger': return 'var(--danger-50)';
      case 'info': return 'var(--info-50)';
      default: return 'var(--primary-50)';
    }
  };

  const getAccentColor = () => {
    switch (accentColor) {
      case 'success': return 'var(--success-600)';
      case 'warning': return 'var(--warning-600)';
      case 'danger': return 'var(--danger-600)';
      case 'info': return 'var(--info-600)';
      default: return 'var(--primary-600)';
    }
  };

  return (
    <div
      className="card"
      style={{
        padding: '1.25rem 1.5rem',
        cursor: onClick ? 'pointer' : 'default',
        position: 'relative',
        overflow: 'hidden',
      }}
      onClick={onClick}
    >
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
        <div>
          <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--slate-500)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            {title}
          </span>
          <div style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--slate-900)', marginTop: '0.25rem', lineHeight: '1.2' }}>
            {value}
          </div>
        </div>

        {Icon && (
          <div
            style={{
              width: '44px',
              height: '44px',
              borderRadius: 'var(--radius-md)',
              backgroundColor: getAccentBg(),
              color: getAccentColor(),
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Icon size={22} />
          </div>
        )}
      </div>

      {(trend || description) && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.875rem', fontSize: '0.75rem' }}>
          {trend && (
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.25rem',
                fontWeight: 700,
                color: trendDirection === 'up' ? 'var(--success-600)' : trendDirection === 'down' ? 'var(--danger-600)' : 'var(--slate-500)',
              }}
            >
              {trendDirection === 'up' && <TrendingUp size={14} />}
              {trendDirection === 'down' && <TrendingDown size={14} />}
              {trend}
            </span>
          )}
          {description && (
            <span style={{ color: 'var(--slate-400)' }}>
              {description}
            </span>
          )}
        </div>
      )}
    </div>
  );
};

export default StatCard;
