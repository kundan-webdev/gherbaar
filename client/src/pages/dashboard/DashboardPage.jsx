import React from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  Building2,
  Users,
  FileText,
  Receipt,
  Wrench,
  BarChart3,
  DoorOpen,
  DoorClosed,
  IndianRupee,
  Clock,
  AlertTriangle,
  Hourglass,
  Loader2,
} from 'lucide-react';
import { useAuth } from '../../features/auth/useAuth.js';
import { getDashboardSummary } from '../../features/reports/reportsApi.js';
import { StatCard } from '../../components/StatCard.jsx';
import { OnboardingChecklist } from '../../components/OnboardingChecklist.jsx';

const quickLinks = [
  { to: '/properties', label: 'Manage Properties', icon: Building2 },
  { to: '/tenants', label: 'Manage Tenants', icon: Users },
  { to: '/leases', label: 'Manage Leases', icon: FileText },
  { to: '/billing/generate', label: 'Generate an Invoice', icon: Receipt },
  { to: '/maintenance', label: 'Maintenance Tickets', icon: Wrench },
  { to: '/reports', label: 'View Reports', icon: BarChart3 },
];

export default function DashboardPage() {
  const { user } = useAuth();
  const { data, isLoading } = useQuery({ queryKey: ['reports', 'dashboard'], queryFn: getDashboardSummary });

  return (
    <div>
      <h1 style={{ marginBottom: 6 }}>Welcome, {user?.name}</h1>
      <p className="muted" style={{ marginBottom: 24 }}>
        Here's how things stand across your properties.
      </p>

      {isLoading ? (
        <p className="muted" style={{ marginBottom: 24, display: 'flex', alignItems: 'center', gap: 8 }}>
          <Loader2 size={16} className="spin" /> Loading overview…
        </p>
      ) : (
        <>
          <OnboardingChecklist summary={data} />

          <div className="stat-grid" style={{ marginBottom: 16 }}>
            <StatCard label="Properties" value={data.totalProperties} icon={Building2} />
            <StatCard label="Total Units" value={data.totalUnits} icon={DoorOpen} />
            <StatCard label="Occupied Units" value={data.occupiedUnits} icon={DoorClosed} />
            <StatCard label="Vacant Units" value={data.vacantUnits} icon={DoorOpen} />
          </div>
          <div className="stat-grid" style={{ marginBottom: 16 }}>
            <StatCard label="Active Tenants" value={data.activeTenants} icon={Users} />
            <StatCard label="Rent Collected" value={`₹${data.rentCollected.toFixed(2)}`} icon={IndianRupee} />
            <StatCard label="Rent Pending" value={`₹${data.rentPending.toFixed(2)}`} icon={Clock} />
            <StatCard label="Rent Overdue" value={`₹${data.rentOverdue.toFixed(2)}`} icon={AlertTriangle} />
          </div>
          <div className="stat-grid" style={{ marginBottom: 28 }}>
            <StatCard label="Open Requests" value={data.maintenanceOpen} icon={Hourglass} />
            <StatCard label="In Progress" value={data.maintenanceInProgress} icon={Wrench} />
          </div>
        </>
      )}

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
