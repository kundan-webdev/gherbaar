import { Router } from 'express';
import { auth } from '../middleware/auth.js';
import { requireRole } from '../middleware/roles.js';
import { validate } from '../middleware/validate.js';
import { createLeaseRules } from '../validators/leases.validators.js';
import * as controller from '../controllers/leases.controller.js';

const router = Router();

router.use(auth);

router.get('/', requireRole('landlord', 'admin', 'manager'), controller.list);
router.get('/:id', requireRole('landlord', 'admin', 'manager'), controller.getOne);
router.post('/', requireRole('landlord', 'admin'), createLeaseRules, validate, controller.create);
router.patch('/:id', requireRole('landlord', 'admin'), controller.update);
router.post('/:id/terminate', requireRole('landlord', 'admin'), controller.terminate);

export default router;
