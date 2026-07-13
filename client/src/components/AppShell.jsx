import React from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import { LogOut } from 'lucide-react';
import { useAuth } from '../features/auth/useAuth.js';
import { NotificationBell } from './NotificationBell.jsx';

export function AppShell({ navItems }) {
  const { user, logout } = useAuth();

  return (
    <div className="shell">
      <aside className="shell-sidebar">
        <div className="shell-brand">
          <span className="shell-brand-mark">🏠</span>
          Gharbaar
        </div>
        <nav className="shell-nav">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) => `shell-nav-link${isActive ? ' active' : ''}`}
              style={{ display: 'flex', alignItems: 'center', gap: 10 }}
            >
              {item.icon && <item.icon size={16} strokeWidth={2} />}
              {item.label}
            </NavLink>
          ))}
        </nav>
      </aside>
      <div className="shell-body">
        <header className="shell-topbar">
          <NotificationBell />
          <span className="shell-user">{user?.name}</span>
          <button className="btn secondary" onClick={logout} style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
            <LogOut size={15} />
            Logout
          </button>
        </header>
        <main className="shell-main">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
