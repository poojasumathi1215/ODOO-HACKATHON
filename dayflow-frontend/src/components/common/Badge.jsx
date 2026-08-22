import React from 'react';

export const Badge = ({
  children,
  variant = 'neutral', // success, warning, danger, info, primary, neutral
  dot = true,
  className = '',
}) => {
  // Normalize variant from common statuses
  let finalVariant = variant;
  if (['present', 'approved', 'paid', 'active', 'stable', 'resolved', 'low'].includes(variant?.toLowerCase())) {
    finalVariant = 'success';
  } else if (['late', 'pending', 'monitor', 'medium', 'draft', 'half_day'].includes(variant?.toLowerCase())) {
    finalVariant = 'warning';
  } else if (['absent', 'rejected', 'cancelled', 'needs_attention', 'high', 'inactive'].includes(variant?.toLowerCase())) {
    finalVariant = 'danger';
  } else if (['leave', 'acknowledged', 'info'].includes(variant?.toLowerCase())) {
    finalVariant = 'info';
  }

  return (
    <span className={`badge badge-${finalVariant} ${className}`}>
      {dot && <span className="badge-dot" />}
      {children}
    </span>
  );
};

export default Badge;
