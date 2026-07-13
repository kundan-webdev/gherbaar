import mongoose from 'mongoose';

const expenseSchema = new mongoose.Schema(
  {
    property: { type: mongoose.Schema.Types.ObjectId, ref: 'Property', required: true, index: true },
    landlord: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    category: {
      type: String,
      enum: ['maintenance', 'repair', 'tax', 'insurance', 'utility', 'other'],
      default: 'other',
    },
    amount: { type: Number, required: true },
    date: { type: Date, required: true },
    description: { type: String, trim: true },
    receiptUrl: { type: String, default: null },
  },
  { timestamps: true }
);

export const Expense = mongoose.model('Expense', expenseSchema);
