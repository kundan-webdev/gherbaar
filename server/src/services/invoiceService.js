import { Lease } from '../models/Lease.js';
import { Invoice } from '../models/Invoice.js';
import { ApiError } from '../utils/ApiError.js';
import { buildUpiDeepLink } from '../utils/upi.js';
import { notifyTenantByProfile } from './notificationService.js';

async function nextInvoiceNumber() {
  const year = new Date().getFullYear();
  const count = await Invoice.countDocuments({
    createdAt: { $gte: new Date(`${year}-01-01`), $lt: new Date(`${year + 1}-01-01`) },
  });
  return `INV-${year}-${String(count + 1).padStart(4, '0')}`;
}

export async function createInvoice(landlordId, payload) {
  const lease = await Lease.findOne({ _id: payload.leaseId, landlord: landlordId }).populate('tenant');
  if (!lease) {
    throw ApiError.notFound('Lease not found');
  }

  const prevReading = payload.prevReading;
  const currReading = payload.currReading;
  if (currReading < prevReading) {
    throw ApiError.badRequest('Current meter reading cannot be less than previous reading');
  }

  const unitsUsed = currReading - prevReading;
  const ratePerUnit = lease.electricityRatePerUnit;
  const electricityAmount = unitsUsed * ratePerUnit;
  const rentAmount = lease.rentAmount;
  const previousDues = payload.previousDues || 0;
  const subtotal = rentAmount + electricityAmount;
  const total = subtotal + previousDues;

  const upiId = payload.upiId;
  const upiDeepLink = upiId
    ? buildUpiDeepLink({
        upiId,
        payeeName: lease.tenant?.name || 'Tenant',
        amount: total,
        note: payload.note,
      })
    : null;

  const invoice = await Invoice.create({
    lease: lease._id,
    property: lease.property,
    tenant: lease.tenant._id,
    landlord: landlordId,
    invoiceNumber: await nextInvoiceNumber(),
    periodFrom: payload.periodFrom,
    periodTo: payload.periodTo,
    rentAmount,
    electricity: {
      prevReading,
      currReading,
      unitsUsed,
      ratePerUnit,
      amount: electricityAmount,
    },
    previousDues,
    subtotal,
    total,
    note: payload.note,
    upiId,
    upiDeepLink,
    status: 'sent',
  });

  await notifyTenantByProfile(lease.tenant._id, {
    type: 'invoice_created',
    title: 'New rent invoice',
    message: `Invoice ${invoice.invoiceNumber} for ₹${total.toFixed(2)} is ready`,
    link: `/tenant/invoices/${invoice._id}`,
  });

  return invoice;
}
