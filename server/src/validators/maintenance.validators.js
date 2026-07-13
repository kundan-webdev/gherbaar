import { body } from 'express-validator';

export const createTicketRules = [
  body('property').isMongoId().withMessage('Valid property id is required'),
  body('title').trim().notEmpty().withMessage('Title is required'),
  body('priority').optional().isIn(['low', 'medium', 'high', 'urgent']),
  body('category').optional().isIn(['maintenance', 'complaint', 'query']),
];

export const addCommentRules = [body('text').trim().notEmpty().withMessage('Comment text is required')];
