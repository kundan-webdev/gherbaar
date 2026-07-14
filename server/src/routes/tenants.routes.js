import { Router } from 'express';
import { auth } from '../middleware/auth.js';
import { requireRole } from '../middleware/roles.js';
import { validate } from '../middleware/validate.js';
import { createTenantRules, updateTenantRules } from '../validators/tenants.validators.js';
import { uploadTenantDocuments } from '../middleware/upload.js';
import { ApiError } from '../utils/ApiError.js';
import * as controller from '../controllers/tenants.controller.js';

const router = Router();

router.use(auth);

function handleDocumentUpload(req, res, next) {
  uploadTenantDocuments.array('documents', 5)(req, res, (err) => {
    if (err) return next(ApiError.badRequest(err.message));
    next();
  });
}

router.get('/', requireRole('landlord', 'admin', 'manager'), controller.list);
router.get('/:id', requireRole('landlord', 'admin', 'manager'), controller.getOne);
router.post('/', requireRole('landlord', 'admin'), createTenantRules, validate, controller.create);
router.patch('/:id', requireRole('landlord', 'admin'), updateTenantRules, validate, controller.update);
router.post('/:id/documents', requireRole('landlord', 'admin'), handleDocumentUpload, controller.uploadDocuments);
router.delete('/:id', requireRole('landlord', 'admin'), controller.remove);

export default router;
