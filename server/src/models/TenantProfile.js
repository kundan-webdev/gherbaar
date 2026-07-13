import mongoose from 'mongoose';

const tenantProfileSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null, index: true },
    addedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    name: { type: String, required: true, trim: true },
    phone: { type: String, required: true, trim: true, index: true },
    email: { type: String, required: true, trim: true, lowercase: true },
    idProofType: { type: String, trim: true },
    idProofNumber: { type: String, trim: true },
    emergencyContact: {
      name: { type: String, trim: true },
      phone: { type: String, trim: true },
    },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export const TenantProfile = mongoose.model('TenantProfile', tenantProfileSchema);
