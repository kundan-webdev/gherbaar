import React from 'react';
import { Link } from 'react-router-dom';
import { History } from 'lucide-react';
import { InvoiceForm } from '../../features/billing/components/InvoiceForm.jsx';

export default function InvoiceGeneratePage() {
  return (
    <div>
      <div className="page-header">
        <h1>Generate Invoice</h1>
        <Link className="btn secondary" to="/billing">
          <History size={15} /> View History
        </Link>
      </div>
      <InvoiceForm />
    </div>
  );
}
