import React from 'react';

export const PageHeader = ({
  title,
  subtitle,
  actions,
  breadcrumbs = [],
}) => {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'flex-start',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '1rem',
        marginBottom: '1.75rem',
      }}
    >
      <div>
        {breadcrumbs && breadcrumbs.length > 0 && (
          <nav
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              fontSize: '0.75rem',
              color: 'var(--slate-400)',
              marginBottom: '0.375rem',
            }}
          >
            {breadcrumbs.map((b, idx) => (
              <span key={idx} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                {idx > 0 && <span>/</span>}
                <span style={{ color: idx === breadcrumbs.length - 1 ? 'var(--slate-600)' : 'var(--slate-400)' }}>
                  {b}
                </span>
              </span>
            ))}
          </nav>
        )}
        <h1
          style={{
            fontSize: '1.625rem',
            fontWeight: 800,
            color: 'var(--slate-900)',
            letterSpacing: '-0.02em',
            lineHeight: '1.25',
          }}
        >
          {title}
        </h1>
        {subtitle && (
          <p style={{ fontSize: '0.875rem', color: 'var(--slate-500)', marginTop: '0.25rem' }}>
            {subtitle}
          </p>
        )}
      </div>

      {actions && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
          {actions}
        </div>
      )}
    </div>
  );
};

export default PageHeader;
