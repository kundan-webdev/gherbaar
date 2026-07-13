import React, { useRef } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ArrowLeft } from 'lucide-react';
import { getPayment } from '../../features/billing/invoicesApi.js';
import { ReceiptPreview } from '../../features/billing/components/ReceiptPreview.jsx';
import { DownloadInvoiceButton } from '../../features/billing/components/DownloadInvoiceButton.jsx';

export default function ReceiptDetailPage() {
  const { invoiceId, paymentId } = useParams();
  const previewRef = useRef(null);

  const { data: payment, isLoading } = useQuery({
    queryKey: ['invoices', invoiceId, 'payments', paymentId],
    queryFn: () => getPayment(invoiceId, paymentId),
  });

  if (isLoading || !payment) return <p className="muted">Loading…</p>;

  return (
    <div>
      <div className="page-header">
        <h1>Receipt {payment.receiptNumber}</h1>
        <Link className="btn secondary" to={`/billing/${invoiceId}`}>
          <ArrowLeft size={15} /> Back to Invoice
        </Link>
      </div>

      <ReceiptPreview payment={payment} ref={previewRef} />

      <DownloadInvoiceButton targetRef={previewRef} fileName={`${payment.receiptNumber}.png`} />
    </div>
  );
}
