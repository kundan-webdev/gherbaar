import { TenantProfile } from '../models/TenantProfile.js';
import { Lease } from '../models/Lease.js';
import { Invoice } from '../models/Invoice.js';
import { Payment } from '../models/Payment.js';
import { ApiError } from '../utils/ApiError.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { getPagination, paginatedResponse } from '../utils/pagination.js';

async function findTenantProfileOrThrow(userId) {
  const tenant = await TenantProfile.findOne({ user: userId });
  if (!tenant) throw ApiError.notFound('Tenant profile not found');
  return tenant;
}

export const getProfile = asyncHandler(async (req, res) => {
  const tenant = await findTenantProfileOrThrow(req.user.id);
  res.json({ tenant });
});

export const listLeases = asyncHandler(async (req, res) => {
  const tenant = await findTenantProfileOrThrow(req.user.id);
  const leases = await Lease.find({ tenant: tenant._id }).populate('property').sort({ createdAt: -1 });

  const items = leases.map((lease) => {
    const unit = lease.property?.units?.id(lease.unitId) || null;
    return { ...lease.toObject(), unit };
  });

  res.json({ items });
});

export const listInvoices = asyncHandler(async (req, res) => {
  const tenant = await findTenantProfileOrThrow(req.user.id);
  const { page, limit, skip } = getPagination(req.query);
  const filter = { tenant: tenant._id };
  if (req.query.status) filter.status = req.query.status;

  const [items, total] = await Promise.all([
    Invoice.find(filter)
      .populate('property', 'name city')
      .sort({ periodFrom: -1 })
      .skip(skip)
      .limit(limit),
    Invoice.countDocuments(filter),
  ]);
  res.json(paginatedResponse(items, total, { page, limit }));
});

export const getInvoice = asyncHandler(async (req, res) => {
  const tenant = await findTenantProfileOrThrow(req.user.id);
  const invoice = await Invoice.findOne({ _id: req.params.id, tenant: tenant._id })
    .populate('tenant', 'name phone')
    .populate('property', 'name city addressLine')
    .populate('lease');
  if (!invoice) throw ApiError.notFound('Invoice not found');
  res.json({ invoice });
});

async function findOwnInvoiceOrThrow(tenantProfileId, invoiceId) {
  const invoice = await Invoice.findOne({ _id: invoiceId, tenant: tenantProfileId });
  if (!invoice) throw ApiError.notFound('Invoice not found');
  return invoice;
}

export const listPayments = asyncHandler(async (req, res) => {
  const tenant = await findTenantProfileOrThrow(req.user.id);
  await findOwnInvoiceOrThrow(tenant._id, req.params.id);
  const payments = await Payment.find({ invoice: req.params.id }).sort({ paidAt: -1 });
  res.json({ items: payments });
});

export const getPayment = asyncHandler(async (req, res) => {
  const tenant = await findTenantProfileOrThrow(req.user.id);
  await findOwnInvoiceOrThrow(tenant._id, req.params.id);
  const payment = await Payment.findOne({ _id: req.params.paymentId, invoice: req.params.id })
    .populate('tenant', 'name phone')
    .populate('property', 'name city addressLine')
    .populate('invoice', 'invoiceNumber periodFrom periodTo');
  if (!payment) throw ApiError.notFound('Receipt not found');
  res.json({ payment });
});
