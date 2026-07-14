import { body } from 'express-validator';

export const createExpenseRules = [
  body('property').isMongoId().withMessage('Valid property id is required'),
  body('amount').isFloat({ min: 0 }).withMessage('Amount is required'),
  body('date').isISO8601().withMessage('Valid date is required'),
  body('category').optional().isIn(['maintenance', 'repair', 'tax', 'emi', 'electricity', 'utility', 'other']),
];
