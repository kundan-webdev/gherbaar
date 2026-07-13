import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Check, Circle, X } from 'lucide-react';
import { useAuth } from '../features/auth/useAuth.js';

function storageKey(userId) {
  return `gharbaar_onboarding_dismissed_${userId}`;
}

export function OnboardingChecklist({ summary }) {
  const { user } = useAuth();
  const [dismissed, setDismissed] = useState(() => localStorage.getItem(storageKey(user?.id)) === 'true');

  const steps = [
    { done: summary.totalProperties > 0, label: 'Add your first property', to: '/properties' },
    { done: summary.totalUnits > 0, label: 'Add a unit inside it', to: '/properties' },
    { done: summary.totalTenants > 0, label: 'Add a tenant', to: '/tenants' },
    { done: summary.totalLeases > 0, label: 'Create a lease', to: '/leases' },
  ];

  const allDone = steps.every((step) => step.done);
  if (dismissed || allDone) return null;

  function dismiss() {
    localStorage.setItem(storageKey(user?.id), 'true');
    setDismissed(true);
  }

  return (
    <div className="card" style={{ marginBottom: 24, borderColor: 'var(--color-accent)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
        <h3>Get set up</h3>
        <button className="btn secondary" style={{ padding: '3px 10px', fontSize: 12 }} onClick={dismiss}>
          <X size={13} /> Dismiss
        </button>
      </div>
      <div style={{ display: 'grid', gap: 10 }}>
        {steps.map((step) => (
          <Link
            key={step.label}
            to={step.to}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              textDecoration: 'none',
              color: step.done ? 'var(--color-text-muted)' : 'var(--color-text)',
              fontWeight: step.done ? 400 : 600,
            }}
          >
            {step.done ? <Check size={16} color="#16a34a" /> : <Circle size={16} color="#9ca3af" />}
            <span style={{ textDecoration: step.done ? 'line-through' : 'none' }}>{step.label}</span>
          </Link>
        ))}
      </div>
    </div>
  );
}
