import { body } from 'express-validator';

export const createManagerRules = [
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('phone').trim().notEmpty().withMessage('Phone is required'),
  body('email').isEmail().withMessage('A valid email is required (used as the manager login id)'),
  body('properties').optional().isArray(),
  body('properties.*').optional().isMongoId(),
];

export const updateManagerRules = [
  body('name').optional().trim().notEmpty(),
  body('phone').optional().trim().notEmpty(),
  body('isActive').optional().isBoolean(),
  body('properties').optional().isArray(),
  body('properties.*').optional().isMongoId(),
];
