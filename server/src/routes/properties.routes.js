import { Router } from 'express';
import { auth } from '../middleware/auth.js';
import { requireRole } from '../middleware/roles.js';
import { validate } from '../middleware/validate.js';
import { createPropertyRules, addUnitRules } from '../validators/properties.validators.js';
import * as controller from '../controllers/properties.controller.js';

const router = Router();

router.use(auth);

router.get('/', requireRole('landlord', 'admin', 'manager'), controller.list);
router.get('/:id', requireRole('landlord', 'admin', 'manager'), controller.getOne);
router.post('/', requireRole('landlord', 'admin'), createPropertyRules, validate, controller.create);
router.patch('/:id', requireRole('landlord', 'admin'), controller.update);
router.delete('/:id', requireRole('landlord', 'admin'), controller.remove);
router.post('/:id/units', requireRole('landlord', 'admin'), addUnitRules, validate, controller.addUnit);
router.patch('/:id/units/:unitId', requireRole('landlord', 'admin'), controller.updateUnit);

export default router;
