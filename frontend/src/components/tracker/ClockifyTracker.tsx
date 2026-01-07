import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, Square } from 'lucide-react';
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

  const [trackingMode, setTrackingMode] = useState<'timer' | 'manual'>('manual');
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
    date: new Date().toISOString().split('T')[0],
    startTime: '',
    endTime: '',
    calculatedHours: 0
  });

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowProjectDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Timer logic
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

  // Manual entry calculations
  useEffect(() => {
    if (manualEntry.startTime && manualEntry.endTime) {
      const start = new Date(`${manualEntry.date}T${manualEntry.startTime}`);
      const end = new Date(`${manualEntry.date}T${manualEntry.endTime}`);

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
  }, [manualEntry.startTime, manualEntry.endTime, manualEntry.date]);

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

  const canStartTimer = (): boolean => {
    return description.trim() !== '' && selectedProject !== '' && selectedTask !== '';
  };

  const handleStartTimer = () => {
    if (!canStartTimer()) {
      if (!description.trim()) {
        toast.error(t('tracker:fields.description_required'));
        return;
      }
      if (!selectedTask) {
        toast.error(t('tracker:messages.select_task_required'));
        return;
      }
    }

    setIsRunning(true);

    // If resuming (elapsedTime > 0), adjust startTime to account for elapsed time
    // Otherwise, start fresh
    if (elapsedTime > 0) {
      // Resuming: set startTime back in time by elapsedTime amount
      setStartTime(new Date(Date.now() - elapsedTime));
      toast.success(t('tracker:messages.timer_resumed'));
    } else {
      // Starting fresh
      setStartTime(new Date());
      setElapsedTime(0);
      toast.success(t('tracker:messages.timer_started'));
    }
  };

  const handlePauseTimer = () => {
    setIsRunning(false);
    // Keep elapsedTime as is - it's already updated by the interval
    toast.success(t('tracker:messages.timer_paused'));
  };

  const handleStopTimer = async () => {
    if (!startTime) return;

    const endTime = new Date();
    const totalMs = endTime.getTime() - startTime.getTime();
    const totalHours = totalMs / (1000 * 60 * 60);

    if (totalHours < 0.01) {
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

      // Reset timer
      setIsRunning(false);
      setStartTime(null);
      setElapsedTime(0);
      setDescription('');

      // Notify parent to reload data
      onUpdate();
    } catch (error: any) {
      toast.error(error.response?.data?.error || t('common:status.error'));
    }
  };

  const handleManualSubmit = async () => {
    if (!description.trim()) {
      toast.error(t('tracker:fields.description_required'));
      return;
    }

    if (!selectedProject || !selectedTask) {
      toast.error(t('tracker:messages.select_task_required'));
      return;
    }

    if (!manualEntry.startTime || !manualEntry.endTime) {
      toast.error(t('tracker:messages.time_required'));
      return;
    }

    if (manualEntry.calculatedHours <= 0) {
      toast.error(t('tracker:messages.end_after_start'));
      return;
    }

    if (manualEntry.calculatedHours > 24) {
      toast.error(t('tracker:messages.max_time'));
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

      toast.success(t('tracker:messages.entry_added_for_date', {
        time: formatHours(manualEntry.calculatedHours),
        date: manualEntry.date
      }));

      // Reset manual entry
      setManualEntry({
        date: new Date().toISOString().split('T')[0],
        startTime: '',
        endTime: '',
        calculatedHours: 0
      });
      setDescription('');

      // Notify parent to reload data
      onUpdate();
    } catch (error: any) {
      toast.error(error.response?.data?.error || t('common:status.error'));
    }
  };

  const selectedProjectData = assignments.jobs.find(job => job.id === selectedProject);
  const selectedTaskData = assignments.tasks.find(task => task.id === selectedTask);

  return (
    <div className="bg-white shadow-sm rounded-lg border border-gray-200">
      <div className="p-6 border-b border-gray-100">
        {/* Mode Toggle */}
        <div className="flex items-center gap-2 mb-4">
          <button
            onClick={() => setTrackingMode('timer')}
            className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
              trackingMode === 'timer'
                ? 'bg-blue-100 text-blue-700'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {t('tracker:modes.timer')}
          </button>
          <button
            onClick={() => setTrackingMode('manual')}
            className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
              trackingMode === 'manual'
                ? 'bg-blue-100 text-blue-700'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {t('tracker:modes.manual')}
          </button>
        </div>

        {/* Description Input */}
        <div className="mb-4">
          <input
            type="text"
            placeholder={`${t('tracker:fields.description_placeholder')} *`}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className={`w-full px-4 py-3 text-lg border-0 border-b-2 focus:outline-none placeholder-gray-400 ${
              description.trim() ? 'border-gray-200 focus:border-blue-500' : 'border-red-200 focus:border-red-500'
            }`}
            required
          />
          {!description.trim() && (
            <p className="mt-1 text-xs text-red-500">* {t('tracker:fields.description_required')}</p>
          )}
        </div>

        {/* Task Selector */}
        <div className="flex items-center gap-3 mb-6">
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setShowProjectDropdown(!showProjectDropdown)}
              className="flex items-center gap-2 px-3 py-2 border border-gray-300 rounded-md hover:bg-gray-50 text-sm"
            >
              {selectedTaskData && selectedProjectData ? (
                <span>{selectedProjectData.name} → {selectedTaskData.description}</span>
              ) : (
                <span className="text-gray-500">{t('tracker:fields.select_task')}</span>
              )}
              <svg className="w-4 h-4 ml-auto" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </button>

            {showProjectDropdown && (
              <div className="absolute top-full left-0 mt-1 w-[700px] bg-white border border-gray-200 rounded-lg shadow-lg z-10">
                <div className="p-3 border-b border-gray-100">
                  <h3 className="font-medium text-gray-900">{t('tracker:fields.select_task')}</h3>
                </div>
                {assignments.jobs.map(job => (
                  <div key={job.id} className="border-b border-gray-100 last:border-0">
                    {/* Project Header - Visual only, not clickable */}
                    <div className="px-3 py-2 bg-gray-50 flex items-center gap-2 cursor-default">
                      <span className="font-medium text-gray-700">{job.name}</span>
                    </div>

                    {/* Tasks - Clickable */}
                    {assignments.tasks.filter(t => t.job_id === job.id).map(task => (
                      <button
                        key={task.id}
                        onClick={() => {
                          setSelectedProject(job.id);
                          setSelectedTask(task.id);
                          setShowProjectDropdown(false);
                        }}
                        className={`w-full px-6 py-2 text-left hover:bg-blue-50 text-sm transition-colors ${
                          selectedTask === task.id ? 'bg-blue-100 text-blue-700' : 'text-gray-600'
                        }`}
                      >
                        {task.description}
                      </button>
                    ))}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Timer Mode */}
        {trackingMode === 'timer' && (
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className={`text-2xl font-mono font-bold ${isRunning ? 'text-blue-600' : 'text-gray-700'}`}>
                {formatTime(elapsedTime)}
              </div>

              {!isRunning ? (
                <button
                  onClick={handleStartTimer}
                  disabled={!canStartTimer()}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    canStartTimer()
                      ? 'bg-blue-600 text-white hover:bg-blue-700'
                      : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                  }`}
                >
                  <Play className="w-4 h-4" />
                  {elapsedTime > 0 ? t('tracker:actions.resume_timer') : t('tracker:actions.start_timer')}
                </button>
              ) : (
                <div className="flex items-center gap-2">
                  <button
                    onClick={handlePauseTimer}
                    className="flex items-center gap-2 px-4 py-2 bg-yellow-500 text-white rounded-lg text-sm font-medium hover:bg-yellow-600 transition-colors"
                  >
                    <Pause className="w-4 h-4" />
                    {t('tracker:actions.pause_timer')}
                  </button>
                  <button
                    onClick={handleStopTimer}
                    className="flex items-center gap-2 px-4 py-2 bg-red-500 text-white rounded-lg text-sm font-medium hover:bg-red-600 transition-colors"
                  >
                    <Square className="w-4 h-4" />
                    {t('tracker:actions.stop_timer')}
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Manual Mode */}
        {trackingMode === 'manual' && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('tracker:fields.date')}
                </label>
                <input
                  type="date"
                  value={manualEntry.date}
                  onChange={(e) => setManualEntry(prev => ({ ...prev, date: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('tracker:fields.start_time')}
                </label>
                <input
                  type="time"
                  value={manualEntry.startTime}
                  onChange={(e) => setManualEntry(prev => ({ ...prev, startTime: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('tracker:fields.end_time')}
                </label>
                <input
                  type="time"
                  value={manualEntry.endTime}
                  onChange={(e) => setManualEntry(prev => ({ ...prev, endTime: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                />
              </div>
            </div>

            {manualEntry.calculatedHours > 0 && (
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <span>{t('tracker:fields.total_time')}:</span>
                <span className="font-medium text-blue-600">
                  {formatHours(manualEntry.calculatedHours)}
                </span>
              </div>
            )}

            <button
              onClick={handleManualSubmit}
              disabled={!description.trim() || !selectedTask || manualEntry.calculatedHours <= 0}
              className={`w-full py-2 rounded-lg text-sm font-medium transition-colors ${
                description.trim() && selectedTask && manualEntry.calculatedHours > 0
                  ? 'bg-blue-600 text-white hover:bg-blue-700'
                  : 'bg-gray-200 text-gray-400 cursor-not-allowed'
              }`}
            >
              {t('tracker:actions.add_manual')}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ClockifyTracker;
