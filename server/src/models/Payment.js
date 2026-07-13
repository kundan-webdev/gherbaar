import mongoose from 'mongoose';

const paymentSchema = new mongoose.Schema(
  {
    invoice: { type: mongoose.Schema.Types.ObjectId, ref: 'Invoice', required: true, index: true },
    property: { type: mongoose.Schema.Types.ObjectId, ref: 'Property', required: true },
    tenant: { type: mongoose.Schema.Types.ObjectId, ref: 'TenantProfile', required: true },
    landlord: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    receiptNumber: { type: String, required: true, unique: true },
    amount: { type: Number, required: true },
    method: {
      type: String,
      enum: ['upi', 'cash', 'bank_transfer', 'other'],
      default: 'cash',
    },
    reference: { type: String, trim: true },
    note: { type: String, trim: true },
    paidAt: { type: Date, required: true },
  },
  { timestamps: true }
);

paymentSchema.index({ invoice: 1, paidAt: -1 });

export const Payment = mongoose.model('Payment', paymentSchema);
