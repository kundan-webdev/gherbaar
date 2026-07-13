import React from 'react';

export function StatCard({ label, value, icon: Icon }) {
  return (
    <div className="stat-card">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div className="stat-card-label">{label}</div>
        {Icon && <Icon size={16} strokeWidth={2} color="#9ca3af" />}
      </div>
      <div className="stat-card-value">{value}</div>
    </div>
  );
}
