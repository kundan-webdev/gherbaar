import React, { useEffect, useRef, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { ArrowLeft, Save, ShieldCheck, ShieldAlert, Upload, Camera, User, X } from 'lucide-react';
import {
  getTenant,
  updateTenant,
  uploadTenantDocuments,
  uploadTenantPhoto,
  removeTenantPhoto,
} from '../../features/tenants/tenantsApi.js';
import { PhotoGallery } from '../../components/PhotoGallery.jsx';

function toDateInputValue(date) {
  if (!date) return '';
  return new Date(date).toISOString().slice(0, 10);
}

export default function TenantDetailPage() {
  const { id } = useParams();
  const queryClient = useQueryClient();
  const [form, setForm] = useState(null);
  const [files, setFiles] = useState([]);
  const [photoFile, setPhotoFile] = useState(null);
  const [photoPreviewUrl, setPhotoPreviewUrl] = useState(null);
  const photoInputRef = useRef(null);

  useEffect(() => {
    if (!photoFile) {
      setPhotoPreviewUrl(null);
      return;
    }
    const objectUrl = URL.createObjectURL(photoFile);
    setPhotoPreviewUrl(objectUrl);
    return () => URL.revokeObjectURL(objectUrl);
  }, [photoFile]);

  const { data: tenant, isLoading } = useQuery({ queryKey: ['tenants', id], queryFn: () => getTenant(id) });

  useEffect(() => {
    if (tenant) {
      setForm({
        name: tenant.name || '',
        phone: tenant.phone || '',
        idProofType: tenant.idProofType || '',
        idProofNumber: tenant.idProofNumber || '',
        aadhaarNumber: tenant.aadhaarNumber || '',
        moveInDate: toDateInputValue(tenant.moveInDate),
        emergencyContactName: tenant.emergencyContact?.name || '',
        emergencyContactPhone: tenant.emergencyContact?.phone || '',
        isActive: tenant.isActive,
      });
    }
  }, [tenant]);

  const invalidate = () => queryClient.invalidateQueries({ queryKey: ['tenants', id] });

  const saveMutation = useMutation({
    mutationFn: (payload) => updateTenant(id, payload),
    onSuccess: invalidate,
  });

  const verifyMutation = useMutation({
    mutationFn: (documentsVerified) => updateTenant(id, { documentsVerified }),
    onSuccess: invalidate,
  });

  const uploadMutation = useMutation({
    mutationFn: () => uploadTenantDocuments(id, files),
    onSuccess: () => {
      invalidate();
      setFiles([]);
    },
  });

  const photoMutation = useMutation({
    mutationFn: () => uploadTenantPhoto(id, photoFile),
    onSuccess: () => {
      invalidate();
      setPhotoFile(null);
      if (photoInputRef.current) photoInputRef.current.value = '';
    },
  });

  const removePhotoMutation = useMutation({
    mutationFn: () => removeTenantPhoto(id),
    onSuccess: invalidate,
  });

  function handleSave(e) {
    e.preventDefault();
    saveMutation.mutate({
      name: form.name,
      phone: form.phone,
      idProofType: form.idProofType,
      idProofNumber: form.idProofNumber,
      aadhaarNumber: form.aadhaarNumber,
      moveInDate: form.moveInDate || null,
      emergencyContact: { name: form.emergencyContactName, phone: form.emergencyContactPhone },
      isActive: form.isActive,
    });
  }

  function handleUpload(e) {
    e.preventDefault();
    if (files.length > 0) uploadMutation.mutate();
  }

  function handlePhotoUpload(e) {
    e.preventDefault();
    if (photoFile) photoMutation.mutate();
  }

  if (isLoading || !tenant || !form) return <p className="muted">Loading…</p>;

  return (
    <div>
      <div className="page-header">
        <h1 style={{ display: 'flex', alignItems: 'center', gap: 12, fontSize: 22 }}>
          <Link to="/tenants" className="btn secondary" style={{ padding: '6px 10px' }}>
            <ArrowLeft size={15} />
          </Link>
          {tenant.photoUrl ? (
            <img
              src={tenant.photoUrl}
              alt={tenant.name}
              style={{
                width: 36,
                height: 36,
                borderRadius: '50%',
                objectFit: 'cover',
                border: '1px solid var(--color-border)',
              }}
            />
          ) : (
            <span
              style={{
                width: 36,
                height: 36,
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: 'var(--color-surface-alt)',
                border: '1px solid var(--color-border)',
                color: 'var(--color-text-muted, #888)',
              }}
            >
              <User size={18} />
            </span>
          )}
          {tenant.name}
        </h1>
        <button
          className={`btn ${tenant.documentsVerified ? 'secondary' : ''}`}
          onClick={() => verifyMutation.mutate(!tenant.documentsVerified)}
          disabled={verifyMutation.isPending}
        >
          {tenant.documentsVerified ? <ShieldAlert size={15} /> : <ShieldCheck size={15} />}
          {tenant.documentsVerified ? 'Mark Unverified' : 'Mark Documents Verified'}
        </button>
      </div>

      <div className="detail-grid wide">
        <form onSubmit={handleSave} className="card" style={{ display: 'grid', gap: 4 }}>
          <h3 style={{ marginBottom: 10 }}>Tenant Details</h3>
          <div className="form-grid">
            <div className="form-group">
              <label>Name</label>
              <input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            </div>
            <div className="form-group">
              <label>Phone</label>
              <input required value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
            </div>
            <div className="form-group">
              <label>Email (login id, fixed)</label>
              <input value={tenant.email} disabled />
            </div>
            <div className="form-group">
              <label>Aadhaar Number</label>
              <input
                value={form.aadhaarNumber}
                maxLength={12}
                onChange={(e) => setForm({ ...form, aadhaarNumber: e.target.value.replace(/\D/g, '') })}
              />
            </div>
            <div className="form-group">
              <label>Move-in Date</label>
              <input type="date" value={form.moveInDate} onChange={(e) => setForm({ ...form, moveInDate: e.target.value })} />
            </div>
            <div className="form-group">
              <label>ID Proof Type</label>
              <input
                placeholder="e.g. Aadhaar, PAN, Passport"
                value={form.idProofType}
                onChange={(e) => setForm({ ...form, idProofType: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label>ID Proof Number</label>
              <input value={form.idProofNumber} onChange={(e) => setForm({ ...form, idProofNumber: e.target.value })} />
            </div>
            <div className="form-group">
              <label>Emergency Contact Name</label>
              <input
                value={form.emergencyContactName}
                onChange={(e) => setForm({ ...form, emergencyContactName: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label>Emergency Contact Phone</label>
              <input
                value={form.emergencyContactPhone}
                onChange={(e) => setForm({ ...form, emergencyContactPhone: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label>Status</label>
              <select
                value={form.isActive ? 'active' : 'inactive'}
                onChange={(e) => setForm({ ...form, isActive: e.target.value === 'active' })}
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
          </div>
          {saveMutation.isError && (
            <p className="error-text">{saveMutation.error.response?.data?.error?.message || 'Failed to save tenant'}</p>
          )}
          <button className="btn" type="submit" disabled={saveMutation.isPending} style={{ justifySelf: 'start', marginTop: 8 }}>
            <Save size={15} /> {saveMutation.isPending ? 'Saving…' : 'Save Changes'}
          </button>
        </form>

        <div className="card" style={{ alignSelf: 'start' }}>
          <h3 style={{ marginBottom: 10 }}>Profile Photo</h3>
          {photoPreviewUrl || tenant.photoUrl ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
              <img
                src={photoPreviewUrl || tenant.photoUrl}
                alt={tenant.name}
                style={{
                  width: 90,
                  height: 90,
                  borderRadius: '50%',
                  objectFit: 'cover',
                  border: '1px solid var(--color-border)',
                }}
              />
              {photoPreviewUrl && <span className="muted" style={{ fontSize: 12 }}>Preview — not uploaded yet</span>}
              {!photoPreviewUrl && tenant.photoUrl && (
                <button
                  type="button"
                  className="btn secondary"
                  style={{ padding: '6px 10px', fontSize: 12 }}
                  onClick={() => removePhotoMutation.mutate()}
                  disabled={removePhotoMutation.isPending}
                >
                  <X size={13} /> {removePhotoMutation.isPending ? 'Removing…' : 'Remove Photo'}
                </button>
              )}
            </div>
          ) : (
            <p className="muted" style={{ fontSize: 13 }}>No photo uploaded yet.</p>
          )}
          <form onSubmit={handlePhotoUpload} style={{ marginTop: 12 }}>
            <div className="form-group">
              <label>Upload Photo (JPG, PNG or WEBP)</label>
              <input
                ref={photoInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={(e) => setPhotoFile(e.target.files[0] || null)}
              />
            </div>
            {photoMutation.isError && (
              <p className="error-text">{photoMutation.error.response?.data?.error?.message || 'Failed to upload photo'}</p>
            )}
            {removePhotoMutation.isError && (
              <p className="error-text">
                {removePhotoMutation.error.response?.data?.error?.message || 'Failed to remove photo'}
              </p>
            )}
            <button className="btn secondary" type="submit" disabled={!photoFile || photoMutation.isPending}>
              <Camera size={15} /> {photoMutation.isPending ? 'Uploading…' : 'Upload Photo'}
            </button>
          </form>

          <h3 style={{ marginTop: 22, marginBottom: 4 }}>Verification Status</h3>
          <p className="muted" style={{ fontSize: 13, marginBottom: 12 }}>
            {tenant.documentsVerified
              ? `Documents verified on ${new Date(tenant.verifiedAt).toLocaleDateString('en-IN')}`
              : 'Documents not yet verified.'}
          </p>
          <span className={`badge badge-${tenant.documentsVerified ? 'success' : 'warning'}`}>
            {tenant.documentsVerified ? <ShieldCheck size={12} /> : <ShieldAlert size={12} />}
            {tenant.documentsVerified ? 'Verified' : 'Pending Verification'}
          </span>

          <h3 style={{ marginTop: 22, marginBottom: 10 }}>Documents</h3>
          <PhotoGallery photos={tenant.documents} />
          {(!tenant.documents || tenant.documents.length === 0) && (
            <p className="muted" style={{ fontSize: 13 }}>No documents uploaded yet.</p>
          )}

          <form onSubmit={handleUpload} style={{ marginTop: 16 }}>
            <div className="form-group">
              <label>Upload ID / Agreement (JPG, PNG or PDF)</label>
              <input
                type="file"
                multiple
                accept="image/jpeg,image/png,image/webp,application/pdf"
                onChange={(e) => setFiles(Array.from(e.target.files))}
              />
            </div>
            {uploadMutation.isError && (
              <p className="error-text">{uploadMutation.error.response?.data?.error?.message || 'Failed to upload'}</p>
            )}
            <button className="btn secondary" type="submit" disabled={files.length === 0 || uploadMutation.isPending}>
              <Upload size={15} /> {uploadMutation.isPending ? 'Uploading…' : 'Upload'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
