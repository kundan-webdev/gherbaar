import { body } from 'express-validator';

export const createTenantRules = [
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('phone').trim().notEmpty().withMessage('Phone is required'),
  body('email').isEmail().withMessage('A valid email is required (used as the tenant login id)'),
];
