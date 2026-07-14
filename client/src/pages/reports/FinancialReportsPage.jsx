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

const BREAKDOWN_VIEWS = [
  { key: 'monthly', label: 'Monthly' },
  { key: 'yearly', label: 'Yearly' },
  { key: 'all', label: 'All' },
];

function groupBreakdown(monthly, view) {
  if (view === 'monthly') return monthly.map((m) => ({ key: m.month, ...m }));

  if (view === 'yearly') {
    const byYear = new Map();
    for (const m of monthly) {
      const year = m.month.slice(0, 4);
      const existing = byYear.get(year) || { key: year, month: year, income: 0, expenses: 0 };
      existing.income += m.income;
      existing.expenses += m.expenses;
      byYear.set(year, existing);
    }
    return [...byYear.values()].sort((a, b) => a.key.localeCompare(b.key)).map((y) => ({ ...y, net: y.income - y.expenses }));
  }

  const total = monthly.reduce(
    (acc, m) => ({ income: acc.income + m.income, expenses: acc.expenses + m.expenses }),
    { income: 0, expenses: 0 }
  );
  return [{ key: 'all', month: 'All time (selected range)', income: total.income, expenses: total.expenses, net: total.income - total.expenses }];
}

export default function FinancialReportsPage() {
  const [presetKey, setPresetKey] = useState('currentFY');
  const [customFrom, setCustomFrom] = useState('');
  const [customTo, setCustomTo] = useState('');
  const [propertyId, setPropertyId] = useState('');
  const [breakdownView, setBreakdownView] = useState('monthly');

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

  const breakdownRows = useMemo(() => (data ? groupBreakdown(data.monthly, breakdownView) : []), [data, breakdownView]);

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
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14, flexWrap: 'wrap', gap: 10 }}>
              <h3>Breakdown</h3>
              <div style={{ display: 'flex', gap: 4, background: 'var(--color-surface-alt)', padding: 4, borderRadius: 'var(--radius-sm)' }}>
                {BREAKDOWN_VIEWS.map((v) => (
                  <button
                    key={v.key}
                    type="button"
                    onClick={() => setBreakdownView(v.key)}
                    className={breakdownView === v.key ? 'btn' : 'btn secondary'}
                    style={{ padding: '5px 14px', fontSize: 12, boxShadow: 'none', border: breakdownView === v.key ? 'none' : undefined }}
                  >
                    {v.label}
                  </button>
                ))}
              </div>
            </div>
            <table>
              <thead>
                <tr>
                  <th>{breakdownView === 'monthly' ? 'Month' : breakdownView === 'yearly' ? 'Year' : 'Period'}</th>
                  <th>Income</th>
                  <th>Expenses</th>
                  <th>Net</th>
                </tr>
              </thead>
              <tbody>
                {breakdownRows.map((row) => (
                  <tr key={row.key}>
                    <td>{row.month}</td>
                    <td>₹{row.income.toFixed(2)}</td>
                    <td>₹{row.expenses.toFixed(2)}</td>
                    <td style={{ fontWeight: 600, color: row.net >= 0 ? 'var(--color-success-text)' : 'var(--color-danger-text)' }}>
                      ₹{row.net.toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {breakdownRows.length === 0 && <p className="muted" style={{ marginTop: 12 }}>No activity in this period.</p>}
          </div>
        </>
      )}
    </div>
  );
}
