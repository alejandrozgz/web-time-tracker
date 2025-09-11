import React, { useState, useEffect } from 'react';
import { Upload, AlertTriangle, CheckCircle, Clock, Loader } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import toast from 'react-hot-toast';
import apiService from '../../services/api';
import { BCSyncStatus, SyncResponse, SyncDashboard } from '../../types';

interface SyncButtonProps {
  onSyncComplete?: () => void;
  companyId: string;
}

const SyncButton: React.FC<SyncButtonProps> = ({ onSyncComplete, companyId }) => {
  const { t } = useTranslation(['common']);
  const [dashboard, setDashboard] = useState<SyncDashboard | null>(null);
  const [syncing, setSyncing] = useState(false);
  const [loading, setLoading] = useState(true);

  // 📊 Cargar dashboard de sync
  useEffect(() => {
    loadSyncDashboard();
  }, [companyId]);

  const loadSyncDashboard = async () => {
    try {
      const dashboardData = await apiService.getSyncDashboard(companyId);
      setDashboard(dashboardData);
    } catch (error) {
      console.error('Error loading sync dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  // 🔄 Manejar sincronización
  const handleSync = async () => {
    if (!dashboard || (dashboard.local_entries + dashboard.modified_entries + dashboard.error_entries) === 0) {
      toast.error(t('common:sync.messages.no_entries'));
      return;
    }

    setSyncing(true);
    
    try {
      const response: SyncResponse = await apiService.syncToBC(companyId);
      
      if (response.success) {
        toast.success(
          t('common:sync.messages.sync_completed', { count: response.synced_entries }),
          { duration: 4000 }
        );
        
        if (response.failed_entries > 0) {
          toast.error(
            t('common:sync.messages.sync_failed', { count: response.failed_entries }),
            { duration: 6000 }
          );
        }
      } else {
        toast.error(`${t('common:sync.status.error')}: ${response.message}`);
      }

      // Recargar dashboard y notificar
      await loadSyncDashboard();
      onSyncComplete?.();
      
    } catch (error: any) {
      console.error('Sync error:', error);
      toast.error(`${t('common:sync.status.error')}: ${error.message}`);
    } finally {
      setSyncing(false);
    }
  };

  // 🎨 Render del botón según estado
  const renderSyncButton = () => {
    if (loading) {
      return (
        <div className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-500 rounded-lg">
          <Loader className="w-4 h-4 animate-spin" />
          <span>{t('common:status.loading')}</span>
        </div>
      );
    }

    if (!dashboard) return null;

    const pendingCount = dashboard.local_entries + dashboard.modified_entries + dashboard.error_entries;
    const hasErrors = dashboard.error_entries > 0;
    const hasDrafts = dashboard.draft_entries > 0;

    // No hay nada que sincronizar
    if (pendingCount === 0 && !hasDrafts) {
      return (
        <div className="flex items-center gap-2 px-3 py-2 bg-green-50 text-green-700 rounded-lg text-sm">
          <CheckCircle className="w-4 h-4" />
          <span>{t('common:sync.status.completed')}</span>
        </div>
      );
    }

    return (
      <div className="flex items-center gap-2">
        {/* Botón principal de sync */}
        {pendingCount > 0 && (
          <button
            onClick={handleSync}
            disabled={syncing}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
              hasErrors
                ? 'bg-red-600 hover:bg-red-700 text-white'
                : 'bg-blue-600 hover:bg-blue-700 text-white'
            } disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            {syncing ? (
              <>
                <Loader className="w-4 h-4 animate-spin" />
                <span>{t('common:sync.status.syncing')}</span>
              </>
            ) : (
              <>
                {hasErrors ? (
                  <AlertTriangle className="w-4 h-4" />
                ) : (
                  <Upload className="w-4 h-4" />
                )}
                <span>
                  {hasErrors ? t('common:buttons.retry') : t('common:buttons.sync_to_bc')}
                </span>
              </>
            )}
          </button>
        )}

        {/* Indicadores de estado */}
        <div className="flex items-center gap-1 text-sm">
          {dashboard.local_entries > 0 && (
            <span className="bg-orange-100 text-orange-700 px-2 py-1 rounded-full text-xs font-medium">
              {t('common:sync.badges.local', { count: dashboard.local_entries })}
            </span>
          )}
          
          {dashboard.modified_entries > 0 && (
            <span className="bg-yellow-100 text-yellow-700 px-2 py-1 rounded-full text-xs font-medium">
              {t('common:sync.badges.modified', { count: dashboard.modified_entries })}
            </span>
          )}
          
          {dashboard.error_entries > 0 && (
            <span className="bg-red-100 text-red-700 px-2 py-1 rounded-full text-xs font-medium">
              {t('common:sync.badges.errors', { count: dashboard.error_entries })}
            </span>
          )}
          
          {dashboard.draft_entries > 0 && (
            <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded-full text-xs font-medium">
              {t('common:sync.badges.in_bc', { count: dashboard.draft_entries })}
            </span>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="flex items-center justify-between">
      {renderSyncButton()}
      
      {/* Info adicional */}
      {dashboard && dashboard.pending_hours > 0 && (
        <div className="text-sm text-gray-500">
          <Clock className="w-4 h-4 inline mr-1" />
          {t('common:sync.pending_hours', { hours: dashboard.pending_hours.toFixed(1) })}
        </div>
      )}
    </div>
  );
};

export default SyncButton;