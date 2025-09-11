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

  // 🔑 CLAVE: Token específico por tenant
  const getTokenKey = (slug: string) => `auth_token_${slug}`;

  // Verificar token existente cuando cambia el tenant
  useEffect(() => {
    const checkAuth = async () => {
      if (!tenantSlug) {
        setLoading(false);
        return;
      }

      // Buscar token específico para este tenant
      const token = localStorage.getItem(getTokenKey(tenantSlug));
      
      if (token) {
        try {
          // Configurar el token en el cliente axios
          apiService.setAuthToken(token);
          
          // Aquí deberías verificar el token con el backend
          // Por ahora simulamos que está válido
          // TODO: Implementar endpoint de verificación
          console.log(`Token found for tenant ${tenantSlug}, assuming valid`);
          
          // Si tienes un endpoint de verificación, descomenta esto:
          // const userData = await apiService.verifyToken();
          // setUser(userData.user);
          // setTenant(userData.tenant); 
          // setCompany(userData.company);
          
        } catch (error) {
          console.log(`Invalid token for tenant ${tenantSlug}, removing`);
          localStorage.removeItem(getTokenKey(tenantSlug));
          apiService.setAuthToken('');
        }
      } else {
        console.log(`No token found for tenant ${tenantSlug}`);
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
    
    // 🔑 Guardar token con clave específica del tenant
    localStorage.setItem(getTokenKey(tenantSlug), response.token);
    apiService.setAuthToken(response.token);
  };

  const logout = () => {
    if (tenantSlug) {
      // 🔑 Limpiar token específico del tenant
      localStorage.removeItem(getTokenKey(tenantSlug));
    }
    
    setUser(null);
    setTenant(null);
    setCompany(null);
    apiService.setAuthToken('');
    
    // Redirigir al login del mismo tenant
    navigate(`/time-tracker/${tenantSlug}`);
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