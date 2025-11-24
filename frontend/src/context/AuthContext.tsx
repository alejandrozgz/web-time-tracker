// File: frontend/src/context/AuthContext.tsx (UPDATED)
import React, { createContext, useContext, useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import apiService from '../services/api';
import { User, Tenant, Company } from '../types';

interface AuthContextType {
  user: User | null;
  tenant: Tenant | null;
  company: Company | null;
  login: (username: string, password: string, companyId: string) => Promise<void>;
  logout: () => void;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { tenantSlug } = useParams<{ tenantSlug: string }>();
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [tenant, setTenant] = useState<Tenant | null>(null);
  const [company, setCompany] = useState<Company | null>(null);
  const [loading, setLoading] = useState(true);

  // 🔑 CLAVE: Token y user data específicos por tenant
  const getTokenKey = (slug: string) => `auth_token_${slug}`;
  const getUserKey = (slug: string) => `auth_user_${slug}`;
  const getTenantKey = (slug: string) => `auth_tenant_${slug}`;
  const getCompanyKey = (slug: string) => `auth_company_${slug}`;

  // Verificar token existente cuando cambia el tenant
  useEffect(() => {
    const checkAuth = async () => {
      if (!tenantSlug) {
        setLoading(false);
        return;
      }

      // Buscar token específico para este tenant
      const token = localStorage.getItem(getTokenKey(tenantSlug));
      const userData = localStorage.getItem(getUserKey(tenantSlug));
      const tenantData = localStorage.getItem(getTenantKey(tenantSlug));
      const companyData = localStorage.getItem(getCompanyKey(tenantSlug));

      if (token && userData && tenantData && companyData) {
        try {
          // Configurar el token en el cliente axios
          apiService.setAuthToken(token);

          // Restaurar datos del usuario desde localStorage
          setUser(JSON.parse(userData));
          setTenant(JSON.parse(tenantData));
          setCompany(JSON.parse(companyData));

          console.log(`✅ Session restored for tenant ${tenantSlug}`);

        } catch (error) {
          console.log(`❌ Invalid stored data for tenant ${tenantSlug}, removing`);
          localStorage.removeItem(getTokenKey(tenantSlug));
          localStorage.removeItem(getUserKey(tenantSlug));
          localStorage.removeItem(getTenantKey(tenantSlug));
          localStorage.removeItem(getCompanyKey(tenantSlug));
          apiService.setAuthToken('');
          setUser(null);
          setTenant(null);
          setCompany(null);
        }
      } else {
        console.log(`No session found for tenant ${tenantSlug}`);
        // Limpiar cualquier token previo
        apiService.setAuthToken('');
        setUser(null);
        setTenant(null);
        setCompany(null);
      }

      setLoading(false);
    };

    checkAuth();
  }, [tenantSlug]); // 🔑 IMPORTANTE: Se ejecuta cada vez que cambia tenantSlug

  const login = async (username: string, password: string, companyId: string) => {
    if (!tenantSlug) throw new Error('No tenant specified');

    const response = await apiService.login({ username, password, companyId });

    setUser(response.user);
    setTenant(response.tenant);
    setCompany(response.company);

    // 🔑 Guardar token y datos con clave específica del tenant
    localStorage.setItem(getTokenKey(tenantSlug), response.token);
    localStorage.setItem(getUserKey(tenantSlug), JSON.stringify(response.user));
    localStorage.setItem(getTenantKey(tenantSlug), JSON.stringify(response.tenant));
    localStorage.setItem(getCompanyKey(tenantSlug), JSON.stringify(response.company));

    apiService.setAuthToken(response.token);

    console.log(`✅ Session saved for tenant ${tenantSlug}`);
  };

  const logout = () => {
    if (tenantSlug) {
      // 🔑 Limpiar token y datos específicos del tenant
      localStorage.removeItem(getTokenKey(tenantSlug));
      localStorage.removeItem(getUserKey(tenantSlug));
      localStorage.removeItem(getTenantKey(tenantSlug));
      localStorage.removeItem(getCompanyKey(tenantSlug));

      console.log(`✅ Session cleared for tenant ${tenantSlug}`);
    }

    setUser(null);
    setTenant(null);
    setCompany(null);
    apiService.setAuthToken('');

    // Redirigir al login del mismo tenant
    navigate(`/${tenantSlug}`);
  };

  return (
    <AuthContext.Provider value={{ user, tenant, company, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};