import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, Tenant, Company } from '../types';
import apiService from '../services/api';

interface AuthContextType {
  user: User | null;
  tenant: Tenant | null;
  company: Company | null;
  login: (username: string, password: string, companyId: string) => Promise<void>;
  logout: () => void;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [tenant, setTenant] = useState<Tenant | null>(null);
  const [company, setCompany] = useState<Company | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('auth-token');
    const userData = localStorage.getItem('user-data');
    
    if (token && userData) {
      try {
        const data = JSON.parse(userData);
        setUser(data.user);
        setTenant(data.tenant);
        setCompany(data.company);
      } catch (error) {
        console.error('Error parsing stored auth data:', error);
        localStorage.removeItem('auth-token');
        localStorage.removeItem('user-data');
      }
    }
    
    setLoading(false);
  }, []);

  const login = async (username: string, password: string, companyId: string) => {
    try {
      const response = await apiService.login({ username, password, companyId });
      
      localStorage.setItem('auth-token', response.token);
      localStorage.setItem('user-data', JSON.stringify(response));
      
      setUser(response.user);
      setTenant(response.tenant);
      setCompany(response.company);
    } catch (error: any) {
      throw new Error(error.response?.data?.error || 'Login failed');
    }
  };

  const logout = () => {
    localStorage.removeItem('auth-token');
    localStorage.removeItem('user-data');
    setUser(null);
    setTenant(null);
    setCompany(null);
  };

  return (
    <AuthContext.Provider value={{ user, tenant, company, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};