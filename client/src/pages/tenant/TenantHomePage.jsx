import React from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Building2, IndianRupee, DoorOpen } from 'lucide-react';
import { useAuth } from '../../features/auth/useAuth.js';
import { listMyLeases, listMyInvoices } from '../../features/tenantPortal/tenantPortalApi.js';
import { StatusBadge } from '../../components/StatusBadge.jsx';

export default function TenantHomePage() {
  const { user } = useAuth();

  const { data: leases, isLoading: leasesLoading } = useQuery({
    queryKey: ['me', 'leases'],
    queryFn: listMyLeases,
  });
  const { data: invoices, isLoading: invoicesLoading } = useQuery({
    queryKey: ['me', 'invoices'],
    queryFn: () => listMyInvoices({ limit: 10 }),
  });

  const activeLease = leases?.find((lease) => lease.status === 'active');

  return (
    <div>
      <h1 style={{ marginBottom: 6 }}>Welcome, {user?.name}</h1>
      <p className="muted" style={{ marginBottom: 24 }}>
        Here's an overview of your rental.
      </p>

      <div className="card" style={{ marginBottom: 24 }}>
        <h3 style={{ marginBottom: 14, display: 'flex', alignItems: 'center', gap: 8 }}>
          <Building2 size={17} /> My Property
        </h3>
        {leasesLoading ? (
          <p className="muted">Loading…</p>
        ) : activeLease ? (
          <div className="stat-grid">
            <div>
              <div className="muted" style={{ fontSize: 13, marginBottom: 4 }}>
                Property
              </div>
              <div style={{ fontWeight: 700 }}>{activeLease.property?.name}</div>
              <div className="muted" style={{ fontSize: 13 }}>
                {activeLease.property?.addressLine}, {activeLease.property?.city}
              </div>
            </div>
            <div>
              <div className="muted" style={{ fontSize: 13, marginBottom: 4 }}>
                <DoorOpen size={13} style={{ verticalAlign: -2, marginRight: 4 }} />
                Unit
              </div>
              <div style={{ fontWeight: 700, fontSize: 20 }}>{activeLease.unit?.unitNo || '-'}</div>
            </div>
            <div>
              <div className="muted" style={{ fontSize: 13, marginBottom: 4 }}>
                <IndianRupee size={13} style={{ verticalAlign: -2, marginRight: 4 }} />
                Monthly Rent
              </div>
              <div style={{ fontWeight: 700, fontSize: 20 }}>₹{activeLease.rentAmount}</div>
            </div>
          </div>
        ) : (
          <p className="muted">No active lease on file yet.</p>
        )}
      </div>

      <div className="card">
        <h3 style={{ marginBottom: 14 }}>Recent Rent Invoices</h3>
        {invoicesLoading ? (
          <p className="muted">Loading…</p>
        ) : (
          <div className="table-scroll">
            <table>
              <thead>
                <tr>
                  <th>Invoice #</th>
                  <th>Period</th>
                  <th>Total</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {invoices?.items.map((invoice) => (
                  <tr key={invoice._id}>
                    <td>
                      <Link to={`/tenant/invoices/${invoice._id}`} style={{ color: 'var(--color-accent)', fontWeight: 600 }}>
                        {invoice.invoiceNumber}
                      </Link>
                    </td>
                    <td>
                      {new Date(invoice.periodFrom).toLocaleDateString('en-IN')} - {new Date(invoice.periodTo).toLocaleDateString('en-IN')}
                    </td>
                    <td>₹{invoice.total.toFixed(2)}</td>
                    <td>
                      <StatusBadge status={invoice.status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        {invoices?.items.length === 0 && <p className="muted" style={{ marginTop: 12 }}>No invoices yet.</p>}
      </div>
    </div>
  );
}
