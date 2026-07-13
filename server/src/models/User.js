import mongoose from 'mongoose';

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    passwordHash: { type: String, required: true },
    role: {
      type: String,
      enum: ['landlord', 'tenant', 'manager', 'admin'],
      default: 'landlord',
      index: true,
    },
    phone: { type: String, trim: true },
    isActive: { type: Boolean, default: true },
    mustChangePassword: { type: Boolean, default: false },
    refreshTokenVersion: { type: Number, default: 0 },
    // Reserved for later phases (trust score / verification) — unused in Phase 1.
    trustScore: { type: Number, default: null },
    verificationStatus: { type: String, default: 'unverified' },
  },
  { timestamps: true }
);

export const User = mongoose.model('User', userSchema);
