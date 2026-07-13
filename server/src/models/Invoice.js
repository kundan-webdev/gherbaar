import mongoose from 'mongoose';

const invoiceSchema = new mongoose.Schema(
  {
    lease: { type: mongoose.Schema.Types.ObjectId, ref: 'Lease', required: true, index: true },
    property: { type: mongoose.Schema.Types.ObjectId, ref: 'Property', required: true },
    tenant: { type: mongoose.Schema.Types.ObjectId, ref: 'TenantProfile', required: true },
    landlord: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    invoiceNumber: { type: String, required: true, unique: true },
    periodFrom: { type: Date, required: true },
    periodTo: { type: Date, required: true },
    rentAmount: { type: Number, required: true },
    electricity: {
      prevReading: { type: Number, required: true },
      currReading: { type: Number, required: true },
      unitsUsed: { type: Number, required: true },
      ratePerUnit: { type: Number, required: true },
      amount: { type: Number, required: true },
    },
    previousDues: { type: Number, default: 0 },
    subtotal: { type: Number, required: true },
    total: { type: Number, required: true },
    note: { type: String, trim: true },
    upiId: { type: String, trim: true },
    upiDeepLink: { type: String },
    status: {
      type: String,
      enum: ['draft', 'sent', 'partial', 'paid', 'overdue', 'cancelled'],
      default: 'draft',
      index: true,
    },
    amountPaid: { type: Number, default: 0 },
    paidAt: { type: Date, default: null },
    paymentMethod: {
      type: String,
      enum: ['upi', 'cash', 'bank_transfer', 'other', null],
      default: null,
    },
  },
  { timestamps: true, optimisticConcurrency: true }
);

invoiceSchema.index({ lease: 1, periodFrom: -1 });

export const Invoice = mongoose.model('Invoice', invoiceSchema);
