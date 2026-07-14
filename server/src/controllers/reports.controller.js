import mongoose from 'mongoose';
import { Invoice } from '../models/Invoice.js';
import { Expense } from '../models/Expense.js';
import { Payment } from '../models/Payment.js';
import { Lease } from '../models/Lease.js';
import { Property } from '../models/Property.js';
import { MaintenanceTicket } from '../models/MaintenanceTicket.js';
import { TenantProfile } from '../models/TenantProfile.js';
import { asyncHandler } from '../utils/asyncHandler.js';

function dateRangeFilter(query) {
  const range = {};
  if (query.from) range.$gte = new Date(query.from);
  if (query.to) range.$lte = new Date(query.to);
  return Object.keys(range).length ? range : undefined;
}

export const collectionSummary = asyncHandler(async (req, res) => {
  const landlordId = new mongoose.Types.ObjectId(req.user.id);
  const match = { landlord: landlordId };
  if (req.query.propertyId) match.property = new mongoose.Types.ObjectId(req.query.propertyId);
  const periodFrom = dateRangeFilter(req.query);
  if (periodFrom) match.periodFrom = periodFrom;

  const rows = await Invoice.aggregate([
    { $match: match },
    {
      $group: {
        _id: '$status',
        totalAmount: { $sum: '$total' },
        amountPaid: { $sum: '$amountPaid' },
        count: { $sum: 1 },
      },
    },
  ]);

  const summary = { collected: 0, outstanding: 0, byStatus: {} };
  for (const row of rows) {
    const remaining = row.totalAmount - row.amountPaid;
    summary.byStatus[row._id] = { totalAmount: row.totalAmount, amountPaid: row.amountPaid, remaining, count: row.count };
    summary.collected += row.amountPaid;
    if (row._id !== 'cancelled' && row._id !== 'draft') summary.outstanding += remaining;
  }

  res.json(summary);
});

export const expenseSummary = asyncHandler(async (req, res) => {
  const landlordId = new mongoose.Types.ObjectId(req.user.id);
  const match = { landlord: landlordId };
  if (req.query.propertyId) match.property = new mongoose.Types.ObjectId(req.query.propertyId);
  const date = dateRangeFilter(req.query);
  if (date) match.date = date;

  const rows = await Expense.aggregate([
    { $match: match },
    { $group: { _id: '$category', totalAmount: { $sum: '$amount' }, count: { $sum: 1 } } },
  ]);

  const total = rows.reduce((sum, row) => sum + row.totalAmount, 0);
  res.json({ total, byCategory: rows });
});

export const occupancy = asyncHandler(async (req, res) => {
  const filter = { owner: req.user.id };
  if (req.query.propertyId) filter._id = req.query.propertyId;

  const properties = await Property.find(filter);
  let totalUnits = 0;
  let occupiedUnits = 0;
  for (const property of properties) {
    totalUnits += property.units.length;
    occupiedUnits += property.units.filter((u) => u.isOccupied).length;
  }

  const activeLeases = await Lease.countDocuments({ landlord: req.user.id, status: 'active' });

  res.json({
    totalUnits,
    occupiedUnits,
    vacantUnits: totalUnits - occupiedUnits,
    occupancyRate: totalUnits ? occupiedUnits / totalUnits : 0,
    activeLeases,
  });
});

function endOfDayFromDateString(dateStr) {
  const d = new Date(dateStr);
  d.setUTCHours(23, 59, 59, 999);
  return d;
}

