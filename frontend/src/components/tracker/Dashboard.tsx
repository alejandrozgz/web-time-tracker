import React, { useState, useEffect, useCallback } from 'react';
import { Play, Calendar } from 'lucide-react';
import ClockifyTracker from './ClockifyTracker';
import WeeklyTimesheet from './WeeklyTimesheet';
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

  const loadData = useCallback(async () => {
	  if (!company) return;
	  
	  setLoading(true);
	  try {
		const [jobsData, timeEntriesData] = await Promise.all([
		  apiService.getJobs(company.id),
		  apiService.getTimeEntries(
			formatDate(currentWeek.start),
			formatDate(currentWeek.end)
		  )
		]);

		setAssignments(jobsData);
		setTimeEntries(timeEntriesData);
	  } catch (error) {
		console.error('Error loading data:', error);
	  } finally {
		setLoading(false);
	  }
	}, [company, currentWeek.start, currentWeek.end]);

	useEffect(() => {
	  if (user && company) {
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

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Navigation Tabs */}
      <nav className="bg-white border-b border-gray-200 rounded-lg shadow-sm">
        <div className="px-6">
          <div className="flex space-x-8">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
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
      </nav>

      {/* Tab Content */}
      {activeTab === 'tracker' && (
        <ClockifyTracker
          assignments={assignments}
          onUpdate={loadData}
        />
      )}
      
      {activeTab === 'timesheet' && (
        <WeeklyTimesheet
          assignments={assignments}
          timeEntries={timeEntries}
          currentWeek={currentWeek}
          onWeekNavigate={navigateWeek}
          onUpdate={loadData}
          formatDate={formatDate}
          getDayName={getDayName}
        />
      )}
    </div>
  );
};

export default Dashboard;