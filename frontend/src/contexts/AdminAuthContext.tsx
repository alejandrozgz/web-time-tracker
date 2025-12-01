import React, { createContext, useContext, useState, useEffect } from 'react';
import adminApiService from '../services/adminApi';

interface AdminAuthContextType {
  isAuthenticated: boolean;
  loading: boolean;
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => void;
}

const AdminAuthContext = createContext<AdminAuthContextType | undefined>(undefined);

export const AdminAuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  // Check if already authenticated on mount
  useEffect(() => {
    const verifyAuth = async () => {
      const token = localStorage.getItem('admin_token');

      if (!token) {
        setLoading(false);
        return;
      }

      try {
        // Set token and verify it with backend
        adminApiService.setAuthToken(token);
        await adminApiService.verifyToken();
        setIsAuthenticated(true);
      } catch (error) {
        // Token is invalid or expired
        console.error('Token verification failed:', error);
        localStorage.removeItem('admin_token');
        adminApiService.setAuthToken('');
        setIsAuthenticated(false);
      } finally {
        setLoading(false);
      }
    };

    verifyAuth();
  }, []);

  const login = async (username: string, password: string): Promise<boolean> => {
    try {
      const response = await adminApiService.login(username, password);

      if (response.success && response.token) {
        // Store token and set authentication
        localStorage.setItem('admin_token', response.token);
        adminApiService.setAuthToken(response.token);
        setIsAuthenticated(true);
        return true;
      }

      return false;
    } catch (error) {
      console.error('Login error:', error);
      return false;
    }
  };

  const logout = () => {
    setIsAuthenticated(false);
    localStorage.removeItem('admin_token');
    adminApiService.setAuthToken('');
  };

  return (
    <AdminAuthContext.Provider value={{ isAuthenticated, loading, login, logout }}>
      {children}
    </AdminAuthContext.Provider>
  );
};

export const useAdminAuth = () => {
  const context = useContext(AdminAuthContext);
  if (context === undefined) {
    throw new Error('useAdminAuth must be used within an AdminAuthProvider');
  }
  return context;
};
