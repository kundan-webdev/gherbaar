import React, { forwardRef } from 'react';

function formatDate(dateStr) {
  return new Date(dateStr).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' });
}

export const InvoicePreview = forwardRef(function InvoicePreview({ invoice, children }, ref) {
  return (
    <div
      ref={ref}
      className="doc-preview"
      style={{
        background: '#faf8f1',
        border: '1px solid #ddd',
        borderRadius: 'var(--radius-md)',
        boxShadow: 'var(--shadow-md)',
        width: 500,
        maxWidth: '100%',
        margin: 'auto',
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', paddingBottom: 30 }}>
        <div style={{ fontSize: 14 }}>{formatDate(invoice.createdAt)}</div>
        <div style={{ textAlign: 'right', fontSize: 28, fontWeight: 'bold', lineHeight: 1 }}>
          RENT <br />
          INVOICE
        </div>
      </div>

      <p>
        <strong>Invoice #:</strong> {invoice.invoiceNumber}
        <br />
        <strong>Name:</strong> {invoice.tenant?.name}
        <br />
        <strong>Property:</strong> {invoice.property?.name}
        <br />
        <strong>Period:</strong> {formatDate(invoice.periodFrom)} To {formatDate(invoice.periodTo)}
      </p>

      <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: 20 }}>
        <tbody>
          <tr>
            <th style={{ textAlign: 'left', padding: '6px 0', borderBottom: '1px solid #ddd' }}></th>
            <th style={{ textAlign: 'left', padding: '6px 0', borderBottom: '1px solid #ddd' }}>Amount (₹)</th>
          </tr>
          <tr>
            <td style={{ padding: '6px 0', borderBottom: '1px solid #ddd' }}>Flat Rent</td>
            <td style={{ padding: '6px 0', borderBottom: '1px solid #ddd' }}>{invoice.rentAmount.toFixed(2)}</td>
          </tr>
          <tr>
            <td style={{ padding: '6px 0', borderBottom: '1px solid #ddd' }}>
              Electricity Details
              <br />
              <br />
              Prev Month Reading: {invoice.electricity.prevReading}
              <br />
              This Month Reading: {invoice.electricity.currReading}
              <br />
              Units Used: {invoice.electricity.unitsUsed}
              <br />
              Rate per Unit: ₹{invoice.electricity.ratePerUnit}
            </td>
            <td style={{ padding: '6px 0', borderBottom: '1px solid #ddd' }}>{invoice.electricity.amount.toFixed(2)}</td>
          </tr>
          <tr>
            <td style={{ padding: '6px 0', borderBottom: '1px solid #ddd' }}>Subtotal</td>
            <td style={{ padding: '6px 0', borderBottom: '1px solid #ddd' }}>{invoice.subtotal.toFixed(2)}</td>
          </tr>
        </tbody>
      </table>

      <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: 10 }}>
        <tbody>
          <tr>
            <td style={{ padding: '6px 0', borderBottom: '1px solid #ddd' }}>Previous Dues</td>
            <td style={{ padding: '6px 0', borderBottom: '1px solid #ddd', textAlign: 'right' }}>{invoice.previousDues.toFixed(2)}</td>
          </tr>
          <tr>
            <td style={{ padding: '6px 0' }}>
              <strong>Total</strong>
            </td>
            <td style={{ padding: '6px 0', textAlign: 'right' }}>
              <strong>₹{invoice.total.toFixed(2)}</strong>
            </td>
          </tr>
        </tbody>
      </table>

      {invoice.note && (
        <div style={{ marginTop: 12 }}>
          <div style={{ fontWeight: 'bold' }}>Note</div>
          <p>{invoice.note}</p>
        </div>
      )}

      <div style={{ textAlign: 'center', margin: '20px 0' }}>{children}</div>

      <div
        style={{
          fontSize: 12,
          textAlign: 'center',
          marginTop: 20,
          color: '#555',
          borderTop: '1px solid #ddd',
          paddingTop: 10,
        }}
      >
        This invoice is generated for information purposes only. Do not use in legal matters.
      </div>
    </div>
  );
});
