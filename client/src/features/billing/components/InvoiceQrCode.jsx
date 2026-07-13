import React, { useEffect, useRef } from 'react';
import QRious from 'qrious';

export function InvoiceQrCode({ upiDeepLink }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    if (!upiDeepLink || !canvasRef.current) return;
    new QRious({
      element: canvasRef.current,
      value: upiDeepLink,
      size: 180,
    });
  }, [upiDeepLink]);

  if (!upiDeepLink) return null;

  return (
    <div>
      <h3 style={{ marginBottom: 8 }}>Scan & Pay</h3>
      <canvas ref={canvasRef} />
    </div>
  );
}
