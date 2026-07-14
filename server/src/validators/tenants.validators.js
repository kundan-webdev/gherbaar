import { body } from 'express-validator';

export const createTenantRules = [
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('phone').trim().notEmpty().withMessage('Phone is required'),
  body('email').isEmail().withMessage('A valid email is required (used as the tenant login id)'),
  body('aadhaarNumber').optional({ checkFalsy: true }).trim().isLength({ min: 12, max: 12 }).withMessage('Aadhaar number must be 12 digits'),
  body('moveInDate').optional({ checkFalsy: true }).isISO8601().withMessage('Valid move-in date is required'),
];

export const updateTenantRules = [
  body('name').optional().trim().notEmpty(),
  body('phone').optional().trim().notEmpty(),
  body('idProofType').optional().isString(),
  body('idProofNumber').optional().isString(),
  body('aadhaarNumber').optional({ checkFalsy: true }).trim().isLength({ min: 12, max: 12 }).withMessage('Aadhaar number must be 12 digits'),
  body('moveInDate').optional({ checkFalsy: true }).isISO8601(),
  body('documentsVerified').optional().isBoolean(),
  body('emergencyContact').optional().isObject(),
  body('isActive').optional().isBoolean(),
];
