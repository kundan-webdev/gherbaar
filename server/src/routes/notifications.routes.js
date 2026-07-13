import { Router } from 'express';
import { auth } from '../middleware/auth.js';
import * as controller from '../controllers/notifications.controller.js';

const router = Router();

router.use(auth);

router.get('/', controller.list);
router.get('/unread-count', controller.unreadCount);
router.patch('/:id/read', controller.markRead);
router.patch('/read-all', controller.markAllRead);

export default router;
