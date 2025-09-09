import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Calendar } from 'lucide-react';
import toast from 'react-hot-toast';
import apiService from '../../services/api';
import { TimeEntry, Assignment } from '../../types';

interface WeeklyTimesheetProps {
  assignments: Assignment;
  timeEntries: TimeEntry[];
  onUpdate: () => void;
  companyId: string;
}

interface TimeMatrix {
  [taskBCId: string]: {
    [date: string]: number;
  };
}

interface PendingChange {
  taskBCId: string;
  date: string;
  hours: number;
}

const WeeklyTimesheet: React.FC<WeeklyTimesheetProps> = ({ 
  assignments, 
  timeEntries, 
  onUpdate,
  companyId 
}) => {
  const [currentWeek, setCurrentWeek] = useState<Date>(new Date());
  const [timeMatrix, setTimeMatrix] = useState<TimeMatrix>({});
  const [pendingChanges, setPendingChanges] = useState<{[key: string]: PendingChange}>({});

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
  const weekStart = weekDates[0].toISOString().split('T')[0];
  const weekEnd = weekDates[6].toISOString().split('T')[0];

  // Build time matrix from entries
  useEffect(() => {
    const matrix: TimeMatrix = {};
    
    timeEntries.forEach(entry => {
      const entryDate = entry.date;
      const taskBCId = entry.bc_task_id;
      
      if (!matrix[taskBCId]) {
        matrix[taskBCId] = {};
      }
      matrix[taskBCId][entryDate] = entry.hours;
    });
    
    setTimeMatrix(matrix);
  }, [timeEntries]);

  // Navigate weeks
  const previousWeek = () => {
    const newDate = new Date(currentWeek);
    newDate.setDate(newDate.getDate() - 7);
    setCurrentWeek(newDate);
  };

  const nextWeek = () => {
    const newDate = new Date(currentWeek);
    newDate.setDate(newDate.getDate() + 7);
    setCurrentWeek(newDate);
  };

  const goToThisWeek = () => {
    setCurrentWeek(new Date());
  };

  // Handle cell changes
  const handleCellChange = (taskBCId: string, date: string, hours: number) => {
    // Validate hours
    if (hours < 0 || hours > 24) {
      toast.error('Hours must be between 0 and 24');
      return;
    }

    // Check daily total
    const dailyTotal = assignments.tasks
      .filter(task => task.bc_task_id !== taskBCId)
      .reduce((sum, task) => {
        return sum + (timeMatrix[task.bc_task_id]?.[date] || 0);
      }, 0) + hours;

    if (dailyTotal > 24) {
      toast.error(`Daily total would exceed 24 hours. Total actual: ${(dailyTotal - hours).toFixed(2)}h`);
      return;
    }

    setTimeMatrix(prev => ({
      ...prev,
      [taskBCId]: {
        ...prev[taskBCId],
        [date]: hours
      }
    }));

    const changeKey = `${taskBCId}-${date}`;
    setPendingChanges(prev => ({
      ...prev,
      [changeKey]: { taskBCId, date, hours }
    }));
  };

  const handleCellBlur = async (taskBCId: string, date: string) => {
    const changeKey = `${taskBCId}-${date}`;
    const change = pendingChanges[changeKey];
    
    if (!change) return;

    try {
      const task = assignments.tasks.find(t => t.bc_task_id === taskBCId);
      const job = assignments.jobs.find(j => j.id === task?.job_id);
      const existingEntry = timeEntries.find(e => 
        e.bc_task_id === taskBCId && e.date === date
      );

      if (change.hours === 0) {
        if (existingEntry) {
          await apiService.deleteTimeEntry(existingEntry.id);
          toast.success('Entry deleted');
        }
      } else if (existingEntry) {
        await apiService.updateTimeEntry(existingEntry.id, { 
          hours: change.hours,
          description: existingEntry.description || `Time for ${task?.description}`
        });
        toast.success('Entry updated');
      } else {
        // Creating new entry - description is mandatory
        await apiService.createTimeEntry({
          bc_job_id: job?.bc_job_id || '',
          bc_task_id: taskBCId,
          date: date,
          hours: change.hours,
          description: `Time logged for ${task?.description}`,
          companyId
        });
        toast.success('Entry created');
      }

      // Remove from pending changes
      setPendingChanges(prev => {
        const { [changeKey]: _, ...rest } = prev;
        return rest;
      });

      onUpdate();
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Error saving entry');
      
      // Revert the change on error
      setTimeMatrix(prev => {
        const existingEntry = timeEntries.find(e => e.bc_task_id === taskBCId && e.date === date);
        return {
          ...prev,
          [taskBCId]: {
            ...prev[taskBCId],
            [date]: existingEntry ? existingEntry.hours : 0
          }
        };
      });

      // Remove from pending changes
      setPendingChanges(prev => {
        const { [changeKey]: _, ...rest } = prev;
        return rest;
      });
    }
  };

  // Calculate totals
  const getTaskTotal = (taskBCId: string): number => {
    return weekDates.reduce((total, date) => {
      const dateStr = date.toISOString().split('T')[0];
      return total + (timeMatrix[taskBCId]?.[dateStr] || 0);
    }, 0);
  };

  const getDayTotal = (date: string): number => {
    return assignments.tasks.reduce((total, task) => {
      return total + (timeMatrix[task.bc_task_id]?.[date] || 0);
    }, 0);
  };

  const getWeekTotal = (): number => {
    return assignments.tasks.reduce((total, task) => {
      return total + getTaskTotal(task.bc_task_id);
    }, 0);
  };

  // Group tasks by job for better display
  const tasksByJob = assignments.jobs.map(job => ({
    job,
    tasks: assignments.tasks.filter(task => task.job_id === job.id)
  })).filter(group => group.tasks.length > 0);

  const formatDate = (date: Date): string => {
    return date.toLocaleDateString('en-US', { 
      weekday: 'short', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  const isToday = (date: Date): boolean => {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  const isPendingChange = (taskBCId: string, date: string): boolean => {
    return `${taskBCId}-${date}` in pendingChanges;
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      {/* Header */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">Weekly Timesheet</h2>
          
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <button
                onClick={previousWeek}
                className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              
              <div className="text-sm font-medium text-gray-900 min-w-[200px] text-center">
                {weekDates[0].toLocaleDateString('en-US', { 
                  month: 'long', 
                  day: 'numeric' 
                })} - {weekDates[6].toLocaleDateString('en-US', { 
                  month: 'long', 
                  day: 'numeric', 
                  year: 'numeric' 
                })}
              </div>
              
              <button
                onClick={nextWeek}
                className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
            
            <button
              onClick={goToThisWeek}
              className="flex items-center gap-2 px-3 py-2 text-sm bg-blue-50 text-blue-700 rounded-md hover:bg-blue-100 transition-colors"
            >
              <Calendar className="w-4 h-4" />
              This Week
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
                Project / Task
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
                Total
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
                    key={task.bc_task_id}
                    className="border-b border-gray-100 hover:bg-gray-50"
                  >
                    <td className="p-4">
                      <div className="text-sm font-medium text-gray-900">
                        {task.bc_task_id}
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        {task.description}
                      </div>
                    </td>

                    {weekDates.map((date, dayIndex) => {
                      const dateStr = date.toISOString().split('T')[0];
                      const value = timeMatrix[task.bc_task_id]?.[dateStr] || 0;
                      const hasPendingChange = isPendingChange(task.bc_task_id, dateStr);
                      
                      return (
                        <td
                          key={dayIndex}
                          className={`p-2 text-center ${
                            isToday(date) ? 'bg-blue-25' : ''
                          }`}
                        >
                          <input
                            type="number"
                            step="0.1"
                            min="0"
                            max="24"
                            value={value || ''}
                            onChange={(e) => handleCellChange(
                              task.bc_task_id,
                              dateStr,
                              parseFloat(e.target.value) || 0
                            )}
                            onBlur={() => handleCellBlur(task.bc_task_id, dateStr)}
                            className={`
							  w-16 px-2 py-1 text-center text-sm border rounded
							  focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
							  ${hasPendingChange 
								? 'border-orange-300 bg-orange-50' 
								: (() => {
									const existingEntry = timeEntries.find(e => e.bc_task_id === task.bc_task_id && e.date === dateStr);
									return existingEntry?.bc_sync_status === 'local' ? 'border-orange-200 bg-orange-25' :
										   existingEntry?.bc_sync_status === 'draft' ? 'border-blue-200 bg-blue-25' :
										   existingEntry?.bc_sync_status === 'posted' ? 'border-green-200 bg-green-25' :
										   existingEntry?.bc_sync_status === 'error' ? 'border-red-200 bg-red-25' :
										   'border-gray-200';
								  })()
							  }
							  ${value > 0 ? 'font-medium' : ''}
							`}
							placeholder="0"
						/>
                        </td>
                      );
                    })}

                    <td className="p-4 text-center font-medium text-gray-900">
                      {getTaskTotal(task.bc_task_id).toFixed(1)}h
                    </td>
                  </tr>
                ))}
              </React.Fragment>
            ))}

            {/* Daily Totals Row */}
            <tr className="border-t-2 border-gray-300 bg-gray-50 font-medium">
              <td className="p-4 text-gray-900">Daily Totals</td>
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

      {/* Footer Info */}
      {Object.keys(pendingChanges).length > 0 && (
        <div className="p-4 bg-orange-50 border-t border-orange-200">
          <div className="flex items-center gap-2 text-sm text-orange-700">
            <div className="w-2 h-2 bg-orange-400 rounded-full"></div>
            <span>{Object.keys(pendingChanges).length} unsaved changes</span>
            <span className="text-orange-600">• Click outside cells to save</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default WeeklyTimesheet;