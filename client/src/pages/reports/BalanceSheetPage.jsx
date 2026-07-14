import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Wallet, Receipt, ShieldCheck, Scale } from 'lucide-react';
import { getBalanceSheet } from '../../features/reports/reportsApi.js';
import { listProperties } from '../../features/properties/propertiesApi.js';
import { StatCard } from '../../components/StatCard.jsx';

function isoToday() {
  return new Date().toISOString().slice(0, 10);
}

export default function BalanceSheetPage() {
  const [asOf, setAsOf] = useState(isoToday());
  const [propertyId, setPropertyId] = useState('');

  const { data: properties } = useQuery({ queryKey: ['properties'], queryFn: () => listProperties({ limit: 100 }) });
  const { data, isLoading } = useQuery({
    queryKey: ['reports', 'balance-sheet', asOf, propertyId],
    queryFn: () => getBalanceSheet({ asOf: asOf || undefined, propertyId: propertyId || undefined }),
  });

  return (
    <div>
      <div className="page-header">
        <h1>Balance Sheet</h1>
      </div>

      <div className="card filter-bar" style={{ marginBottom: 24 }}>
        <div className="form-group" style={{ marginBottom: 0 }}>
          <label>As of Date</label>
          <input type="date" value={asOf} onChange={(e) => setAsOf(e.target.value)} />
        </div>
        <div className="form-group" style={{ marginBottom: 0 }}>
          <label>Property</label>
          <select value={propertyId} onChange={(e) => setPropertyId(e.target.value)}>
            <option value="">All properties</option>
            {properties?.items.map((p) => (
              <option key={p._id} value={p._id}>
                {p.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {isLoading || !data ? (
        <p className="muted">Loading…</p>
      ) : (
        <>
          <div className="stat-grid" style={{ marginBottom: 24 }}>
            <StatCard label="Total Assets" value={`₹${data.assets.total.toFixed(2)}`} icon={Wallet} />
            <StatCard label="Total Liabilities" value={`₹${data.liabilities.total.toFixed(2)}`} icon={Receipt} />
            <StatCard label="Net Equity" value={`₹${data.equity.toFixed(2)}`} icon={Scale} />
          </div>

          <div className="detail-grid">
            <div className="card">
              <h3 style={{ marginBottom: 14 }}>Assets</h3>
              <div style={{ display: 'grid', gap: 10 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span className="muted">Cash (rent collected − expenses paid)</span>
                  <strong>₹{data.assets.cash.toFixed(2)}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span className="muted">Accounts Receivable (outstanding rent)</span>
                  <strong>₹{data.assets.accountsReceivable.toFixed(2)}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid var(--color-border)', paddingTop: 10, marginTop: 4 }}>
                  <span style={{ fontWeight: 700 }}>Total Assets</span>
                  <strong style={{ color: 'var(--color-success-text)' }}>₹{data.assets.total.toFixed(2)}</strong>
                </div>
              </div>
            </div>

            <div className="card">
              <h3 style={{ marginBottom: 14 }}>Liabilities &amp; Equity</h3>
              <div style={{ display: 'grid', gap: 10 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span className="muted">Security Deposits Payable</span>
                  <strong>₹{data.liabilities.securityDepositsHeld.toFixed(2)}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span className="muted">Advance Rent Held</span>
                  <strong>₹{data.liabilities.advanceRentHeld.toFixed(2)}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid var(--color-border)', paddingTop: 10, marginTop: 4 }}>
                  <span style={{ fontWeight: 700 }}>Total Liabilities</span>
                  <strong>₹{data.liabilities.total.toFixed(2)}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 8 }}>
                  <span style={{ fontWeight: 700 }}>Net Equity</span>
                  <strong style={{ color: data.equity >= 0 ? 'var(--color-success-text)' : 'var(--color-danger-text)' }}>
                    ₹{data.equity.toFixed(2)}
                  </strong>
                </div>
              </div>
            </div>
          </div>

          <p className="muted" style={{ fontSize: 12, marginTop: 16, display: 'flex', alignItems: 'center', gap: 6 }}>
            <ShieldCheck size={13} /> Simplified snapshot as of {new Date(data.asOf).toLocaleDateString('en-IN')} — cash assumes all
            collected rent stays in hand after expenses; property valuations and loans aren't tracked yet.
          </p>
        </>
      )}
    </div>
  );
}
