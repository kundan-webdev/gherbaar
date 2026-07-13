import React, { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { ArrowLeft, Send, Upload } from 'lucide-react';
import { getTicket, addComment, updateTicket, uploadPhotos } from '../../features/maintenance/maintenanceApi.js';
import { StatusBadge } from '../../components/StatusBadge.jsx';
import { PhotoGallery } from '../../components/PhotoGallery.jsx';
import { useAuth } from '../../features/auth/useAuth.js';

export default function MaintenanceDetailPage() {
  const { id } = useParams();
  const { user } = useAuth();
  const basePath = user?.role === 'manager' ? '/manager/maintenance' : '/maintenance';
  const queryClient = useQueryClient();
  const [comment, setComment] = useState('');
  const [files, setFiles] = useState([]);

  const { data: ticket, isLoading } = useQuery({ queryKey: ['maintenance', id], queryFn: () => getTicket(id) });

  const invalidate = () => queryClient.invalidateQueries({ queryKey: ['maintenance', id] });

  const statusMutation = useMutation({
    mutationFn: (status) => updateTicket(id, { status }),
    onSuccess: invalidate,
  });

  const commentMutation = useMutation({
    mutationFn: (text) => addComment(id, text),
    onSuccess: () => {
      invalidate();
      setComment('');
    },
  });

  const uploadMutation = useMutation({
    mutationFn: () => uploadPhotos(id, files),
    onSuccess: () => {
      invalidate();
      setFiles([]);
    },
  });

  function handleCommentSubmit(e) {
    e.preventDefault();
    if (!comment.trim()) return;
    commentMutation.mutate(comment);
  }

  function handleUploadSubmit(e) {
    e.preventDefault();
    if (files.length === 0) return;
    uploadMutation.mutate();
  }

  if (isLoading || !ticket) return <p className="muted">Loading…</p>;

  return (
    <div>
      <div className="page-header">
        <h1>{ticket.title}</h1>
        <Link className="btn secondary" to={basePath}>
          <ArrowLeft size={15} /> Back
        </Link>
      </div>

      <div className="card" style={{ marginBottom: 24 }}>
        <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap', marginBottom: 16 }}>
          <div>
            <div className="muted" style={{ fontSize: 13, marginBottom: 4 }}>
              Raised By
            </div>
            <div style={{ fontWeight: 600 }}>{ticket.raisedBy?.name || 'Unknown'}</div>
          </div>
          <div>
            <div className="muted" style={{ fontSize: 13, marginBottom: 4 }}>
              Property
            </div>
            <div style={{ fontWeight: 600 }}>{ticket.property?.name || '-'}</div>
          </div>
          <div>
            <div className="muted" style={{ fontSize: 13, marginBottom: 4 }}>
              Category
            </div>
            <span style={{ textTransform: 'capitalize', fontWeight: 600 }}>{ticket.category}</span>
          </div>
          <div>
            <div className="muted" style={{ fontSize: 13, marginBottom: 4 }}>
              Priority
            </div>
            <StatusBadge status={ticket.priority} />
          </div>
          <div>
            <div className="muted" style={{ fontSize: 13, marginBottom: 4 }}>
              Status
            </div>
            <select
              value={ticket.status}
              onChange={(e) => statusMutation.mutate(e.target.value)}
              disabled={statusMutation.isPending}
              style={{ padding: '6px 10px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--color-border)' }}
            >
              <option value="open">Open</option>
              <option value="in_progress">In Progress</option>
              <option value="resolved">Resolved</option>
              <option value="closed">Closed</option>
            </select>
          </div>
        </div>
        {ticket.description && (
          <p style={{ marginBottom: 12 }}>
            <strong>Description:</strong> {ticket.description}
          </p>
        )}

        <PhotoGallery photos={ticket.photos} />

        <form onSubmit={handleUploadSubmit} style={{ display: 'flex', gap: 8, alignItems: 'center', marginTop: 14 }}>
          <input type="file" accept="image/png,image/jpeg,image/webp" multiple onChange={(e) => setFiles([...e.target.files])} />
          <button className="btn secondary" type="submit" disabled={files.length === 0 || uploadMutation.isPending}>
            <Upload size={14} /> Add Photos
          </button>
        </form>
        {uploadMutation.isError && (
          <p className="error-text">{uploadMutation.error.response?.data?.error?.message || 'Failed to upload photos'}</p>
        )}
      </div>

      <div className="card">
        <h3 style={{ marginBottom: 14 }}>Updates</h3>
        {ticket.comments.length === 0 && (
          <p className="muted" style={{ marginBottom: 12 }}>
            No updates yet.
          </p>
        )}
        <div style={{ display: 'grid', gap: 12, marginBottom: 16 }}>
          {ticket.comments.map((c, i) => (
            <div key={i} style={{ borderBottom: '1px solid var(--color-border)', paddingBottom: 10 }}>
              <div className="muted" style={{ fontSize: 13, marginBottom: 3, fontWeight: 600 }}>
                {c.author?.name || 'Unknown'} · {new Date(c.createdAt).toLocaleString('en-IN')}
              </div>
              <div>{c.text}</div>
            </div>
          ))}
        </div>

        <form onSubmit={handleCommentSubmit} style={{ display: 'flex', gap: 8 }}>
          <input
            style={{ flex: 1, padding: '9px 11px', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-sm)' }}
            placeholder="Add a response…"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
          />
          <button className="btn" type="submit" disabled={commentMutation.isPending}>
            <Send size={15} /> Send
          </button>
        </form>
      </div>
    </div>
  );
}
