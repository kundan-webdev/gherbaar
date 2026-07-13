import React from 'react';
import { Link } from 'react-router-dom';
import { Building2, Users, Wrench } from 'lucide-react';
import { useAuth } from '../../features/auth/useAuth.js';

const quickLinks = [
  { to: '/manager/properties', label: 'View Properties', icon: Building2 },
  { to: '/manager/tenants', label: 'View Tenants', icon: Users },
  { to: '/manager/maintenance', label: 'Manage Maintenance', icon: Wrench },
];

export default function ManagerHomePage() {
  const { user } = useAuth();

  return (
    <div>
      <h1 style={{ marginBottom: 6 }}>Welcome, {user?.name}</h1>
      <p className="muted" style={{ marginBottom: 24 }}>
        Here's quick access to the properties you manage.
      </p>

      <div className="form-grid">
        {quickLinks.map((link) => (
          <Link key={link.to} to={link.to} className="quick-link-card">
            <link.icon size={17} strokeWidth={2} />
            {link.label}
          </Link>
        ))}
      </div>
    </div>
  );
}
