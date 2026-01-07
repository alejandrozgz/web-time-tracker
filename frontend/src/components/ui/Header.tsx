// File: frontend/src/components/ui/Header.tsx (UPDATED)
import React from 'react';
import { LogOut, User, Building2, Clock } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom'; // ✅ AGREGAR
import { useAuth } from '../../context/AuthContext';
import LanguageSelector from './LanguageSelector';

interface HeaderProps {
  onMenuToggle: () => void;
}

const Header: React.FC<HeaderProps> = () => {
  const { t } = useTranslation('common');
  const { user, company, logout } = useAuth();
  const { tenantSlug } = useParams<{ tenantSlug: string }>(); // ✅ AGREGAR

  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between py-4">
          {/* Left side - Logo and Title */}
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-3">
              <div className="h-8 w-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <Clock className="h-5 w-5 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-semibold text-gray-900">
                  {t('navigation.time_tracker')}
                </h1>
                <p className="text-xs text-gray-500">Microsoft Dynamics 365 BC</p>
              </div>
            </div>
          </div>
          {/* Center - Company info (desktop) */}
          <div className="hidden md:flex items-center space-x-2 bg-gray-50 px-3 py-2 rounded-lg">
            <Building2 className="h-4 w-4 text-gray-600" />
            <span className="text-sm font-medium text-gray-700">
              {company?.name || 'No Company'}
            </span>
            <span className="text-xs text-gray-500">
              ({tenantSlug}) {/* ✅ CAMBIAR DE tenant?.slug A tenantSlug */}
            </span>
          </div>
          {/* Right side - Language, User, Logout */}
          <div className="flex items-center space-x-4">
            {/* Language Selector - Desktop only */}
            <div className="hidden md:block">
              <LanguageSelector />
            </div>
            {/* User info (desktop) */}
            <div className="hidden md:flex items-center space-x-2">
              <User className="h-4 w-4 text-gray-600" />
              <span className="text-sm font-medium text-gray-700">
                {user?.displayName || 'Usuario'}
              </span>
              <span className="text-xs text-gray-500">
                ({user?.resourceNo})
              </span>
            </div>
            {/* Logout button */}
            <button
              onClick={logout}
              className="flex items-center space-x-2 px-3 py-2 text-sm font-medium text-gray-700 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              title={t('navigation.logout')}
            >
              <LogOut className="h-4 w-4" />
              <span className="hidden sm:inline">{t('navigation.logout')}</span>
            </button>
          </div>
        </div>
        {/* Mobile info row */}
        <div className="md:hidden pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2 text-xs text-gray-600">
              <Building2 className="h-3 w-3" />
              <span>{company?.name}</span>
              <span className="text-gray-400">•</span>
              <User className="h-3 w-3" />
              <span>{user?.displayName}</span>
            </div>
            
            {/* Language selector mobile (solo bandera) */}
            <div className="md:hidden">
              <LanguageSelector />
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;