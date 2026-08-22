import React from 'react';
import { Inbox } from 'lucide-react';
import Button from './Button';

export const EmptyState = ({
  icon: Icon = Inbox,
  title = 'No records found',
  description = 'There are no entries to display right now.',
  actionLabel,
  onAction,
}) => {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '3.5rem 1.5rem',
        textAlign: 'center',
        backgroundColor: 'var(--slate-50)',
        borderRadius: 'var(--radius-lg)',
        border: '1px dashed var(--slate-300)',
      }}
    >
      <div
        style={{
          width: '52px',
          height: '52px',
          borderRadius: '50%',
          backgroundColor: '#ffffff',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: 'var(--shadow-sm)',
          color: 'var(--slate-400)',
          marginBottom: '1rem',
        }}
      >
        <Icon size={26} />
      </div>
      <h4 style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--slate-800)', marginBottom: '0.25rem' }}>
        {title}
      </h4>
      <p style={{ fontSize: '0.875rem', color: 'var(--slate-500)', maxWidth: '380px', marginBottom: actionLabel ? '1.25rem' : 0 }}>
        {description}
      </p>
      {actionLabel && onAction && (
        <Button variant="primary" size="sm" onClick={onAction}>
          {actionLabel}
        </Button>
      )}
    </div>
  );
};

export default EmptyState;
