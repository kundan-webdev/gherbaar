import React, { useRef, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { IndianRupee } from 'lucide-react';
import { getInvoice, recordPayment, listPayments } from '../../features/billing/invoicesApi.js';
import { InvoicePreview } from '../../features/billing/components/InvoicePreview.jsx';
import { InvoiceQrCode } from '../../features/billing/components/InvoiceQrCode.jsx';
import { DownloadInvoiceButton } from '../../features/billing/components/DownloadInvoiceButton.jsx';
import { StatusBadge } from '../../components/StatusBadge.jsx';

const emptyPaymentForm = { amount: '', method: 'cash', reference: '', note: '' };

export default function InvoiceDetailPage() {
  const { id } = useParams();
  const previewRef = useRef(null);
  const queryClient = useQueryClient();
  const [paymentForm, setPaymentForm] = useState(emptyPaymentForm);

  const { data: invoice, isLoading } = useQuery({ queryKey: ['invoices', id], queryFn: () => getInvoice(id) });
  const { data: payments } = useQuery({ queryKey: ['invoices', id, 'payments'], queryFn: () => listPayments(id) });

  const paymentMutation = useMutation({
    mutationFn: (payload) => recordPayment(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['invoices', id] });
      queryClient.invalidateQueries({ queryKey: ['invoices', id, 'payments'] });
      setPaymentForm(emptyPaymentForm);
    },
  });

  if (isLoading || !invoice) return <p className="muted">Loading…</p>;

  const remaining = invoice.total - invoice.amountPaid;
  const canRecordPayment = invoice.status !== 'paid' && invoice.status !== 'cancelled';

  function handlePaymentSubmit(e) {
    e.preventDefault();
    paymentMutation.mutate({ ...paymentForm, amount: Number(paymentForm.amount) });
  }

  return (
    <div>
      <div className="page-header">
        <h1 style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          Invoice {invoice.invoiceNumber} <StatusBadge status={invoice.status} />
        </h1>
      </div>

      <InvoicePreview invoice={invoice} ref={previewRef}>
        <InvoiceQrCode upiDeepLink={invoice.upiDeepLink} />
      </InvoicePreview>

      <DownloadInvoiceButton targetRef={previewRef} fileName={`${invoice.invoiceNumber}.png`} />

      <div style={{ display: 'grid', gap: 16, marginTop: 24 }}>
        {canRecordPayment && (
          <div className="card">
            <h3 style={{ marginBottom: 4 }}>Record a Payment</h3>
            <p className="muted" style={{ marginBottom: 14, fontSize: 13 }}>
              Remaining balance: ₹{remaining.toFixed(2)}
            </p>
            <form onSubmit={handlePaymentSubmit} className="form-grid">
              <div className="form-group">
                <label>Amount (₹)</label>
                <input
                  type="number"
                  required
                  min="0.01"
                  step="0.01"
                  max={remaining}
                  value={paymentForm.amount}
                  onChange={(e) => setPaymentForm({ ...paymentForm, amount: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label>Method</label>
                <select value={paymentForm.method} onChange={(e) => setPaymentForm({ ...paymentForm, method: e.target.value })}>
                  <option value="cash">Cash</option>
                  <option value="upi">UPI</option>
                  <option value="bank_transfer">Bank Transfer</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <div className="form-group">
                <label>Reference (optional)</label>
                <input value={paymentForm.reference} onChange={(e) => setPaymentForm({ ...paymentForm, reference: e.target.value })} />
              </div>
              <div className="form-group" style={{ gridColumn: 'span 3' }}>
                <label>Note (optional)</label>
                <input value={paymentForm.note} onChange={(e) => setPaymentForm({ ...paymentForm, note: e.target.value })} />
              </div>
              {paymentMutation.isError && (
                <p className="error-text" style={{ gridColumn: 'span 3' }}>
                  {paymentMutation.error.response?.data?.error?.message || 'Failed to record payment'}
                </p>
              )}
              <button className="btn" type="submit" disabled={paymentMutation.isPending}>
                <IndianRupee size={15} /> Record Payment
              </button>
            </form>
          </div>
        )}

        <div className="card table-scroll">
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
                    <Link to={`/billing/${id}/payments/${payment._id}`} style={{ color: 'var(--color-accent)', fontWeight: 600 }}>
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
    </div>
  );
}
