import mongoose from 'mongoose';

const unitSchema = new mongoose.Schema({
  unitNo: { type: String, required: true, trim: true },
  floor: { type: String, trim: true },
  bedrooms: { type: Number },
  defaultRent: { type: Number },
  isOccupied: { type: Boolean, default: false },
});

const propertySchema = new mongoose.Schema(
  {
    owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    name: { type: String, required: true, trim: true },
    addressLine: { type: String, required: true, trim: true },
    city: { type: String, required: true, trim: true },
    state: { type: String, trim: true },
    pincode: { type: String, trim: true },
    type: {
      type: String,
      enum: ['apartment', 'independent_house', 'pg', 'commercial'],
      default: 'apartment',
    },
    units: [unitSchema],
    amenities: [{ type: String }],
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export const Property = mongoose.model('Property', propertySchema);
