import React from 'react';
import { Clock } from 'lucide-react';
import Badge from '../common/Badge';

export const ActivityFeed = ({ activities = [] }) => {
  if (!activities || activities.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '2rem 1rem', color: 'var(--slate-400)', fontSize: '0.875rem' }}>
        No recent activity logged.
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      {activities.map((item, idx) => (
        <div key={item.id || idx} style={{ display: 'flex', gap: '0.875rem', position: 'relative' }}>
          {/* Timeline indicator line */}
          {idx < activities.length - 1 && (
            <div
              style={{
                position: 'absolute',
                top: '24px',
                left: '11px',
                bottom: '-20px',
                width: '2px',
                backgroundColor: 'var(--border-light)',
              }}
            />
          )}

          {/* Dot */}
          <div
            style={{
              width: '24px',
              height: '24px',
              borderRadius: '50%',
              backgroundColor: 'var(--primary-50)',
              border: '2px solid var(--primary-600)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 2,
              shrink: 0,
            }}
          >
            <div style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: 'var(--primary-600)' }} />
          </div>

          <div style={{ flex: 1, paddingBottom: '0.25rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.5rem', marginBottom: '0.25rem' }}>
              <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--slate-800)' }}>
                {item.actor || 'System'}
              </span>
              {item.badge && <Badge variant="neutral">{item.badge}</Badge>}
            </div>
            <p style={{ fontSize: '0.8125rem', color: 'var(--slate-600)', lineHeight: '1.4', marginBottom: '0.375rem' }}>
              {item.action}
            </p>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', fontSize: '0.6875rem', color: 'var(--slate-400)' }}>
              <Clock size={12} />
              <span>{item.timestamp}</span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default ActivityFeed;
