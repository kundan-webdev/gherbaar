import React, { useRef } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ArrowLeft } from 'lucide-react';
import { getMyInvoice, listMyInvoicePayments } from '../../features/tenantPortal/tenantPortalApi.js';
import { InvoicePreview } from '../../features/billing/components/InvoicePreview.jsx';
import { InvoiceQrCode } from '../../features/billing/components/InvoiceQrCode.jsx';
import { DownloadInvoiceButton } from '../../features/billing/components/DownloadInvoiceButton.jsx';
import { StatusBadge } from '../../components/StatusBadge.jsx';

export default function TenantInvoiceDetailPage() {
  const { id } = useParams();
  const previewRef = useRef(null);

  const { data: invoice, isLoading } = useQuery({ queryKey: ['me', 'invoices', id], queryFn: () => getMyInvoice(id) });
  const { data: payments } = useQuery({ queryKey: ['me', 'invoices', id, 'payments'], queryFn: () => listMyInvoicePayments(id) });

  if (isLoading || !invoice) return <p className="muted">Loading…</p>;

  const remaining = invoice.total - invoice.amountPaid;

  return (
    <div>
      <div className="page-header">
        <h1 style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          Invoice {invoice.invoiceNumber} <StatusBadge status={invoice.status} />
        </h1>
        <Link className="btn secondary" to="/tenant">
          <ArrowLeft size={15} /> Back
        </Link>
      </div>

      <InvoicePreview invoice={invoice} ref={previewRef}>
        {invoice.status !== 'paid' && <InvoiceQrCode upiDeepLink={invoice.upiDeepLink} />}
      </InvoicePreview>

      <DownloadInvoiceButton targetRef={previewRef} fileName={`${invoice.invoiceNumber}.png`} />

      {invoice.status !== 'paid' && invoice.status !== 'cancelled' && (
        <p className="muted" style={{ textAlign: 'center', marginTop: 12, fontSize: 13 }}>
          Remaining balance: ₹{remaining.toFixed(2)}
        </p>
      )}

      <div className="card table-scroll" style={{ marginTop: 24 }}>
        <h3 style={{ marginBottom: 14 }}>Payment History</h3>
        <table>
          <thead>
            <tr>
              <th>Receipt #</th>
              <th>Date</th>
              <th>Amount</th>
              <th>Method</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {payments?.map((payment) => (
              <tr key={payment._id}>
                <td>{payment.receiptNumber}</td>
                <td>{new Date(payment.paidAt).toLocaleDateString('en-IN')}</td>
                <td>₹{payment.amount.toFixed(2)}</td>
                <td style={{ textTransform: 'capitalize' }}>{payment.method.replace('_', ' ')}</td>
                <td>
                  <Link to={`/tenant/invoices/${id}/payments/${payment._id}`} style={{ color: 'var(--color-accent)', fontWeight: 600 }}>
                    View Receipt
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {payments?.length === 0 && <p className="muted" style={{ marginTop: 12 }}>No payments recorded yet.</p>}
      </div>
    </div>
  );
}
