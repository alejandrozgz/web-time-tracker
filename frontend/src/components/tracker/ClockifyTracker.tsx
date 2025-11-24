import React, { useState, useEffect, useCallback } from 'react';
import { Play, Pause, Square, Clock, Edit2, Save, X } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import toast from 'react-hot-toast';
import apiService from '../../services/api';
import { Assignment, TimeEntry } from '../../types';

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

  // Recent entries
  const [recentEntries, setRecentEntries] = useState<TimeEntry[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const ENTRIES_PER_PAGE = 20;

  // Edit mode state
  const [editingEntryId, setEditingEntryId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({
    startTime: '',
    endTime: ''
  });

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

  const loadRecentEntries = useCallback(async (page = 1, append = false) => {
	  try {
		setLoadingMore(true);

		// No date limit - fetch all entries with pagination
		const offset = (page - 1) * ENTRIES_PER_PAGE;

		const entries = await apiService.getTimeEntries(
		  companyId,
		  undefined, // No from date - get all entries
		  undefined, // No to date - get all entries including future
		  ENTRIES_PER_PAGE,
		  offset
		);

		if (append) {
		  setRecentEntries(prev => [...prev, ...entries]);
		} else {
		  setRecentEntries(entries);
		}

		// Check if there are more entries (if we got less than requested, no more)
		setHasMore(entries.length === ENTRIES_PER_PAGE);
		setLoadingMore(false);
	  } catch (error) {
		console.error('Error loading recent entries:', error);
		setLoadingMore(false);
	  }
	}, [companyId, ENTRIES_PER_PAGE]);

  useEffect(() => {
    loadRecentEntries();
  }, [loadRecentEntries]);

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

  // 🎯 NUEVA FUNCIÓN: Formatear tiempo a HH:mm
  const formatTimeHHMM = (timeStr: string | undefined): string => {
    if (!timeStr) return '--:--';
    return timeStr.slice(0, 5); // Toma solo HH:mm de HH:mm:ss
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
    setStartTime(new Date());
    setElapsedTime(0);
    toast.success(t('tracker:messages.timer_started'));
  };

  const handlePauseTimer = () => {
    setIsRunning(false);
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
      // 🎯 CAMBIO: Usar BC IDs y obtener objetos correspondientes
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

      // ✅ Only reload recent entries, not entire page
      setCurrentPage(1);
      await loadRecentEntries(1, false);
      // Call onUpdate but without awaiting to prevent full reload blocking
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
      // 🎯 CAMBIO: Usar BC IDs y obtener objetos correspondientes
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

      // ✅ Only reload recent entries, not entire page
      setCurrentPage(1);
      await loadRecentEntries(1, false);
      // Call onUpdate but without awaiting to prevent full reload blocking
      onUpdate();
    } catch (error: any) {
      toast.error(error.response?.data?.error || t('common:status.error'));
    }
  };

  // 🎯 CAMBIO: Ajustar para usar BC IDs en las recent entries
  const handleQuickStart = (entry: TimeEntry) => {
    setDescription(entry.description);

    // Encontrar job y task por BC IDs
    const job = assignments.jobs.find(j => j.bc_job_id === entry.bc_job_id);
    const task = assignments.tasks.find(t => t.bc_task_id === entry.bc_task_id);

    if (job) setSelectedProject(job.id);
    if (task) setSelectedTask(task.id);
    setShowProjectDropdown(false);
  };

  // Group entries by date
  const groupEntriesByDate = (entries: TimeEntry[]) => {
    const grouped: { [key: string]: TimeEntry[] } = {};

    entries.forEach(entry => {
      if (!grouped[entry.date]) {
        grouped[entry.date] = [];
      }
      grouped[entry.date].push(entry);
    });

    return grouped;
  };

  // Handle edit entry
  const handleStartEdit = (entry: TimeEntry) => {
    setEditingEntryId(entry.id);
    setEditForm({
      startTime: entry.start_time?.slice(0, 5) || '',
      endTime: entry.end_time?.slice(0, 5) || ''
    });
  };

  const handleCancelEdit = () => {
    setEditingEntryId(null);
    setEditForm({ startTime: '', endTime: '' });
  };

  const handleSaveEdit = async (entry: TimeEntry) => {
    if (!editForm.startTime || !editForm.endTime) {
      toast.error(t('tracker:messages.time_required'));
      return;
    }

    // Calculate hours
    const start = new Date(`${entry.date}T${editForm.startTime}:00`);
    const end = new Date(`${entry.date}T${editForm.endTime}:00`);

    if (end <= start) {
      toast.error(t('tracker:messages.end_after_start'));
      return;
    }

    const diffMs = end.getTime() - start.getTime();
    const diffHours = diffMs / (1000 * 60 * 60);

    if (diffHours > 24) {
      toast.error(t('tracker:messages.max_time'));
      return;
    }

    try {
      await apiService.updateTimeEntry(entry.id, {
        start_time: `${editForm.startTime}:00`,
        end_time: `${editForm.endTime}:00`,
        hours: diffHours
      });

      toast.success(t('tracker:messages.entry_updated'));
      setEditingEntryId(null);
      setEditForm({ startTime: '', endTime: '' });
      setCurrentPage(1);
      await loadRecentEntries(1, false);
      onUpdate();
    } catch (error: any) {
      toast.error(error.response?.data?.error || t('common:status.error'));
    }
  };

  const canEditEntry = (entry: TimeEntry) => {
    return entry.bc_sync_status === 'local' || entry.bc_sync_status === 'modified';
  };

  const handleLoadMore = () => {
    const nextPage = currentPage + 1;
    setCurrentPage(nextPage);
    loadRecentEntries(nextPage, true);
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
            ⏱️ {t('tracker:modes.timer')}
          </button>
          <button
            onClick={() => setTrackingMode('manual')}
            className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
              trackingMode === 'manual'
                ? 'bg-blue-100 text-blue-700'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            🕐 {t('tracker:modes.manual')}
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

        {/* Task Selector - Solo tareas clickeables */}
        <div className="flex items-center gap-3 mb-6">
          <div className="relative">
            <button
              onClick={() => setShowProjectDropdown(!showProjectDropdown)}
              className="flex items-center gap-2 px-3 py-2 border border-gray-300 rounded-md hover:bg-gray-50 text-sm"
            >
              <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
              {selectedTaskData && selectedProjectData ? (
                <span>{selectedProjectData.name} → {selectedTaskData.description}</span>
              ) : (
                <span className="text-gray-500">{t('tracker:fields.select_task')}</span>
              )}
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
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
                    {/* Proyecto - SOLO VISUAL, NO CLICKEABLE */}
                    <div className="px-3 py-2 bg-gray-50 flex items-center gap-2 cursor-default">
                      <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                      <span className="font-medium text-gray-700">{job.name}</span>
                    </div>
                    
                    {/* Tareas - CLICKEABLES */}
                    {assignments.tasks.filter(t => t.job_id === job.id).map(task => (
                      <button
                        key={task.id}
                        onClick={() => {
                          setSelectedProject(job.id);
                          setSelectedTask(task.id);
                          setShowProjectDropdown(false);
                        }}
                        className={`w-full px-6 py-2 text-left hover:bg-blue-50 text-sm flex items-center gap-2 transition-colors ${
                          selectedTask === task.id ? 'bg-blue-100 text-blue-700' : 'text-gray-600'
                        }`}
                      >
                        <div className={`w-2 h-2 rounded-full ${
                          selectedTask === task.id ? 'bg-blue-500' : 'bg-gray-400'
                        }`}></div>
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
                  {t('tracker:actions.start_timer')}
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

      {/* Recent Entries - Agrupadas por día con edición */}
      <div className="p-6">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-medium text-gray-900">{t('tracker:recent_entries.title')}</h3>
          {recentEntries.length > 0 && (
            <span className="text-xs text-gray-500">
              {recentEntries.length} {recentEntries.length === 1 ? 'entry' : 'entries'} loaded
            </span>
          )}
        </div>

        {recentEntries.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <Clock className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">{t('tracker:recent_entries.no_entries')}</p>
          </div>
        ) : (
          <div className="space-y-4">
            {Object.entries(groupEntriesByDate(recentEntries)).map(([date, entries]) => (
              <div key={date} className="space-y-2">
                {/* Date Header */}
                <div className="flex items-center gap-2 px-2">
                  <div className="text-xs font-semibold text-gray-600 uppercase tracking-wide">
                    {new Date(date + 'T00:00:00').toLocaleDateString('es-ES', {
                      weekday: 'long',
                      day: 'numeric',
                      month: 'long'
                    })}
                  </div>
                  <div className="flex-1 h-px bg-gray-200"></div>
                  <div className="text-xs text-gray-500">
                    {entries.reduce((sum, e) => sum + e.hours, 0).toFixed(2)}h
                  </div>
                </div>

                {/* Entries for this date */}
                {entries.map((entry) => {
                  const project = assignments.jobs.find(j => j.bc_job_id === entry.bc_job_id);
                  const task = assignments.tasks.find(t => t.bc_task_id === entry.bc_task_id);
                  const isEditing = editingEntryId === entry.id;
                  const editable = canEditEntry(entry);

                  return (
                    <div key={entry.id} className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg group border border-gray-100">
                      <div className="flex items-center gap-3 flex-1">
                        <div className="w-3 h-3 bg-blue-500 rounded-full flex-shrink-0"></div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">
                            {entry.description}
                          </p>
                          <p className="text-xs text-gray-500">
                            {project?.name} • {task?.description}
                          </p>
                        </div>

                        {/* Time section - Editable if not synced */}
                        {isEditing ? (
                          <div className="flex items-center gap-2">
                            <input
                              type="time"
                              value={editForm.startTime}
                              onChange={(e) => setEditForm(prev => ({ ...prev, startTime: e.target.value }))}
                              className="px-2 py-1 border border-gray-300 rounded text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                            <span className="text-gray-400">-</span>
                            <input
                              type="time"
                              value={editForm.endTime}
                              onChange={(e) => setEditForm(prev => ({ ...prev, endTime: e.target.value }))}
                              className="px-2 py-1 border border-gray-300 rounded text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                          </div>
                        ) : (
                          <div className="text-right">
                            <div className="font-mono text-xs text-gray-700">
                              {formatTimeHHMM(entry.start_time)} - {formatTimeHHMM(entry.end_time)}
                            </div>
                            <div className="text-xs font-medium text-blue-600">
                              {entry.hours.toFixed(2)}h
                            </div>
                          </div>
                        )}

                        {/* Badge de estado sync */}
                        <span className={`px-2 py-1 rounded-full text-xs font-medium flex-shrink-0 ${
                          entry.bc_sync_status === 'local' ? 'bg-orange-100 text-orange-700' :
                          entry.bc_sync_status === 'draft' ? 'bg-blue-100 text-blue-700' :
                          entry.bc_sync_status === 'posted' ? 'bg-green-100 text-green-700' :
                          entry.bc_sync_status === 'error' ? 'bg-red-100 text-red-700' :
                          'bg-gray-100 text-gray-700'
                        }`}>
                          {t(`tracker:sync_status.${entry.bc_sync_status}`) || entry.bc_sync_status}
                        </span>
                      </div>

                      {/* Action buttons */}
                      <div className={`flex items-center gap-1 ml-2 ${isEditing ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'} transition-opacity`}>
                        {isEditing ? (
                          <>
                            <button
                              onClick={() => handleSaveEdit(entry)}
                              className="p-1 text-green-600 hover:bg-green-50 rounded"
                              title="Guardar"
                            >
                              <Save className="w-4 h-4" />
                            </button>
                            <button
                              onClick={handleCancelEdit}
                              className="p-1 text-gray-400 hover:bg-gray-100 rounded"
                              title="Cancelar"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </>
                        ) : (
                          <>
                            {editable && (
                              <button
                                onClick={() => handleStartEdit(entry)}
                                className="p-1 text-gray-400 hover:text-orange-600 rounded"
                                title="Editar horarios"
                              >
                                <Edit2 className="w-4 h-4" />
                              </button>
                            )}
                            <button
                              onClick={() => handleQuickStart(entry)}
                              className="p-1 text-gray-400 hover:text-blue-600 rounded"
                              title={t('tracker:actions.use_for_timer')}
                            >
                              <Play className="w-4 h-4" />
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            ))}

            {/* Load More Button */}
            {hasMore && (
              <div className="flex justify-center pt-4">
                <button
                  onClick={handleLoadMore}
                  disabled={loadingMore}
                  className="px-4 py-2 text-sm font-medium text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg border border-blue-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loadingMore ? (
                    <span className="flex items-center gap-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                      Loading...
                    </span>
                  ) : (
                    'Load More'
                  )}
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ClockifyTracker;