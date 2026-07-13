import { validationResult } from 'express-validator';
import { ApiError } from '../utils/ApiError.js';

export function validate(req, res, next) {
  const result = validationResult(req);
  if (!result.isEmpty()) {
    return next(ApiError.badRequest('Validation failed', result.array()));
  }
  next();
}
