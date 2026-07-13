import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Plus } from 'lucide-react';
import { listTickets, createTicket, uploadPhotos } from '../../features/maintenance/maintenanceApi.js';
import { listProperties } from '../../features/properties/propertiesApi.js';
import { StatusBadge } from '../../components/StatusBadge.jsx';
import { useAuth } from '../../features/auth/useAuth.js';

const emptyForm = { property: '', title: '', description: '', priority: 'medium', category: 'maintenance' };
const emptyFilters = { property: '', status: '', category: '' };

export default function MaintenanceListPage() {
  const { user } = useAuth();
  const basePath = user?.role === 'manager' ? '/manager/maintenance' : '/maintenance';
  const queryClient = useQueryClient();
  const [form, setForm] = useState(emptyForm);
  const [files, setFiles] = useState([]);
  const [filters, setFilters] = useState(emptyFilters);

  const { data: tickets, isLoading } = useQuery({
    queryKey: ['maintenance', filters],
    queryFn: () =>
      listTickets({
        propertyId: filters.property || undefined,
        status: filters.status || undefined,
        category: filters.category || undefined,
      }),
  });
  const { data: properties } = useQuery({ queryKey: ['properties'], queryFn: () => listProperties({ limit: 100 }) });

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
    createMutation.mutate({ form, files });
  }

  return (
    <div>
      <div className="page-header">
        <h1>Maintenance Tickets</h1>
      </div>

      <form onSubmit={handleSubmit} className="card form-grid" style={{ marginBottom: 24 }}>
        <div className="form-group">
          <label>Property</label>
          <select required value={form.property} onChange={(e) => setForm({ ...form, property: e.target.value })}>
            <option value="">Select property</option>
            {properties?.items.map((p) => (
              <option key={p._id} value={p._id}>
                {p.name}
              </option>
            ))}
          </select>
        </div>
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
            {createMutation.error.response?.data?.error?.message || 'Failed to raise ticket'}
          </p>
        )}
        <button className="btn" type="submit" disabled={createMutation.isPending} style={{ alignSelf: 'end' }}>
          <Plus size={15} /> Raise Ticket
        </button>
      </form>

      <div className="card filter-bar" style={{ marginBottom: 24 }}>
        <div className="form-group" style={{ marginBottom: 0 }}>
          <label>Filter by Property</label>
          <select value={filters.property} onChange={(e) => setFilters({ ...filters, property: e.target.value })}>
            <option value="">All properties</option>
            {properties?.items.map((p) => (
              <option key={p._id} value={p._id}>
                {p.name}
              </option>
            ))}
          </select>
        </div>
        <div className="form-group" style={{ marginBottom: 0 }}>
          <label>Filter by Status</label>
          <select value={filters.status} onChange={(e) => setFilters({ ...filters, status: e.target.value })}>
            <option value="">All statuses</option>
            <option value="open">Open</option>
            <option value="in_progress">In Progress</option>
            <option value="resolved">Resolved</option>
            <option value="closed">Closed</option>
          </select>
        </div>
        <div className="form-group" style={{ marginBottom: 0 }}>
          <label>Filter by Category</label>
          <select value={filters.category} onChange={(e) => setFilters({ ...filters, category: e.target.value })}>
            <option value="">All categories</option>
            <option value="maintenance">Maintenance</option>
            <option value="complaint">Complaint</option>
            <option value="query">Query</option>
          </select>
        </div>
      </div>

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
                  <td>
                    <Link to={`${basePath}/${ticket._id}`} style={{ color: 'var(--color-accent)', fontWeight: 600 }}>
                      View
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {tickets?.items.length === 0 && <p className="muted" style={{ marginTop: 12 }}>No tickets match these filters.</p>}
        </div>
      )}
    </div>
  );
}
