import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Calendar } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { TimeEntry, Assignment } from '../../types';

interface WeeklyTimesheetProps {
  assignments: Assignment;
  timeEntries: TimeEntry[];
  onUpdate: () => void;
  companyId: string;
  onWeekChange?: (date: Date) => void;
  loading?: boolean;
}

interface TimeMatrix {
  [taskKey: string]: {
    [date: string]: number;
  };
}

const WeeklyTimesheet: React.FC<WeeklyTimesheetProps> = ({
  assignments,
  timeEntries,
  onWeekChange,
  loading = false
}) => {
  const { t, i18n } = useTranslation(['dashboard', 'common']);
  const [currentWeek, setCurrentWeek] = useState<Date>(new Date());
  const [timeMatrix, setTimeMatrix] = useState<TimeMatrix>({});

  // Get week dates
  const getWeekDates = (date: Date): Date[] => {
    const week = [];
    const startOfWeek = new Date(date);
    const day = startOfWeek.getDay();
    const diff = startOfWeek.getDate() - day + (day === 0 ? -6 : 1); // Monday as first day
    startOfWeek.setDate(diff);

    for (let i = 0; i < 7; i++) {
      const dayDate = new Date(startOfWeek);
      dayDate.setDate(startOfWeek.getDate() + i);
      week.push(dayDate);
    }
    return week;
  };

  const weekDates = getWeekDates(currentWeek);

  // Build time matrix from entries
  useEffect(() => {
    const matrix: TimeMatrix = {};
    
    console.log('🔍 Building time matrix with entries:', timeEntries);
    
    timeEntries.forEach(entry => {
      const entryDate = entry.date;
      const taskKey = `${entry.bc_job_id}-${entry.bc_task_id}`; // Clave compuesta
      
      if (!matrix[taskKey]) {
        matrix[taskKey] = {};
      }
      matrix[taskKey][entryDate] = (matrix[taskKey][entryDate] || 0) + entry.hours;
    });
    
    console.log('🔍 Final matrix:', matrix);
    setTimeMatrix(matrix);
  }, [timeEntries]);

  // Navigate weeks
  const previousWeek = () => {
    const newDate = new Date(currentWeek);
    newDate.setDate(newDate.getDate() - 7);
    setCurrentWeek(newDate);
    onWeekChange?.(newDate);
  };

  const nextWeek = () => {
    const newDate = new Date(currentWeek);
    newDate.setDate(newDate.getDate() + 7);
    setCurrentWeek(newDate);
    onWeekChange?.(newDate);
  };

  const goToThisWeek = () => {
    const today = new Date();
    setCurrentWeek(today);
    onWeekChange?.(today);
  };

  // Calculate totals using task keys
  const getTaskTotal = (job: any, task: any): number => {
    const taskKey = `${job.bc_job_id}-${task.bc_task_id}`;
    return weekDates.reduce((total, date) => {
      const dateStr = date.toISOString().split('T')[0];
      return total + (timeMatrix[taskKey]?.[dateStr] || 0);
    }, 0);
  };

  const getDayTotal = (date: string): number => {
    return assignments.jobs.reduce((total, job) => {
      const jobTasks = assignments.tasks.filter(task => task.job_id === job.id);
      return total + jobTasks.reduce((taskTotal, task) => {
        const taskKey = `${job.bc_job_id}-${task.bc_task_id}`;
        return taskTotal + (timeMatrix[taskKey]?.[date] || 0);
      }, 0);
    }, 0);
  };

  const getWeekTotal = (): number => {
    return assignments.jobs.reduce((total, job) => {
      const jobTasks = assignments.tasks.filter(task => task.job_id === job.id);
      return total + jobTasks.reduce((taskTotal, task) => {
        return taskTotal + getTaskTotal(job, task);
      }, 0);
    }, 0);
  };

  // Group tasks by job for better display
  const tasksByJob = assignments.jobs.map(job => ({
    job,
    tasks: assignments.tasks.filter(task => task.job_id === job.id)
  })).filter(group => group.tasks.length > 0);

  const formatDate = (date: Date): string => {
    // Use current language for date formatting
    const locale = i18n.language === 'es' ? 'es-ES' : 'en-US';
    return date.toLocaleDateString(locale, { 
      weekday: 'short', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  const formatWeekRange = (startDate: Date, endDate: Date): string => {
    const locale = i18n.language === 'es' ? 'es-ES' : 'en-US';
    const startStr = startDate.toLocaleDateString(locale, { 
      month: 'long', 
      day: 'numeric' 
    });
    const endStr = endDate.toLocaleDateString(locale, { 
      month: 'long', 
      day: 'numeric', 
      year: 'numeric' 
    });
    return `${startStr} - ${endStr}`;
  };

  const isToday = (date: Date): boolean => {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  // Get sync status styling
  const getSyncStatusStyling = (job: any, task: any, dateStr: string) => {
    const existingEntry = timeEntries.find(e => 
      e.bc_job_id === job.bc_job_id && 
      e.bc_task_id === task.bc_task_id && 
      e.date === dateStr
    );
    
    if (!existingEntry) return 'border-gray-200 bg-gray-50';
    
    switch (existingEntry.bc_sync_status) {
      case 'not_synced': return 'border-orange-200 bg-orange-25';
      case 'synced': return 'border-blue-200 bg-blue-25';
      case 'error': return 'border-red-200 bg-red-25';
      default: return 'border-gray-200 bg-gray-50';
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 relative">
      {/* Loading Overlay */}
      {loading && (
        <div className="absolute inset-0 bg-white/80 backdrop-blur-sm z-10 flex items-center justify-center rounded-lg">
          <div className="flex flex-col items-center gap-3">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            <p className="text-sm font-medium text-gray-700">Loading entries...</p>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">
            {t('dashboard:charts.weekly_timesheet', 'Weekly Timesheet')}
          </h2>
          
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <button
                onClick={previousWeek}
                disabled={loading}
                className="p-2 text-gray-400 hover:text-gray-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                title={t('common:buttons.previous')}
              >
                <ChevronLeft className="w-5 h-5" />
              </button>

              <div className="text-sm font-medium text-gray-900 min-w-[200px] text-center">
                {formatWeekRange(weekDates[0], weekDates[6])}
              </div>

              <button
                onClick={nextWeek}
                disabled={loading}
                className="p-2 text-gray-400 hover:text-gray-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                title={t('common:buttons.next')}
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>

            <button
              onClick={goToThisWeek}
              disabled={loading}
              className="flex items-center gap-2 px-3 py-2 text-sm bg-blue-50 text-blue-700 rounded-md hover:bg-blue-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Calendar className="w-4 h-4" />
              {t('dashboard:summary.this_week', 'This Week')}
            </button>
          </div>
        </div>
      </div>

      {/* Timesheet Grid */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-200 bg-gray-50">
              <th className="text-left p-4 font-medium text-gray-900 min-w-[250px]">
                {t('tracker:fields.project')} / {t('tracker:fields.task')}
              </th>
              {weekDates.map((date, index) => (
                <th
                  key={index}
                  className={`text-center p-4 font-medium min-w-[100px] ${
                    isToday(date)
                      ? 'bg-blue-50 text-blue-900'
                      : 'text-gray-900'
                  }`}
                >
                  <div className="text-sm">{formatDate(date)}</div>
                </th>
              ))}
              <th className="text-center p-4 font-medium text-gray-900 min-w-[80px]">
                {t('tracker:fields.total_time', 'Total')}
              </th>
            </tr>
          </thead>
          <tbody>
            {tasksByJob.map((jobGroup) => (
              <React.Fragment key={jobGroup.job.id}>
                {/* Job Header */}
                <tr className="border-b border-gray-200 bg-gray-25">
                  <td 
                    colSpan={9} 
                    className="p-3 text-sm font-medium text-gray-700 bg-gray-25"
                  >
                    📁 {jobGroup.job.bc_job_id} - {jobGroup.job.name}
                  </td>
                </tr>

                {/* Tasks */}
                {jobGroup.tasks.map((task) => (
                  <tr 
                    key={`${jobGroup.job.bc_job_id}-${task.bc_task_id}`}
                    className="border-b border-gray-100"
                  >
                    <td className="p-4">
                      <div className="text-sm font-medium text-gray-900">
                        {task.description}
                      </div>
                    </td>

                    {weekDates.map((date, dayIndex) => {
                      const dateStr = date.toISOString().split('T')[0];
                      const taskKey = `${jobGroup.job.bc_job_id}-${task.bc_task_id}`;
                      const value = timeMatrix[taskKey]?.[dateStr] || 0;
                      const syncStyling = getSyncStatusStyling(jobGroup.job, task, dateStr);
                      
                      return (
                        <td
                          key={dayIndex}
                          className={`p-2 text-center ${
                            isToday(date) ? 'bg-blue-25' : ''
                          }`}
                        >
                          <div
                            className={`
                              w-16 px-2 py-1 text-center text-sm border rounded mx-auto
                              ${value > 0 ? 'font-medium text-gray-900' : 'text-gray-400'}
                              ${syncStyling}
                            `}
                          >
                            {value > 0 ? value.toFixed(1) : '-'}
                          </div>
                        </td>
                      );
                    })}

                    <td className="p-4 text-center font-medium text-gray-900">
                      {getTaskTotal(jobGroup.job, task).toFixed(1)}h
                    </td>
                  </tr>
                ))}
              </React.Fragment>
            ))}

            {/* Daily Totals Row */}
            <tr className="border-t-2 border-gray-300 bg-gray-50 font-medium">
              <td className="p-4 text-gray-900">
                {t('dashboard:summary.daily_totals', 'Daily Totals')}
              </td>
              {weekDates.map((date, index) => {
                const dateStr = date.toISOString().split('T')[0];
                const dayTotal = getDayTotal(dateStr);
                
                return (
                  <td
                    key={index}
                    className={`p-4 text-center ${
                      dayTotal > 8 ? 'text-red-600' : 'text-gray-900'
                    } ${isToday(date) ? 'bg-blue-50' : ''}`}
                  >
                    {dayTotal.toFixed(1)}h
                  </td>
                );
              })}
              <td className="p-4 text-center font-bold text-gray-900">
                {getWeekTotal().toFixed(1)}h
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default WeeklyTimesheet;