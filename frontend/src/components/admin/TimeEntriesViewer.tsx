import React, { useState, useEffect } from 'react';
import { Clock, RefreshCw, Filter, Download } from 'lucide-react';
import adminApiService from '../../services/adminApi';
import { TimeEntryAdmin, TenantFull, BCSyncStatus } from '../../types';
import toast from 'react-hot-toast';

const TimeEntriesViewer: React.FC = () => {
  const [entries, setEntries] = useState<TimeEntryAdmin[]>([]);
  const [tenants, setTenants] = useState<TenantFull[]>([]);
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);

  const [filters, setFilters] = useState({
    tenant_id: '',
    bc_sync_status: '',
    date_from: '',
    date_to: '',
    limit: 100,
    offset: 0
  });

  useEffect(() => {
    loadTenants();
  }, []);

  useEffect(() => {
    loadEntries();
  }, [filters]);

  const loadTenants = async () => {
    try {
      const data = await adminApiService.getTenants({ limit: 1000 });
      setTenants(data.tenants);
    } catch (error) {
      console.error('Error loading tenants:', error);
    }
  };

  const loadEntries = async () => {
    setLoading(true);
    try {
      const data = await adminApiService.getTimeEntries({
        tenant_id: filters.tenant_id || undefined,
        bc_sync_status: filters.bc_sync_status || undefined,
        date_from: filters.date_from || undefined,
        date_to: filters.date_to || undefined,
        limit: filters.limit,
        offset: filters.offset
      });
      setEntries(data.entries);
    } catch (error) {
      console.error('Error loading entries:', error);
      toast.error('Failed to load time entries');
    } finally {
      setLoading(false);
    }
  };

  const getSyncStatusBadge = (status: BCSyncStatus) => {
    const colors: Record<BCSyncStatus, string> = {
      [BCSyncStatus.LOCAL]: 'bg-orange-100 text-orange-800',
      [BCSyncStatus.DRAFT]: 'bg-yellow-100 text-yellow-800',
      [BCSyncStatus.POSTED]: 'bg-green-100 text-green-800',
      [BCSyncStatus.ERROR]: 'bg-red-100 text-red-800',
      [BCSyncStatus.MODIFIED]: 'bg-blue-100 text-blue-800',
      [BCSyncStatus.POSTING]: 'bg-purple-100 text-purple-800'
    };

    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${colors[status]}`}>
        {status}
      </span>
    );
  };

  const getTotalHours = () => {
    return entries.reduce((sum, entry) => sum + entry.hours, 0).toFixed(2);
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Clock className="w-8 h-8 text-indigo-500" />
          <div>
            <h1 className="text-3xl font-bold text-gray-800">Time Entries</h1>
            <p className="text-sm text-gray-600 mt-1">
              {entries.length} entries • {getTotalHours()} hours total
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`px-4 py-2 rounded-lg transition-colors ${
              showFilters ? 'bg-indigo-500 text-white' : 'bg-gray-100 hover:bg-gray-200'
            }`}
          >
            <Filter className="w-5 h-5" />
          </button>
          <button
            onClick={loadEntries}
            className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg"
          >
            <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Filters */}
      {showFilters && (
        <div className="bg-white p-4 rounded-lg shadow space-y-4">
          <h3 className="font-semibold text-gray-800">Filters</h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Tenant</label>
              <select
                value={filters.tenant_id}
                onChange={(e) => setFilters({ ...filters, tenant_id: e.target.value, offset: 0 })}
                className="w-full px-3 py-2 border rounded-lg"
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
              <label className="block text-sm font-medium mb-1">Sync Status</label>
              <select
                value={filters.bc_sync_status}
                onChange={(e) => setFilters({ ...filters, bc_sync_status: e.target.value, offset: 0 })}
                className="w-full px-3 py-2 border rounded-lg"
              >
                <option value="">All Statuses</option>
                <option value="local">Local</option>
                <option value="draft">Draft</option>
                <option value="posted">Posted</option>
                <option value="error">Error</option>
                <option value="modified">Modified</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Date From</label>
              <input
                type="date"
                value={filters.date_from}
                onChange={(e) => setFilters({ ...filters, date_from: e.target.value, offset: 0 })}
                className="w-full px-3 py-2 border rounded-lg"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Date To</label>
              <input
                type="date"
                value={filters.date_to}
                onChange={(e) => setFilters({ ...filters, date_to: e.target.value, offset: 0 })}
                className="w-full px-3 py-2 border rounded-lg"
              />
            </div>
          </div>

          <button
            onClick={() => setFilters({ tenant_id: '', bc_sync_status: '', date_from: '', date_to: '', limit: 100, offset: 0 })}
            className="text-sm text-indigo-600 hover:text-indigo-700"
          >
            Clear Filters
          </button>
        </div>
      )}

      {/* Entries Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tenant</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Resource</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Job</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Description</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Hours</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {entries.map((entry) => (
                <tr key={entry.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-sm text-gray-900">
                    {new Date(entry.date).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600">
                    {entry.tenant_name}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600">
                    {entry.resource_display_name || entry.resource_no}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600 font-mono">
                    {entry.bc_job_id}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-900 max-w-xs truncate">
                    {entry.description}
                  </td>
                  <td className="px-4 py-3 text-sm font-medium text-gray-900">
                    {entry.hours}h
                  </td>
                  <td className="px-4 py-3">
                    {getSyncStatusBadge(entry.bc_sync_status)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {entries.length === 0 && !loading && (
            <div className="p-8 text-center text-gray-500">
              No time entries found
            </div>
          )}
        </div>

        {/* Pagination */}
        {entries.length > 0 && (
          <div className="px-4 py-3 bg-gray-50 border-t border-gray-200 flex items-center justify-between">
            <div className="text-sm text-gray-600">
              Showing {filters.offset + 1} to {filters.offset + entries.length}
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setFilters({ ...filters, offset: Math.max(0, filters.offset - filters.limit) })}
                disabled={filters.offset === 0}
                className="px-3 py-1 bg-white border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              <button
                onClick={() => setFilters({ ...filters, offset: filters.offset + filters.limit })}
                disabled={entries.length < filters.limit}
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

export default TimeEntriesViewer;
