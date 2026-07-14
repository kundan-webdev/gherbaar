import React, { forwardRef } from 'react';

function formatDate(dateStr) {
  return new Date(dateStr).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' });
}

export const ReceiptPreview = forwardRef(function ReceiptPreview({ payment }, ref) {
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
        <div style={{ fontSize: 14 }}>{formatDate(payment.paidAt)}</div>
        <div style={{ textAlign: 'right', fontSize: 28, fontWeight: 'bold', lineHeight: 1 }}>
          PAYMENT <br />
          RECEIPT
        </div>
      </div>

      <p>
        <strong>Receipt #:</strong> {payment.receiptNumber}
        <br />
        <strong>Against Invoice:</strong> {payment.invoice?.invoiceNumber}
        <br />
        <strong>Name:</strong> {payment.tenant?.name}
        <br />
        <strong>Property:</strong> {payment.property?.name}
      </p>

      <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: 20 }}>
        <tbody>
          <tr>
            <td style={{ padding: '6px 0', borderBottom: '1px solid #ddd' }}>Payment Method</td>
            <td style={{ padding: '6px 0', borderBottom: '1px solid #ddd', textTransform: 'capitalize' }}>
              {payment.method.replace('_', ' ')}
            </td>
          </tr>
          {payment.reference && (
            <tr>
              <td style={{ padding: '6px 0', borderBottom: '1px solid #ddd' }}>Reference</td>
              <td style={{ padding: '6px 0', borderBottom: '1px solid #ddd' }}>{payment.reference}</td>
            </tr>
          )}
          <tr>
            <td style={{ padding: '10px 0' }}>
              <strong>Amount Paid</strong>
            </td>
            <td style={{ padding: '10px 0', textAlign: 'right' }}>
              <strong>₹{payment.amount.toFixed(2)}</strong>
            </td>
          </tr>
        </tbody>
      </table>

      {payment.note && (
        <div style={{ marginTop: 12 }}>
          <div style={{ fontWeight: 'bold' }}>Note</div>
          <p>{payment.note}</p>
        </div>
      )}

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
        This receipt is generated for information purposes only. Do not use in legal matters.
      </div>
    </div>
  );
});
