import { TenantProfile } from '../models/TenantProfile.js';
import { Lease } from '../models/Lease.js';
import { User } from '../models/User.js';
import { ApiError } from '../utils/ApiError.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { getPagination, paginatedResponse } from '../utils/pagination.js';
import { escapeRegex } from '../utils/escapeRegex.js';
import { getManagerPropertyIds } from '../utils/managerAccess.js';
import * as tenantAccountService from '../services/tenantAccountService.js';

const UPDATABLE_FIELDS = ['name', 'phone', 'idProofType', 'idProofNumber', 'emergencyContact', 'isActive'];

async function findOwnedOrThrow(id, landlordId) {
  const tenant = await TenantProfile.findOne({ _id: id, addedBy: landlordId });
  if (!tenant) throw ApiError.notFound('Tenant not found');
  return tenant;
}

async function getManagerTenantIds(managerUserId) {
  const propertyIds = await getManagerPropertyIds(managerUserId);
  const tenantIds = await Lease.distinct('tenant', { property: { $in: propertyIds } });
  return tenantIds.map((id) => id.toString());
}

async function findVisibleOrThrow(id, user) {
  if (user.role === 'manager') {
    const tenantIds = await getManagerTenantIds(user.id);
    if (!tenantIds.includes(id)) throw ApiError.notFound('Tenant not found');
    const tenant = await TenantProfile.findById(id);
    if (!tenant) throw ApiError.notFound('Tenant not found');
    return tenant;
  }
  return findOwnedOrThrow(id, user.id);
}

export const list = asyncHandler(async (req, res) => {
  const { page, limit, skip } = getPagination(req.query);
  const filter =
    req.user.role === 'manager' ? { _id: { $in: await getManagerTenantIds(req.user.id) } } : { addedBy: req.user.id };
  if (req.query.search && typeof req.query.search === 'string') {
    const pattern = new RegExp(escapeRegex(req.query.search), 'i');
    filter.$or = [{ name: pattern }, { phone: pattern }];
  }
  const [items, total] = await Promise.all([
    TenantProfile.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit),
    TenantProfile.countDocuments(filter),
  ]);
  res.json(paginatedResponse(items, total, { page, limit }));
});

export const create = asyncHandler(async (req, res) => {
  const { tenant, credentials } = await tenantAccountService.createTenantWithAccount(req.user.id, req.body);
  res.status(201).json({ tenant, credentials });
});

export const getOne = asyncHandler(async (req, res) => {
  const tenant = await findVisibleOrThrow(req.params.id, req.user);
  res.json({ tenant });
});

export const update = asyncHandler(async (req, res) => {
  const tenant = await findOwnedOrThrow(req.params.id, req.user.id);
  for (const field of UPDATABLE_FIELDS) {
    if (field in req.body) tenant[field] = req.body[field];
  }
  await tenant.save();
  res.json({ tenant });
});

export const remove = asyncHandler(async (req, res) => {
  const tenant = await findOwnedOrThrow(req.params.id, req.user.id);
  if (tenant.user) {
    await User.updateOne({ _id: tenant.user }, { isActive: false });
  }
  await tenant.deleteOne();
  res.status(204).send();
});
