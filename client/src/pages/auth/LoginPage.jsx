import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthLayout } from '../../layouts/AuthLayout.jsx';
import { useAuth } from '../../features/auth/useAuth.js';
import { homePathForRole } from '../../lib/roleHome.js';

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      const user = await login(form);
      navigate(user.mustChangePassword ? '/change-password' : homePathForRole(user.role));
    } catch (err) {
      setError(err.response?.data?.error?.message || 'Login failed');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <AuthLayout subtitle="Log in to manage your properties">
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Email</label>
          <input
            type="email"
            required
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
          />
        </div>
        <div className="form-group">
          <label>Password</label>
          <input
            type="password"
            required
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
          />
        </div>
        {error && <p className="error-text">{error}</p>}
        <button className="btn" type="submit" disabled={submitting} style={{ width: '100%', marginTop: 8 }}>
          {submitting ? 'Logging in…' : 'Login'}
        </button>
      </form>
      <p style={{ marginTop: 16, fontSize: 14 }}>
        No account? <Link to="/register">Register</Link>
      </p>
    </AuthLayout>
  );
}
