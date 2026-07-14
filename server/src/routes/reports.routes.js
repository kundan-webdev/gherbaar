import { Router } from 'express';
import { auth } from '../middleware/auth.js';
import { requireRole } from '../middleware/roles.js';
import * as controller from '../controllers/reports.controller.js';

const router = Router();

router.use(auth, requireRole('landlord', 'admin'));

router.get('/collection-summary', controller.collectionSummary);
router.get('/expense-summary', controller.expenseSummary);
router.get('/occupancy', controller.occupancy);
router.get('/dashboard', controller.dashboardSummary);
router.get('/financials', controller.financialSummary);
router.get('/balance-sheet', controller.balanceSheet);

export default router;
