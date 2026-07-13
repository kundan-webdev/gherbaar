import { Router } from 'express';
import authRoutes from './auth.routes.js';
import propertiesRoutes from './properties.routes.js';
import tenantsRoutes from './tenants.routes.js';
import leasesRoutes from './leases.routes.js';
import invoicesRoutes from './invoices.routes.js';
import expensesRoutes from './expenses.routes.js';
import maintenanceRoutes from './maintenance.routes.js';
import reportsRoutes from './reports.routes.js';
import tenantPortalRoutes from './tenantPortal.routes.js';
import notificationsRoutes from './notifications.routes.js';
import managersRoutes from './managers.routes.js';

const router = Router();

router.use('/auth', authRoutes);
router.use('/properties', propertiesRoutes);
router.use('/tenants', tenantsRoutes);
router.use('/leases', leasesRoutes);
router.use('/managers', managersRoutes);
router.use('/invoices', invoicesRoutes);
router.use('/expenses', expensesRoutes);
router.use('/maintenance', maintenanceRoutes);
router.use('/reports', reportsRoutes);
router.use('/me', tenantPortalRoutes);
router.use('/notifications', notificationsRoutes);

export default router;
