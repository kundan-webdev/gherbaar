import { ManagerProfile } from '../models/ManagerProfile.js';

export async function getManagerPropertyIds(userId) {
  const profile = await ManagerProfile.findOne({ user: userId, isActive: true }).select('properties');
  return profile ? profile.properties.map((id) => id.toString()) : [];
}
