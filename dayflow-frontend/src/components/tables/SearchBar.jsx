import React from 'react';
import { Search, X } from 'lucide-react';

export const SearchBar = ({
  value,
  onChange,
  placeholder = 'Search records...',
  className = '',
}) => {
  return (
    <div
      className={`search-bar-wrapper ${className}`}
      style={{
        position: 'relative',
        display: 'flex',
        alignItems: 'center',
        minWidth: '240px',
      }}
    >
      <Search
        size={16}
        style={{
          position: 'absolute',
          left: '0.875rem',
          color: 'var(--slate-400)',
          pointerEvents: 'none',
        }}
      />
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="form-control"
        style={{
          paddingLeft: '2.375rem',
          paddingRight: value ? '2rem' : '0.875rem',
          height: '38px',
          fontSize: '0.875rem',
        }}
      />
      {value && (
        <button
          onClick={() => onChange('')}
          style={{
            position: 'absolute',
            right: '0.625rem',
            background: 'none',
            border: 'none',
            color: 'var(--slate-400)',
            cursor: 'pointer',
            padding: '0.25rem',
            display: 'flex',
            alignItems: 'center',
          }}
          aria-label="Clear search"
        >
          <X size={14} />
        </button>
      )}
    </div>
  );
};

export default SearchBar;
