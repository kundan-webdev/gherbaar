import React from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Plus } from 'lucide-react';
import { listInvoices } from '../../features/billing/invoicesApi.js';
import { StatusBadge } from '../../components/StatusBadge.jsx';

export default function InvoiceHistoryPage() {
  const { data, isLoading } = useQuery({ queryKey: ['invoices'], queryFn: () => listInvoices() });

  return (
    <div>
      <div className="page-header">
        <h1>Billing History</h1>
        <Link className="btn" to="/billing/generate">
          <Plus size={15} /> Generate Invoice
        </Link>
      </div>

      {isLoading ? (
        <p className="muted">Loading…</p>
      ) : (
        <div className="card table-scroll">
          <table>
            <thead>
              <tr>
                <th>Invoice #</th>
                <th>Tenant</th>
                <th>Property</th>
                <th>Period</th>
                <th>Total</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {data?.items.map((invoice) => (
                <tr key={invoice._id}>
                  <td>
                    <Link to={`/billing/${invoice._id}`} style={{ color: 'var(--color-accent)', fontWeight: 600 }}>
                      {invoice.invoiceNumber}
                    </Link>
                  </td>
                  <td>{invoice.tenant?.name}</td>
                  <td>{invoice.property?.name}</td>
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
          {data?.items.length === 0 && <p className="muted" style={{ marginTop: 12 }}>No invoices yet.</p>}
        </div>
      )}
    </div>
  );
}
