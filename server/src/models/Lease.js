import mongoose from 'mongoose';

const leaseSchema = new mongoose.Schema(
  {
    property: { type: mongoose.Schema.Types.ObjectId, ref: 'Property', required: true, index: true },
    unitId: { type: mongoose.Schema.Types.ObjectId, required: true },
    tenant: { type: mongoose.Schema.Types.ObjectId, ref: 'TenantProfile', required: true, index: true },
    landlord: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    rentAmount: { type: Number, required: true },
    securityDeposit: { type: Number, default: 0 },
    advanceRent: { type: Number, default: 0 },
    electricityRatePerUnit: { type: Number, default: 8 },
    startDate: { type: Date, required: true },
    endDate: { type: Date, default: null },
    billingCycleDay: { type: Number, default: 1, min: 1, max: 28 },
    status: {
      type: String,
      enum: ['active', 'terminated', 'expired'],
      default: 'active',
      index: true,
    },
    documentUrl: { type: String, default: null },
    notes: { type: String, trim: true },
  },
  { timestamps: true }
);

leaseSchema.index({ property: 1, status: 1 });

export const Lease = mongoose.model('Lease', leaseSchema);