export const financialSummary = asyncHandler(async (req, res) => {
  const landlordId = new mongoose.Types.ObjectId(req.user.id);
  const now = new Date();
  const from = req.query.from ? new Date(req.query.from) : new Date(now.getFullYear(), 0, 1);
  const to = req.query.to ? endOfDayFromDateString(req.query.to) : now;
  const propertyFilter = req.query.propertyId ? new mongoose.Types.ObjectId(req.query.propertyId) : null;

  const paymentMatch = { landlord: landlordId, paidAt: { $gte: from, $lte: to } };
  const expenseMatch = { landlord: landlordId, date: { $gte: from, $lte: to } };
  if (propertyFilter) {
    paymentMatch.property = propertyFilter;
    expenseMatch.property = propertyFilter;
  }

  const [incomeRows, expenseRows, properties] = await Promise.all([
    Payment.aggregate([
      { $match: paymentMatch },
      {
        $group: {
          _id: { property: '$property', month: { $dateToString: { format: '%Y-%m', date: '$paidAt' } } },
          income: { $sum: '$amount' },
        },
      },
    ]),
    Expense.aggregate([
      { $match: expenseMatch },
      {
        $group: {
          _id: { property: '$property', month: { $dateToString: { format: '%Y-%m', date: '$date' } } },
          expenses: { $sum: '$amount' },
        },
      },
    ]),
    Property.find({ owner: req.user.id }).select('name'),
  ]);

  const propertyNames = {};
  for (const p of properties) propertyNames[p._id.toString()] = p.name;

  const byKey = new Map();
  const keyFor = (propertyId, month) => `${propertyId}|${month}`;

  for (const row of incomeRows) {
    const propId = row._id.property.toString();
    byKey.set(keyFor(propId, row._id.month), { property: propId, month: row._id.month, income: row.income, expenses: 0 });
  }
  for (const row of expenseRows) {
    const propId = row._id.property.toString();
    const key = keyFor(propId, row._id.month);
    const existing = byKey.get(key);
    if (existing) existing.expenses += row.expenses;
    else byKey.set(key, { property: propId, month: row._id.month, income: 0, expenses: row.expenses });
  }

  const rows = [...byKey.values()];

  const byPropertyMap = new Map();
  for (const row of rows) {
    const existing = byPropertyMap.get(row.property) || {
      propertyId: row.property,
      propertyName: propertyNames[row.property] || 'Unknown property',
      income: 0,
      expenses: 0,
    };
    existing.income += row.income;
    existing.expenses += row.expenses;
    byPropertyMap.set(row.property, existing);
  }
  const byProperty = [...byPropertyMap.values()]
    .map((p) => ({ ...p, net: p.income - p.expenses }))
    .sort((a, b) => b.income - a.income);

  const byMonthMap = new Map();
  for (const row of rows) {
    const existing = byMonthMap.get(row.month) || { month: row.month, income: 0, expenses: 0 };
    existing.income += row.income;
    existing.expenses += row.expenses;
    byMonthMap.set(row.month, existing);
  }
  const monthly = [...byMonthMap.values()]
    .sort((a, b) => a.month.localeCompare(b.month))
    .map((m) => ({ ...m, net: m.income - m.expenses }));

  const totalIncome = byProperty.reduce((sum, p) => sum + p.income, 0);
  const totalExpenses = byProperty.reduce((sum, p) => sum + p.expenses, 0);

  res.json({
    from: from.toISOString(),
    to: to.toISOString(),
    totalIncome,
    totalExpenses,
    netProfit: totalIncome - totalExpenses,
    byProperty,
    monthly,
  });
});

