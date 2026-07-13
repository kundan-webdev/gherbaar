import { ManagerProfile } from '../models/ManagerProfile.js';
import { User } from '../models/User.js';
import { ApiError } from '../utils/ApiError.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { getPagination, paginatedResponse } from '../utils/pagination.js';
import * as managerAccountService from '../services/managerAccountService.js';

const UPDATABLE_FIELDS = ['name', 'phone', 'isActive'];

async function findOwnedOrThrow(id, landlordId) {
  const manager = await ManagerProfile.findOne({ _id: id, addedBy: landlordId });
  if (!manager) throw ApiError.notFound('Manager not found');
  return manager;
}

export const list = asyncHandler(async (req, res) => {
  const { page, limit, skip } = getPagination(req.query);
  const filter = { addedBy: req.user.id };
  const [items, total] = await Promise.all([
    ManagerProfile.find(filter).populate('properties', 'name city').sort({ createdAt: -1 }).skip(skip).limit(limit),
    ManagerProfile.countDocuments(filter),
  ]);
  res.json(paginatedResponse(items, total, { page, limit }));
});

export const create = asyncHandler(async (req, res) => {
  const { manager, credentials } = await managerAccountService.createManagerWithAccount(req.user.id, req.body);
  await manager.populate('properties', 'name city');
  res.status(201).json({ manager, credentials });
});

export const getOne = asyncHandler(async (req, res) => {
  const manager = await findOwnedOrThrow(req.params.id, req.user.id);
  await manager.populate('properties', 'name city');
  res.json({ manager });
});

export const update = asyncHandler(async (req, res) => {
  const manager = await findOwnedOrThrow(req.params.id, req.user.id);
  for (const field of UPDATABLE_FIELDS) {
    if (field in req.body) manager[field] = req.body[field];
  }
  if (req.body.properties) {
    await managerAccountService.assertPropertiesOwnedByLandlord(req.user.id, req.body.properties);
    manager.properties = req.body.properties;
  }
  await manager.save();
  await manager.populate('properties', 'name city');
  res.json({ manager });
});

export const remove = asyncHandler(async (req, res) => {
  const manager = await findOwnedOrThrow(req.params.id, req.user.id);
  if (manager.user) {
    await User.updateOne({ _id: manager.user }, { isActive: false });
  }
  await manager.deleteOne();
  res.status(204).send();
});
