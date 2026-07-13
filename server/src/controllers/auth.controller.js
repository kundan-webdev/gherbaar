import * as authService from '../services/authService.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { User } from '../models/User.js';

export const registerHandler = asyncHandler(async (req, res) => {
  const { user, token } = await authService.register(req.body);
  res.status(201).json({ user: authService.toPublicUser(user), token });
});

export const loginHandler = asyncHandler(async (req, res) => {
  const { user, token } = await authService.login(req.body);
  res.json({ user: authService.toPublicUser(user), token });
});

export const meHandler = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id);
  res.json({ user: authService.toPublicUser(user) });
});

export const changePasswordHandler = asyncHandler(async (req, res) => {
  const { user, token } = await authService.changePassword(req.user.id, req.body);
  res.json({ user: authService.toPublicUser(user), token });
});
