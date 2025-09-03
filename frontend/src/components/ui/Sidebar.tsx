import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  Home, 
  Clock, 
  BarChart3, 
  Settings, 
  X,
  Calendar,
  FileText,
  Play
} from 'lucide-react';

interface SidebarProps {
  isOpen: boolean;
  onToggle: (open: boolean) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, onToggle }) => {
  const location = useLocation();

  const navigation = [
    {
      name: 'Dashboard',
      href: '/',
      icon: Home,
      description: 'Resumen general'
    },
    {
      name: 'Registrar Tiempo',
      href: '/time-entries',
      icon: Play,
      description: 'Crear nuevas entradas'
    },
    {
      name: 'Historial',
      href: '/history',
      icon: Clock,
      description: 'Ver entradas pasadas'
    },
    {
      name: 'Reportes',
      href: '/reports',
      icon: BarChart3,
      description: 'Estadísticas y análisis'
    },
    {
      name: 'Calendario',
      href: '/calendar',
      icon: Calendar,
      description: 'Vista calendario'
    },
    {
      name: 'Configuración',
      href: '/settings',
      icon: Settings,
      description: 'Ajustes de usuario'
    }
  ];

  const isActive = (href: string) => {
    if (href === '/') {
      return location.pathname === '/' || location.pathname === '/dashboard';
    }
    return location.pathname.startsWith(href);
  };

  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => onToggle(false)}
        />
      )}

      <div className={`
        fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out
        lg:translate-x-0 lg:static lg:inset-0
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="flex items-center justify-between p-4 border-b border-gray-200 lg:hidden">
          <h2 className="text-lg font-semibold text-gray-900">Menú</h2>
          <button
            onClick={() => onToggle(false)}
            className="p-2 rounded-md text-gray-500 hover:text-gray-700 hover:bg-gray-100"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <nav className="mt-4 lg:mt-8">
          <div className="px-4 space-y-1">
            {navigation.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.href);
              
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  onClick={() => onToggle(false)}
                  className={`
                    group flex items-center px-3 py-3 text-sm font-medium rounded-lg transition-colors
                    ${active 
                      ? 'bg-blue-50 text-blue-700 border-r-2 border-blue-700' 
                      : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                    }
                  `}
                >
                  <Icon className={`
                    flex-shrink-0 mr-3 h-5 w-5
                    ${active ? 'text-blue-700' : 'text-gray-500 group-hover:text-gray-700'}
                  `} />
                  
                  <div className="flex-1">
                    <div className="text-sm font-medium">{item.name}</div>
                    <div className={`
                      text-xs mt-0.5
                      ${active ? 'text-blue-600' : 'text-gray-500'}
                    `}>
                      {item.description}
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>

          <div className="mt-8 mx-4 p-4 bg-gray-50 rounded-lg">
            <h3 className="text-sm font-medium text-gray-900 mb-2">Hoy</h3>
            <div className="space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-gray-600">Horas registradas:</span>
                <span className="font-medium text-gray-900">0.0h</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Entradas:</span>
                <span className="font-medium text-gray-900">0</span>
              </div>
            </div>
          </div>

          <div className="mt-6 mx-4 p-3 bg-blue-50 rounded-lg">
            <div className="flex items-start">
              <FileText className="h-4 w-4 text-blue-600 mt-0.5 mr-2 flex-shrink-0" />
              <div className="text-xs">
                <p className="text-blue-800 font-medium">Sincronización BC</p>
                <p className="text-blue-700 mt-1">
                  Las entradas se sincronizan automáticamente con Microsoft Dynamics 365 Business Central.
                </p>
              </div>
            </div>
          </div>
        </nav>
      </div>
    </>
  );
};

export default Sidebar;