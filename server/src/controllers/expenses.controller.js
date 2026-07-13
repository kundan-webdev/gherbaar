import { Expense } from '../models/Expense.js';
import { ApiError } from '../utils/ApiError.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { getPagination, paginatedResponse } from '../utils/pagination.js';

async function findOwnedOrThrow(id, landlordId) {
  const expense = await Expense.findOne({ _id: id, landlord: landlordId });
  if (!expense) throw ApiError.notFound('Expense not found');
  return expense;
}

export const list = asyncHandler(async (req, res) => {
  const { page, limit, skip } = getPagination(req.query);
  const filter = { landlord: req.user.id };
  if (req.query.propertyId) filter.property = req.query.propertyId;
  if (req.query.category) filter.category = req.query.category;
  if (req.query.from || req.query.to) {
    filter.date = {};
    if (req.query.from) filter.date.$gte = new Date(req.query.from);
    if (req.query.to) filter.date.$lte = new Date(req.query.to);
  }

  const [items, total] = await Promise.all([
    Expense.find(filter).sort({ date: -1 }).skip(skip).limit(limit),
    Expense.countDocuments(filter),
  ]);
  res.json(paginatedResponse(items, total, { page, limit }));
});

export const create = asyncHandler(async (req, res) => {
  const expense = await Expense.create({ ...req.body, landlord: req.user.id });
  res.status(201).json({ expense });
});

export const getOne = asyncHandler(async (req, res) => {
  const expense = await findOwnedOrThrow(req.params.id, req.user.id);
  res.json({ expense });
});

export const update = asyncHandler(async (req, res) => {
  const expense = await findOwnedOrThrow(req.params.id, req.user.id);
  Object.assign(expense, req.body);
  await expense.save();
  res.json({ expense });
});

export const remove = asyncHandler(async (req, res) => {
  const expense = await findOwnedOrThrow(req.params.id, req.user.id);
  await expense.deleteOne();
  res.status(204).send();
});
