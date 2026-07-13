import bcrypt from 'bcryptjs';
import { User } from '../models/User.js';
import { ManagerProfile } from '../models/ManagerProfile.js';
import { Property } from '../models/Property.js';
import { ApiError } from '../utils/ApiError.js';
import { generateTempPassword } from '../utils/generateTempPassword.js';

export async function assertPropertiesOwnedByLandlord(landlordId, propertyIds) {
  if (!propertyIds || propertyIds.length === 0) return;
  const owned = await Property.countDocuments({ _id: { $in: propertyIds }, owner: landlordId });
  if (owned !== new Set(propertyIds).size) {
    throw ApiError.badRequest('One or more properties are invalid or not owned by you');
  }
}

export async function createManagerWithAccount(landlordId, payload) {
  const email = payload.email.toLowerCase();
  const properties = payload.properties || [];

  await assertPropertiesOwnedByLandlord(landlordId, properties);

  const existing = await User.findOne({ email });
  if (existing) {
    throw ApiError.conflict('An account with this email already exists');
  }

  const tempPassword = generateTempPassword();
  const passwordHash = await bcrypt.hash(tempPassword, 10);

  const user = await User.create({
    name: payload.name,
    email,
    passwordHash,
    role: 'manager',
    phone: payload.phone,
    mustChangePassword: true,
  });

  let manager;
  try {
    manager = await ManagerProfile.create({
      user: user._id,
      addedBy: landlordId,
      name: payload.name,
      phone: payload.phone,
      email,
      properties,
    });
  } catch (err) {
    await User.deleteOne({ _id: user._id });
    throw err;
  }

  return {
    manager,
    credentials: { email, tempPassword },
  };
}
