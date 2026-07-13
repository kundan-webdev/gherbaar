import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Send } from 'lucide-react';
import { listTickets, createTicket, uploadPhotos } from '../../features/maintenance/maintenanceApi.js';
import { listMyLeases } from '../../features/tenantPortal/tenantPortalApi.js';
import { StatusBadge } from '../../components/StatusBadge.jsx';

const emptyForm = { title: '', description: '', priority: 'medium', category: 'maintenance' };

export default function TenantMaintenancePage() {
  const queryClient = useQueryClient();
  const [form, setForm] = useState(emptyForm);
  const [files, setFiles] = useState([]);

  const { data: tickets, isLoading } = useQuery({ queryKey: ['maintenance'], queryFn: () => listTickets() });
  const { data: leases } = useQuery({ queryKey: ['me', 'leases'], queryFn: listMyLeases });
  const activeLease = leases?.find((lease) => lease.status === 'active');

  const createMutation = useMutation({
    mutationFn: async ({ form, files }) => {
      const ticket = await createTicket(form);
      if (files.length > 0) await uploadPhotos(ticket._id, files);
      return ticket;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['maintenance'] });
      setForm(emptyForm);
      setFiles([]);
    },
  });

  function handleSubmit(e) {
    e.preventDefault();
    createMutation.mutate({
      form: {
        ...form,
        property: activeLease.property._id || activeLease.property,
        unitId: activeLease.unitId,
        lease: activeLease._id,
      },
      files,
    });
  }

  return (
    <div>
      <div className="page-header">
        <h1>Maintenance & Queries</h1>
      </div>

      {activeLease ? (
        <form onSubmit={handleSubmit} className="card form-grid" style={{ marginBottom: 24 }}>
          <div className="form-group">
            <label>Title</label>
            <input required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
          </div>
          <div className="form-group">
            <label>Category</label>
            <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
              <option value="maintenance">Maintenance</option>
              <option value="complaint">Complaint</option>
              <option value="query">Query</option>
            </select>
          </div>
          <div className="form-group">
            <label>Priority</label>
            <select value={form.priority} onChange={(e) => setForm({ ...form, priority: e.target.value })}>
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
              <option value="urgent">Urgent</option>
            </select>
          </div>
          <div className="form-group" style={{ gridColumn: 'span 2' }}>
            <label>Description</label>
            <input value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
          </div>
          <div className="form-group">
            <label>Photos (optional, up to 5)</label>
            <input type="file" accept="image/png,image/jpeg,image/webp" multiple onChange={(e) => setFiles([...e.target.files])} />
          </div>
          {createMutation.isError && (
            <p className="error-text" style={{ gridColumn: 'span 3' }}>
              {createMutation.error.response?.data?.error?.message || 'Failed to submit request'}
            </p>
          )}
          <button className="btn" type="submit" disabled={createMutation.isPending}>
            <Send size={15} /> Submit Request
          </button>
        </form>
      ) : (
        <p className="card muted" style={{ marginBottom: 24 }}>
          You need an active lease before you can raise a maintenance request or query.
        </p>
      )}

      {isLoading ? (
        <p className="muted">Loading…</p>
      ) : (
        <div className="card table-scroll">
          <table>
            <thead>
              <tr>
                <th>Title</th>
                <th>Category</th>
                <th>Priority</th>
                <th>Status</th>
                <th>Raised On</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {tickets?.items.map((ticket) => (
                <tr key={ticket._id}>
                  <td>{ticket.title}</td>
                  <td style={{ textTransform: 'capitalize' }}>{ticket.category}</td>
                  <td>
                    <StatusBadge status={ticket.priority} />
                  </td>
                  <td>
                    <StatusBadge status={ticket.status} />
                  </td>
                  <td>{new Date(ticket.createdAt).toLocaleDateString('en-IN')}</td>
                  <td>
                    <Link to={`/tenant/maintenance/${ticket._id}`} style={{ color: 'var(--color-accent)', fontWeight: 600 }}>
                      View
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {tickets?.items.length === 0 && <p className="muted" style={{ marginTop: 12 }}>No requests raised yet.</p>}
        </div>
      )}
    </div>
  );
}
