import React from 'react';

export function StatCard({ label, value, icon: Icon }) {
  return (
    <div className="stat-card">
      <div className="stat-card-top">
        <div className="stat-card-label">{label}</div>
        {Icon && (
          <div className="stat-card-icon">
            <Icon size={16} strokeWidth={2} />
          </div>
        )}
      </div>
      <div className="stat-card-value">{value}</div>
    </div>
  );
}
