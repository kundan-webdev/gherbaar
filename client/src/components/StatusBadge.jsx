import React from 'react';

const VARIANTS = {
  // invoice status
  paid: 'success',
  partial: 'info',
  sent: 'warning',
  overdue: 'danger',
  draft: 'neutral',
  cancelled: 'neutral',
  // maintenance status
  open: 'info',
  in_progress: 'warning',
  resolved: 'success',
  closed: 'neutral',
  // priority
  low: 'neutral',
  medium: 'info',
  high: 'warning',
  urgent: 'danger',
  // lease status
  active: 'success',
  terminated: 'neutral',
  expired: 'danger',
};

export function StatusBadge({ status }) {
  if (!status) return null;
  const variant = VARIANTS[status] || 'neutral';
  return <span className={`badge badge-${variant}`}>{status.replace('_', ' ')}</span>;
}
