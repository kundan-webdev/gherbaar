import { body } from 'express-validator';

export const createInvoiceRules = [
  body('leaseId').isMongoId().withMessage('Valid lease id is required'),
  body('periodFrom').isISO8601().withMessage('Valid period start date is required'),
  body('periodTo').isISO8601().withMessage('Valid period end date is required'),
  body('prevReading').isFloat({ min: 0 }).withMessage('Previous meter reading is required'),
  body('currReading').isFloat({ min: 0 }).withMessage('Current meter reading is required'),
  body('previousDues').optional().isFloat({ min: 0 }),
  body('upiId').optional({ checkFalsy: true }).isString(),
  body('note').optional().isString(),
];

export const updateInvoiceRules = [
  body('periodFrom').optional().isISO8601(),
  body('periodTo').optional().isISO8601(),
  body('prevReading').optional().isFloat({ min: 0 }),
  body('currReading').optional().isFloat({ min: 0 }),
  body('previousDues').optional().isFloat({ min: 0 }),
  body('upiId').optional({ checkFalsy: true }).isString(),
  body('note').optional().isString(),
];

export const updateStatusRules = [
  body('status')
    .isIn(['draft', 'sent', 'overdue', 'cancelled'])
    .withMessage('Status must be draft, sent, overdue, or cancelled — record a payment to mark an invoice paid or partially paid'),
];

export const recordPaymentRules = [
  body('amount').isFloat({ gt: 0 }).withMessage('Amount must be a positive number'),
  body('method').optional().isIn(['upi', 'cash', 'bank_transfer', 'other']),
  body('reference').optional().isString(),
  body('note').optional().isString(),
  body('paidAt').optional().isISO8601(),
];
