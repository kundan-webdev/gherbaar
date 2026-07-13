import React from 'react';
import html2canvas from 'html2canvas';

export function DownloadInvoiceButton({ targetRef, fileName = 'rental_invoice.png' }) {
  async function handleDownload() {
    if (!targetRef.current) return;
    const canvas = await html2canvas(targetRef.current);
    const link = document.createElement('a');
    link.download = fileName;
    link.href = canvas.toDataURL('image/png');
    link.click();
  }

  return (
    <div style={{ textAlign: 'center', marginTop: 16 }}>
      <button className="btn" onClick={handleDownload}>
        Download as Image
      </button>
    </div>
  );
}
