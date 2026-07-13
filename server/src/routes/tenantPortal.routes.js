import { Router } from 'express';
import { auth } from '../middleware/auth.js';
import { requireRole } from '../middleware/roles.js';
import * as controller from '../controllers/tenantPortal.controller.js';

const router = Router();

router.use(auth, requireRole('tenant'));

router.get('/profile', controller.getProfile);
router.get('/leases', controller.listLeases);
router.get('/invoices', controller.listInvoices);
router.get('/invoices/:id', controller.getInvoice);
router.get('/invoices/:id/payments', controller.listPayments);
router.get('/invoices/:id/payments/:paymentId', controller.getPayment);

export default router;
