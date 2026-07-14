import { Invoice } from '../models/Invoice.js';
import { Payment } from '../models/Payment.js';
import { ApiError } from '../utils/ApiError.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { getPagination, paginatedResponse } from '../utils/pagination.js';
import * as invoiceService from '../services/invoiceService.js';
import * as paymentService from '../services/paymentService.js';

async function findOwnedOrThrow(id, landlordId) {
  const invoice = await Invoice.findOne({ _id: id, landlord: landlordId })
    .populate('tenant', 'name phone')
    .populate('property', 'name city')
    .populate('lease');
  if (!invoice) throw ApiError.notFound('Invoice not found');
  return invoice;
}

export const list = asyncHandler(async (req, res) => {
  const { page, limit, skip } = getPagination(req.query);
  const filter = { landlord: req.user.id };
  if (req.query.leaseId) filter.lease = req.query.leaseId;
  if (req.query.propertyId) filter.property = req.query.propertyId;
  if (req.query.status) filter.status = req.query.status;

  const [items, total] = await Promise.all([
    Invoice.find(filter)
      .populate('tenant', 'name phone')
      .populate('property', 'name city')
      .sort({ periodFrom: -1 })
      .skip(skip)
      .limit(limit),
    Invoice.countDocuments(filter),
  ]);
  res.json(paginatedResponse(items, total, { page, limit }));
});

export const create = asyncHandler(async (req, res) => {
  const invoice = await invoiceService.createInvoice(req.user.id, req.body);
  res.status(201).json({ invoice });
});

export const getOne = asyncHandler(async (req, res) => {
  const invoice = await findOwnedOrThrow(req.params.id, req.user.id);
  res.json({ invoice });
});

export const update = asyncHandler(async (req, res) => {
  const invoice = await invoiceService.updateInvoice(req.user.id, req.params.id, req.body);
  res.json({ invoice });
});

export const updateStatus = asyncHandler(async (req, res) => {
  const invoice = await findOwnedOrThrow(req.params.id, req.user.id);
  invoice.status = req.body.status;
  await invoice.save();
  res.json({ invoice });
});

export const recordPayment = asyncHandler(async (req, res) => {
  const { payment, invoice } = await paymentService.recordPayment(req.user.id, req.params.id, req.body);
  res.status(201).json({ payment, invoice });
});

export const listPayments = asyncHandler(async (req, res) => {
  await findOwnedOrThrow(req.params.id, req.user.id);
  const payments = await Payment.find({ invoice: req.params.id }).sort({ paidAt: -1 });
  res.json({ items: payments });
});

export const getPayment = asyncHandler(async (req, res) => {
  await findOwnedOrThrow(req.params.id, req.user.id);
  const payment = await Payment.findOne({ _id: req.params.paymentId, invoice: req.params.id })
    .populate('tenant', 'name phone')
    .populate('property', 'name city addressLine')
    .populate('invoice', 'invoiceNumber periodFrom periodTo');
  if (!payment) throw ApiError.notFound('Receipt not found');
  res.json({ payment });
});

export const getQr = asyncHandler(async (req, res) => {
  const invoice = await findOwnedOrThrow(req.params.id, req.user.id);
  if (!invoice.upiDeepLink) {
    throw ApiError.badRequest('This invoice has no UPI id on file');
  }
  res.json({ upiDeepLink: invoice.upiDeepLink });
});
