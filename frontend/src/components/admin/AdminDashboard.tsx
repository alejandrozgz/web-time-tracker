import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Users,
  Building2,
  Server,
  Clock,
  AlertCircle,
  CheckCircle,
  RefreshCw
} from 'lucide-react';
import adminApiService from '../../services/adminApi';
import { AdminDashboardStats } from '../../types';

const AdminDashboard: React.FC = () => {
  const [stats, setStats] = useState<AdminDashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    setLoading(true);
    try {
      const data = await adminApiService.getDashboardStats();
      setStats(data);
    } catch (error) {
      console.error('Error loading dashboard stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!stats) return null;

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-800">Admin Dashboard</h1>
        <button
          onClick={loadStats}
          className="flex items-center gap-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {/* Main Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Tenants */}
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Tenants</p>
              <p className="text-3xl font-bold text-gray-800">{stats.total_tenants}</p>
              <p className="text-xs text-green-600 mt-1">{stats.active_tenants} active</p>
            </div>
            <Server className="w-12 h-12 text-blue-500" />
          </div>
        </div>

        {/* Companies */}
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Companies</p>
              <p className="text-3xl font-bold text-gray-800">{stats.total_companies}</p>
            </div>
            <Building2 className="w-12 h-12 text-purple-500" />
          </div>
        </div>

        {/* Users */}
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Users</p>
              <p className="text-3xl font-bold text-gray-800">{stats.total_users}</p>
              <p className="text-xs text-green-600 mt-1">{stats.active_users} active</p>
            </div>
            <Users className="w-12 h-12 text-green-500" />
          </div>
        </div>

        {/* Time Entries */}
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Time Entries</p>
              <p className="text-3xl font-bold text-gray-800">{stats.total_time_entries}</p>
              <p className="text-xs text-gray-600 mt-1">{stats.total_hours_tracked}h tracked</p>
            </div>
            <Clock className="w-12 h-12 text-indigo-500" />
          </div>
        </div>
      </div>

      {/* Secondary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Sync Status Distribution */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Entries by Sync Status</h2>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Local (Not Synced)</span>
              <span className="px-3 py-1 bg-orange-100 text-orange-800 rounded-full text-sm font-medium">
                {stats.entries_by_status.local}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Draft (In BC)</span>
              <span className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm font-medium">
                {stats.entries_by_status.draft}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Posted</span>
              <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
                {stats.entries_by_status.posted}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Modified</span>
              <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                {stats.entries_by_status.modified}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Error</span>
              <span className="px-3 py-1 bg-red-100 text-red-800 rounded-full text-sm font-medium">
                {stats.entries_by_status.error}
              </span>
            </div>
          </div>
        </div>

        {/* Recent Sync Activity */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Recent Sync Activity (24h)</h2>
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-green-100 rounded-lg">
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-800">{stats.recent_syncs}</p>
                <p className="text-sm text-gray-600">Successful Syncs</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="p-3 bg-red-100 rounded-lg">
                <AlertCircle className="w-8 h-8 text-red-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-800">{stats.failed_syncs}</p>
                <p className="text-sm text-gray-600">Failed Syncs</p>
              </div>
            </div>
            {stats.failed_syncs > 0 && (
              <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-800">
                  ⚠️ There are failed syncs that need attention
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Quick Links */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          <Link
            to="/admin/tenants"
            className="p-4 border-2 border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-all text-center"
          >
            <Server className="w-6 h-6 mx-auto mb-2 text-gray-600" />
            <p className="text-sm font-medium text-gray-800">Manage Tenants</p>
          </Link>
          <Link
            to="/admin/companies"
            className="p-4 border-2 border-gray-200 rounded-lg hover:border-purple-500 hover:bg-purple-50 transition-all text-center"
          >
            <Building2 className="w-6 h-6 mx-auto mb-2 text-gray-600" />
            <p className="text-sm font-medium text-gray-800">View Companies</p>
          </Link>
          <Link
            to="/admin/user-activity"
            className="p-4 border-2 border-gray-200 rounded-lg hover:border-green-500 hover:bg-green-50 transition-all text-center"
          >
            <Users className="w-6 h-6 mx-auto mb-2 text-gray-600" />
            <p className="text-sm font-medium text-gray-800">User Activity</p>
          </Link>
          <Link
            to="/admin/time-entries"
            className="p-4 border-2 border-gray-200 rounded-lg hover:border-indigo-500 hover:bg-indigo-50 transition-all text-center"
          >
            <Clock className="w-6 h-6 mx-auto mb-2 text-gray-600" />
            <p className="text-sm font-medium text-gray-800">View Time Entries</p>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
