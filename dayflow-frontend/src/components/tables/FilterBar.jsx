import React from 'react';
import { Filter } from 'lucide-react';

export const FilterBar = ({ filters = [], values = {}, onChange, onReset }) => {
  const hasActiveFilters = Object.values(values).some((v) => v && v !== 'all');

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '0.75rem',
        flexWrap: 'wrap',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', color: 'var(--slate-500)', fontSize: '0.8125rem' }}>
        <Filter size={15} />
        <span style={{ fontWeight: 600 }}>Filter by:</span>
      </div>

      {filters.map((f, idx) => (
        <select
          key={idx}
          value={values[f.key] || 'all'}
          onChange={(e) => onChange(f.key, e.target.value)}
          className="form-control"
          style={{
            height: '38px',
            padding: '0.25rem 0.75rem',
            width: 'auto',
            minWidth: '130px',
            fontSize: '0.8125rem',
            backgroundColor: values[f.key] && values[f.key] !== 'all' ? 'var(--primary-50)' : '#ffffff',
            borderColor: values[f.key] && values[f.key] !== 'all' ? 'var(--primary-300)' : 'var(--border-color)',
            fontWeight: values[f.key] && values[f.key] !== 'all' ? 600 : 400,
          }}
        >
          <option value="all">{f.label}: All</option>
          {f.options.map((opt, optIdx) => (
            <option key={optIdx} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      ))}

      {hasActiveFilters && onReset && (
        <button
          onClick={onReset}
          style={{
            background: 'none',
            border: 'none',
            color: 'var(--danger-600)',
            fontSize: '0.8125rem',
            fontWeight: 600,
            cursor: 'pointer',
            padding: '0.25rem 0.5rem',
          }}
        >
          Clear Filters
        </button>
      )}
    </div>
  );
};

export default FilterBar;
