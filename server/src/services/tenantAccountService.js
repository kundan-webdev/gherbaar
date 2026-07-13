import bcrypt from 'bcryptjs';
import { User } from '../models/User.js';
import { TenantProfile } from '../models/TenantProfile.js';
import { ApiError } from '../utils/ApiError.js';
import { generateTempPassword } from '../utils/generateTempPassword.js';

export async function createTenantWithAccount(landlordId, payload) {
  const email = payload.email.toLowerCase();

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
    role: 'tenant',
    phone: payload.phone,
    mustChangePassword: true,
  });

  let tenant;
  try {
    tenant = await TenantProfile.create({
      user: user._id,
      addedBy: landlordId,
      name: payload.name,
      phone: payload.phone,
      email,
      idProofType: payload.idProofType,
      idProofNumber: payload.idProofNumber,
      emergencyContact: payload.emergencyContact,
    });
  } catch (err) {
    await User.deleteOne({ _id: user._id });
    throw err;
  }

  return {
    tenant,
    credentials: { email, tempPassword },
  };
}
