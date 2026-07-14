import { body } from 'express-validator';

export const createPropertyRules = [
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('addressLine').trim().notEmpty().withMessage('Address is required'),
  body('city').trim().notEmpty().withMessage('City is required'),
  body('type').optional().isIn(['flat', 'apartment', 'independent_house', 'pg', 'commercial']),
];

export const addUnitRules = [
  body('unitNo').trim().notEmpty().withMessage('Unit number is required'),
  body('defaultRent').optional().isFloat({ min: 0 }),
];
