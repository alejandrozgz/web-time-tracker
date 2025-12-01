// File: frontend/src/App.tsx
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import TenantApp from './components/tenant/TenantApp';
import './i18n';

// Admin Portal Components
import { AdminAuthProvider } from './contexts/AdminAuthContext';
import AdminLogin from './components/admin/AdminLogin';
import ProtectedAdminRoute from './components/admin/ProtectedAdminRoute';
import AdminLayout from './components/admin/AdminLayout';
import AdminDashboard from './components/admin/AdminDashboard';
import TenantsManager from './components/admin/TenantsManager';
import CompaniesManager from './components/admin/CompaniesManager';
import TimeEntriesViewer from './components/admin/TimeEntriesViewer';
import AdminSyncLogsViewer from './components/admin/AdminSyncLogsViewer';
import UserActivityAnalytics from './components/admin/UserActivityAnalytics';
import SystemLogsViewer from './components/admin/SystemLogsViewer';
import { useAdminAuth } from './contexts/AdminAuthContext';

// Wrapper component to use the hook
const AdminLoginWrapper: React.FC = () => {
  const { login } = useAdminAuth();
  return <AdminLogin onLogin={login} />;
};

const App: React.FC = () => {
  return (
    <Router>
      <AdminAuthProvider>
        <div className="App">
          <Routes>
          {/* Ruta raíz redirige al sitio principal */}
          <Route
            path="/"
            element={
              <Navigate
                to="https://atpdynamicssolutions.com"
                replace
              />
            }
          />

          {/* PORTAL DE ADMINISTRADOR */}
          {/* Login de Admin */}
          <Route path="/admin/login" element={<AdminLoginWrapper />} />

          {/* Rutas protegidas de Admin */}
          <Route
            path="/admin"
            element={
              <ProtectedAdminRoute>
                <AdminLayout />
              </ProtectedAdminRoute>
            }
          >
            <Route index element={<AdminDashboard />} />
            <Route path="tenants" element={<TenantsManager />} />
            <Route path="companies" element={<CompaniesManager />} />
            <Route path="time-entries" element={<TimeEntriesViewer />} />
            <Route path="sync-logs" element={<AdminSyncLogsViewer />} />
            <Route path="user-activity" element={<UserActivityAnalytics />} />
            <Route path="system-logs" element={<SystemLogsViewer />} />
          </Route>

          {/* Rutas con tenant slug */}
          <Route path="/:tenantSlug/*" element={<TenantApp />} />

          {/* Fallback - también redirige al sitio principal */}
          <Route
            path="*"
            element={
              <Navigate
                to="https://atpdynamicssolutions.com"
                replace
              />
            }
          />
          </Routes>

          <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: '#363636',
              color: '#fff',
              borderRadius: '8px',
              fontSize: '14px',
            },
            success: {
              duration: 3000,
              style: {
                background: '#059669',
                color: '#fff',
              },
            },
            error: {
              duration: 5000,
              style: {
                background: '#dc2626',
                color: '#fff',
              },
            },
          }}
          />
        </div>
      </AdminAuthProvider>
    </Router>
  );
};

export default App;