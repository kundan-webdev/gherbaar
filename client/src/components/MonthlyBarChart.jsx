import React, { useState } from 'react';

const PLOT_HEIGHT = 200;

function formatMonth(monthStr) {
  const [year, month] = monthStr.split('-');
  return new Date(Number(year), Number(month) - 1, 1).toLocaleDateString('en-IN', { month: 'short', year: '2-digit' });
}

function formatCurrency(value) {
  return `₹${value.toLocaleString('en-IN', { maximumFractionDigits: 0 })}`;
}

function Bar({ value, max, color, label }) {
  const [active, setActive] = useState(false);
  const height = max > 0 ? Math.max((value / max) * PLOT_HEIGHT, value > 0 ? 2 : 0) : 0;

  return (
    <div
      style={{ position: 'relative', display: 'flex', alignItems: 'flex-end' }}
      onMouseEnter={() => setActive(true)}
      onMouseLeave={() => setActive(false)}
      onFocus={() => setActive(true)}
      onBlur={() => setActive(false)}
      tabIndex={0}
      role="img"
      aria-label={label}
    >
      <div
        style={{
          width: 18,
          maxWidth: 24,
          height,
          background: color,
          borderRadius: '4px 4px 0 0',
          filter: active ? 'brightness(1.12)' : 'none',
          cursor: 'pointer',
          transition: 'filter 0.1s ease',
        }}
      />
      {active && (
        <div
          style={{
            position: 'absolute',
            bottom: '100%',
            left: '50%',
            transform: 'translateX(-50%)',
            marginBottom: 8,
            background: '#111827',
            color: '#fff',
            padding: '5px 9px',
            borderRadius: 6,
            fontSize: 12,
            whiteSpace: 'nowrap',
            zIndex: 5,
            pointerEvents: 'none',
          }}
        >
          {label}
        </div>
      )}
    </div>
  );
}

export function MonthlyBarChart({ data }) {
  const max = Math.max(1, ...data.flatMap((d) => [d.income, d.expenses]));

  return (
    <div>
      <div style={{ display: 'flex', gap: 18, marginBottom: 16, fontSize: 13 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{ width: 10, height: 10, borderRadius: 2, background: 'var(--chart-income)', display: 'inline-block' }} />
          <span className="muted">Income</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{ width: 10, height: 10, borderRadius: 2, background: 'var(--chart-expenses)', display: 'inline-block' }} />
          <span className="muted">Expenses</span>
        </div>
      </div>

      {data.length === 0 ? (
        <p className="muted">No income or expenses recorded in this period.</p>
      ) : (
        <div
          style={{
            display: 'flex',
            alignItems: 'flex-end',
            gap: 20,
            height: PLOT_HEIGHT,
            borderBottom: '1px solid var(--color-border)',
            padding: '0 4px',
            overflowX: 'auto',
          }}
        >
          {data.map((d) => (
            <div key={d.month} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flexShrink: 0 }}>
              <div style={{ display: 'flex', alignItems: 'flex-end', gap: 2, height: PLOT_HEIGHT }}>
                <Bar
                  value={d.income}
                  max={max}
                  color="var(--chart-income)"
                  label={`Income, ${formatMonth(d.month)}: ${formatCurrency(d.income)}`}
                />
                <Bar
                  value={d.expenses}
                  max={max}
                  color="var(--chart-expenses)"
                  label={`Expenses, ${formatMonth(d.month)}: ${formatCurrency(d.expenses)}`}
                />
              </div>
              <div className="muted" style={{ fontSize: 11, marginTop: 8 }}>
                {formatMonth(d.month)}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
