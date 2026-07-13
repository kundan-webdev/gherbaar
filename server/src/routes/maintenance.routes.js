import { Router } from 'express';
import { auth } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { createTicketRules, addCommentRules } from '../validators/maintenance.validators.js';
import { uploadMaintenancePhotos } from '../middleware/upload.js';
import { ApiError } from '../utils/ApiError.js';
import * as controller from '../controllers/maintenance.controller.js';

const router = Router();

router.use(auth);

function handlePhotoUpload(req, res, next) {
  uploadMaintenancePhotos.array('photos', 5)(req, res, (err) => {
    if (err) return next(ApiError.badRequest(err.message));
    next();
  });
}

router.get('/', controller.list);
router.post('/', createTicketRules, validate, controller.create);
router.get('/:id', controller.getOne);
router.patch('/:id', controller.update);
router.post('/:id/comments', addCommentRules, validate, controller.addComment);
router.post('/:id/photos', handlePhotoUpload, controller.uploadPhotos);

export default router;
