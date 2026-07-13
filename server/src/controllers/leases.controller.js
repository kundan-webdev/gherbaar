import { Lease } from '../models/Lease.js';
import { Property } from '../models/Property.js';
import { ApiError } from '../utils/ApiError.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { getPagination, paginatedResponse } from '../utils/pagination.js';
import { getManagerPropertyIds } from '../utils/managerAccess.js';

async function syncUnitOccupancy(propertyId, unitId, isOccupied) {
  await Property.updateOne({ _id: propertyId, 'units._id': unitId }, { $set: { 'units.$.isOccupied': isOccupied } });
}

async function findOwnedOrThrow(id, landlordId) {
  const lease = await Lease.findOne({ _id: id, landlord: landlordId })
    .populate('tenant')
    .populate('property');
  if (!lease) throw ApiError.notFound('Lease not found');
  return lease;
}

async function findVisibleOrThrow(id, user) {
  if (user.role === 'manager') {
    const propertyIds = await getManagerPropertyIds(user.id);
    const lease = await Lease.findOne({ _id: id, property: { $in: propertyIds } })
      .populate('tenant')
      .populate('property');
    if (!lease) throw ApiError.notFound('Lease not found');
    return lease;
  }
  return findOwnedOrThrow(id, user.id);
}

export const list = asyncHandler(async (req, res) => {
  const { page, limit, skip } = getPagination(req.query);
  const filter = {};

  if (req.user.role === 'manager') {
    const managerPropertyIds = await getManagerPropertyIds(req.user.id);
    if (req.query.propertyId) {
      filter.property = managerPropertyIds.includes(req.query.propertyId) ? req.query.propertyId : null;
    } else {
      filter.property = { $in: managerPropertyIds };
    }
  } else {
    filter.landlord = req.user.id;
    if (req.query.propertyId) filter.property = req.query.propertyId;
  }
  if (req.query.tenantId) filter.tenant = req.query.tenantId;
  if (req.query.status) filter.status = req.query.status;

  const [items, total] = await Promise.all([
    Lease.find(filter)
      .populate('tenant', 'name phone')
      .populate('property', 'name city')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
    Lease.countDocuments(filter),
  ]);
  res.json(paginatedResponse(items, total, { page, limit }));
});

export const create = asyncHandler(async (req, res) => {
  const lease = await Lease.create({ ...req.body, landlord: req.user.id });
  await syncUnitOccupancy(lease.property, lease.unitId, true);
  res.status(201).json({ lease });
});

export const getOne = asyncHandler(async (req, res) => {
  const lease = await findVisibleOrThrow(req.params.id, req.user);
  res.json({ lease });
});

export const update = asyncHandler(async (req, res) => {
  const lease = await findOwnedOrThrow(req.params.id, req.user.id);
  Object.assign(lease, req.body);
  await lease.save();
  res.json({ lease });
});

export const terminate = asyncHandler(async (req, res) => {
  const lease = await findOwnedOrThrow(req.params.id, req.user.id);
  lease.status = 'terminated';
  lease.endDate = req.body.endDate || new Date();
  await lease.save();

  const stillActive = await Lease.exists({
    _id: { $ne: lease._id },
    property: lease.property._id,
    unitId: lease.unitId,
    status: 'active',
  });
  if (!stillActive) {
    await syncUnitOccupancy(lease.property._id, lease.unitId, false);
  }
  res.json({ lease });
});
