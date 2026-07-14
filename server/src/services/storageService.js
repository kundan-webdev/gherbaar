import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { fileURLToPath } from 'url';
import { v2 as cloudinary } from 'cloudinary';
import { env } from '../config/env.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
export const uploadsRoot = path.join(__dirname, '..', '..', 'uploads');

export const isCloudStorageEnabled = Boolean(
  env.cloudinary.cloudName && env.cloudinary.apiKey && env.cloudinary.apiSecret
);

if (isCloudStorageEnabled) {
  cloudinary.config({
    cloud_name: env.cloudinary.cloudName,
    api_key: env.cloudinary.apiKey,
    api_secret: env.cloudinary.apiSecret,
  });
}

function uploadBufferToCloudinary(buffer, folder, publicId) {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder: `gharbaar/${folder}`, public_id: publicId, resource_type: 'auto' },
      (err, result) => {
        if (err) return reject(err);
        resolve(result.secure_url);
      }
    );
    stream.end(buffer);
  });
}

function saveBufferToDisk(buffer, folder, filename) {
  const dir = path.join(uploadsRoot, folder);
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(path.join(dir, filename), buffer);
  return `/uploads/${folder}/${filename}`;
}

export async function storeFile(file, folder) {
  const ext = path.extname(file.originalname).toLowerCase();
  const id = crypto.randomUUID();
  if (isCloudStorageEnabled) {
    return uploadBufferToCloudinary(file.buffer, folder, id);
  }
  return saveBufferToDisk(file.buffer, folder, `${id}${ext}`);
}

export async function storeFiles(files, folder) {
  return Promise.all(files.map((file) => storeFile(file, folder)));
}
