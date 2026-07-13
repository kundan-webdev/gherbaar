import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthLayout } from '../../layouts/AuthLayout.jsx';
import { useAuth } from '../../features/auth/useAuth.js';
import { changePasswordRequest } from '../../features/auth/authApi.js';
import { homePathForRole } from '../../lib/roleHome.js';

export default function ChangePasswordPage() {
  const { user, updateSession } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ currentPassword: '', newPassword: '' });
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      const data = await changePasswordRequest(form);
      updateSession(data.user, data.token);
      navigate(homePathForRole(data.user.role), { replace: true });
    } catch (err) {
      setError(err.response?.data?.error?.message || 'Could not change password');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <AuthLayout subtitle={user?.mustChangePassword ? 'This is a temporary password — set a new one to continue.' : 'Change your password'}>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Current Password</label>
          <input
            type="password"
            required
            value={form.currentPassword}
            onChange={(e) => setForm({ ...form, currentPassword: e.target.value })}
          />
        </div>
        <div className="form-group">
          <label>New Password</label>
          <input
            type="password"
            required
            minLength={6}
            value={form.newPassword}
            onChange={(e) => setForm({ ...form, newPassword: e.target.value })}
          />
        </div>
        {error && <p className="error-text">{error}</p>}
        <button className="btn" type="submit" disabled={submitting} style={{ width: '100%', marginTop: 8 }}>
          {submitting ? 'Updating…' : 'Update Password'}
        </button>
      </form>
    </AuthLayout>
  );
}
