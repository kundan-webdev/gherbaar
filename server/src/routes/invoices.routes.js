import { Router } from 'express';
import { auth } from '../middleware/auth.js';
import { requireRole } from '../middleware/roles.js';
import { validate } from '../middleware/validate.js';
import { createInvoiceRules, updateInvoiceRules, updateStatusRules, recordPaymentRules } from '../validators/invoices.validators.js';
import * as controller from '../controllers/invoices.controller.js';

const router = Router();

router.use(auth, requireRole('landlord', 'admin'));

router.get('/', controller.list);
router.post('/', createInvoiceRules, validate, controller.create);
router.get('/:id', controller.getOne);
router.patch('/:id', updateInvoiceRules, validate, controller.update);
router.patch('/:id/status', updateStatusRules, validate, controller.updateStatus);
router.get('/:id/qr', controller.getQr);
router.post('/:id/payments', recordPaymentRules, validate, controller.recordPayment);
router.get('/:id/payments', controller.listPayments);
router.get('/:id/payments/:paymentId', controller.getPayment);

export default router;
