import React, { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { UserPlus, KeyRound } from 'lucide-react';
import { listTenants, createTenant } from '../../features/tenants/tenantsApi.js';

const emptyForm = { name: '', phone: '', email: '' };

export default function TenantsListPage() {
  const queryClient = useQueryClient();
  const [form, setForm] = useState(emptyForm);
  const [issuedCredentials, setIssuedCredentials] = useState(null);

  const { data, isLoading } = useQuery({ queryKey: ['tenants'], queryFn: () => listTenants() });

  const createMutation = useMutation({
    mutationFn: createTenant,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['tenants'] });
      setForm(emptyForm);
      setIssuedCredentials(data.credentials);
    },
  });

  function handleSubmit(e) {
    e.preventDefault();
    setIssuedCredentials(null);
    createMutation.mutate(form);
  }

  return (
    <div>
      <div className="page-header">
        <h1>Tenants</h1>
      </div>

      {issuedCredentials && (
        <div className="card" style={{ marginBottom: 24, borderColor: 'var(--color-accent)', background: 'var(--color-accent-soft)' }}>
          <strong style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <KeyRound size={16} /> Tenant login created — save these now, the password won't be shown again
          </strong>
          <p style={{ marginTop: 10 }}>
            Login email: <code>{issuedCredentials.email}</code>
            <br />
            Temporary password: <code>{issuedCredentials.tempPassword}</code>
          </p>
          <button className="btn secondary" style={{ marginTop: 10 }} onClick={() => setIssuedCredentials(null)}>
            Dismiss
          </button>
        </div>
      )}

      {createMutation.isError && (
        <p className="error-text" style={{ marginBottom: 12 }}>
          {createMutation.error.response?.data?.error?.message || 'Failed to add tenant'}
        </p>
      )}

      <form onSubmit={handleSubmit} className="card form-grid" style={{ marginBottom: 24, gridTemplateColumns: '1fr 1fr 1fr auto', alignItems: 'end' }}>
        <div className="form-group" style={{ marginBottom: 0 }}>
          <label>Name</label>
          <input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
        </div>
        <div className="form-group" style={{ marginBottom: 0 }}>
          <label>Phone</label>
          <input required value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
        </div>
        <div className="form-group" style={{ marginBottom: 0 }}>
          <label>Email (used as tenant login id)</label>
          <input required type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
        </div>
        <button className="btn" type="submit" disabled={createMutation.isPending}>
          <UserPlus size={15} /> Add Tenant
        </button>
      </form>

      {isLoading ? (
        <p className="muted">Loading…</p>
      ) : (
        <div className="card table-scroll">
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Phone</th>
                <th>Email</th>
              </tr>
            </thead>
            <tbody>
              {data?.items.map((tenant) => (
                <tr key={tenant._id}>
                  <td>{tenant.name}</td>
                  <td>{tenant.phone}</td>
                  <td>{tenant.email || '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {data?.items.length === 0 && <p className="muted" style={{ marginTop: 12 }}>No tenants yet.</p>}
        </div>
      )}
    </div>
  );
}
