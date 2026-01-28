import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Calendar, Save } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { TimeEntry, Assignment, TimesheetPendingChanges } from '../../types';
import apiService from '../../services/api';

interface WeeklyTimesheetProps {
  assignments: Assignment;
  timeEntries: TimeEntry[];
  onUpdate: () => void;
  companyId: string;
  onWeekChange?: (date: Date) => void;
  loading?: boolean;
  editable?: boolean;
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
  onUpdate,
  companyId,
  loading = false,
  editable = false
}) => {
  const { t, i18n } = useTranslation(['dashboard', 'common']);
  const [currentWeek, setCurrentWeek] = useState<Date>(new Date());
  const [timeMatrix, setTimeMatrix] = useState<TimeMatrix>({});
  const [pendingChanges, setPendingChanges] = useState<TimesheetPendingChanges>({});
  const [editingCell, setEditingCell] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

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
      const taskKey = `${entry.bc_job_id}::${entry.bc_task_id}`; // Clave compuesta (:: evita conflictos con guiones en IDs)
      
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
    const taskKey = `${job.bc_job_id}::${task.bc_task_id}`;
    return weekDates.reduce((total, date) => {
      const dateStr = date.toISOString().split('T')[0];
      return total + (timeMatrix[taskKey]?.[dateStr] || 0);
    }, 0);
  };

  const getDayTotal = (date: string): number => {
    return assignments.jobs.reduce((total, job) => {
      const jobTasks = assignments.tasks.filter(task => task.job_id === job.id);
      return total + jobTasks.reduce((taskTotal, task) => {
        const taskKey = `${job.bc_job_id}::${task.bc_task_id}`;
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

  // Get sync status styling with enhanced indicators
  const getSyncStatusStyling = (job: any, task: any, dateStr: string) => {
    const existingEntry = timeEntries.find(e =>
      e.bc_job_id === job.bc_job_id &&
      e.bc_task_id === task.bc_task_id &&
      e.date === dateStr
    );

    if (!existingEntry) return 'border-gray-200 bg-gray-50';

    switch (existingEntry.bc_sync_status) {
      case 'not_synced': return 'border-orange-300 bg-orange-50 ring-1 ring-orange-200';
      case 'synced': return 'border-blue-300 bg-blue-50 ring-1 ring-blue-200';
      case 'error': return 'border-red-300 bg-red-50 ring-1 ring-red-200';
      default: return 'border-gray-200 bg-gray-50';
    }
  };

  // ===== EDITING HANDLERS =====

  const handleCellClick = (taskKey: string, dateStr: string, currentHours: number) => {
    if (!editable) return;

    const cellKey = `${taskKey}:${dateStr}`;
    setEditingCell(cellKey);

    if (!pendingChanges[cellKey]) {
      setPendingChanges(prev => ({
        ...prev,
        [cellKey]: {
          taskKey,
          date: dateStr,
          hours: currentHours,
          originalHours: currentHours,
          isDirty: false
        }
      }));
    }
  };

  const handleCellChange = (cellKey: string, newHours: number) => {
    setPendingChanges(prev => {
      const existing = prev[cellKey];
      if (!existing) return prev;

      return {
        ...prev,
        [cellKey]: {
          ...existing,
          hours: newHours,
          isDirty: newHours !== existing.originalHours
        }
      };
    });
  };

  const handleCellBlur = () => {
    setEditingCell(null);
  };

  const getCellEditState = (cellKey: string) => {
    return pendingChanges[cellKey];
  };

  const hasPendingChanges = Object.values(pendingChanges).some(cell => cell.isDirty);

  const handleSaveAll = async () => {
    if (!hasPendingChanges || saving) return;

    setSaving(true);

    try {
      const dirtyChanges = Object.values(pendingChanges).filter(cell => cell.isDirty);

      const entries = dirtyChanges.map(cell => {
        const [bc_job_id, bc_task_id] = cell.taskKey.split('::');
        return {
          bc_job_id,
          bc_task_id,
          date: cell.date,
          hours: cell.hours,
          description: `Timesheet entry for ${cell.date}`
        };
      });

      const result = await apiService.bulkSaveTimeEntries({
        companyId: companyId,
        entries
      });

      if (result.success || result.failed === 0) {
        setPendingChanges({});
        onUpdate();
        console.log(`✅ Saved ${result.created + result.updated} entries`);
      } else {
        console.error(`❌ Failed to save ${result.failed} entries:`, result.errors);
      }
    } catch (error) {
      console.error('❌ Save all error:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleDiscardAll = () => {
    setPendingChanges({});
    setEditingCell(null);
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

      {/* Header - Responsive */}
      <div className="p-4 sm:p-6 border-b border-gray-200">
        <div className="flex flex-col gap-4">
          {/* Title */}
          <h2 className="text-lg font-semibold text-gray-900">
            {t('dashboard:charts.weekly_timesheet', 'Weekly Timesheet')}
          </h2>

          {/* Navigation Controls - Responsive */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            {/* Week Navigation */}
            <div className="flex items-center gap-2 justify-center sm:justify-start">
              <button
                onClick={previousWeek}
                disabled={loading}
                className="p-2 text-gray-400 hover:text-gray-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0"
                title={t('common:buttons.previous')}
              >
                <ChevronLeft className="w-5 h-5" />
              </button>

              <div className="text-xs sm:text-sm font-medium text-gray-900 min-w-[180px] sm:min-w-[200px] text-center">
                {formatWeekRange(weekDates[0], weekDates[6])}
              </div>

              <button
                onClick={nextWeek}
                disabled={loading}
                className="p-2 text-gray-400 hover:text-gray-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0"
                title={t('common:buttons.next')}
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>

            {/* This Week Button - Responsive */}
            <button
              onClick={goToThisWeek}
              disabled={loading}
              className="flex items-center justify-center gap-2 px-3 py-2 text-xs sm:text-sm bg-blue-50 text-blue-700 rounded-md hover:bg-blue-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0"
            >
              <Calendar className="w-4 h-4 flex-shrink-0" />
              <span className="whitespace-nowrap">{t('dashboard:summary.this_week', 'This Week')}</span>
            </button>
          </div>

          {/* Save All Button - Only in editable mode */}
          {editable && (
            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={handleSaveAll}
                disabled={!hasPendingChanges || saving || loading}
                className={`
                  flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-md
                  transition-colors disabled:opacity-50 disabled:cursor-not-allowed
                  ${hasPendingChanges
                    ? 'bg-blue-600 text-white hover:bg-blue-700'
                    : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  }
                `}
              >
                {saving ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    <span>Saving...</span>
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    <span>Save All ({Object.values(pendingChanges).filter(c => c.isDirty).length})</span>
                  </>
                )}
              </button>

              {hasPendingChanges && (
                <button
                  onClick={handleDiscardAll}
                  disabled={saving || loading}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors disabled:opacity-50"
                >
                  Discard
                </button>
              )}

              {/* Sync Status Legend */}
              <div className="flex flex-wrap items-center gap-4 text-xs text-gray-600 ml-auto">
                <div className="flex items-center gap-1">
                  <div className="w-3 h-3 border-2 border-orange-300 bg-orange-50 rounded"></div>
                  <span>Not Synced</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-3 h-3 border-2 border-blue-300 bg-blue-50 rounded"></div>
                  <span>Synced to BC</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-3 h-3 border-2 border-red-300 bg-red-50 rounded"></div>
                  <span>Sync Error</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-3 h-3 border-2 border-yellow-400 bg-yellow-50 rounded"></div>
                  <span>Unsaved</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Timesheet Grid - Responsive */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-200 bg-gray-50">
              <th className="text-left p-2 sm:p-4 font-medium text-gray-900 min-w-[180px] sm:min-w-[250px] text-xs sm:text-sm">
                {t('tracker:fields.project')} / {t('tracker:fields.task')}
              </th>
              {weekDates.map((date, index) => (
                <th
                  key={index}
                  className={`text-center p-2 sm:p-4 font-medium min-w-[70px] sm:min-w-[100px] text-xs sm:text-sm ${
                    isToday(date)
                      ? 'bg-blue-50 text-blue-900'
                      : 'text-gray-900'
                  }`}
                >
                  <div className="text-xs sm:text-sm">{formatDate(date)}</div>
                </th>
              ))}
              <th className="text-center p-2 sm:p-4 font-medium text-gray-900 min-w-[60px] sm:min-w-[80px] text-xs sm:text-sm">
                {t('tracker:fields.total_time', 'Total')}
              </th>
            </tr>
          </thead>
          <tbody>
            {tasksByJob.map((jobGroup) => (
              <React.Fragment key={jobGroup.job.id}>
                {/* Job Header - Responsive */}
                <tr className="border-b border-gray-200 bg-gray-25">
                  <td
                    colSpan={9}
                    className="p-2 sm:p-3 text-xs sm:text-sm font-medium text-gray-700 bg-gray-25"
                  >
                    📁 {jobGroup.job.bc_job_id} - {jobGroup.job.name}
                  </td>
                </tr>

                {/* Tasks - Responsive */}
                {jobGroup.tasks.map((task) => (
                  <tr
                    key={`${jobGroup.job.bc_job_id}::${task.bc_task_id}`}
                    className="border-b border-gray-100"
                  >
                    <td className="p-2 sm:p-4">
                      <div className="text-xs sm:text-sm font-medium text-gray-900">
                        {task.description}
                      </div>
                    </td>

                    {weekDates.map((date, dayIndex) => {
                      const dateStr = date.toISOString().split('T')[0];
                      const taskKey = `${jobGroup.job.bc_job_id}::${task.bc_task_id}`;
                      const cellKey = `${taskKey}:${dateStr}`;

                      const cellEdit = getCellEditState(cellKey);
                      const matrixValue = timeMatrix[taskKey]?.[dateStr] || 0;
                      const displayValue = cellEdit?.hours ?? matrixValue;

                      const syncStyling = getSyncStatusStyling(jobGroup.job, task, dateStr);
                      const isEditing = editingCell === cellKey;
                      const isDirty = cellEdit?.isDirty || false;

                      return (
                        <td
                          key={dayIndex}
                          className={`p-1 sm:p-2 text-center ${
                            isToday(date) ? 'bg-blue-25' : ''
                          }`}
                        >
                          {editable && isEditing ? (
                            <input
                              type="number"
                              step="0.5"
                              min="0"
                              max="24"
                              value={displayValue}
                              onChange={(e) => handleCellChange(cellKey, parseFloat(e.target.value) || 0)}
                              onBlur={handleCellBlur}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') handleCellBlur();
                                if (e.key === 'Escape') {
                                  handleDiscardAll();
                                  handleCellBlur();
                                }
                              }}
                              autoFocus
                              className={`
                                w-12 sm:w-16 px-1 sm:px-2 py-1 text-center text-xs sm:text-sm border rounded
                                focus:outline-none focus:ring-2 focus:ring-blue-500
                                ${isDirty ? 'bg-yellow-50 border-yellow-400' : 'border-gray-300'}
                              `}
                            />
                          ) : (
                            <div
                              onClick={() => editable && handleCellClick(taskKey, dateStr, displayValue)}
                              className={`
                                w-12 sm:w-16 px-1 sm:px-2 py-1 text-center text-xs sm:text-sm border rounded mx-auto
                                ${displayValue > 0 ? 'font-medium text-gray-900' : 'text-gray-400'}
                                ${syncStyling}
                                ${isDirty ? 'bg-yellow-50 border-yellow-400' : ''}
                                ${editable ? 'cursor-pointer hover:bg-blue-50' : 'cursor-default'}
                              `}
                              title={editable ? 'Click to edit' : undefined}
                            >
                              {displayValue > 0 ? displayValue.toFixed(1) : '-'}
                              {isDirty && <span className="ml-1 text-yellow-600">*</span>}
                            </div>
                          )}
                        </td>
                      );
                    })}

                    <td className="p-2 sm:p-4 text-center font-medium text-gray-900 text-xs sm:text-sm">
                      {getTaskTotal(jobGroup.job, task).toFixed(1)}h
                    </td>
                  </tr>
                ))}
              </React.Fragment>
            ))}

            {/* Daily Totals Row - Responsive */}
            <tr className="border-t-2 border-gray-300 bg-gray-50 font-medium">
              <td className="p-2 sm:p-4 text-gray-900 text-xs sm:text-sm">
                {t('dashboard:summary.daily_totals', 'Daily Totals')}
              </td>
              {weekDates.map((date, index) => {
                const dateStr = date.toISOString().split('T')[0];
                const dayTotal = getDayTotal(dateStr);

                return (
                  <td
                    key={index}
                    className={`p-2 sm:p-4 text-center text-xs sm:text-sm ${
                      dayTotal > 8 ? 'text-red-600' : 'text-gray-900'
                    } ${isToday(date) ? 'bg-blue-50' : ''}`}
                  >
                    {dayTotal.toFixed(1)}h
                  </td>
                );
              })}
              <td className="p-2 sm:p-4 text-center font-bold text-gray-900 text-xs sm:text-sm">
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