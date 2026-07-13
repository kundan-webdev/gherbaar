import React from 'react';
import { LayoutDashboard, Building2, Users, FileText, Receipt, Wallet, Wrench, BarChart3, UserCog } from 'lucide-react';
import { AppShell } from '../components/AppShell.jsx';

const navItems = [
  { to: '/', label: 'Dashboard', end: true, icon: LayoutDashboard },
  { to: '/properties', label: 'Properties', icon: Building2 },
  { to: '/tenants', label: 'Tenants', icon: Users },
  { to: '/leases', label: 'Leases', icon: FileText },
  { to: '/billing', label: 'Billing', icon: Receipt },
  { to: '/expenses', label: 'Expenses', icon: Wallet },
  { to: '/maintenance', label: 'Maintenance', icon: Wrench },
  { to: '/reports', label: 'Reports', icon: BarChart3 },
  { to: '/managers', label: 'Managers', icon: UserCog },
];

export function AppLayout() {
  return <AppShell navItems={navItems} />;
}
