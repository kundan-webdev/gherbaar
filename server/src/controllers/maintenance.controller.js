import { MaintenanceTicket } from '../models/MaintenanceTicket.js';
import { Property } from '../models/Property.js';
import { User } from '../models/User.js';
import { ApiError } from '../utils/ApiError.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { getPagination, paginatedResponse } from '../utils/pagination.js';
import { notify } from '../services/notificationService.js';
import { getManagerPropertyIds } from '../utils/managerAccess.js';
import { storeFiles } from '../services/storageService.js';

function maintenanceLinkForRole(role, ticketId) {
  if (role === 'tenant') return `/tenant/maintenance/${ticketId}`;
  if (role === 'manager') return `/manager/maintenance/${ticketId}`;
  return `/maintenance/${ticketId}`;
}

async function findVisibleOrThrow(id, user) {
  const ticket = await MaintenanceTicket.findById(id);
  if (!ticket) throw ApiError.notFound('Maintenance ticket not found');
  if (user.role === 'admin' || ticket.raisedBy.toString() === user.id) return ticket;

  if (user.role === 'manager') {
    const propertyIds = await getManagerPropertyIds(user.id);
    if (propertyIds.includes(ticket.property.toString())) return ticket;
    throw ApiError.notFound('Maintenance ticket not found');
  }

  const property = await Property.findOne({ _id: ticket.property, owner: user.id });
  if (!property) throw ApiError.notFound('Maintenance ticket not found');
  return ticket;
}

export const list = asyncHandler(async (req, res) => {
  const { page, limit, skip } = getPagination(req.query);
  const filter = {};
  if (req.query.status) filter.status = req.query.status;
  if (req.query.priority) filter.priority = req.query.priority;
  if (req.query.category) filter.category = req.query.category;

  if (req.user.role === 'landlord') {
    const ownedPropertyIds = await Property.find({ owner: req.user.id }).distinct('_id');
    if (req.query.propertyId) {
      const owned = ownedPropertyIds.some((id) => id.toString() === req.query.propertyId);
      filter.property = owned ? req.query.propertyId : null;
    } else {
      filter.property = { $in: ownedPropertyIds };
    }
  } else if (req.user.role === 'manager') {
    const managerPropertyIds = await getManagerPropertyIds(req.user.id);
    if (req.query.propertyId) {
      filter.property = managerPropertyIds.includes(req.query.propertyId) ? req.query.propertyId : null;
    } else {
      filter.property = { $in: managerPropertyIds };
    }
  } else if (req.user.role === 'tenant') {
    filter.raisedBy = req.user.id;
    if (req.query.propertyId) filter.property = req.query.propertyId;
  } else if (req.query.propertyId) {
    filter.property = req.query.propertyId;
  }

  const [items, total] = await Promise.all([
    MaintenanceTicket.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit),
    MaintenanceTicket.countDocuments(filter),
  ]);
  res.json(paginatedResponse(items, total, { page, limit }));
});

export const create = asyncHandler(async (req, res) => {
  const ticket = await MaintenanceTicket.create({ ...req.body, raisedBy: req.user.id });

  const property = await Property.findById(ticket.property).select('owner name');
  if (property && property.owner.toString() !== req.user.id) {
    const raiser = await User.findById(req.user.id).select('name');
    await notify(property.owner, {
      type: 'maintenance_created',
      title: 'New maintenance request',
      message: `${raiser?.name || 'A tenant'} raised "${ticket.title}" at ${property.name}`,
      link: `/maintenance/${ticket._id}`,
    });
  }

  res.status(201).json({ ticket });
});

export const getOne = asyncHandler(async (req, res) => {
  const ticket = await findVisibleOrThrow(req.params.id, req.user);
  await ticket.populate('comments.author', 'name role');
  await ticket.populate('raisedBy', 'name role');
  await ticket.populate('property', 'name city');
  res.json({ ticket });
});

const UPDATABLE_TICKET_FIELDS = ['title', 'description', 'priority', 'category', 'status', 'assignedTo'];

export const update = asyncHandler(async (req, res) => {
  const ticket = await findVisibleOrThrow(req.params.id, req.user);
  const previousStatus = ticket.status;
  for (const field of UPDATABLE_TICKET_FIELDS) {
    if (field in req.body) ticket[field] = req.body[field];
  }
  if (req.body.status === 'resolved' && !ticket.resolvedAt) ticket.resolvedAt = new Date();
  await ticket.save();

  if (req.body.status && req.body.status !== previousStatus && ticket.raisedBy.toString() !== req.user.id) {
    const raiser = await User.findById(ticket.raisedBy).select('role');
    await notify(ticket.raisedBy, {
      type: 'maintenance_status',
      title: 'Request status updated',
      message: `"${ticket.title}" is now ${ticket.status.replace('_', ' ')}`,
      link: maintenanceLinkForRole(raiser?.role, ticket._id),
    });
  }

  res.json({ ticket });
});

export const addComment = asyncHandler(async (req, res) => {
  const ticket = await findVisibleOrThrow(req.params.id, req.user);
  ticket.comments.push({ author: req.user.id, text: req.body.text });
  await ticket.save();

  const isRaiser = ticket.raisedBy.toString() === req.user.id;
  let recipientId;
  if (isRaiser) {
    const property = await Property.findById(ticket.property).select('owner');
    recipientId = property?.owner;
  } else {
    recipientId = ticket.raisedBy;
  }

  if (recipientId && recipientId.toString() !== req.user.id) {
    const recipient = await User.findById(recipientId).select('role');
    await notify(recipientId, {
      type: 'maintenance_comment',
      title: 'New update on your request',
      message: `New reply on "${ticket.title}"`,
      link: maintenanceLinkForRole(recipient?.role, ticket._id),
    });
  }

  res.status(201).json({ ticket });
});

const MAX_PHOTOS_PER_TICKET = 5;

export const uploadPhotos = asyncHandler(async (req, res) => {
  const ticket = await findVisibleOrThrow(req.params.id, req.user);

  if (!req.files || req.files.length === 0) {
    throw ApiError.badRequest('No photos were uploaded');
  }
  if (ticket.photos.length + req.files.length > MAX_PHOTOS_PER_TICKET) {
    throw ApiError.badRequest(`A ticket can have at most ${MAX_PHOTOS_PER_TICKET} photos`);
  }

  const urls = await storeFiles(req.files, 'maintenance');
  ticket.photos.push(...urls);
  await ticket.save();
  res.status(201).json({ ticket });
});
