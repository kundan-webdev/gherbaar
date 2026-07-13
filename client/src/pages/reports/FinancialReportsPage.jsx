import React, { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { IndianRupee, Wallet, TrendingUp } from 'lucide-react';
import { getFinancialSummary } from '../../features/reports/reportsApi.js';
import { listProperties } from '../../features/properties/propertiesApi.js';
import { StatCard } from '../../components/StatCard.jsx';
import { MonthlyBarChart } from '../../components/MonthlyBarChart.jsx';

function isoDate(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function financialYearRange(offsetYears) {
  const now = new Date();
  const fyStartYear = now.getMonth() >= 3 ? now.getFullYear() : now.getFullYear() - 1;
  const startYear = fyStartYear - offsetYears;
  return {
    from: isoDate(new Date(startYear, 3, 1)),
    to: isoDate(new Date(startYear + 1, 2, 31)),
  };
}

const PRESETS = [
  { key: 'currentFY', label: 'This financial year', ...financialYearRange(0) },
  { key: 'previousFY', label: 'Previous financial year', ...financialYearRange(1) },
  { key: 'custom', label: 'Custom range' },
];

export default function FinancialReportsPage() {
  const [presetKey, setPresetKey] = useState('currentFY');
  const [customFrom, setCustomFrom] = useState('');
  const [customTo, setCustomTo] = useState('');
  const [propertyId, setPropertyId] = useState('');

  const activePreset = PRESETS.find((p) => p.key === presetKey);
  const from = presetKey === 'custom' ? customFrom : activePreset.from;
  const to = presetKey === 'custom' ? customTo : activePreset.to;

  const { data: properties } = useQuery({ queryKey: ['properties'], queryFn: () => listProperties({ limit: 100 }) });
  const { data, isLoading } = useQuery({
    queryKey: ['reports', 'financials', from, to, propertyId],
    queryFn: () => getFinancialSummary({ from: from || undefined, to: to || undefined, propertyId: propertyId || undefined }),
    enabled: presetKey !== 'custom' || Boolean(customFrom && customTo),
  });

  const rangeLabel = useMemo(() => {
    if (!from || !to) return '';
    return `${new Date(from).toLocaleDateString('en-IN')} – ${new Date(to).toLocaleDateString('en-IN')}`;
  }, [from, to]);

  return (
    <div>
      <div className="page-header">
        <h1>Financial Reports</h1>
      </div>

      <div className="card filter-bar" style={{ marginBottom: 24 }}>
        <div className="form-group" style={{ marginBottom: 0 }}>
          <label>Period</label>
          <select value={presetKey} onChange={(e) => setPresetKey(e.target.value)}>
            {PRESETS.map((p) => (
              <option key={p.key} value={p.key}>
                {p.label}
              </option>
            ))}
          </select>
        </div>
        {presetKey === 'custom' ? (
          <>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label>From</label>
              <input type="date" value={customFrom} onChange={(e) => setCustomFrom(e.target.value)} />
            </div>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label>To</label>
              <input type="date" value={customTo} onChange={(e) => setCustomTo(e.target.value)} />
            </div>
          </>
        ) : (
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label>Range</label>
            <div style={{ padding: '9px 0', fontSize: 14 }}>{rangeLabel}</div>
          </div>
        )}
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
            <StatCard label="Total Income" value={`₹${data.totalIncome.toFixed(2)}`} icon={IndianRupee} />
            <StatCard label="Total Expenses" value={`₹${data.totalExpenses.toFixed(2)}`} icon={Wallet} />
            <StatCard label="Net Profit" value={`₹${data.netProfit.toFixed(2)}`} icon={TrendingUp} />
          </div>

          <div className="card" style={{ marginBottom: 24 }}>
            <h3 style={{ marginBottom: 16 }}>Income vs Expenses by Month</h3>
            <MonthlyBarChart data={data.monthly} />
          </div>

          <div className="card table-scroll" style={{ marginBottom: 24 }}>
            <h3 style={{ marginBottom: 14 }}>Profit &amp; Loss by Property</h3>
            <table>
              <thead>
                <tr>
                  <th>Property</th>
                  <th>Income</th>
                  <th>Expenses</th>
                  <th>Net</th>
                </tr>
              </thead>
              <tbody>
                {data.byProperty.map((p) => (
                  <tr key={p.propertyId}>
                    <td>{p.propertyName}</td>
                    <td>₹{p.income.toFixed(2)}</td>
                    <td>₹{p.expenses.toFixed(2)}</td>
                    <td style={{ fontWeight: 600, color: p.net >= 0 ? 'var(--color-success-text)' : 'var(--color-danger-text)' }}>
                      ₹{p.net.toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {data.byProperty.length === 0 && <p className="muted" style={{ marginTop: 12 }}>No activity in this period.</p>}
          </div>

          <div className="card table-scroll">
            <h3 style={{ marginBottom: 14 }}>Monthly Breakdown</h3>
            <table>
              <thead>
                <tr>
                  <th>Month</th>
                  <th>Income</th>
                  <th>Expenses</th>
                  <th>Net</th>
                </tr>
              </thead>
              <tbody>
                {data.monthly.map((m) => (
                  <tr key={m.month}>
                    <td>{m.month}</td>
                    <td>₹{m.income.toFixed(2)}</td>
                    <td>₹{m.expenses.toFixed(2)}</td>
                    <td style={{ fontWeight: 600, color: m.net >= 0 ? 'var(--color-success-text)' : 'var(--color-danger-text)' }}>
                      ₹{m.net.toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {data.monthly.length === 0 && <p className="muted" style={{ marginTop: 12 }}>No activity in this period.</p>}
          </div>
        </>
      )}
    </div>
  );
}
