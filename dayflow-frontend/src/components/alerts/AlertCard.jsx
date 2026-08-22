import React from 'react';
import { AlertCircle, Clock, CheckCircle2, Eye, ShieldAlert } from 'lucide-react';
import Badge from '../common/Badge';
import Button from '../common/Button';

export const AlertCard = ({
  alert,
  onView,
  onAcknowledge,
  onResolve,
  loading = false,
}) => {
  const getSeverityBadge = () => {
    switch (alert.severity?.toLowerCase()) {
      case 'high':
        return <Badge variant="danger">High Severity</Badge>;
      case 'medium':
        return <Badge variant="warning">Medium Severity</Badge>;
      default:
        return <Badge variant="info">Low Severity</Badge>;
    }
  };

  const isResolved = alert.status === 'resolved';
  const isAcknowledged = alert.status === 'acknowledged';

  return (
    <div
      className="card"
      style={{
        padding: '1.25rem',
        borderLeft: `4px solid ${
          alert.severity === 'high'
            ? 'var(--danger-500)'
            : alert.severity === 'medium'
            ? 'var(--warning-500)'
            : 'var(--info-500)'
        }`,
        backgroundColor: isResolved ? 'var(--slate-50)' : '#ffffff',
        opacity: isResolved ? 0.85 : 1,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '1rem', flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem', flex: 1, minWidth: '260px' }}>
          <div
            style={{
              padding: '0.5rem',
              borderRadius: 'var(--radius-md)',
              backgroundColor:
                alert.severity === 'high'
                  ? 'var(--danger-50)'
                  : alert.severity === 'medium'
                  ? 'var(--warning-50)'
                  : 'var(--info-50)',
              color:
                alert.severity === 'high'
                  ? 'var(--danger-600)'
                  : alert.severity === 'medium'
                  ? 'var(--warning-600)'
                  : 'var(--info-600)',
              flexShrink: 0,
            }}
          >
            <ShieldAlert size={20} />
          </div>

          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
              <h4 style={{ fontSize: '0.9375rem', fontWeight: 700, color: 'var(--slate-900)' }}>
                {alert.title}
              </h4>
              {getSeverityBadge()}
              <span className={`badge badge-${isResolved ? 'success' : isAcknowledged ? 'info' : 'warning'}`}>
                {alert.status}
              </span>
            </div>

            <p style={{ fontSize: '0.8125rem', color: 'var(--slate-600)', marginTop: '0.375rem', lineHeight: '1.45' }}>
              {alert.message}
            </p>

            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginTop: '0.625rem', fontSize: '0.75rem', color: 'var(--slate-400)' }}>
              <span>Target: <strong style={{ color: 'var(--slate-700)' }}>{alert.target}</strong></span>
              <span>•</span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                <Clock size={12} /> {alert.date}
              </span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', alignSelf: 'center' }}>
          {onView && (
            <Button variant="ghost" size="sm" icon={Eye} onClick={() => onView(alert)}>
              Details
            </Button>
          )}

          {!isResolved && !isAcknowledged && onAcknowledge && (
            <Button variant="secondary" size="sm" onClick={() => onAcknowledge(alert)} disabled={loading}>
              Acknowledge
            </Button>
          )}

          {!isResolved && onResolve && (
            <Button variant="primary" size="sm" icon={CheckCircle2} onClick={() => onResolve(alert)} disabled={loading}>
              Resolve
            </Button>
          )}

          {isResolved && (
            <span style={{ fontSize: '0.75rem', color: 'var(--success-600)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
              <CheckCircle2 size={14} /> Resolved
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export default AlertCard;
