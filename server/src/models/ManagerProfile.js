import mongoose from 'mongoose';

const managerProfileSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null, index: true },
    addedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    name: { type: String, required: true, trim: true },
    phone: { type: String, required: true, trim: true },
    email: { type: String, required: true, trim: true, lowercase: true },
    properties: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Property' }],
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export const ManagerProfile = mongoose.model('ManagerProfile', managerProfileSchema);
