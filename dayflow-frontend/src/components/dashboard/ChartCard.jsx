import React from 'react';

export const ChartCard = ({
  title,
  subtitle,
  actions,
  children,
  height = 300,
}) => {
  return (
    <div className="card" style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <div className="card-header" style={{ padding: '1.125rem 1.5rem' }}>
        <div>
          <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--slate-900)' }}>{title}</h3>
          {subtitle && (
            <p style={{ fontSize: '0.75rem', color: 'var(--slate-500)', marginTop: '0.125rem' }}>
              {subtitle}
            </p>
          )}
        </div>
        {actions && <div>{actions}</div>}
      </div>

      <div className="card-body" style={{ flex: 1, minHeight: `${height}px`, width: '100%', padding: '1.25rem' }}>
        {children}
      </div>
    </div>
  );
};

export default ChartCard;
