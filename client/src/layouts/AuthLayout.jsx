import React from 'react';

export function AuthLayout({ children, subtitle }) {
  return (
    <div className="auth-shell">
      <div className="auth-card">
        <div className="auth-brand">
          <span className="auth-brand-mark">🏠</span>
          <span className="auth-brand-text">Gharbaar</span>
        </div>
        {subtitle && <p className="auth-subtitle">{subtitle}</p>}
        {children}
      </div>
    </div>
  );
}
