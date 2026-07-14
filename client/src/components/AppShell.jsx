import React, { useEffect, useState } from 'react';
import { NavLink, Outlet, useLocation } from 'react-router-dom';
import { LogOut, Menu, X } from 'lucide-react';
import { useAuth } from '../features/auth/useAuth.js';
import { NotificationBell } from './NotificationBell.jsx';

export function AppShell({ navItems }) {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [navOpen, setNavOpen] = useState(false);

  useEffect(() => {
    setNavOpen(false);
  }, [location.pathname]);

  return (
    <div className="shell">
      <aside className={`shell-sidebar${navOpen ? ' open' : ''}`}>
        <div className="shell-brand">
          <span className="shell-brand-mark">🏠</span>
          Gharbaar
          <button className="shell-nav-close" onClick={() => setNavOpen(false)} aria-label="Close menu">
            <X size={18} />
          </button>
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
      {navOpen && <div className="shell-backdrop" onClick={() => setNavOpen(false)} />}
      <div className="shell-body">
        <header className="shell-topbar">
          <button className="shell-menu-btn" onClick={() => setNavOpen(true)} aria-label="Open menu">
            <Menu size={20} />
          </button>
          <div className="shell-topbar-spacer" />
          <NotificationBell />
          <span className="shell-user">{user?.name}</span>
          <button className="btn secondary" onClick={logout} style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
            <LogOut size={15} />
            <span className="shell-logout-label">Logout</span>
          </button>
        </header>
        <main className="shell-main">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
