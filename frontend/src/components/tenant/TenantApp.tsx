// File: frontend/src/components/tenant/TenantApp.tsx
import React, { useEffect } from 'react';
import { Routes, Route, Navigate, useParams } from 'react-router-dom';
import { AuthProvider, useAuth } from '../../context/AuthContext';
import Login from '../auth/Login';
import Dashboard from '../tracker/Dashboard';
import TimeEntries from '../tracker/TimeEntries';
import Header from '../ui/Header';
import apiService from '../../services/api';

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <div className="min-h-screen bg-gray-100">
      <Header onMenuToggle={() => {}} />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
    </div>
  );
};

const TenantRoutes: React.FC = () => {
  const { user, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
      </div>
    );
  }
  
  if (!user) {
    return <Login />;
  }
  
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/time-entries" element={<TimeEntries />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Layout>
  );
};

const TenantApp: React.FC = () => {
  const { tenantSlug } = useParams<{ tenantSlug: string }>();

  // Configurar API para este tenant
  useEffect(() => {
    if (tenantSlug) {
      apiService.setTenant(tenantSlug);
    }
  }, [tenantSlug]);

  return (
    <AuthProvider>
      <TenantRoutes />
    </AuthProvider>
  );
};

export default TenantApp;