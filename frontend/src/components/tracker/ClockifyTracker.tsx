import React, { useState, useEffect } from 'react';
import { Play, Square, Clock, Save, Plus } from 'lucide-react';
import toast from 'react-hot-toast';
import apiService from '../../services/api';
import { TimeEntry, Assignment, Job, JobTask } from '../../types';

interface ClockifyTrackerProps {
  assignments: Assignment;
  onUpdate: () => void;
  companyId: string;
}

const ClockifyTracker: React.FC<ClockifyTrackerProps> = ({ assignments, onUpdate, companyId }) => {
  // 🎯 State usando BC IDs
  const [selectedBCJobId, setSelectedBCJobId] = useState<string>('');
  const [selectedBCTaskId, setSelectedBCTaskId] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [elapsedTime, setElapsedTime] = useState<number>(0);
  const [startTime, setStartTime] = useState<Date | null>(null);
  
  // Manual time entry mode
  const [manualMode, setManualMode] = useState<boolean>(false);
  const [manualDate, setManualDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [manualStartTime, setManualStartTime] = useState<string>('');
  const [manualEndTime, setManualEndTime] = useState<string>('');
  const [manualHours, setManualHours] = useState<string>('');

  // 🔄 Get selected job and task objects
  const selectedJob = assignments.jobs.find(j => j.bc_job_id === selectedBCJobId);
  const selectedTask = assignments.tasks.find(t => t.bc_task_id === selectedBCTaskId && t.job_id === selectedJob?.id);

  // Timer effect
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isRunning && startTime) {
      interval = setInterval(() => {
        setElapsedTime(Math.floor((Date.now() - startTime.getTime()) / 1000));
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isRunning, startTime]);

  // Format time helper
  const formatTime = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const remainingSeconds = seconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  // Start timer
  const handleStart = () => {
    if (!selectedBCJobId || !selectedBCTaskId || !description.trim()) {
      toast.error('Please select project, task and add description');
      return;
    }

    setStartTime(new Date());
    setElapsedTime(0);
    setIsRunning(true);
    toast.success('Timer started');
  };

  // Stop timer and save
  const handleStop = async () => {
    if (!startTime || !isRunning) return;

    const endTime = new Date();
    const hours = (endTime.getTime() - startTime.getTime()) / (1000 * 60 * 60);

    if (hours < 0.01) {
      toast.error('Minimum 36 seconds required');
      return;
    }

    try {
      await apiService.createTimeEntry({
        bc_job_id: selectedBCJobId,
        bc_task_id: selectedBCTaskId,
        date: startTime.toISOString().split('T')[0],
        hours: parseFloat(hours.toFixed(2)),
        description: description.trim(),
        start_time: startTime.toTimeString().split(' ')[0].substring(0, 5),
        end_time: endTime.toTimeString().split(' ')[0].substring(0, 5),
        companyId // Pass company ID for backend
      });

      toast.success(`Time entry saved: ${hours.toFixed(2)} hours`);
      
      // Reset form
      setIsRunning(false);
      setStartTime(null);
      setElapsedTime(0);
      setDescription('');
      onUpdate();

    } catch (error: any) {
      console.error('Error saving time entry:', error);
      toast.error(error.response?.data?.error || 'Failed to save time entry');
    }
  };

  // Save manual entry
  const handleSaveManual = async () => {
    if (!selectedBCJobId || !selectedBCTaskId || !description.trim()) {
      toast.error('Please select project, task and add description');
      return;
    }

    let hours: number;

    // Calculate hours from time range or direct input
    if (manualStartTime && manualEndTime) {
      const start = new Date(`2000-01-01T${manualStartTime}:00`);
      const end = new Date(`2000-01-01T${manualEndTime}:00`);
      
      if (end <= start) {
        toast.error('End time must be after start time');
        return;
      }
      
      hours = (end.getTime() - start.getTime()) / (1000 * 60 * 60);
    } else if (manualHours) {
      hours = parseFloat(manualHours);
      if (isNaN(hours) || hours <= 0 || hours > 24) {
        toast.error('Hours must be between 0.1 and 24');
        return;
      }
    } else {
      toast.error('Please specify either time range or hours');
      return;
    }

    try {
      await apiService.createTimeEntry({
        bc_job_id: selectedBCJobId,
        bc_task_id: selectedBCTaskId,
        date: manualDate,
        hours: parseFloat(hours.toFixed(2)),
        description: description.trim(),
        start_time: manualStartTime || undefined,
        end_time: manualEndTime || undefined,
        companyId
      });

      toast.success(`Manual entry saved: ${hours.toFixed(2)} hours`);
      
      // Reset form
      setDescription('');
      setManualStartTime('');
      setManualEndTime('');
      setManualHours('');
      onUpdate();

    } catch (error: any) {
      console.error('Error saving manual entry:', error);
      toast.error(error.response?.data?.error || 'Failed to save time entry');
    }
  };

  // Handle job selection change
  const handleJobChange = (bcJobId: string) => {
    setSelectedBCJobId(bcJobId);
    setSelectedBCTaskId(''); // Reset task when job changes
  };

  // Get available tasks for selected job
  const availableTasks = selectedJob 
    ? assignments.tasks.filter(task => task.job_id === selectedJob.id)
    : [];

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold text-gray-900">Time Tracker</h2>
        <div className="flex gap-2">
          <button
            onClick={() => setManualMode(!manualMode)}
            className={`px-3 py-1 text-sm rounded-md border transition-colors ${
              manualMode 
                ? 'bg-blue-50 text-blue-700 border-blue-200' 
                : 'bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100'
            }`}
          >
            {manualMode ? 'Timer Mode' : 'Manual Mode'}
          </button>
        </div>
      </div>

      {/* Project and Task Selection */}
      <div className="space-y-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Project Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Project *
            </label>
            <select
              value={selectedBCJobId}
              onChange={(e) => handleJobChange(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              disabled={isRunning}
            >
              <option value="">Select project...</option>
              {assignments.jobs.map((job) => (
                <option key={job.bc_job_id} value={job.bc_job_id}>
                  {job.bc_job_id} - {job.name}
                </option>
              ))}
            </select>
          </div>

          {/* Task Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Task *
            </label>
            <select
              value={selectedBCTaskId}
              onChange={(e) => setSelectedBCTaskId(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              disabled={!selectedBCJobId || isRunning}
            >
              <option value="">Select task...</option>
              {availableTasks.map((task) => (
                <option key={task.bc_task_id} value={task.bc_task_id}>
                  {task.bc_task_id} - {task.description}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Description *
          </label>
          <input
            type="text"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="What are you working on?"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            disabled={isRunning}
          />
        </div>
      </div>

      {!manualMode ? (
        /* Timer Mode */
        <div className="space-y-4">
          <div className="flex items-center justify-center">
            <div className="text-4xl font-mono font-bold text-gray-900">
              {formatTime(elapsedTime)}
            </div>
          </div>

          <div className="flex justify-center gap-4">
            {!isRunning ? (
              <button
                onClick={handleStart}
                className="flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={!selectedBCJobId || !selectedBCTaskId || !description.trim()}
              >
                <Play className="w-5 h-5" />
                Start Timer
              </button>
            ) : (
              <button
                onClick={handleStop}
                className="flex items-center gap-2 px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                <Square className="w-5 h-5" />
                Stop & Save
              </button>
            )}
          </div>

          {isRunning && startTime && (
            <div className="text-center text-sm text-gray-600">
              Started at {startTime.toLocaleTimeString()}
            </div>
          )}
        </div>
      ) : (
        /* Manual Mode */
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Date *
              </label>
              <input
                type="date"
                value={manualDate}
                onChange={(e) => setManualDate(e.target.value)}
                max={new Date().toISOString().split('T')[0]}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Start Time
              </label>
              <input
                type="time"
                value={manualStartTime}
                onChange={(e) => {
                  setManualStartTime(e.target.value);
                  setManualHours(''); // Clear hours when using time range
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                End Time
              </label>
              <input
                type="time"
                value={manualEndTime}
                onChange={(e) => {
                  setManualEndTime(e.target.value);
                  setManualHours(''); // Clear hours when using time range
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          <div className="text-center text-sm text-gray-500">OR</div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Hours
            </label>
            <input
              type="number"
              step="0.1"
              min="0.1"
              max="24"
              value={manualHours}
              onChange={(e) => {
                setManualHours(e.target.value);
                setManualStartTime(''); // Clear times when using direct hours
                setManualEndTime('');
              }}
              placeholder="e.g., 2.5"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div className="flex justify-center">
            <button
              onClick={handleSaveManual}
              className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={!selectedBCJobId || !selectedBCTaskId || !description.trim() || (!manualHours && (!manualStartTime || !manualEndTime))}
            >
              <Save className="w-5 h-5" />
              Save Entry
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ClockifyTracker;