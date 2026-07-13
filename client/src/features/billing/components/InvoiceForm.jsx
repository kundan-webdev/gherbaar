import React, { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { listLeases } from '../../leases/leasesApi.js';
import { createInvoice } from '../invoicesApi.js';

const emptyForm = {
  leaseId: '',
  periodFrom: '',
  periodTo: '',
  prevReading: '',
  currReading: '',
  previousDues: 0,
  upiId: '',
  note: '',
};

export function InvoiceForm() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [form, setForm] = useState(emptyForm);

  const { data: leases } = useQuery({
    queryKey: ['leases', 'active'],
    queryFn: () => listLeases({ status: 'active', limit: 100 }),
  });

  const createMutation = useMutation({
    mutationFn: createInvoice,
    onSuccess: (invoice) => {
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
      navigate(`/billing/${invoice._id}`);
    },
  });

  function handleSubmit(e) {
    e.preventDefault();
    createMutation.mutate({
      ...form,
      prevReading: Number(form.prevReading),
      currReading: Number(form.currReading),
      previousDues: Number(form.previousDues) || 0,
    });
  }

  return (
    <form onSubmit={handleSubmit} className="card" style={{ display: 'grid', gap: 12, maxWidth: 520 }}>
      <div className="form-group">
        <label>Lease</label>
        <select required value={form.leaseId} onChange={(e) => setForm({ ...form, leaseId: e.target.value })}>
          <option value="">Select lease</option>
          {leases?.items.map((lease) => (
            <option key={lease._id} value={lease._id}>
              {lease.property?.name} — {lease.tenant?.name} (₹{lease.rentAmount}/mo)
            </option>
          ))}
        </select>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        <div className="form-group">
          <label>From Date</label>
          <input type="date" required value={form.periodFrom} onChange={(e) => setForm({ ...form, periodFrom: e.target.value })} />
        </div>
        <div className="form-group">
          <label>To Date</label>
          <input type="date" required value={form.periodTo} onChange={(e) => setForm({ ...form, periodTo: e.target.value })} />
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
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

      {createMutation.isError && (
        <p className="error-text">{createMutation.error.response?.data?.error?.message || 'Failed to generate invoice'}</p>
      )}

      <button className="btn" type="submit" disabled={createMutation.isPending}>
        {createMutation.isPending ? 'Generating…' : 'Generate Invoice'}
      </button>
    </form>
  );
}
