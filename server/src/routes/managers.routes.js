import { Router } from 'express';
import { auth } from '../middleware/auth.js';
import { requireRole } from '../middleware/roles.js';
import { validate } from '../middleware/validate.js';
import { createManagerRules, updateManagerRules } from '../validators/managers.validators.js';
import * as controller from '../controllers/managers.controller.js';

const router = Router();

router.use(auth, requireRole('landlord', 'admin'));

router.get('/', controller.list);
router.post('/', createManagerRules, validate, controller.create);
router.get('/:id', controller.getOne);
router.patch('/:id', updateManagerRules, validate, controller.update);
router.delete('/:id', controller.remove);

export default router;
