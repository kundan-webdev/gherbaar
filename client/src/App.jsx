import React from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import { ProtectedRoute } from './components/ProtectedRoute.jsx';
import { AppLayout } from './layouts/AppLayout.jsx';
import { TenantLayout } from './layouts/TenantLayout.jsx';
import { ManagerLayout } from './layouts/ManagerLayout.jsx';
import LoginPage from './pages/auth/LoginPage.jsx';
import RegisterPage from './pages/auth/RegisterPage.jsx';
import ChangePasswordPage from './pages/auth/ChangePasswordPage.jsx';
import DashboardPage from './pages/dashboard/DashboardPage.jsx';
import TenantHomePage from './pages/tenant/TenantHomePage.jsx';
import TenantInvoiceDetailPage from './pages/tenant/TenantInvoiceDetailPage.jsx';
import TenantMaintenancePage from './pages/tenant/TenantMaintenancePage.jsx';
import TenantMaintenanceDetailPage from './pages/tenant/TenantMaintenanceDetailPage.jsx';
import PropertiesListPage from './pages/properties/PropertiesListPage.jsx';
import TenantsListPage from './pages/tenants/TenantsListPage.jsx';
import LeasesListPage from './pages/leases/LeasesListPage.jsx';
import InvoiceGeneratePage from './pages/billing/InvoiceGeneratePage.jsx';
import InvoiceHistoryPage from './pages/billing/InvoiceHistoryPage.jsx';
import InvoiceDetailPage from './pages/billing/InvoiceDetailPage.jsx';
import ReceiptDetailPage from './pages/billing/ReceiptDetailPage.jsx';
import TenantReceiptDetailPage from './pages/tenant/TenantReceiptDetailPage.jsx';
import ExpensesPage from './pages/expenses/ExpensesPage.jsx';
import MaintenanceListPage from './pages/maintenance/MaintenanceListPage.jsx';
import MaintenanceDetailPage from './pages/maintenance/MaintenanceDetailPage.jsx';
import ReportsPage from './pages/reports/ReportsPage.jsx';
import FinancialReportsPage from './pages/reports/FinancialReportsPage.jsx';
import ManagersListPage from './pages/managers/ManagersListPage.jsx';
import ManagerHomePage from './pages/manager/ManagerHomePage.jsx';
import ManagerPropertiesPage from './pages/manager/ManagerPropertiesPage.jsx';
import ManagerTenantsPage from './pages/manager/ManagerTenantsPage.jsx';

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route
        path="/change-password"
        element={
          <ProtectedRoute>
            <ChangePasswordPage />
          </ProtectedRoute>
        }
      />

      <Route
        element={
          <ProtectedRoute roles={['landlord', 'admin']}>
            <AppLayout />
          </ProtectedRoute>
        }
      >
        <Route path="/" element={<DashboardPage />} />
        <Route path="/properties" element={<PropertiesListPage />} />
        <Route path="/tenants" element={<TenantsListPage />} />
        <Route path="/leases" element={<LeasesListPage />} />
        <Route path="/billing" element={<InvoiceHistoryPage />} />
        <Route path="/billing/generate" element={<InvoiceGeneratePage />} />
        <Route path="/billing/:id" element={<InvoiceDetailPage />} />
        <Route path="/billing/:invoiceId/payments/:paymentId" element={<ReceiptDetailPage />} />
        <Route path="/expenses" element={<ExpensesPage />} />
        <Route path="/maintenance" element={<MaintenanceListPage />} />
        <Route path="/maintenance/:id" element={<MaintenanceDetailPage />} />
        <Route path="/reports" element={<ReportsPage />} />
        <Route path="/reports/financials" element={<FinancialReportsPage />} />
        <Route path="/managers" element={<ManagersListPage />} />
      </Route>

      <Route
        element={
          <ProtectedRoute roles={['tenant']}>
            <TenantLayout />
          </ProtectedRoute>
        }
      >
        <Route path="/tenant" element={<TenantHomePage />} />
        <Route path="/tenant/invoices/:id" element={<TenantInvoiceDetailPage />} />
        <Route path="/tenant/invoices/:invoiceId/payments/:paymentId" element={<TenantReceiptDetailPage />} />
        <Route path="/tenant/maintenance" element={<TenantMaintenancePage />} />
        <Route path="/tenant/maintenance/:id" element={<TenantMaintenanceDetailPage />} />
      </Route>

      <Route
        element={
          <ProtectedRoute roles={['manager']}>
            <ManagerLayout />
          </ProtectedRoute>
        }
      >
        <Route path="/manager" element={<ManagerHomePage />} />
        <Route path="/manager/properties" element={<ManagerPropertiesPage />} />
        <Route path="/manager/tenants" element={<ManagerTenantsPage />} />
        <Route path="/manager/maintenance" element={<MaintenanceListPage />} />
        <Route path="/manager/maintenance/:id" element={<MaintenanceDetailPage />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
