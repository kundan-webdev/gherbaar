import { body } from 'express-validator';

export const createLeaseRules = [
  body('property').isMongoId().withMessage('Valid property id is required'),
  body('unitId').isMongoId().withMessage('Valid unit id is required'),
  body('tenant').isMongoId().withMessage('Valid tenant id is required'),
  body('rentAmount').isFloat({ min: 0 }).withMessage('Rent amount is required'),
  body('startDate').isISO8601().withMessage('Valid start date is required'),
  body('electricityRatePerUnit').optional().isFloat({ min: 0 }),
];
