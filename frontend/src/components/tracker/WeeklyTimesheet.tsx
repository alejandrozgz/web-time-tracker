import React, { useState, useEffect, useCallback } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import toast from 'react-hot-toast';
import apiService from '../../services/api';
import { Assignment, TimeEntry } from '../../types';

interface WeeklyTimesheetProps {
  assignments: Assignment;
  timeEntries: TimeEntry[];
  currentWeek: { start: Date; end: Date };
  onWeekNavigate: (direction: 'prev' | 'next') => void;
  onUpdate: () => void;
  formatDate: (date: Date) => string;
  getDayName: (date: Date) => string;
}

const WeeklyTimesheet: React.FC<WeeklyTimesheetProps> = ({
  assignments,
  timeEntries,
  currentWeek,
  onWeekNavigate,
  onUpdate,
  formatDate,
  getDayName
}) => {
  const [timeMatrix, setTimeMatrix] = useState<Record<string, Record<string, number>>>({});
  const [pendingChanges, setPendingChanges] = useState<Record<string, { taskId: string; date: string; hours: number }>>({});

  const createTimeMatrix = useCallback(() => {
	  const matrix: Record<string, Record<string, number>> = {};
	  
	  assignments.tasks.forEach(task => {
		matrix[task.id] = {};
		for (let i = 0; i < 7; i++) {
		  const date = new Date(currentWeek.start);
		  date.setDate(date.getDate() + i);
		  const dateStr = formatDate(date);
		  
		  const entry = timeEntries.find(e => 
			e.task_id === task.id && e.date === dateStr
		  );
		  
		  matrix[task.id][dateStr] = entry ? entry.hours : 0;
		}
	  });
	  
	  return matrix;
	}, [assignments.tasks, currentWeek.start, timeEntries, formatDate]);

	useEffect(() => {
	  setTimeMatrix(createTimeMatrix());
	}, [createTimeMatrix]);

  const handleCellChange = (taskId: string, date: string, value: string) => {
    const hours = parseFloat(value) || 0;
    
    if (hours > 24) {
      toast.error('Una entrada no puede exceder 24 horas');
      return;
    }

    // Check daily total doesn't exceed 24 hours
    const dailyTotal = Object.keys(timeMatrix).reduce((sum, tId) => {
      if (tId === taskId) return sum + hours;
      return sum + (timeMatrix[tId][date] || 0);
    }, 0);

    if (dailyTotal > 24) {
      toast.error(`Total diario no puede exceder 24 horas. Total actual: ${(dailyTotal - hours).toFixed(2)}h`);
      return;
    }

    setTimeMatrix(prev => ({
      ...prev,
      [taskId]: {
        ...prev[taskId],
        [date]: hours
      }
    }));

    const changeKey = `${taskId}-${date}`;
    setPendingChanges(prev => ({
      ...prev,
      [changeKey]: { taskId, date, hours }
    }));
  };

  const handleCellBlur = async (taskId: string, date: string) => {
    const changeKey = `${taskId}-${date}`;
    const change = pendingChanges[changeKey];
    
    if (!change) return;

    try {
      const task = assignments.tasks.find(t => t.id === taskId);
      const existingEntry = timeEntries.find(e => 
        e.task_id === taskId && e.date === date
      );

      if (change.hours === 0) {
        if (existingEntry) {
          await apiService.deleteTimeEntry(existingEntry.id);
          toast.success('Entrada eliminada');
        }
      } else if (existingEntry) {
        await apiService.updateTimeEntry(existingEntry.id, { 
          hours: change.hours,
          description: existingEntry.description || `Tiempo para ${task?.description}` // Ensure description exists
        });
        toast.success('Entrada actualizada');
      } else {
        // Creating new entry - description is mandatory
        await apiService.createTimeEntry({
          job_id: task?.job_id || '',
          task_id: taskId,
          date: date,
          hours: change.hours,
          description: `Tiempo registrado para ${task?.description}` // Auto-generate description
        });
        toast.success('Entrada creada');
      }

      onUpdate();
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Error al guardar entrada');
      // Revert the change on error
      setTimeMatrix(prev => {
        const existingEntry = timeEntries.find(e => e.task_id === taskId && e.date === date);
        return {
          ...prev,
          [taskId]: {
            ...prev[taskId],
            [date]: existingEntry ? existingEntry.hours : 0
          }
        };
      });
    }

    setPendingChanges(prev => {
      const newPending = { ...prev };
      delete newPending[changeKey];
      return newPending;
    });
  };

  const calculateRowTotal = (taskId: string) => {
    return Object.values(timeMatrix[taskId] || {}).reduce((sum, hours) => sum + hours, 0);
  };

  const calculateColumnTotal = (date: string) => {
    return Object.keys(timeMatrix).reduce((sum, taskId) => {
      return sum + (timeMatrix[taskId][date] || 0);
    }, 0);
  };

  const calculateWeekTotal = () => {
    return Object.keys(timeMatrix).reduce((total, taskId) => {
      return total + calculateRowTotal(taskId);
    }, 0);
  };

  const weekDates: Date[] = [];
  for (let i = 0; i < 7; i++) {
    const date = new Date(currentWeek.start);
    date.setDate(date.getDate() + i);
    weekDates.push(date);
  }

  return (
    <div className="bg-white shadow rounded-lg">
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-medium text-gray-900">
            Hoja de Tiempo Semanal
          </h2>
          <div className="flex items-center space-x-4">
            <button
              onClick={() => onWeekNavigate('prev')}
              className="p-2 rounded-md border border-gray-300 hover:bg-gray-50 transition-colors"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <span className="text-sm font-medium text-gray-900 min-w-max">
              {formatDate(currentWeek.start)} - {formatDate(currentWeek.end)}
            </span>
            <button
              onClick={() => onWeekNavigate('next')}
              className="p-2 rounded-md border border-gray-300 hover:bg-gray-50 transition-colors"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Proyecto / Tarea
              </th>
              {weekDates.map((date, index) => (
                <th key={index} className="px-3 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <div>{getDayName(date)}</div>
                  <div className="text-gray-400">{date.getDate()}</div>
                </th>
              ))}
              <th className="px-3 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                Total
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {assignments.jobs.map(job => (
              <React.Fragment key={job.id}>
                <tr className="bg-blue-50">
                  <td className="px-6 py-4 text-sm font-semibold text-blue-900">
                    {job.name}
                  </td>
                  <td colSpan={8}></td>
                </tr>
                
                {assignments.tasks
                  .filter(task => task.job_id === job.id)
                  .map(task => (
                    <tr key={task.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 text-sm text-gray-900 pl-12">
                        {task.description}
                      </td>
                      {weekDates.map((date, index) => {
                        const dateStr = formatDate(date);
                        const value = timeMatrix[task.id]?.[dateStr] || 0;
                        const hasChange = pendingChanges[`${task.id}-${dateStr}`];
                        
                        return (
                          <td key={index} className="px-2 py-4 text-center">
                            <input
                              type="number"
                              min="0"
                              max="24"
                              step="0.25"
                              value={value || ''}
                              onChange={(e) => handleCellChange(task.id, dateStr, e.target.value)}
                              onBlur={() => handleCellBlur(task.id, dateStr)}
                              className={`w-16 px-2 py-1 text-center border rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                                hasChange ? 'bg-yellow-50 border-yellow-300' : 'border-gray-300'
                              }`}
                              placeholder="0"
                            />
                          </td>
                        );
                      })}
                      <td className="px-3 py-4 text-center text-sm font-medium text-gray-900">
                        {calculateRowTotal(task.id).toFixed(2)}
                      </td>
                    </tr>
                  ))}
              </React.Fragment>
            ))}
            
            <tr className="bg-gray-100 font-semibold">
              <td className="px-6 py-4 text-sm text-gray-900">
                Totales Diarios
              </td>
              {weekDates.map((date, index) => {
                const dateStr = formatDate(date);
                const total = calculateColumnTotal(dateStr);
                return (
                  <td key={index} className="px-3 py-4 text-center text-sm text-gray-900">
                    {total.toFixed(2)}
                  </td>
                );
              })}
              <td className="px-3 py-4 text-center text-sm text-blue-600 font-bold">
                {calculateWeekTotal().toFixed(2)}
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      {Object.keys(pendingChanges).length > 0 && (
        <div className="px-6 py-3 bg-yellow-50 border-t border-yellow-200">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-yellow-700">
                Tienes cambios sin guardar. Haz clic fuera de las celdas para guardar automáticamente.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default WeeklyTimesheet;