import React, { useState, useEffect } from 'react';
import { Users, Calendar, Activity, TrendingUp, AlertCircle } from 'lucide-react';
import adminApiService from '../../services/adminApi';
import toast from 'react-hot-toast';

interface UserActivityAnalyticsProps {}

const UserActivityAnalytics: React.FC<UserActivityAnalyticsProps> = () => {
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState(30);
  const [data, setData] = useState<{
    period: number;
    detailedStats: Array<{
      tenant_id: string;
      tenant_name: string;
      company_id: string;
      company_name: string;
      resource_no: string;
      last_activity: string | null;
      days_since_activity: number | null;
      total_entries: number;
      total_hours: number;
    }>;
    summaryStats: Array<{
      tenant_id: string;
      tenant_name: string;
      total_users: number;
      active_users: number;
      total_entries: number;
      total_hours: number;
    }>;
  } | null>(null);
  const [expandedTenant, setExpandedTenant] = useState<string | null>(null);

  useEffect(() => {
    loadActivityData();
  }, [period]);

  const loadActivityData = async () => {
    try {
      setLoading(true);
      const activityData = await adminApiService.getUserActivity(period);
      setData(activityData);
    } catch (error) {
      console.error('Error loading user activity:', error);
      toast.error('Failed to load user activity data');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Never';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getActivityBadge = (daysAgo: number | null) => {
    if (daysAgo === null) {
      return <span className="px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700">Never</span>;
    }
    if (daysAgo <= 7) {
      return <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">Active</span>;
    }
    if (daysAgo <= period) {
      return <span className="px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-700">Recent</span>;
    }
    return <span className="px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-700">Inactive</span>;
  };

  if (loading) {
    return (
      <div className="bg-white shadow-sm rounded-lg border border-gray-200 p-6">
        <div className="flex justify-center items-center h-32">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
        </div>
      </div>
    );
  }

  if (!data) {
    return null;
  }

  return (
    <div className="p-6 space-y-6">
      {/* Page Title */}
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-800">User Activity Analytics</h1>
      </div>

      {/* Period Selector and Summary Cards */}
      <div className="bg-white shadow-sm rounded-lg border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-gray-500" />
            <span className="text-sm font-medium text-gray-700">Period:</span>
            <select
              value={period}
              onChange={(e) => setPeriod(Number(e.target.value))}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value={7}>Last 7 days</option>
              <option value={30}>Last 30 days</option>
              <option value={60}>Last 60 days</option>
              <option value={90}>Last 90 days</option>
            </select>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-blue-50 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <Users className="h-5 w-5 text-blue-600" />
              <span className="text-sm font-medium text-gray-700">Total Users</span>
            </div>
            <div className="text-2xl font-bold text-gray-900">
              {data.summaryStats.reduce((sum, s) => sum + s.total_users, 0)}
            </div>
          </div>

          <div className="bg-green-50 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <Activity className="h-5 w-5 text-green-600" />
              <span className="text-sm font-medium text-gray-700">Active Users</span>
            </div>
            <div className="text-2xl font-bold text-gray-900">
              {data.summaryStats.reduce((sum, s) => sum + s.active_users, 0)}
            </div>
          </div>

          <div className="bg-yellow-50 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <AlertCircle className="h-5 w-5 text-yellow-600" />
              <span className="text-sm font-medium text-gray-700">Total Entries</span>
            </div>
            <div className="text-2xl font-bold text-gray-900">
              {data.summaryStats.reduce((sum, s) => sum + (s.total_entries || 0), 0).toLocaleString()}
            </div>
          </div>

          <div className="bg-purple-50 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="h-5 w-5 text-purple-600" />
              <span className="text-sm font-medium text-gray-700">Total Hours</span>
            </div>
            <div className="text-2xl font-bold text-gray-900">
              {data.summaryStats.reduce((sum, s) => sum + (s.total_hours || 0), 0).toFixed(2)}h
            </div>
          </div>
        </div>
      </div>

      {/* Tenant Summary Table */}
      <div className="bg-white shadow-sm rounded-lg border border-gray-200">
        <div className="p-6">
          <h3 className="text-sm font-medium text-gray-900 mb-4">Activity by Tenant</h3>

          <div className="space-y-2">
            {data.summaryStats.map((tenant) => (
              <div key={tenant.tenant_id} className="border border-gray-200 rounded-lg">
                {/* Tenant Header */}
                <button
                  onClick={() => setExpandedTenant(expandedTenant === tenant.tenant_id ? null : tenant.tenant_id)}
                  className="w-full p-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center gap-4 flex-1">
                    <div className="flex-1 text-left">
                      <h4 className="text-sm font-semibold text-gray-900">{tenant.tenant_name}</h4>
                    </div>

                    <div className="flex items-center gap-6 text-sm">
                      <div>
                        <span className="text-gray-500">Total Users: </span>
                        <span className="font-semibold text-gray-900">{tenant.total_users}</span>
                      </div>
                      <div>
                        <span className="text-gray-500">Active ({period}d): </span>
                        <span className="font-semibold text-green-600">{tenant.active_users}</span>
                      </div>
                      <div>
                        <span className="text-gray-500">Entries: </span>
                        <span className="font-semibold text-blue-600">{tenant.total_entries?.toLocaleString() || 0}</span>
                      </div>
                      <div>
                        <span className="text-gray-500">Hours: </span>
                        <span className="font-semibold text-purple-600">{tenant.total_hours?.toFixed(2) || '0.00'}h</span>
                      </div>
                    </div>
                  </div>
                </button>

                {/* Expanded User Details */}
                {expandedTenant === tenant.tenant_id && (
                  <div className="border-t border-gray-200 bg-gray-50 p-4">
                    <div className="space-y-2">
                      {data.detailedStats
                        .filter((user) => user.tenant_id === tenant.tenant_id)
                        .map((user) => (
                          <div
                            key={`${user.tenant_id}-${user.resource_no}`}
                            className="flex items-center justify-between p-3 bg-white rounded border border-gray-200"
                          >
                            <div className="flex-1">
                              <p className="text-sm font-medium text-gray-900">{user.resource_no}</p>
                              <p className="text-xs text-gray-500">
                                {user.company_name} • {user.total_entries} entries • {user.total_hours.toFixed(2)}h
                              </p>
                            </div>
                            <div className="flex items-center gap-4">
                              <div className="text-right">
                                <p className="text-xs text-gray-500">Last Activity</p>
                                <p className="text-sm font-medium text-gray-900">
                                  {formatDate(user.last_activity)}
                                </p>
                                {user.days_since_activity !== null && (
                                  <p className="text-xs text-gray-500">{user.days_since_activity} days ago</p>
                                )}
                              </div>
                              {getActivityBadge(user.days_since_activity)}
                            </div>
                          </div>
                        ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserActivityAnalytics;
