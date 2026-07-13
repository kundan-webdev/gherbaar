import { ApiError } from '../utils/ApiError.js';

export function errorHandler(err, req, res, next) {
  if (err instanceof ApiError) {
    return res.status(err.statusCode).json({ error: { message: err.message, details: err.details } });
  }

  if (err.name === 'ValidationError') {
    return res.status(400).json({ error: { message: err.message } });
  }

  if (err.code === 11000) {
    return res.status(409).json({ error: { message: 'Duplicate value', details: err.keyValue } });
  }

  console.error(err);
  res.status(500).json({ error: { message: 'Internal server error' } });
}
