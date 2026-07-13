import { Property } from '../models/Property.js';
import { ApiError } from '../utils/ApiError.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { getPagination, paginatedResponse } from '../utils/pagination.js';
import { getManagerPropertyIds } from '../utils/managerAccess.js';

async function findOwnedOrThrow(id, ownerId) {
  const property = await Property.findOne({ _id: id, owner: ownerId });
  if (!property) throw ApiError.notFound('Property not found');
  return property;
}

async function findVisibleOrThrow(id, user) {
  if (user.role === 'manager') {
    const propertyIds = await getManagerPropertyIds(user.id);
    if (!propertyIds.includes(id)) throw ApiError.notFound('Property not found');
    const property = await Property.findById(id);
    if (!property) throw ApiError.notFound('Property not found');
    return property;
  }
  return findOwnedOrThrow(id, user.id);
}

export const list = asyncHandler(async (req, res) => {
  const { page, limit, skip } = getPagination(req.query);
  const filter =
    req.user.role === 'manager' ? { _id: { $in: await getManagerPropertyIds(req.user.id) } } : { owner: req.user.id };
  const [items, total] = await Promise.all([
    Property.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit),
    Property.countDocuments(filter),
  ]);
  res.json(paginatedResponse(items, total, { page, limit }));
});

export const create = asyncHandler(async (req, res) => {
  const property = await Property.create({ ...req.body, owner: req.user.id });
  res.status(201).json({ property });
});

export const getOne = asyncHandler(async (req, res) => {
  const property = await findVisibleOrThrow(req.params.id, req.user);
  res.json({ property });
});

export const update = asyncHandler(async (req, res) => {
  const property = await findOwnedOrThrow(req.params.id, req.user.id);
  Object.assign(property, req.body);
  await property.save();
  res.json({ property });
});

export const remove = asyncHandler(async (req, res) => {
  const property = await findOwnedOrThrow(req.params.id, req.user.id);
  await property.deleteOne();
  res.status(204).send();
});

export const addUnit = asyncHandler(async (req, res) => {
  const property = await findOwnedOrThrow(req.params.id, req.user.id);
  property.units.push(req.body);
  await property.save();
  res.status(201).json({ property });
});

export const updateUnit = asyncHandler(async (req, res) => {
  const property = await findOwnedOrThrow(req.params.id, req.user.id);
  const unit = property.units.id(req.params.unitId);
  if (!unit) throw ApiError.notFound('Unit not found');
  Object.assign(unit, req.body);
  await property.save();
  res.json({ property });
});
