// File: frontend/src/App.tsx
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import TenantApp from './components/tenant/TenantApp';
import './i18n';

const App: React.FC = () => {
  return (
    <Router>
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
    </Router>
  );
};

export default App;