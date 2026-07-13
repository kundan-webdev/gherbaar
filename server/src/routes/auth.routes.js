import { Router } from 'express';
import { registerHandler, loginHandler, meHandler, changePasswordHandler } from '../controllers/auth.controller.js';
import { registerRules, loginRules, changePasswordRules } from '../validators/auth.validators.js';
import { validate } from '../middleware/validate.js';
import { auth } from '../middleware/auth.js';

const router = Router();

router.post('/register', registerRules, validate, registerHandler);
router.post('/login', loginRules, validate, loginHandler);
router.get('/me', auth, meHandler);
router.post('/change-password', auth, changePasswordRules, validate, changePasswordHandler);

export default router;
