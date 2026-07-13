import React from 'react';
import { Home, Building2, Users, Wrench } from 'lucide-react';
import { AppShell } from '../components/AppShell.jsx';

const navItems = [
  { to: '/manager', label: 'Home', end: true, icon: Home },
  { to: '/manager/properties', label: 'Properties', icon: Building2 },
  { to: '/manager/tenants', label: 'Tenants', icon: Users },
  { to: '/manager/maintenance', label: 'Maintenance', icon: Wrench },
];

export function ManagerLayout() {
  return <AppShell navItems={navItems} />;
}
