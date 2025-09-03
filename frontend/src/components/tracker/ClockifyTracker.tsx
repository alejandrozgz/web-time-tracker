import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Play, Square, Save, Clock } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';
import apiService from '../../services/api';
import { Assignment, TimeEntry } from '../../types';

interface ClockifyTrackerProps {
  assignments: Assignment;
  onUpdate: () => void;
}

const ClockifyTracker: React.FC<ClockifyTrackerProps> = ({ assignments, onUpdate }) => {
  
  // Timer state
  const [isRunning, setIsRunning] = useState(false);
  const [startTime, setStartTime] = useState<number | null>(null);
  const [elapsedTime, setElapsedTime] = useState(0);
  
  // Form state
  const [description, setDescription] = useState('');
  const [selectedProject, setSelectedProject] = useState('');
  const [selectedTask, setSelectedTask] = useState('');
  const [trackingMode, setTrackingMode] = useState<'timer' | 'manual'>('timer');
  const [showProjectDropdown, setShowProjectDropdown] = useState(false);
  
  // Manual entry state
  const [manualEntry, setManualEntry] = useState({
    date: new Date().toISOString().split('T')[0],
    startTime: '',
    endTime: '',
    calculatedHours: 0
  });
  
    const calculateManualHours = useCallback(() => {
	  const start = new Date(`${manualEntry.date}T${manualEntry.startTime}`);
	  const end = new Date(`${manualEntry.date}T${manualEntry.endTime}`);
	  
	  if (end > start) {
		const diffMs = end.getTime() - start.getTime();
		const hours = diffMs / (1000 * 60 * 60);
		setManualEntry(prev => ({ 
		  ...prev, 
		  calculatedHours: Math.round(hours * 100) / 100 
		}));
	  } else {
		setManualEntry(prev => ({ ...prev, calculatedHours: 0 }));
	  }
	}, [manualEntry.date, manualEntry.startTime, manualEntry.endTime]);

  // Recent entries
  const [recentEntries, setRecentEntries] = useState<TimeEntry[]>([]);
  
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    loadRecentEntries();
  }, []);

  useEffect(() => {
    // Timer effect
    if (isRunning && startTime) {
      intervalRef.current = setInterval(() => {
        setElapsedTime(Date.now() - startTime);
      }, 1000);
    } else if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isRunning, startTime]);

  useEffect(() => {
	  // Calculate manual hours when times change
	  if (trackingMode === 'manual' && manualEntry.startTime && manualEntry.endTime) {
		calculateManualHours();
	  }
	}, [manualEntry.startTime, manualEntry.endTime, manualEntry.date, trackingMode, calculateManualHours]);

  const loadRecentEntries = async () => {
    try {
      const today = new Date();
      const lastWeek = new Date();
      lastWeek.setDate(today.getDate() - 7);
      
      const entries = await apiService.getTimeEntries(
        lastWeek.toISOString().split('T')[0],
        today.toISOString().split('T')[0]
      );
      
      setRecentEntries(entries.slice(-5));
    } catch (error) {
      console.error('Error loading recent entries:', error);
    }
  };

  const formatTime = (milliseconds: number): string => {
    const totalSeconds = Math.floor(milliseconds / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const formatHours = (hours: number): string => {
    const h = Math.floor(hours);
    const m = Math.floor((hours - h) * 60);
    if (h > 0) {
      return `${h}:${m.toString().padStart(2, '0')}:00`;
    }
    return `${m}:00`;
  };

  const handleStart = () => {
    if (!selectedProject || !selectedTask) {
      toast.error('Selecciona proyecto y tarea primero');
      return;
    }

    if (!description.trim()) {
      toast.error('La descripción es obligatoria');
      return;
    }

    setStartTime(Date.now());
    setElapsedTime(0);
    setIsRunning(true);
    toast.success('Timer iniciado');
  };

  const handleStop = async () => {
    if (!startTime) return;

    const totalHours = elapsedTime / (1000 * 60 * 60);
    
    if (totalHours < 0.017) { // Less than 1 minute
      toast.error('El timer debe ejecutarse por al menos 1 minuto');
      return;
    }

    try {
      await apiService.createTimeEntry({
        job_id: selectedProject,
        task_id: selectedTask,
        date: new Date().toISOString().split('T')[0],
        hours: Math.round(totalHours * 100) / 100,
        description: description.trim()
      });

      toast.success(`${formatTime(elapsedTime)} agregado`);
      
      // Reset timer
      setIsRunning(false);
      setStartTime(null);
      setElapsedTime(0);
      
      onUpdate();
      loadRecentEntries();
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Error al guardar entrada');
    }
  };

  const handleManualSave = async () => {
    if (!selectedProject || !selectedTask) {
      toast.error('Selecciona proyecto y tarea primero');
      return;
    }

    if (!description.trim()) {
      toast.error('La descripción es obligatoria');
      return;
    }

    if (!manualEntry.startTime || !manualEntry.endTime) {
      toast.error('Ingresa hora de inicio y fin');
      return;
    }

    if (manualEntry.calculatedHours <= 0) {
      toast.error('La hora de fin debe ser posterior al inicio');
      return;
    }

    if (manualEntry.calculatedHours > 24) {
      toast.error('Una entrada no puede exceder 24 horas');
      return;
    }

    try {
      await apiService.createTimeEntry({
        job_id: selectedProject,
        task_id: selectedTask,
        date: manualEntry.date,
        hours: manualEntry.calculatedHours,
        description: description.trim(),
        start_time: manualEntry.startTime,
        end_time: manualEntry.endTime
      });

      toast.success(`${formatHours(manualEntry.calculatedHours)} agregado para ${manualEntry.date}`);
      
      // Reset manual entry
      setManualEntry({
        date: new Date().toISOString().split('T')[0],
        startTime: '',
        endTime: '',
        calculatedHours: 0
      });
      setDescription('');
      
      onUpdate();
      loadRecentEntries();
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Error al guardar entrada');
    }
  };

  const handleQuickStart = (entry: TimeEntry) => {
    setDescription(entry.description);
    setSelectedProject(entry.job_id);
    setSelectedTask(entry.task_id);
    setShowProjectDropdown(false);
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
            ⏱️ Timer
          </button>
          <button
            onClick={() => setTrackingMode('manual')}
            className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
              trackingMode === 'manual'
                ? 'bg-blue-100 text-blue-700'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            🕐 Manual
          </button>
        </div>

        {/* Description Input */}
        <div className="mb-4">
          <input
            type="text"
            placeholder="¿En qué estás trabajando? *"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className={`w-full px-4 py-3 text-lg border-0 border-b-2 focus:outline-none placeholder-gray-400 ${
              description.trim() ? 'border-gray-200 focus:border-blue-500' : 'border-red-200 focus:border-red-500'
            }`}
            required
          />
          {!description.trim() && (
            <p className="mt-1 text-xs text-red-500">* La descripción es obligatoria</p>
          )}
        </div>

        {/* Project & Task Selector */}
        <div className="flex items-center gap-3 mb-6">
          <div className="relative">
            <button
              onClick={() => setShowProjectDropdown(!showProjectDropdown)}
              className="flex items-center gap-2 px-3 py-2 border border-gray-300 rounded-md hover:bg-gray-50 text-sm"
            >
              <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
              {selectedProjectData ? (
                <span>{selectedProjectData.name}</span>
              ) : (
                <span className="text-gray-500">Seleccionar proyecto</span>
              )}
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </button>

            {showProjectDropdown && (
              <div className="absolute top-full left-0 mt-1 w-80 bg-white border border-gray-200 rounded-lg shadow-lg z-10">
                <div className="p-3 border-b border-gray-100">
                  <h3 className="font-medium text-gray-900">Proyectos</h3>
                </div>
                {assignments.jobs.map(job => (
                  <div key={job.id} className="border-b border-gray-100 last:border-0">
                    <button
                      onClick={() => {
                        setSelectedProject(job.id);
                        setSelectedTask('');
                      }}
                      className="w-full px-3 py-2 text-left hover:bg-gray-50 flex items-center gap-2"
                    >
                      <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                      <span className="font-medium">{job.name}</span>
                    </button>
                    {assignments.tasks.filter(t => t.job_id === job.id).map(task => (
                      <button
                        key={task.id}
                        onClick={() => {
                          setSelectedProject(job.id);
                          setSelectedTask(task.id);
                          setShowProjectDropdown(false);
                        }}
                        className="w-full px-6 py-2 text-left hover:bg-blue-50 text-sm text-gray-600 flex items-center gap-2"
                      >
                        <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                        {task.description}
                      </button>
                    ))}
                  </div>
                ))}
              </div>
            )}
          </div>

          {selectedTaskData && (
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <span>→</span>
              <span>{selectedTaskData.description}</span>
            </div>
          )}
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
                  onClick={handleStart}
                  className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <Play className="w-4 h-4" />
                  <span className="font-medium">START</span>
                </button>
              ) : (
                <button
                  onClick={handleStop}
                  className="flex items-center gap-2 px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                >
                  <Square className="w-4 h-4" />
                  <span className="font-medium">STOP</span>
                </button>
              )}
            </div>
          </div>
        )}

        {/* Manual Mode */}
        {trackingMode === 'manual' && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Fecha</label>
                <input
                  type="date"
                  value={manualEntry.date}
                  onChange={(e) => setManualEntry(prev => ({ ...prev, date: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Hora Inicio</label>
                <input
                  type="time"
                  value={manualEntry.startTime}
                  onChange={(e) => setManualEntry(prev => ({ ...prev, startTime: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Hora Fin</label>
                <input
                  type="time"
                  value={manualEntry.endTime}
                  onChange={(e) => setManualEntry(prev => ({ ...prev, endTime: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Duración</label>
                <div className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-md text-center font-mono">
                  {manualEntry.calculatedHours > 0 ? (
                    <span className="text-blue-600 font-semibold">
                      {formatHours(manualEntry.calculatedHours)}
                    </span>
                  ) : (
                    <span className="text-gray-400">--:--</span>
                  )}
                </div>
              </div>
            </div>

            {manualEntry.calculatedHours > 0 && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <div className="flex items-center gap-2 text-blue-800">
                  <Clock className="w-4 h-4" />
                  <span className="text-sm font-medium">
                    Duración calculada: {manualEntry.calculatedHours.toFixed(2)} horas
                  </span>
                </div>
              </div>
            )}

            <div className="flex justify-end">
              <button
                onClick={handleManualSave}
                disabled={!selectedProject || !selectedTask || manualEntry.calculatedHours <= 0}
                className="flex items-center gap-2 px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Save className="w-4 h-4" />
                <span className="font-medium">GUARDAR</span>
              </button>
            </div>
          </div>
        )}

        {/* Status indicators */}
        {isRunning && trackingMode === 'timer' && (
          <div className="mt-4 flex items-center gap-2 text-sm text-green-600">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span>Registrando tiempo...</span>
          </div>
        )}
      </div>

      {/* Recent Entries */}
      <div className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-medium text-gray-900">Entradas Recientes</h3>
          <button 
            onClick={loadRecentEntries}
            className="text-xs text-blue-600 hover:text-blue-800"
          >
            Actualizar
          </button>
        </div>

        {recentEntries.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <Clock className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">No hay entradas recientes</p>
          </div>
        ) : (
          <div className="space-y-2">
            {recentEntries.map((entry) => {
              const project = assignments.jobs.find(j => j.id === entry.job_id);
              const task = assignments.tasks.find(t => t.id === entry.task_id);
              
              return (
                <div key={entry.id} className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg group">
                  <div className="flex items-center gap-3 flex-1">
                    <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {entry.description}
                      </p>
                      <p className="text-xs text-gray-500">
                        {project?.name} • {task?.description}
                      </p>
                    </div>
                    <div className="flex items-center gap-4 text-xs text-gray-500">
                      <span>{entry.date}</span>
                      <span className="font-mono font-medium">
                        {entry.hours.toFixed(2)}h
                      </span>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => handleQuickStart(entry)}
                      className="p-1 text-gray-400 hover:text-blue-600 rounded"
                      title="Usar para timer"
                    >
                      <Play className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default ClockifyTracker;