export const balanceSheet = asyncHandler(async (req, res) => {
  const landlordId = new mongoose.Types.ObjectId(req.user.id);
  const asOf = req.query.asOf ? endOfDayFromDateString(req.query.asOf) : new Date();
  const propertyFilter = req.query.propertyId ? new mongoose.Types.ObjectId(req.query.propertyId) : null;

  const invoiceMatch = { landlord: landlordId, status: { $in: ['sent', 'partial', 'overdue'] }, createdAt: { $lte: asOf } };
  const paymentMatch = { landlord: landlordId, paidAt: { $lte: asOf } };
  const expenseMatch = { landlord: landlordId, date: { $lte: asOf } };
  const leaseMatch = { landlord: landlordId, status: 'active', startDate: { $lte: asOf } };
  if (propertyFilter) {
    invoiceMatch.property = propertyFilter;
    paymentMatch.property = propertyFilter;
    expenseMatch.property = propertyFilter;
    leaseMatch.property = propertyFilter;
  }

  const [receivableRows, cashRows, expenseRows, depositRows, advanceRows] = await Promise.all([
    Invoice.aggregate([
      { $match: invoiceMatch },
      { $group: { _id: null, outstanding: { $sum: { $subtract: ['$total', '$amountPaid'] } } } },
    ]),
    Payment.aggregate([{ $match: paymentMatch }, { $group: { _id: null, total: { $sum: '$amount' } } }]),
    Expense.aggregate([{ $match: expenseMatch }, { $group: { _id: null, total: { $sum: '$amount' } } }]),
    Lease.aggregate([{ $match: leaseMatch }, { $group: { _id: null, total: { $sum: '$securityDeposit' } } }]),
    Lease.aggregate([{ $match: leaseMatch }, { $group: { _id: null, total: { $sum: '$advanceRent' } } }]),
  ]);

  const accountsReceivable = receivableRows[0]?.outstanding || 0;
  const cashCollected = cashRows[0]?.total || 0;
  const expensesPaid = expenseRows[0]?.total || 0;
  const securityDepositsHeld = depositRows[0]?.total || 0;
  const advanceRentHeld = advanceRows[0]?.total || 0;

  const cash = cashCollected - expensesPaid;
  const totalAssets = cash + accountsReceivable;
  const totalLiabilities = securityDepositsHeld + advanceRentHeld;
  const netEquity = totalAssets - totalLiabilities;

  res.json({
    asOf: asOf.toISOString(),
    assets: {
      cash,
      accountsReceivable,
      total: totalAssets,
    },
    liabilities: {
      securityDepositsHeld,
      advanceRentHeld,
      total: totalLiabilities,
    },
    equity: netEquity,
  });
});

export const dashboardSummary = asyncHandler(async (req, res) => {
  const landlordId = new mongoose.Types.ObjectId(req.user.id);

  const properties = await Property.find({ owner: req.user.id });
  const propertyIds = properties.map((p) => p._id);

  let totalUnits = 0;
  let occupiedUnits = 0;
  for (const property of properties) {
    totalUnits += property.units.length;
    occupiedUnits += property.units.filter((u) => u.isOccupied).length;
  }

  const [invoiceRows, maintenanceRows, activeTenantIds, totalTenants, totalLeases] = await Promise.all([
    Invoice.aggregate([
      { $match: { landlord: landlordId } },
      { $group: { _id: '$status', totalAmount: { $sum: '$total' }, amountPaid: { $sum: '$amountPaid' } } },
    ]),
    MaintenanceTicket.aggregate([
      { $match: { property: { $in: propertyIds } } },
      { $group: { _id: '$status', count: { $sum: 1 } } },
    ]),
    Lease.distinct('tenant', { landlord: req.user.id, status: 'active' }),
    TenantProfile.countDocuments({ addedBy: req.user.id }),
    Lease.countDocuments({ landlord: req.user.id }),
  ]);

  const maintenanceByStatus = {};
  for (const row of maintenanceRows) maintenanceByStatus[row._id] = row.count;

  let rentCollected = 0;
  let rentPending = 0;
  let rentOverdue = 0;
  for (const row of invoiceRows) {
    const remaining = row.totalAmount - row.amountPaid;
    rentCollected += row.amountPaid;
    if (row._id === 'overdue') rentOverdue += remaining;
    else if (row._id === 'sent' || row._id === 'partial') rentPending += remaining;
  }

  res.json({
    totalProperties: properties.length,
    totalUnits,
    occupiedUnits,
    vacantUnits: totalUnits - occupiedUnits,
    activeTenants: activeTenantIds.length,
    totalTenants,
    totalLeases,
    rentCollected,
    rentPending,
    rentOverdue,
    maintenanceOpen: maintenanceByStatus.open || 0,
    maintenanceInProgress: maintenanceByStatus.in_progress || 0,
  });
});
