import React from 'react';
import { Home, Wrench, KeyRound } from 'lucide-react';
import { AppShell } from '../components/AppShell.jsx';

const navItems = [
  { to: '/tenant', label: 'Home', end: true, icon: Home },
  { to: '/tenant/maintenance', label: 'Maintenance & Queries', icon: Wrench },
  { to: '/change-password', label: 'Change Password', icon: KeyRound },
];

export function TenantLayout() {
  return <AppShell navItems={navItems} />;
}
