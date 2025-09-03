import React from 'react';
import { LogOut, User, Building2, Clock } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

interface HeaderProps {
  onMenuToggle: () => void;
}

const Header: React.FC<HeaderProps> = () => {
  const { user, tenant, company, logout } = useAuth();

  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between py-4">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-3">
              <div className="h-8 w-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <Clock className="h-5 w-5 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-semibold text-gray-900">Time Tracker</h1>
                <p className="text-xs text-gray-500">Microsoft Dynamics 365 BC</p>
              </div>
            </div>
          </div>

          <div className="hidden md:flex items-center space-x-2 bg-gray-50 px-3 py-2 rounded-lg">
            <Building2 className="h-4 w-4 text-gray-600" />
            <span className="text-sm font-medium text-gray-700">
              {company?.name || 'No Company'}
            </span>
            <span className="text-xs text-gray-500">
              ({tenant?.slug})
            </span>
          </div>

          <div className="flex items-center space-x-4">
            <div className="hidden md:flex items-center space-x-2">
              <User className="h-4 w-4 text-gray-600" />
              <span className="text-sm font-medium text-gray-700">
                {user?.displayName || 'Usuario'}
              </span>
              <span className="text-xs text-gray-500">
                ({user?.resourceNo})
              </span>
            </div>

            <button
              onClick={logout}
              className="flex items-center space-x-2 px-3 py-2 text-sm font-medium text-gray-700 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              title="Cerrar Sesión"
            >
              <LogOut className="h-4 w-4" />
              <span className="hidden sm:inline">Salir</span>
            </button>
          </div>
        </div>

        <div className="md:hidden pb-3">
          <div className="flex items-center space-x-2 text-xs text-gray-600">
            <Building2 className="h-3 w-3" />
            <span>{company?.name}</span>
            <span className="text-gray-400">•</span>
            <User className="h-3 w-3" />
            <span>{user?.displayName}</span>
          </div>
        </div>
      </header>
    </div>
  );
};

export default Header;