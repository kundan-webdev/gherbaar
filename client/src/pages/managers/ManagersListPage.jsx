import React, { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { UserPlus, KeyRound, Trash2 } from 'lucide-react';
import { listManagers, createManager, updateManager, removeManager } from '../../features/managers/managersApi.js';
import { listProperties } from '../../features/properties/propertiesApi.js';
import { StatusBadge } from '../../components/StatusBadge.jsx';

const emptyForm = { name: '', phone: '', email: '', properties: [] };

export default function ManagersListPage() {
  const queryClient = useQueryClient();
  const [form, setForm] = useState(emptyForm);
  const [issuedCredentials, setIssuedCredentials] = useState(null);

  const { data, isLoading } = useQuery({ queryKey: ['managers'], queryFn: () => listManagers() });
  const { data: properties } = useQuery({ queryKey: ['properties'], queryFn: () => listProperties({ limit: 100 }) });

  const invalidate = () => queryClient.invalidateQueries({ queryKey: ['managers'] });

  const createMutation = useMutation({
    mutationFn: createManager,
    onSuccess: (data) => {
      invalidate();
      setForm(emptyForm);
      setIssuedCredentials(data.credentials);
    },
  });

  const togglePropertyMutation = useMutation({
    mutationFn: ({ id, properties }) => updateManager(id, { properties }),
    onSuccess: invalidate,
  });

  const removeMutation = useMutation({
    mutationFn: removeManager,
    onSuccess: invalidate,
  });

  function handleSubmit(e) {
    e.preventDefault();
    setIssuedCredentials(null);
    createMutation.mutate(form);
  }

  function togglePropertyForForm(propertyId) {
    setForm((f) => ({
      ...f,
      properties: f.properties.includes(propertyId)
        ? f.properties.filter((id) => id !== propertyId)
        : [...f.properties, propertyId],
    }));
  }

  function togglePropertyForManager(manager, propertyId) {
    const currentIds = manager.properties.map((p) => p._id);
    const nextIds = currentIds.includes(propertyId) ? currentIds.filter((id) => id !== propertyId) : [...currentIds, propertyId];
    togglePropertyMutation.mutate({ id: manager._id, properties: nextIds });
  }

  return (
    <div>
      <div className="page-header">
        <h1>Property Managers</h1>
      </div>

      {issuedCredentials && (
        <div className="card" style={{ marginBottom: 24, borderColor: 'var(--color-accent)', background: 'var(--color-accent-soft)' }}>
          <strong style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <KeyRound size={16} /> Manager login created — save these now, the password won't be shown again
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
          {createMutation.error.response?.data?.error?.message || 'Failed to add manager'}
        </p>
      )}

      <form onSubmit={handleSubmit} className="card" style={{ marginBottom: 24 }}>
        <div className="form-grid" style={{ marginBottom: 14 }}>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label>Name</label>
            <input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          </div>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label>Phone</label>
            <input required value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
          </div>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label>Email (used as manager login id)</label>
            <input required type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
          </div>
        </div>
        <div className="form-group" style={{ marginBottom: 14 }}>
          <label>Properties they can manage</label>
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            {properties?.items.map((p) => (
              <label
                key={p._id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                  padding: '6px 10px',
                  border: '1px solid var(--color-border)',
                  borderRadius: 'var(--radius-sm)',
                  fontSize: 13,
                  cursor: 'pointer',
                }}
              >
                <input type="checkbox" checked={form.properties.includes(p._id)} onChange={() => togglePropertyForForm(p._id)} />
                {p.name}
              </label>
            ))}
            {properties?.items.length === 0 && <span className="muted">Add a property first.</span>}
          </div>
        </div>
        <button className="btn" type="submit" disabled={createMutation.isPending}>
          <UserPlus size={15} /> Add Manager
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
                <th>Properties</th>
                <th>Status</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {data?.items.map((manager) => (
                <tr key={manager._id}>
                  <td>{manager.name}</td>
                  <td>{manager.phone}</td>
                  <td>{manager.email}</td>
                  <td>
                    <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', maxWidth: 260 }}>
                      {properties?.items.map((p) => {
                        const assigned = manager.properties.some((mp) => mp._id === p._id);
                        return (
                          <button
                            key={p._id}
                            onClick={() => togglePropertyForManager(manager, p._id)}
                            className={`badge badge-${assigned ? 'success' : 'neutral'}`}
                            style={{ border: 'none', cursor: 'pointer' }}
                            title={assigned ? 'Click to unassign' : 'Click to assign'}
                          >
                            {p.name}
                          </button>
                        );
                      })}
                    </div>
                  </td>
                  <td>
                    <StatusBadge status={manager.isActive ? 'active' : 'closed'} />
                  </td>
                  <td>
                    <button
                      className="btn secondary"
                      style={{ padding: '4px 8px' }}
                      onClick={() => {
                        if (window.confirm(`Remove manager ${manager.name}? Their login will be disabled.`)) {
                          removeMutation.mutate(manager._id);
                        }
                      }}
                    >
                      <Trash2 size={13} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {data?.items.length === 0 && <p className="muted" style={{ marginTop: 12 }}>No managers yet.</p>}
        </div>
      )}
    </div>
  );
}
