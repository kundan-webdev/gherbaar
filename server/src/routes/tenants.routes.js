import { Router } from 'express';
import { auth } from '../middleware/auth.js';
import { requireRole } from '../middleware/roles.js';
import { validate } from '../middleware/validate.js';
import { createTenantRules } from '../validators/tenants.validators.js';
import * as controller from '../controllers/tenants.controller.js';

const router = Router();

router.use(auth);

router.get('/', requireRole('landlord', 'admin', 'manager'), controller.list);
router.get('/:id', requireRole('landlord', 'admin', 'manager'), controller.getOne);
router.post('/', requireRole('landlord', 'admin'), createTenantRules, validate, controller.create);
router.patch('/:id', requireRole('landlord', 'admin'), controller.update);
router.delete('/:id', requireRole('landlord', 'admin'), controller.remove);

export default router;
