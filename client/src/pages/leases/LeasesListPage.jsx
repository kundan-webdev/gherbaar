import React, { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { FilePlus } from 'lucide-react';
import { listLeases, createLease } from '../../features/leases/leasesApi.js';
import { listProperties } from '../../features/properties/propertiesApi.js';
import { listTenants } from '../../features/tenants/tenantsApi.js';
import { StatusBadge } from '../../components/StatusBadge.jsx';

const emptyForm = {
  property: '',
  unitId: '',
  tenant: '',
  rentAmount: '',
  securityDeposit: '',
  advanceRent: '',
  electricityRatePerUnit: 8,
  startDate: '',
  billingCycleDay: 1,
};

export default function LeasesListPage() {
  const queryClient = useQueryClient();
  const [form, setForm] = useState(emptyForm);

  const { data: leases, isLoading } = useQuery({ queryKey: ['leases'], queryFn: () => listLeases() });
  const { data: properties } = useQuery({ queryKey: ['properties'], queryFn: () => listProperties({ limit: 100 }) });
  const { data: tenants } = useQuery({ queryKey: ['tenants'], queryFn: () => listTenants({ limit: 100 }) });

  const createMutation = useMutation({
    mutationFn: createLease,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leases'] });
      setForm(emptyForm);
    },
  });

  const selectedProperty = properties?.items.find((p) => p._id === form.property);

  function handleSubmit(e) {
    e.preventDefault();
    createMutation.mutate({
      ...form,
      rentAmount: Number(form.rentAmount),
      securityDeposit: Number(form.securityDeposit) || 0,
      advanceRent: Number(form.advanceRent) || 0,
      electricityRatePerUnit: Number(form.electricityRatePerUnit),
    });
  }

  function handleRentChange(value) {
    setForm((f) => ({
      ...f,
      rentAmount: value,
      // Advance is typically 1 month's rent — pre-fill it until the landlord edits it themselves.
      advanceRent: f.advanceRent === '' ? value : f.advanceRent,
    }));
  }

  return (
    <div>
      <div className="page-header">
        <h1>Leases</h1>
      </div>

      <form onSubmit={handleSubmit} className="card form-grid" style={{ marginBottom: 24 }}>
        <div className="form-group">
          <label>Property</label>
          <select required value={form.property} onChange={(e) => setForm({ ...form, property: e.target.value, unitId: '' })}>
            <option value="">Select property</option>
            {properties?.items.map((p) => (
              <option key={p._id} value={p._id}>
                {p.name}
              </option>
            ))}
          </select>
        </div>
        <div className="form-group">
          <label>Unit</label>
          <select required value={form.unitId} onChange={(e) => setForm({ ...form, unitId: e.target.value })}>
            <option value="">Select unit</option>
            {selectedProperty?.units.map((u) => (
              <option key={u._id} value={u._id}>
                {u.unitNo}
              </option>
            ))}
          </select>
        </div>
        <div className="form-group">
          <label>Tenant</label>
          <select required value={form.tenant} onChange={(e) => setForm({ ...form, tenant: e.target.value })}>
            <option value="">Select tenant</option>
            {tenants?.items.map((t) => (
              <option key={t._id} value={t._id}>
                {t.name}
              </option>
            ))}
          </select>
        </div>
        <div className="form-group">
          <label>Rent Amount (₹)</label>
          <input type="number" required value={form.rentAmount} onChange={(e) => handleRentChange(e.target.value)} />
        </div>
        <div className="form-group">
          <label>Security Deposit (₹)</label>
          <input
            type="number"
            value={form.securityDeposit}
            onChange={(e) => setForm({ ...form, securityDeposit: e.target.value })}
          />
        </div>
        <div className="form-group">
          <label>Advance Rent (₹, usually 1 month)</label>
          <input type="number" value={form.advanceRent} onChange={(e) => setForm({ ...form, advanceRent: e.target.value })} />
        </div>
        <div className="form-group">
          <label>Electricity Rate (₹/unit)</label>
          <input type="number" value={form.electricityRatePerUnit} onChange={(e) => setForm({ ...form, electricityRatePerUnit: e.target.value })} />
        </div>
        <div className="form-group">
          <label>Start Date</label>
          <input type="date" required value={form.startDate} onChange={(e) => setForm({ ...form, startDate: e.target.value })} />
        </div>
        <button className="btn" type="submit" disabled={createMutation.isPending} style={{ alignSelf: 'end' }}>
          <FilePlus size={15} /> Create Lease
        </button>
      </form>

      {isLoading ? (
        <p className="muted">Loading…</p>
      ) : (
        <div className="card table-scroll">
          <table>
            <thead>
              <tr>
                <th>Property</th>
                <th>Tenant</th>
                <th>Rent</th>
                <th>Security Deposit</th>
                <th>Advance Rent</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {leases?.items.map((lease) => (
                <tr key={lease._id}>
                  <td>{lease.property?.name}</td>
                  <td>{lease.tenant?.name}</td>
                  <td>₹{lease.rentAmount}</td>
                  <td>₹{lease.securityDeposit || 0}</td>
                  <td>₹{lease.advanceRent || 0}</td>
                  <td>
                    <StatusBadge status={lease.status} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {leases?.items.length === 0 && <p className="muted" style={{ marginTop: 12 }}>No leases yet.</p>}
        </div>
      )}
    </div>
  );
}
