import React, { useState, useEffect, useRef } from 'react';
import { Play, Square, Clock, ChevronDown, Tag, List } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import toast from 'react-hot-toast';
import apiService from '../../services/api';
import { Assignment } from '../../types';

interface ClockifyTrackerProps {
  assignments: Assignment;
  onUpdate: () => void;
  companyId: string;
}

const ClockifyTracker: React.FC<ClockifyTrackerProps> = ({ assignments, onUpdate, companyId }) => {
  const { t } = useTranslation(['tracker', 'common']);
  
  const [trackingMode, setTrackingMode] = useState<'timer' | 'manual'>('timer');
  const [description, setDescription] = useState('');
  const [selectedProject, setSelectedProject] = useState('');
  const [selectedTask, setSelectedTask] = useState('');
  const [showProjectDropdown, setShowProjectDropdown] = useState(false);
  
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Timer state
  const [isRunning, setIsRunning] = useState(false);
  const [startTime, setStartTime] = useState<Date | null>(null);
  const [elapsedTime, setElapsedTime] = useState(0);

  // Manual entry state
  const [manualEntry, setManualEntry] = useState({
    date: new Date().toISOString().split('T')[0], // For date picker, not directly in bar
    startTime: '',
    endTime: '',
    calculatedHours: 0
  });

  // --- LOGIC (MOSTLY UNCHANGED) ---

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isRunning && startTime) {
      interval = setInterval(() => {
        setElapsedTime(Date.now() - startTime.getTime());
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isRunning, startTime]);
  
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowProjectDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (manualEntry.startTime && manualEntry.endTime) {
      const start = new Date(`1970-01-01T${manualEntry.startTime}`);
      const end = new Date(`1970-01-01T${manualEntry.endTime}`);
      
      if (end > start) {
        const diffMs = end.getTime() - start.getTime();
        const diffHours = diffMs / (1000 * 60 * 60);
        setManualEntry(prev => ({ ...prev, calculatedHours: diffHours }));
      } else {
        setManualEntry(prev => ({ ...prev, calculatedHours: 0 }));
      }
    } else {
      setManualEntry(prev => ({ ...prev, calculatedHours: 0 }));
    }
  }, [manualEntry.startTime, manualEntry.endTime]);

  const formatTime = (ms: number): string => {
    const totalSeconds = Math.floor(ms / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  const formatHours = (hours: number): string => {
    const h = Math.floor(hours);
    const m = Math.round((hours - h) * 60);
    return `${h}h ${m}m`;
  };

  const canSubmit = (): boolean => description.trim() !== '' && selectedTask !== '';

  const handleStartTimer = () => {
    if (!canSubmit()) {
      toast.error(t('tracker:messages.description_and_task_required'));
      return;
    }
    setIsRunning(true);
    setStartTime(new Date());
    setElapsedTime(0);
    toast.success(t('tracker:messages.timer_started'));
  };

  const handleStopTimer = async () => {
    if (!startTime) return;
    const endTime = new Date();
    // In this simplified Clockify model, we don't use the pause state for calculation.
    // The total time is just end - start.
    const totalMs = endTime.getTime() - startTime.getTime();
    const totalHours = totalMs / (1000 * 60 * 60);

    if (totalHours < 0.01) {
      setIsRunning(false);
      toast.error(t('tracker:messages.min_time'));
      return;
    }

    try {
      const selectedProjectData = assignments.jobs.find(job => job.id === selectedProject);
      const selectedTaskData = assignments.tasks.find(task => task.id === selectedTask);

      await apiService.createTimeEntry({
        bc_job_id: selectedProjectData?.bc_job_id || '',
        bc_task_id: selectedTaskData?.bc_task_id || '',
        date: new Date().toISOString().split('T')[0],
        hours: totalHours,
        description: description.trim(),
        start_time: startTime.toTimeString().slice(0, 8),
        end_time: endTime.toTimeString().slice(0, 8),
        companyId
      });

      toast.success(t('tracker:messages.entry_added', { time: formatHours(totalHours) }));
      
      setIsRunning(false);
      setStartTime(null);
      setElapsedTime(0);
      setDescription('');
      onUpdate();
    } catch (error: any) {
      toast.error(error.response?.data?.error || t('common:status.error'));
    }
  };

  const handleManualSubmit = async () => {
    if (!canSubmit() || manualEntry.calculatedHours <= 0) {
        toast.error(t('tracker:messages.all_fields_required'));
        return;
    }

    try {
      const selectedProjectData = assignments.jobs.find(job => job.id === selectedProject);
      const selectedTaskData = assignments.tasks.find(task => task.id === selectedTask);

      await apiService.createTimeEntry({
        bc_job_id: selectedProjectData?.bc_job_id || '',
        bc_task_id: selectedTaskData?.bc_task_id || '',
        date: manualEntry.date,
        hours: manualEntry.calculatedHours,
        description: description.trim(),
        start_time: manualEntry.startTime,
        end_time: manualEntry.endTime,
        companyId
      });

      toast.success(t('tracker:messages.entry_added', { time: formatHours(manualEntry.calculatedHours) }));
      
      setManualEntry(prev => ({ ...prev, startTime: '', endTime: '', calculatedHours: 0 }));
      setDescription('');
      onUpdate();
    } catch (error: any) {
      toast.error(error.response?.data?.error || t('common:status.error'));
    }
  };

  const selectedProjectData = assignments.jobs.find(job => job.id === selectedProject);
  const selectedTaskData = assignments.tasks.find(task => task.id === selectedTask);

  const ProjectTaskSelector = (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setShowProjectDropdown(!showProjectDropdown)}
        className="flex items-center gap-2 text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
      >
        <Tag className={`w-5 h-5 ${selectedTaskData ? 'text-blue-600 dark:text-blue-500' : ''}`} />
        <span className={`text-sm font-medium ${selectedTaskData ? 'text-blue-700 dark:text-blue-300' : ''}`}>
            {selectedProjectData ? `${selectedProjectData.name} - ${selectedTaskData?.description}` : t('tracker:fields.select_project')}
        </span>
      </button>
      {showProjectDropdown && (
        <div className="absolute top-full left-0 md:right-0 md:left-auto mt-2 w-screen sm:w-[700px] max-w-[calc(100vw-2rem)] bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-2xl z-20">
          <div className="p-3 border-b border-gray-200 dark:border-gray-700">
            <h3 className="font-semibold text-gray-900 dark:text-white">{t('tracker:fields.select_task')}</h3>
          </div>
          <div className="max-h-[40vh] overflow-y-auto">
            {assignments.jobs.map(job => (
              <div key={job.id}>
                <div className="px-4 py-2 bg-gray-50 dark:bg-gray-700/50">
                  <span className="font-medium text-gray-800 dark:text-gray-200 text-sm">{job.name}</span>
                </div>
                {assignments.tasks.filter(t => t.job_id === job.id).map(task => (
                  <button
                    key={task.id}
                    onClick={() => {
                      setSelectedProject(job.id);
                      setSelectedTask(task.id);
                      setShowProjectDropdown(false);
                    }}
                    className={`w-full text-left px-6 py-2.5 text-sm transition-colors ${selectedTask === task.id ? 'bg-blue-600 text-white' : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'}`}
                  >
                    {task.description}
                  </button>
                ))}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );

  return (
    <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg border border-gray-200/80 dark:border-gray-700/60 flex flex-col md:flex-row items-center p-2 gap-2 md:gap-4">
      <div className="flex-grow w-full">
        <input
          type="text"
          placeholder={t('tracker:fields.description_placeholder')}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="w-full bg-transparent text-gray-800 dark:text-gray-200 focus:outline-none placeholder:text-gray-400 dark:placeholder:text-gray-500"
        />
      </div>

      <div className="w-full md:w-auto flex items-center gap-4 border-t-2 md:border-t-0 md:border-l-2 border-gray-100 dark:border-gray-700/50 pt-2 md:pt-0 md:pl-4">
        {ProjectTaskSelector}

        {trackingMode === 'timer' ? (
          <>
            <div className="text-lg font-mono font-semibold text-gray-800 dark:text-gray-200 w-24 text-center">
              {formatTime(elapsedTime)}
            </div>
            <button
              onClick={isRunning ? handleStopTimer : handleStartTimer}
              className={`w-28 h-10 flex items-center justify-center rounded text-sm font-bold text-white transition-colors ${
                isRunning
                  ? 'bg-red-500 hover:bg-red-600'
                  : 'bg-blue-500 hover:bg-blue-600'
              } ${!canSubmit() && !isRunning ? 'opacity-50 cursor-not-allowed' : ''}`}
              disabled={!canSubmit() && !isRunning}
            >
              {isRunning ? t('tracker:actions.stop_timer').toUpperCase() : t('tracker:actions.start_timer').toUpperCase()}
            </button>
          </>
        ) : (
          <>
            <input type="time" value={manualEntry.startTime} onChange={(e) => setManualEntry(p => ({...p, startTime: e.target.value}))} className="w-24 px-2 py-1 bg-gray-100 dark:bg-gray-700 border-transparent rounded focus:ring-2 focus:ring-blue-500 text-sm" />
            <span className="text-gray-400">-</span>
            <input type="time" value={manualEntry.endTime} onChange={(e) => setManualEntry(p => ({...p, endTime: e.target.value}))} className="w-24 px-2 py-1 bg-gray-100 dark:bg-gray-700 border-transparent rounded focus:ring-2 focus:ring-blue-500 text-sm" />
            <button
              onClick={handleManualSubmit}
              className={`w-28 h-10 flex items-center justify-center rounded text-sm font-bold text-white transition-colors bg-blue-500 hover:bg-blue-600 ${!canSubmit() || manualEntry.calculatedHours <= 0 ? 'opacity-50 cursor-not-allowed' : ''}`}
              disabled={!canSubmit() || manualEntry.calculatedHours <= 0}
            >
              {t('common:actions.add').toUpperCase()}
            </button>
          </>
        )}

        <div className="border-l border-gray-200 dark:border-gray-700 pl-2">
            <button onClick={() => setTrackingMode('timer')} title={t('tracker:modes.timer')} className={`p-2 rounded-md transition-colors ${trackingMode === 'timer' ? 'bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400' : 'text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'}`}>
                <Clock className="w-5 h-5"/>
            </button>
            <button onClick={() => setTrackingMode('manual')} title={t('tracker:modes.manual')} className={`p-2 rounded-md transition-colors ${trackingMode === 'manual' ? 'bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400' : 'text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'}`}>
                <List className="w-5 h-5"/>
            </button>
        </div>
      </div>
    </div>
  );
};

export default ClockifyTracker;