import React, { useState, useEffect } from 'react';
import { Clock, User, Lock, LogIn, Building2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';
import apiService from '../../services/api';
import { Company } from '../../types';

const Login: React.FC = () => {
  const { login } = useAuth();
  const [companies, setCompanies] = useState<Company[]>([]);
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    companyId: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [loadingCompanies, setLoadingCompanies] = useState(true);

  useEffect(() => {
    loadCompanies();
  }, []);

  const loadCompanies = async () => {
    try {
      const companiesData = await apiService.getCompanies();
      setCompanies(companiesData);
      
      if (companiesData.length === 1) {
        setFormData(prev => ({ ...prev, companyId: companiesData[0].id }));
      }
    } catch (error) {
      toast.error('Error al cargar empresas');
      console.error('Error loading companies:', error);
    } finally {
      setLoadingCompanies(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.username || !formData.password || !formData.companyId) {
      toast.error('Por favor completa todos los campos');
      return;
    }

    setIsLoading(true);

    try {
      await login(formData.username, formData.password, formData.companyId);
      toast.success('¡Inicio de sesión exitoso!');
    } catch (error: any) {
      toast.error(error.message || 'Error de autenticación');
    } finally {
      setIsLoading(false);
    }
  };

  if (loadingCompanies) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 px-4">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <div className="mx-auto h-12 w-12 bg-blue-600 rounded-full flex items-center justify-center">
            <Clock className="h-6 w-6 text-white" />
          </div>
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
            Time Tracker
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Integrado con Microsoft Dynamics 365 Business Central
          </p>
          <p className="mt-1 text-xs text-gray-500">
            Tenant: <span className="font-medium">empresa-demo</span>
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label htmlFor="company" className="block text-sm font-medium text-gray-700 mb-1">
                Empresa *
              </label>
              <div className="relative">
                <Building2 className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                <select
                  id="company"
                  value={formData.companyId}
                  onChange={(e) => setFormData(prev => ({ ...prev, companyId: e.target.value }))}
                  className="appearance-none block w-full pl-12 pr-3 py-3 border border-gray-300 rounded-md placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  required
                >
                  <option value="">Selecciona una empresa...</option>
                  {companies.map(company => (
                    <option key={company.id} value={company.id}>
                      {company.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-1">
                Usuario *
              </label>
              <div className="relative">
                <User className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  id="username"
                  value={formData.username}
                  onChange={(e) => setFormData(prev => ({ ...prev, username: e.target.value }))}
                  className="appearance-none block w-full px-12 py-3 border border-gray-300 rounded-md placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="demo"
                  required
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                Contraseña *
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                <input
                  type="password"
                  id="password"
                  value={formData.password}
                  onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                  className="appearance-none block w-full px-12 py-3 border border-gray-300 rounded-md placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="123"
                  required
                />
              </div>
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={isLoading}
              className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white" />
              ) : (
                <>
                  <LogIn className="h-5 w-5 mr-2" />
                  Iniciar Sesión
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Login;