import React, { useState, useEffect, useCallback } from 'react';
import { Play, Calendar } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import ClockifyTracker from './ClockifyTracker';
import RecentEntries from './RecentEntries';
import WeeklyTimesheet from './WeeklyTimesheet';
import SyncButton from '../sync/SyncButton';
import { useAuth } from '../../context/AuthContext';
import apiService from '../../services/api';
import { Assignment, TimeEntry } from '../../types';

// Utility functions
const formatDate = (date: Date): string => {
  return date.toISOString().split('T')[0];
};

const getWeekDates = (date: Date) => {
  const start = new Date(date);
  const day = start.getDay();
  const diff = start.getDate() - day + (day === 0 ? -6 : 1);
  start.setDate(diff);
  start.setHours(0, 0, 0, 0);
  
  const end = new Date(start);
  end.setDate(start.getDate() + 6);
  end.setHours(23, 59, 59, 999);
  
  return { start, end };
};

const Dashboard: React.FC = () => {
  const { t } = useTranslation(['dashboard', 'common']);
  const { user, company } = useAuth();
  const [activeTab, setActiveTab] = useState<'tracker' | 'timesheet'>('tracker');
  const [assignments, setAssignments] = useState<Assignment>({ jobs: [], tasks: [] });
  const [timeEntries, setTimeEntries] = useState<TimeEntry[]>([]);
  const [recentEntries, setRecentEntries] = useState<TimeEntry[]>([]);
  const [currentWeek, setCurrentWeek] = useState(getWeekDates(new Date()));
  const [loading, setLoading] = useState(true);
  const [loadingEntries, setLoadingEntries] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [syncRefreshTrigger, setSyncRefreshTrigger] = useState(0); // Trigger for SyncButton refresh
  const ENTRIES_PER_PAGE = 20;

  // Debug: Watch assignments changes
  useEffect(() => {
    console.log('🔍 Dashboard - assignments changed:', assignments);
    console.log('🔍 Dashboard - jobs count:', assignments?.jobs?.length || 0);
    console.log('🔍 Dashboard - tasks count:', assignments?.tasks?.length || 0);
  }, [assignments]);

  // Debug: Watch company changes
  useEffect(() => {
    console.log('🔍 Dashboard - company changed:', company);
  }, [company]);


  const loadAssignments = useCallback(async () => {
    if (!company) {
      console.log('🔍 Dashboard - loadAssignments called but no company');
      return;
    }

    console.log('🔍 Dashboard - loadAssignments called with company:', company.id);
    setLoading(true);

    try {
      const jobsData = await apiService.getJobs(company.id);

      console.log('🔍 Dashboard - jobsData received:', jobsData);
      console.log('🔍 Dashboard - jobs count:', jobsData?.jobs?.length || 0);
      console.log('🔍 Dashboard - tasks count:', jobsData?.tasks?.length || 0);

      if (jobsData && typeof jobsData === 'object') {
        const validJobsData = {
          jobs: Array.isArray(jobsData.jobs) ? jobsData.jobs : [],
          tasks: Array.isArray(jobsData.tasks) ? jobsData.tasks : []
        };

        console.log('🔍 Dashboard - setting assignments:', validJobsData);
        setAssignments(validJobsData);
      } else {
        console.warn('🔍 Dashboard - Invalid jobsData format:', jobsData);
        setAssignments({ jobs: [], tasks: [] });
      }
    } catch (error) {
      console.error('🔍 Dashboard - Error loading assignments:', error);
      setAssignments({ jobs: [], tasks: [] });
    } finally {
      setLoading(false);
    }
  }, [company]);

  const loadTimeEntries = useCallback(async () => {
    if (!company) return;

    setLoadingEntries(true);
    try {
      const timeEntriesData = await apiService.getTimeEntries(
        company.id,
        formatDate(currentWeek.start),
        formatDate(currentWeek.end)
      );

      setTimeEntries(Array.isArray(timeEntriesData) ? timeEntriesData : []);
      console.log('🔍 Dashboard - Time entries loaded:', timeEntriesData?.length || 0);
    } catch (error) {
      console.error('🔍 Dashboard - Error loading time entries:', error);
      setTimeEntries([]);
    } finally {
      setLoadingEntries(false);
    }
  }, [company, currentWeek.start, currentWeek.end]);

  const loadRecentEntries = useCallback(async (page = 1, append = false) => {
    if (!company || !user) return;

    try {
      setLoadingMore(true);
      const offset = (page - 1) * ENTRIES_PER_PAGE;

      const entries = await apiService.getTimeEntries(
        company.id,
        undefined, // No from date - get all entries
        undefined, // No to date - get all entries including future
        ENTRIES_PER_PAGE,
        offset,
        user.resourceNo // Filter by current user's resource
      );

      if (append) {
        setRecentEntries(prev => [...prev, ...entries]);
      } else {
        setRecentEntries(entries);
      }

      setHasMore(entries.length === ENTRIES_PER_PAGE);
    } catch (error) {
      console.error('🔍 Dashboard - Error loading recent entries:', error);
      setRecentEntries([]);
      setHasMore(false);
    } finally {
      setLoadingMore(false);
    }
  }, [company, user, ENTRIES_PER_PAGE]);

  const handleLoadMore = () => {
    const nextPage = currentPage + 1;
    setCurrentPage(nextPage);
    loadRecentEntries(nextPage, true);
  };

  // Load all data (used on initial load or sync)
  const loadData = useCallback(async () => {
    await Promise.all([loadAssignments(), loadTimeEntries(), loadRecentEntries(1, false)]);
    setCurrentPage(1);
  }, [loadAssignments, loadTimeEntries, loadRecentEntries]);

  // Refresh approval status from BC
  const refreshApprovalStatus = useCallback(async () => {
    if (!company) return;

    try {
      console.log('🔄 Refreshing approval status from BC...');
      const result = await apiService.refreshApprovalStatus(company.id);
      console.log('✅ Approval status refreshed:', result);

      if (result.updated_entries > 0) {
        console.log(`📊 ${result.updated_entries} entries updated with new approval status`);
        // Reload entries to show updated statuses
        await loadRecentEntries(1, false);
        setCurrentPage(1);
      }
    } catch (error) {
      console.error('❌ Error refreshing approval status:', error);
      // Don't show error to user - this is a background operation
    }
  }, [company, loadRecentEntries]);

  // Refresh only time entries (used when adding/editing entries)
  const refreshEntries = useCallback(async () => {
    await Promise.all([loadTimeEntries(), loadRecentEntries(1, false)]);
    setCurrentPage(1);
    // Trigger SyncButton refresh
    setSyncRefreshTrigger(prev => prev + 1);
  }, [loadTimeEntries, loadRecentEntries]);

  // Load assignments only when user/company changes
  useEffect(() => {
    console.log('🔍 Dashboard - useEffect triggered, user:', !!user, 'company:', !!company);
    if (user && company) {
      console.log('🔍 Dashboard - calling loadAssignments...');
      loadAssignments();
    }
  }, [user, company, loadAssignments]);

  // Load time entries when currentWeek changes
  useEffect(() => {
    if (user && company) {
      console.log('🔍 Dashboard - week changed, loading time entries...');
      loadTimeEntries();
    }
  }, [user, company, currentWeek, loadTimeEntries]);

  // Load recent entries when tracker tab is active
  useEffect(() => {
    if (user && company && activeTab === 'tracker') {
      console.log('🔍 Dashboard - tracker tab active, loading recent entries...');
      loadRecentEntries(1, false);
      setCurrentPage(1);

      // Also refresh approval status from BC
      refreshApprovalStatus();
    }
  }, [user, company, activeTab, loadRecentEntries, refreshApprovalStatus]);

  const setWeekByDate = (date: Date) => {
    setCurrentWeek(getWeekDates(date));
  };

  // Tabs with translations
  const tabs = [
    { id: 'tracker' as const, label: t('common:navigation.time_tracker'), icon: Play },
    { id: 'timesheet' as const, label: t('dashboard:charts.weekly_timesheet'), icon: Calendar }
  ];

  console.log('🔍 Dashboard - render, loading:', loading, 'jobs:', assignments?.jobs?.length || 0);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
        <span className="ml-2">{t('common:status.loading')}</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Dashboard Header con Sync Button - Responsive */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
          {/* Company Info */}
          <div className="flex-1 min-w-0">
            <h1 className="text-lg sm:text-xl font-bold text-gray-900 truncate">
              {company?.name || t('dashboard:title')}
            </h1>
            <p className="text-xs sm:text-sm text-gray-500 truncate">
              {user?.displayName} • {t('dashboard:summary.projects_count', { count: assignments.jobs.length })} • {t('dashboard:summary.tasks_count', { count: assignments.tasks.length })}
            </p>
          </div>

          {/* Sync Button */}
          {company && (
            <div className="flex-shrink-0">
              <SyncButton
                companyId={company.id}
                onSyncComplete={loadData}
                refreshTrigger={syncRefreshTrigger}
              />
            </div>
          )}
        </div>

        {/* Navigation Tabs - Responsive */}
        <div className="border-b border-gray-200">
          <div className="flex space-x-4 sm:space-x-8 -mb-px overflow-x-auto">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center py-2 px-1 border-b-2 font-medium text-xs sm:text-sm transition-colors whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <tab.icon className="h-4 w-4 mr-1 sm:mr-2" />
                <span className="hidden sm:inline">{tab.label}</span>
                <span className="sm:hidden">{tab.id === 'tracker' ? 'Timer' : 'Week'}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Tab Content */}
      {activeTab === 'tracker' && (
        <div className="space-y-6">
          {/* Tracker Section */}
          <ClockifyTracker
            assignments={assignments}
            onUpdate={refreshEntries}
            companyId={company?.id || ''}
          />

          {/* Recent Entries Section - Separated */}
          <RecentEntries
            entries={recentEntries}
            assignments={assignments}
            onUpdate={refreshEntries}
            onLoadMore={handleLoadMore}
            hasMore={hasMore}
            loadingMore={loadingMore}
          />
        </div>
      )}

      {activeTab === 'timesheet' && (
        <WeeklyTimesheet
          assignments={assignments}
          timeEntries={timeEntries}
          onUpdate={refreshEntries}
          companyId={company?.id || ''}
          onWeekChange={setWeekByDate}
          loading={loadingEntries}
        />
      )}
    </div>
  );
};

export default Dashboard;