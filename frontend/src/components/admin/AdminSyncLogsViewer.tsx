import React, { useState, useEffect } from 'react';
import {
  FileText,
  AlertCircle,
  CheckCircle,
  AlertTriangle,
  Info,
  Filter,
  RefreshCw,
  Calendar,
  Clock,
  Database,
  TrendingUp,
  ChevronDown,
  ChevronRight,
  Building2
} from 'lucide-react';
import adminApiService from '../../services/adminApi';
import {
  BCSyncLog,
  SyncLogLevel,
  SyncOperationType,
  SyncLogFilters,
  CompanyFull
} from '../../types';

const AdminSyncLogsViewer: React.FC = () => {
  // State
  const [logs, setLogs] = useState<BCSyncLog[]>([]);
  const [companies, setCompanies] = useState<CompanyFull[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedLog, setExpandedLog] = useState<string | null>(null);

  // Filters
  const [selectedCompanyId, setSelectedCompanyId] = useState<string>('');
  const [selectedTenantId, setSelectedTenantId] = useState<string>('');
  const [filters, setFilters] = useState<SyncLogFilters>({
    limit: 50,
    offset: 0
  });
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    loadCompanies();
  }, []);

  useEffect(() => {
    if (companies.length > 0) {
      loadLogs();
    }
  }, [selectedCompanyId, selectedTenantId, filters, companies]);

  const loadCompanies = async () => {
    try {
      const data = await adminApiService.getCompanies({ limit: 1000 });
      setCompanies(data.companies);
    } catch (error) {
      console.error('Error loading companies:', error);
    }
  };

  const loadLogs = async () => {
    setLoading(true);
    try {
      const companyId = selectedCompanyId;

      console.log('🔍 Loading logs for company:', companyId || 'ALL');
      console.log('🔍 Available companies:', companies.length);

      // If no company selected, fetch logs from all companies
      if (!companyId) {
        if (companies.length === 0) {
          console.warn('⚠️ No companies available');
          setLogs([]);
          setLoading(false);
          return;
        }

        // Fetch logs from all companies and combine them
        const allLogsPromises = companies.map(async (company) => {
          if (!company.tenant_slug) return [];

          try {
            const params = new URLSearchParams();
            if (filters.operation_type) params.append('operation_type', filters.operation_type);
            if (filters.log_level) params.append('log_level', filters.log_level);
            if (filters.date_from) params.append('date_from', filters.date_from);
            if (filters.date_to) params.append('date_to', filters.date_to);
            params.append('limit', '1000');
            params.append('offset', '0');

            const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3000/api';
            const url = `${API_BASE_URL}/${company.tenant_slug}/sync/logs?companyId=${company.id}&${params}`;

            const response = await fetch(url);
            if (!response.ok) return [];

            const data = await response.json();
            return (data.logs || []).map((log: any) => ({
              ...log,
              company_name: company.name,
              tenant_name: company.tenant_name
            }));
          } catch (error) {
            console.error(`Error fetching logs for company ${company.name}:`, error);
            return [];
          }
        });

        const allLogsArrays = await Promise.all(allLogsPromises);
        const allLogs = allLogsArrays.flat();

        // Sort by created_at descending
        allLogs.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

        // Apply pagination
        const offset = filters.offset || 0;
        const limit = filters.limit || 50;
        const paginatedLogs = allLogs.slice(offset, offset + limit);

        console.log('✅ Received logs from all companies:', paginatedLogs.length);
        setLogs(paginatedLogs);
        setLoading(false);
        return;
      }

      // Single company - use existing logic
      const company = companies.find(c => c.id === companyId);
      console.log('🔍 Found company:', company?.name, 'slug:', company?.tenant_slug);

      if (!company?.tenant_slug) {
        console.warn('⚠️ Company has no tenant_slug');
        setLogs([]);
        setLoading(false);
        return;
      }

      // Make direct fetch to tenant API
      const params = new URLSearchParams();
      if (filters.operation_type) params.append('operation_type', filters.operation_type);
      if (filters.log_level) params.append('log_level', filters.log_level);
      if (filters.date_from) params.append('date_from', filters.date_from);
      if (filters.date_to) params.append('date_to', filters.date_to);
      params.append('limit', (filters.limit || 50).toString());
      params.append('offset', (filters.offset || 0).toString());

      const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3000/api';
      const url = `${API_BASE_URL}/${company.tenant_slug}/sync/logs?companyId=${companyId}&${params}`;
      console.log('🔍 Fetching from URL:', url);

      const response = await fetch(url);
      console.log('🔍 Response status:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Response error:', errorText);
        throw new Error('Failed to fetch logs');
      }

      const data = await response.json();
      console.log('✅ Received logs:', data.logs?.length || 0);
      console.log('📊 Full response:', data);

      // Add company name to logs
      const logsWithCompanyName = (data.logs || []).map((log: any) => ({
        ...log,
        company_name: company.name,
        tenant_name: company.tenant_name
      }));

      setLogs(logsWithCompanyName);
    } catch (error) {
      console.error('❌ Error loading sync logs:', error);
      setLogs([]);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = () => {
    loadLogs();
  };

  const getLogLevelIcon = (level: SyncLogLevel) => {
    switch (level) {
      case SyncLogLevel.SUCCESS:
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case SyncLogLevel.ERROR:
        return <AlertCircle className="w-5 h-5 text-red-500" />;
      case SyncLogLevel.WARNING:
        return <AlertTriangle className="w-5 h-5 text-yellow-500" />;
      case SyncLogLevel.INFO:
      default:
        return <Info className="w-5 h-5 text-blue-500" />;
    }
  };

  const getLogLevelBadge = (level: SyncLogLevel) => {
    const baseClasses = 'px-2 py-1 rounded-full text-xs font-medium';
    switch (level) {
      case SyncLogLevel.SUCCESS:
        return <span className={`${baseClasses} bg-green-100 text-green-800`}>Success</span>;
      case SyncLogLevel.ERROR:
        return <span className={`${baseClasses} bg-red-100 text-red-800`}>Error</span>;
      case SyncLogLevel.WARNING:
        return <span className={`${baseClasses} bg-yellow-100 text-yellow-800`}>Warning</span>;
      case SyncLogLevel.INFO:
      default:
        return <span className={`${baseClasses} bg-blue-100 text-blue-800`}>Info</span>;
    }
  };

  const getOperationTypeBadge = (type: SyncOperationType) => {
    const baseClasses = 'px-2 py-1 rounded-full text-xs font-medium';
    switch (type) {
      case SyncOperationType.SYNC_TO_BC:
        return <span className={`${baseClasses} bg-purple-100 text-purple-800`}>Sync to BC</span>;
      case SyncOperationType.POST_BATCH:
        return <span className={`${baseClasses} bg-indigo-100 text-indigo-800`}>Post Batch</span>;
      case SyncOperationType.FETCH_FROM_BC:
        return <span className={`${baseClasses} bg-cyan-100 text-cyan-800`}>Fetch from BC</span>;
      case SyncOperationType.RETRY:
        return <span className={`${baseClasses} bg-orange-100 text-orange-800`}>Retry</span>;
      default:
        return <span className={`${baseClasses} bg-gray-100 text-gray-800`}>{type}</span>;
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  const formatDuration = (ms?: number) => {
    if (!ms) return 'N/A';
    if (ms < 1000) return `${ms}ms`;
    return `${(ms / 1000).toFixed(2)}s`;
  };

  const toggleLogExpansion = (logId: string) => {
    setExpandedLog(expandedLog === logId ? null : logId);
  };

  // Get unique tenants from companies
  const tenants = Array.from(
    new Map(
      companies
        .filter(c => c.tenant_id && c.tenant_name)
        .map(c => [c.tenant_id, { id: c.tenant_id, name: c.tenant_name }])
    ).values()
  );

  // Filter companies by selected tenant
  const filteredCompanies = selectedTenantId
    ? companies.filter(c => c.tenant_id === selectedTenantId)
    : companies;

  if (loading && logs.length === 0 && companies.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <FileText className="w-6 h-6 text-gray-700" />
          <h2 className="text-2xl font-bold text-gray-800">Sync Logs</h2>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
          >
            <Filter className="w-4 h-4" />
            Filters
          </button>
          <button
            onClick={handleRefresh}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>
      </div>

      {/* Company Selection */}
      <div className="bg-white p-4 rounded-lg shadow">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Building2 className="w-4 h-4 inline mr-1" />
              Tenant
            </label>
            <select
              value={selectedTenantId}
              onChange={(e) => {
                setSelectedTenantId(e.target.value);
                setSelectedCompanyId('');
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Tenants</option>
              {tenants.map((tenant) => (
                <option key={tenant.id} value={tenant.id}>
                  {tenant.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Building2 className="w-4 h-4 inline mr-1" />
              Company
            </label>
            <select
              value={selectedCompanyId}
              onChange={(e) => setSelectedCompanyId(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select a company</option>
              {filteredCompanies.map((company) => (
                <option key={company.id} value={company.id}>
                  {company.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <p className="mt-3 text-sm text-gray-600">
          View synchronization logs between the web application and Business Central for the selected company
        </p>
      </div>

      {/* Filters Panel */}
      {showFilters && (
        <div className="bg-white p-4 rounded-lg shadow space-y-4">
          <h3 className="font-semibold text-gray-800">Filter Logs</h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Operation Type</label>
              <select
                value={filters.operation_type || ''}
                onChange={(e) => setFilters({ ...filters, operation_type: e.target.value as SyncOperationType || undefined, offset: 0 })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All</option>
                <option value={SyncOperationType.SYNC_TO_BC}>Sync to BC</option>
                <option value={SyncOperationType.POST_BATCH}>Post Batch</option>
                <option value={SyncOperationType.FETCH_FROM_BC}>Fetch from BC</option>
                <option value={SyncOperationType.RETRY}>Retry</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Log Level</label>
              <select
                value={filters.log_level || ''}
                onChange={(e) => setFilters({ ...filters, log_level: e.target.value as SyncLogLevel || undefined, offset: 0 })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All</option>
                <option value={SyncLogLevel.SUCCESS}>Success</option>
                <option value={SyncLogLevel.ERROR}>Error</option>
                <option value={SyncLogLevel.WARNING}>Warning</option>
                <option value={SyncLogLevel.INFO}>Info</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Date From</label>
              <input
                type="date"
                value={filters.date_from?.split('T')[0] || ''}
                onChange={(e) => setFilters({ ...filters, date_from: e.target.value ? new Date(e.target.value).toISOString() : undefined, offset: 0 })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Date To</label>
              <input
                type="date"
                value={filters.date_to?.split('T')[0] || ''}
                onChange={(e) => setFilters({ ...filters, date_to: e.target.value ? new Date(e.target.value).toISOString() : undefined, offset: 0 })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <button
            onClick={() => setFilters({ limit: 50, offset: 0 })}
            className="text-sm text-blue-600 hover:text-blue-700"
          >
            Clear Filters
          </button>
        </div>
      )}

      {/* Logs List */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          {logs.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              <FileText className="w-12 h-12 mx-auto mb-3 text-gray-400" />
              <p>No sync logs found</p>
              {!selectedCompanyId && companies.length > 0 && (
                <p className="text-sm mt-2">Showing logs from all companies. Select a specific company to filter.</p>
              )}
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {logs.map((log) => (
                <div key={log.id} className="hover:bg-gray-50 transition-colors">
                  <div
                    className="p-4 cursor-pointer"
                    onClick={() => toggleLogExpansion(log.id)}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3 flex-1">
                        {getLogLevelIcon(log.log_level)}
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1 flex-wrap">
                            {getOperationTypeBadge(log.operation_type)}
                            {getLogLevelBadge(log.log_level)}
                            {log.batch_name && (
                              <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs font-mono">
                                {log.batch_name}
                              </span>
                            )}
                            {!selectedCompanyId && (log as any).company_name && (
                              <span className="px-2 py-1 bg-indigo-100 text-indigo-700 rounded text-xs font-medium">
                                {(log as any).company_name}
                              </span>
                            )}
                          </div>
                          <p className="text-gray-800 font-medium">{log.message}</p>
                          <div className="flex items-center gap-4 mt-2 text-sm text-gray-600">
                            <span className="flex items-center gap-1">
                              <Calendar className="w-4 h-4" />
                              {formatDate(log.created_at)}
                            </span>
                            {log.duration_ms && (
                              <span className="flex items-center gap-1">
                                <Clock className="w-4 h-4" />
                                {formatDuration(log.duration_ms)}
                              </span>
                            )}
                            {log.entries_processed !== undefined && (
                              <span>
                                Entries: {log.entries_succeeded}/{log.entries_processed}
                              </span>
                            )}
                          </div>
                        </div>
                        {expandedLog === log.id ? (
                          <ChevronDown className="w-5 h-5 text-gray-400" />
                        ) : (
                          <ChevronRight className="w-5 h-5 text-gray-400" />
                        )}
                      </div>
                    </div>

                    {/* Expanded Details */}
                    {expandedLog === log.id && (
                      <div className="mt-4 ml-8 p-4 bg-gray-50 rounded-lg space-y-2">
                        {log.bc_error_code && (
                          <div>
                            <span className="font-medium text-red-600">Error Code: </span>
                            <span className="font-mono text-sm">{log.bc_error_code}</span>
                          </div>
                        )}
                        {log.bc_error_message && (
                          <div>
                            <span className="font-medium text-red-600">Error Message: </span>
                            <span className="text-sm">{log.bc_error_message}</span>
                          </div>
                        )}
                        {log.resource_no && (
                          <div>
                            <span className="font-medium">Resource: </span>
                            <span className="font-mono text-sm">{log.resource_no}</span>
                          </div>
                        )}
                        {log.bc_journal_id && (
                          <div>
                            <span className="font-medium">Journal ID: </span>
                            <span className="font-mono text-sm">{log.bc_journal_id}</span>
                          </div>
                        )}
                        {log.details && (
                          <div>
                            <span className="font-medium">Details: </span>
                            <pre className="mt-2 p-3 bg-gray-800 text-gray-100 rounded text-xs overflow-x-auto">
                              {JSON.stringify(log.details, null, 2)}
                            </pre>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Pagination */}
        {logs.length > 0 && (
          <div className="px-4 py-3 bg-gray-50 border-t border-gray-200 flex items-center justify-between">
            <div className="text-sm text-gray-600">
              Showing {(filters.offset || 0) + 1} to {(filters.offset || 0) + logs.length}
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setFilters({ ...filters, offset: Math.max(0, (filters.offset || 0) - (filters.limit || 50)) })}
                disabled={(filters.offset || 0) === 0}
                className="px-3 py-1 bg-white border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              <button
                onClick={() => setFilters({ ...filters, offset: (filters.offset || 0) + (filters.limit || 50) })}
                disabled={logs.length < (filters.limit || 50)}
                className="px-3 py-1 bg-white border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminSyncLogsViewer;
