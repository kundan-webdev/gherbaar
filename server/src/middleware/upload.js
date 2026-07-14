import multer from 'multer';

const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const ALLOWED_DOCUMENT_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'];

function fileFilter(allowedMimeTypes, errorMessage) {
  return (req, file, cb) => {
    if (!allowedMimeTypes.includes(file.mimetype)) {
      return cb(new Error(errorMessage));
    }
    cb(null, true);
  };
}

export const uploadMaintenancePhotos = multer({
  storage: multer.memoryStorage(),
  fileFilter: fileFilter(ALLOWED_MIME_TYPES, 'Only JPEG, PNG, or WEBP images are allowed'),
  limits: { fileSize: 5 * 1024 * 1024, files: 5 },
});

export const uploadTenantDocuments = multer({
  storage: multer.memoryStorage(),
  fileFilter: fileFilter(ALLOWED_DOCUMENT_MIME_TYPES, 'Only JPEG, PNG, WEBP, or PDF files are allowed'),
  limits: { fileSize: 8 * 1024 * 1024, files: 5 },
});

export const uploadTenantPhoto = multer({
  storage: multer.memoryStorage(),
  fileFilter: fileFilter(ALLOWED_MIME_TYPES, 'Only JPEG, PNG, or WEBP images are allowed'),
  limits: { fileSize: 5 * 1024 * 1024, files: 1 },
});
