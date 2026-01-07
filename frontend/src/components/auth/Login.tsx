import React, { useState, useEffect } from 'react';
import { Clock, User, Lock, LogIn, Building2 } from 'lucide-react';
import { useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import toast from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';
import LanguageSelector from '../ui/LanguageSelector';
import apiService from '../../services/api';
import { Company } from '../../types';

const Login: React.FC = () => {
  const { t } = useTranslation(['auth', 'common']);
  const { login } = useAuth();
  const { tenantSlug } = useParams<{ tenantSlug: string }>();
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
      toast.error(t('errors.load_companies'));
      console.error('Error loading companies:', error);
    } finally {
      setLoadingCompanies(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.username || !formData.password || !formData.companyId) {
      toast.error(t('errors.complete_fields'));
      return;
    }

    setIsLoading(true);

    try {
      await login(formData.username, formData.password, formData.companyId);
      toast.success(t('success.login'));
    } catch (error: any) {
      toast.error(error.message || t('errors.authentication'));
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
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 px-4 py-8 sm:py-12">
      <div className="max-w-md w-full space-y-6 sm:space-y-8">
        {/* Language Selector - Top Right */}
        <div className="flex justify-end">
          <LanguageSelector />
        </div>

        {/* Header - Responsive */}
        <div className="text-center">
          <div className="mx-auto h-10 w-10 sm:h-12 sm:w-12 bg-blue-600 rounded-full flex items-center justify-center">
            <Clock className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
          </div>
          <h2 className="mt-4 sm:mt-6 text-2xl sm:text-3xl font-extrabold text-gray-900">
            {t('title')}
          </h2>
          <p className="mt-2 text-xs sm:text-sm text-gray-600">
            {t('subtitle')}
          </p>
          <p className="mt-1 text-xs text-gray-500">
            {t('tenant')}: <span className="font-medium">{tenantSlug}</span>
          </p>
        </div>

        {/* Form - Responsive */}
        <form className="mt-6 sm:mt-8 space-y-4 sm:space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
            {/* Company Select - Responsive */}
            <div>
              <label htmlFor="company" className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                {t('fields.company')} *
              </label>
              <div className="relative">
                <Building2 className="absolute left-3 top-2.5 sm:top-3 h-4 w-4 sm:h-5 sm:w-5 text-gray-400" />
                <select
                  id="company"
                  value={formData.companyId}
                  onChange={(e) => setFormData(prev => ({ ...prev, companyId: e.target.value }))}
                  className="appearance-none block w-full pl-10 sm:pl-12 pr-3 py-2.5 sm:py-3 border border-gray-300 rounded-md placeholder-gray-500 text-gray-900 text-sm sm:text-base focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  required
                >
                  <option value="">{t('placeholders.select_company')}</option>
                  {companies.map(company => (
                    <option key={company.id} value={company.id}>
                      {company.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Username Input - Responsive */}
            <div>
              <label htmlFor="username" className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                {t('fields.username')} *
              </label>
              <div className="relative">
                <User className="absolute left-3 top-2.5 sm:top-3 h-4 w-4 sm:h-5 sm:w-5 text-gray-400" />
                <input
                  type="text"
                  id="username"
                  value={formData.username}
                  onChange={(e) => setFormData(prev => ({ ...prev, username: e.target.value }))}
                  className="appearance-none block w-full pl-10 sm:pl-12 pr-3 py-2.5 sm:py-3 border border-gray-300 rounded-md placeholder-gray-500 text-gray-900 text-sm sm:text-base focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder={t('placeholders.username')}
                  required
                />
              </div>
            </div>

            {/* Password Input - Responsive */}
            <div>
              <label htmlFor="password" className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                {t('fields.password')} *
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-2.5 sm:top-3 h-4 w-4 sm:h-5 sm:w-5 text-gray-400" />
                <input
                  type="password"
                  id="password"
                  value={formData.password}
                  onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                  className="appearance-none block w-full pl-10 sm:pl-12 pr-3 py-2.5 sm:py-3 border border-gray-300 rounded-md placeholder-gray-500 text-gray-900 text-sm sm:text-base focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder={t('placeholders.password')}
                  required
                />
              </div>
            </div>
          </div>

          {/* Login Button - Responsive */}
          <div>
            <button
              type="submit"
              disabled={isLoading}
              className="group relative w-full flex justify-center py-2.5 sm:py-3 px-4 border border-transparent text-sm sm:text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white" />
              ) : (
                <>
                  <LogIn className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
                  {t('buttons.login')}
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