import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { ArrowLeft, Save } from 'lucide-react';
import { getInvoice, updateInvoice } from '../../features/billing/invoicesApi.js';

function toDateInputValue(date) {
  if (!date) return '';
  return new Date(date).toISOString().slice(0, 10);
}

export default function InvoiceEditPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [form, setForm] = useState(null);

  const { data: invoice, isLoading } = useQuery({ queryKey: ['invoices', id], queryFn: () => getInvoice(id) });

  useEffect(() => {
    if (invoice) {
      setForm({
        periodFrom: toDateInputValue(invoice.periodFrom),
        periodTo: toDateInputValue(invoice.periodTo),
        prevReading: invoice.electricity.prevReading,
        currReading: invoice.electricity.currReading,
        previousDues: invoice.previousDues,
        upiId: invoice.upiId || '',
        note: invoice.note || '',
      });
    }
  }, [invoice]);

  const updateMutation = useMutation({
    mutationFn: (payload) => updateInvoice(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['invoices', id] });
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
      navigate(`/billing/${id}`);
    },
  });

  function handleSubmit(e) {
    e.preventDefault();
    updateMutation.mutate({
      ...form,
      prevReading: Number(form.prevReading),
      currReading: Number(form.currReading),
      previousDues: Number(form.previousDues) || 0,
    });
  }

  if (isLoading || !invoice || !form) return <p className="muted">Loading…</p>;

  if (!['draft', 'sent'].includes(invoice.status)) {
    return (
      <div>
        <div className="page-header">
          <h1>Edit Invoice</h1>
        </div>
        <p className="error-text">Invoice {invoice.invoiceNumber} can no longer be edited (status: {invoice.status}).</p>
        <Link className="btn secondary" to={`/billing/${id}`} style={{ marginTop: 12, display: 'inline-flex' }}>
          <ArrowLeft size={15} /> Back to Invoice
        </Link>
      </div>
    );
  }

  return (
    <div>
      <div className="page-header">
        <h1 style={{ display: 'flex', alignItems: 'center', gap: 12, fontSize: 22 }}>
          <Link to={`/billing/${id}`} className="btn secondary" style={{ padding: '6px 10px' }}>
            <ArrowLeft size={15} />
          </Link>
          Edit Invoice {invoice.invoiceNumber}
        </h1>
      </div>

      <form onSubmit={handleSubmit} className="card" style={{ display: 'grid', gap: 12, maxWidth: 520 }}>
        <div className="field-pair">
          <div className="form-group">
            <label>From Date</label>
            <input type="date" required value={form.periodFrom} onChange={(e) => setForm({ ...form, periodFrom: e.target.value })} />
          </div>
          <div className="form-group">
            <label>To Date</label>
            <input type="date" required value={form.periodTo} onChange={(e) => setForm({ ...form, periodTo: e.target.value })} />
          </div>
        </div>

        <div className="field-pair">
          <div className="form-group">
            <label>Previous Meter Reading</label>
            <input type="number" required value={form.prevReading} onChange={(e) => setForm({ ...form, prevReading: e.target.value })} />
          </div>
          <div className="form-group">
            <label>Current Meter Reading</label>
            <input type="number" required value={form.currReading} onChange={(e) => setForm({ ...form, currReading: e.target.value })} />
          </div>
        </div>

        <div className="form-group">
          <label>Previous Dues (₹)</label>
          <input type="number" value={form.previousDues} onChange={(e) => setForm({ ...form, previousDues: e.target.value })} />
        </div>

        <div className="form-group">
          <label>UPI ID (for QR code)</label>
          <input placeholder="example@upi" value={form.upiId} onChange={(e) => setForm({ ...form, upiId: e.target.value })} />
        </div>

        <div className="form-group">
          <label>Note for Tenant (optional)</label>
          <input value={form.note} onChange={(e) => setForm({ ...form, note: e.target.value })} />
        </div>

        {updateMutation.isError && (
          <p className="error-text">{updateMutation.error.response?.data?.error?.message || 'Failed to update invoice'}</p>
        )}

        <button className="btn" type="submit" disabled={updateMutation.isPending}>
          <Save size={15} /> {updateMutation.isPending ? 'Saving…' : 'Save Changes'}
        </button>
      </form>
    </div>
  );
}
