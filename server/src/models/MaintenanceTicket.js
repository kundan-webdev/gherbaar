import mongoose from 'mongoose';

const commentSchema = new mongoose.Schema(
  {
    author: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    text: { type: String, required: true, trim: true },
    createdAt: { type: Date, default: Date.now },
  },
  { _id: false }
);

const maintenanceTicketSchema = new mongoose.Schema(
  {
    property: { type: mongoose.Schema.Types.ObjectId, ref: 'Property', required: true, index: true },
    unitId: { type: mongoose.Schema.Types.ObjectId, default: null },
    lease: { type: mongoose.Schema.Types.ObjectId, ref: 'Lease', default: null },
    raisedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    assignedTo: { type: String, trim: true, default: null },
    category: {
      type: String,
      enum: ['maintenance', 'complaint', 'query'],
      default: 'maintenance',
      index: true,
    },
    title: { type: String, required: true, trim: true },
    description: { type: String, trim: true },
    priority: {
      type: String,
      enum: ['low', 'medium', 'high', 'urgent'],
      default: 'medium',
    },
    status: {
      type: String,
      enum: ['open', 'in_progress', 'resolved', 'closed'],
      default: 'open',
      index: true,
    },
    photos: [{ type: String }],
    resolvedAt: { type: Date, default: null },
    comments: [commentSchema],
  },
  { timestamps: true }
);

maintenanceTicketSchema.index({ property: 1, status: 1 });

export const MaintenanceTicket = mongoose.model('MaintenanceTicket', maintenanceTicketSchema);
