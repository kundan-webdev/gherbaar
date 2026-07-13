import { Notification } from '../models/Notification.js';
import { TenantProfile } from '../models/TenantProfile.js';

export async function notify(userId, { type, title, message, link }) {
  if (!userId) return null;
  return Notification.create({ user: userId, type, title, message, link });
}

export async function notifyTenantByProfile(tenantProfileId, payload) {
  const tenant = await TenantProfile.findById(tenantProfileId).select('user');
  if (!tenant?.user) return null;
  return notify(tenant.user, payload);
}
