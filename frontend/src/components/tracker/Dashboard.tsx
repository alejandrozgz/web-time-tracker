import React, { useState, useEffect, useCallback } from 'react';
import { Play, Calendar } from 'lucide-react';
import ClockifyTracker from './ClockifyTracker';
import WeeklyTimesheet from './WeeklyTimesheet';
import SyncButton from '../sync/SyncButton';
import { useAuth } from '../../context/AuthContext';
import apiService from '../../services/api';
import { Assignment, TimeEntry } from '../../types';

// Utility functions
const formatDate = (date: Date): string => {
  return date.toISOString().split('T')[0];
};

const getDayName = (date: Date): string => {
  const days = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
  return days[date.getDay()];
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
  const { user, company } = useAuth();
  const [activeTab, setActiveTab] = useState<'tracker' | 'timesheet'>('tracker');
  const [assignments, setAssignments] = useState<Assignment>({ jobs: [], tasks: [] });
  const [timeEntries, setTimeEntries] = useState<TimeEntry[]>([]);
  const [currentWeek, setCurrentWeek] = useState(getWeekDates(new Date()));
  const [loading, setLoading] = useState(true);
  const [forceUpdate, setForceUpdate] = useState(0);

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

  // Debug: Force re-render when jobs arrive
  useEffect(() => {
    if (assignments.jobs.length > 0) {
      console.log('🔍 Dashboard - forcing re-render with jobs:', assignments.jobs.length);
      setForceUpdate(prev => prev + 1);
    }
  }, [assignments]);

  const loadData = useCallback(async () => {
    if (!company) {
      console.log('🔍 Dashboard - loadData called but no company');
      return;
    }
    
    console.log('🔍 Dashboard - loadData called with company:', company.id);
    setLoading(true);
    
    try {
      console.log('🔍 Dashboard - starting API calls...');
      
      const [jobsData, timeEntriesData] = await Promise.all([
		  apiService.getJobs(company.id),
		  apiService.getTimeEntries(              // ✅ CAMBIAR ESTA LÍNEA
			company.id,                           // ✅ AGREGAR companyId AQUÍ
			formatDate(currentWeek.start),
			formatDate(currentWeek.end)
		  )
		]);

      console.log('🔍 Dashboard - API calls completed');
      console.log('🔍 Dashboard - jobsData received:', jobsData);
      console.log('🔍 Dashboard - jobsData type:', typeof jobsData);
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

      setTimeEntries(Array.isArray(timeEntriesData) ? timeEntriesData : []);
    } catch (error) {
      console.error('🔍 Dashboard - Error loading data:', error);
      setAssignments({ jobs: [], tasks: [] });
      setTimeEntries([]);
    } finally {
      setLoading(false);
    }
  }, [company, currentWeek.start, currentWeek.end]);

  useEffect(() => {
    console.log('🔍 Dashboard - useEffect triggered, user:', !!user, 'company:', !!company);
    if (user && company) {
      console.log('🔍 Dashboard - calling loadData...');
      loadData();
    }
  }, [user, company, loadData]);

  const navigateWeek = (direction: 'prev' | 'next') => {
    const newDate = new Date(currentWeek.start);
    newDate.setDate(newDate.getDate() + (direction === 'next' ? 7 : -7));
    setCurrentWeek(getWeekDates(newDate));
  };

  const tabs = [
    { id: 'tracker' as const, label: 'Tracker', icon: Play },
    { id: 'timesheet' as const, label: 'Hoja de Tiempo', icon: Calendar }
  ];

  console.log('🔍 Dashboard - render, loading:', loading, 'jobs:', assignments?.jobs?.length || 0);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
        <span className="ml-2">Cargando proyectos...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 🎯 DASHBOARD HEADER CON SYNC BUTTON */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <div className="flex items-center justify-between mb-4">
          {/* Company Info */}
          <div>
            <h1 className="text-xl font-bold text-gray-900">
              {company?.name || 'Dashboard'}
            </h1>
            <p className="text-sm text-gray-500">
              {user?.displayName} • {assignments.jobs.length} proyectos • {assignments.tasks.length} tareas
            </p>
          </div>

          {/* 🚀 SYNC BUTTON */}
          {company && (
            <SyncButton 
              companyId={company.id} 
              onSyncComplete={loadData}
            />
          )}
        </div>

        {/* Navigation Tabs */}
        <div className="border-b border-gray-200">
          <div className="flex space-x-8">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <tab.icon className="h-4 w-4 mr-2" />
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Debug Info - Remover en producción */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-sm">
        <h3 className="font-medium text-yellow-800">Debug Info:</h3>
        <p>Jobs: {assignments?.jobs?.length || 0}</p>
        <p>Tasks: {assignments?.tasks?.length || 0}</p>
        <p>Company: {company?.name || 'None'}</p>
        <p>Force Update: {forceUpdate}</p>
        {assignments?.jobs?.length > 0 && (
          <p>First Job: {assignments.jobs[0].name}</p>
        )}
      </div>

      {/* Tab Content */}
      {activeTab === 'tracker' && (
        <div>
          <ClockifyTracker
            assignments={assignments}
            onUpdate={loadData}
            companyId={company?.id || ''}
          />
        </div>
      )}
      
      {activeTab === 'timesheet' && (
        <WeeklyTimesheet
          assignments={assignments}
          timeEntries={timeEntries}
          onUpdate={loadData}
          companyId={company?.id || ''}
        />
      )}
    </div>
  );
};

export default Dashboard;