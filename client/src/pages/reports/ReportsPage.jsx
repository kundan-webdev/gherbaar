import React from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { IndianRupee, Wallet, Receipt, Home, TrendingUp, Scale } from 'lucide-react';
import { getCollectionSummary, getExpenseSummary, getOccupancy } from '../../features/reports/reportsApi.js';
import { StatCard } from '../../components/StatCard.jsx';

export default function ReportsPage() {
  const { data: collection } = useQuery({ queryKey: ['reports', 'collection'], queryFn: () => getCollectionSummary() });
  const { data: expense } = useQuery({ queryKey: ['reports', 'expense'], queryFn: () => getExpenseSummary() });
  const { data: occupancy } = useQuery({ queryKey: ['reports', 'occupancy'], queryFn: () => getOccupancy() });

  return (
    <div>
      <div className="page-header">
        <h1>Reports</h1>
        <div style={{ display: 'flex', gap: 10 }}>
          <Link className="btn secondary" to="/reports/balance-sheet">
            <Scale size={15} /> Balance Sheet
          </Link>
          <Link className="btn" to="/reports/financials">
            <TrendingUp size={15} /> Financial Reports
          </Link>
        </div>
      </div>

      <div className="stat-grid" style={{ marginBottom: 24 }}>
        <StatCard label="Rent Collected" value={`₹${(collection?.collected || 0).toFixed(2)}`} icon={IndianRupee} />
        <StatCard label="Outstanding" value={`₹${(collection?.outstanding || 0).toFixed(2)}`} icon={Receipt} />
        <StatCard label="Total Expenses" value={`₹${(expense?.total || 0).toFixed(2)}`} icon={Wallet} />
        <StatCard label="Occupancy Rate" value={`${Math.round((occupancy?.occupancyRate || 0) * 100)}%`} icon={Home} />
      </div>

      <div className="card">
        <h3 style={{ marginBottom: 14 }}>Occupancy</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: 16 }}>
          <div>
            <div className="muted" style={{ fontSize: 13 }}>
              Total Units
            </div>
            <div style={{ fontSize: 20, fontWeight: 700 }}>{occupancy?.totalUnits ?? '-'}</div>
          </div>
          <div>
            <div className="muted" style={{ fontSize: 13 }}>
              Occupied Units
            </div>
            <div style={{ fontSize: 20, fontWeight: 700 }}>{occupancy?.occupiedUnits ?? '-'}</div>
          </div>
          <div>
            <div className="muted" style={{ fontSize: 13 }}>
              Vacant Units
            </div>
            <div style={{ fontSize: 20, fontWeight: 700 }}>{occupancy?.vacantUnits ?? '-'}</div>
          </div>
          <div>
            <div className="muted" style={{ fontSize: 13 }}>
              Active Leases
            </div>
            <div style={{ fontSize: 20, fontWeight: 700 }}>{occupancy?.activeLeases ?? '-'}</div>
          </div>
        </div>
      </div>
    </div>
  );
}
