import { Invoice } from '../models/Invoice.js';
import { Payment } from '../models/Payment.js';
import { ApiError } from '../utils/ApiError.js';
import { notifyTenantByProfile } from './notificationService.js';

async function nextReceiptNumber() {
  const year = new Date().getFullYear();
  const count = await Payment.countDocuments({
    createdAt: { $gte: new Date(`${year}-01-01`), $lt: new Date(`${year + 1}-01-01`) },
  });
  return `RCPT-${year}-${String(count + 1).padStart(4, '0')}`;
}

export async function recordPayment(landlordId, invoiceId, payload) {
  const invoice = await Invoice.findOne({ _id: invoiceId, landlord: landlordId });
  if (!invoice) throw ApiError.notFound('Invoice not found');

  if (invoice.status === 'cancelled') {
    throw ApiError.badRequest('Cannot record a payment against a cancelled invoice');
  }

  const remaining = invoice.total - invoice.amountPaid;
  if (payload.amount > remaining + 0.01) {
    throw ApiError.badRequest(`Amount exceeds the remaining balance of ${remaining.toFixed(2)}`);
  }

  const paidAt = payload.paidAt ? new Date(payload.paidAt) : new Date();
  const method = payload.method || 'cash';

  invoice.amountPaid += payload.amount;
  invoice.status = invoice.amountPaid >= invoice.total - 0.01 ? 'paid' : 'partial';
  if (invoice.status === 'paid') {
    invoice.paidAt = paidAt;
    invoice.paymentMethod = method;
  }

  try {
    await invoice.save();
  } catch (err) {
    if (err.name === 'VersionError') {
      throw ApiError.conflict('This invoice was just updated by another request. Please refresh and try again.');
    }
    throw err;
  }

  const payment = await Payment.create({
    invoice: invoice._id,
    property: invoice.property,
    tenant: invoice.tenant,
    landlord: landlordId,
    receiptNumber: await nextReceiptNumber(),
    amount: payload.amount,
    method,
    reference: payload.reference,
    note: payload.note,
    paidAt,
  });

  await notifyTenantByProfile(invoice.tenant, {
    type: 'payment_recorded',
    title: invoice.status === 'paid' ? 'Payment received — invoice paid in full' : 'Partial payment received',
    message: `₹${payload.amount.toFixed(2)} recorded against invoice ${invoice.invoiceNumber} (receipt ${payment.receiptNumber})`,
    link: `/tenant/invoices/${invoice._id}`,
  });

  return { payment, invoice };
}
