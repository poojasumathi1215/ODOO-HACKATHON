import React from 'react';
import { Loader2 } from 'lucide-react';

export const Loader = ({ size = 32, text = 'Loading data...' }) => {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '3rem 1.5rem',
        gap: '0.75rem',
        color: 'var(--slate-500)',
      }}
    >
      <Loader2 size={size} style={{ animation: 'spin 1s linear infinite', color: 'var(--primary-600)' }} />
      {text && <span style={{ fontSize: '0.875rem', fontWeight: 500 }}>{text}</span>}
    </div>
  );
};

export const SkeletonRow = ({ columns = 5 }) => {
  return (
    <tr style={{ animation: 'pulse 1.5s infinite ease-in-out' }}>
      {Array.from({ length: columns }).map((_, i) => (
        <td key={i} style={{ padding: '1rem' }}>
          <div
            style={{
              height: '16px',
              backgroundColor: 'var(--slate-200)',
              borderRadius: '4px',
              width: i === 0 ? '70%' : i === columns - 1 ? '40%' : '85%',
            }}
          />
        </td>
      ))}
    </tr>
  );
};

export default Loader;
