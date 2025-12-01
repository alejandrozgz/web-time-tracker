import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Clock, Edit2, Trash2, Tag, Save, X, MoreVertical } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import toast from 'react-hot-toast';
import apiService from '../../services/api';
import { Assignment, TimeEntry } from '../../types';

interface RecentEntriesProps {
  entries: TimeEntry[];
  assignments: Assignment;
  onUpdate: () => void;
  onLoadMore: () => void;
  hasMore: boolean;
  loadingMore: boolean;
}

// Sub-component for a single entry row to manage its own state
const EntryRow: React.FC<{ 
  entry: TimeEntry; 
  assignments: Assignment; 
  onUpdate: () => void;
}> = ({ entry, assignments, onUpdate }) => {
  const { t } = useTranslation(['tracker', 'common']);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({ description: '', startTime: '', endTime: '' });
  const [showProjectDropdown, setShowProjectDropdown] = useState(false);
  const [selectedProject, setSelectedProject] = useState('');
  const [selectedTask, setSelectedTask] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);

  const project = useMemo(() => assignments.jobs.find(j => j.bc_job_id === entry.bc_job_id), [assignments.jobs, entry.bc_job_id]);
  const task = useMemo(() => assignments.tasks.find(t => t.bc_task_id === entry.bc_task_id), [assignments.tasks, entry.bc_task_id]);

  useEffect(() => {
    // Close dropdown on outside click
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowProjectDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const canEditOrDelete = (entry: TimeEntry) => {
    return entry.bc_sync_status === 'not_synced' || entry.bc_sync_status === 'error' || entry.approval_status === 'rejected';
  };

  const handleStartEdit = () => {
    setIsEditing(true);
    setEditForm({
      description: entry.description,
      startTime: entry.start_time?.slice(0, 5) || '',
      endTime: entry.end_time?.slice(0, 5) || ''
    });
    const currentProject = assignments.jobs.find(j => j.bc_job_id === entry.bc_job_id);
    const currentTask = assignments.tasks.find(t => t.bc_task_id === entry.bc_task_id);
    setSelectedProject(currentProject?.id || '');
    setSelectedTask(currentTask?.id || '');
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
  };

  const handleSaveEdit = async () => {
    const start = new Date(`${entry.date}T${editForm.startTime}:00`);
    const end = new Date(`${entry.date}T${editForm.endTime}:00`);
    if (end <= start) {
      toast.error(t('tracker:messages.end_after_start'));
      return;
    }
    const diffHours = (end.getTime() - start.getTime()) / (1000 * 60 * 60);

    const newProject = assignments.jobs.find(j => j.id === selectedProject);
    const newT = assignments.tasks.find(t => t.id === selectedTask);

    try {
      await apiService.updateTimeEntry(entry.id, {
        start_time: `${editForm.startTime}:00`,
        end_time: `${editForm.endTime}:00`,
        hours: diffHours,
        description: editForm.description,
        bc_job_id: newProject?.bc_job_id,
        bc_task_id: newT?.bc_task_id,
      });
      toast.success(t('tracker:messages.entry_updated'));
      setIsEditing(false);
      onUpdate();
    } catch (error: any) {
      toast.error(error.response?.data?.error || t('common:status.error'));
    }
  };
  
  const handleDelete = async () => {
    if (window.confirm(t('tracker:messages.confirm_delete'))) {
        try {
            await apiService.deleteTimeEntry(entry.id);
            toast.success(t('tracker:messages.entry_deleted'));
            onUpdate();
        } catch (error: any)            {
            toast.error(error.response?.data?.error || t('common:status.error'));
        }
    }
  };
  
  const formatHours = (hours: number) => {
    const h = Math.floor(hours);
    const m = Math.floor((hours - h) * 60);
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
  };

  const editable = canEditOrDelete(entry);

  if (isEditing) {
    return (
      <div className="flex items-center gap-4 p-2 bg-blue-50 dark:bg-gray-900/50 rounded-lg border border-blue-200 dark:border-blue-800">
        <input type="text" value={editForm.description} onChange={e => setEditForm(p => ({...p, description: e.target.value}))} className="flex-grow w-full md:w-1/3 bg-white dark:bg-gray-700 border-gray-300 rounded-md shadow-sm text-sm p-2"/>
        
        <div className="relative" ref={dropdownRef}>
            <button onClick={() => setShowProjectDropdown(!showProjectDropdown)} className="flex items-center gap-2 text-sm text-blue-600">
                <Tag className="w-4 h-4"/> 
                <span>{project?.name || '...'}</span>
            </button>
            {showProjectDropdown && (
              <div className="absolute top-full right-0 mt-2 w-screen sm:w-[700px] max-w-[calc(100vw-2rem)] bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-2xl z-20">
                <div className="max-h-[40vh] overflow-y-auto">
                    {assignments.jobs.map(job => (
                      <div key={job.id}>
                        <div className="px-4 py-2 bg-gray-50 dark:bg-gray-700/50"><span className="font-medium text-gray-800 dark:text-gray-200 text-sm">{job.name}</span></div>
                        {assignments.tasks.filter(t => t.job_id === job.id).map(task => (
                          <button key={task.id} onClick={() => { setSelectedProject(job.id); setSelectedTask(task.id); setShowProjectDropdown(false); }} className={`w-full text-left px-6 py-2.5 text-sm transition-colors ${selectedTask === task.id ? 'bg-blue-600 text-white' : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'}`}>{task.description}</button>
                        ))}
                      </div>
                    ))}
                </div>
              </div>
            )}
        </div>
        
        <div className="flex items-center gap-2">
            <input type="time" value={editForm.startTime} onChange={e => setEditForm(p => ({...p, startTime: e.target.value}))} className="bg-white dark:bg-gray-700 border-gray-300 rounded-md shadow-sm text-sm p-2 w-28"/>
            <span>-</span>
            <input type="time" value={editForm.endTime} onChange={e => setEditForm(p => ({...p, endTime: e.target.value}))} className="bg-white dark:bg-gray-700 border-gray-300 rounded-md shadow-sm text-sm p-2 w-28"/>
        </div>
        <div className="font-semibold text-lg">{formatHours(entry.hours)}</div>
        <button onClick={handleSaveEdit} className="p-2 text-green-600 hover:bg-green-100 rounded-full"><Save className="w-5 h-5"/></button>
        <button onClick={handleCancelEdit} className="p-2 text-gray-500 hover:bg-gray-100 rounded-full"><X className="w-5 h-5"/></button>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-4 p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50">
      <div className="flex-grow w-full md:w-1/3"><p className="truncate dark:text-gray-200">{entry.description}</p></div>
      <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
        <Tag className="w-4 h-4 text-blue-500"/>
        <span className="font-medium text-gray-600 dark:text-gray-300 truncate">{project?.name || '...'}</span>
      </div>
      <div className="hidden md:flex items-center gap-2 text-sm text-gray-500">
        <span>{entry.start_time?.slice(0, 5) || '--:--'} - {entry.end_time?.slice(0, 5) || '--:--'}</span>
      </div>
      <div className="font-semibold text-lg dark:text-white">{formatHours(entry.hours)}</div>
      <div className="flex items-center gap-1">
        <button onClick={handleStartEdit} disabled={!editable} className="p-2 disabled:text-gray-300 dark:disabled:text-gray-600 disabled:cursor-not-allowed text-gray-500 hover:text-blue-600 dark:hover:text-blue-400"><Edit2 className="w-4 h-4"/></button>
        <button onClick={handleDelete} disabled={!editable} className="p-2 disabled:text-gray-300 dark:disabled:text-gray-600 disabled:cursor-not-allowed text-gray-500 hover:text-red-600 dark:hover:text-red-400"><Trash2 className="w-4 h-4"/></button>
        <button className="p-2 text-gray-500"><MoreVertical className="w-4 h-4"/></button>
      </div>
    </div>
  );
};


const RecentEntries: React.FC<RecentEntriesProps> = (props) => {
  const { t } = useTranslation(['tracker', 'common']);
  const { entries, loadingMore, hasMore, onLoadMore } = props;

  const groupEntriesByDate = useMemo(() => {
    const grouped: { [key: string]: TimeEntry[] } = {};
    entries.forEach(entry => {
      const date = entry.date;
      if (!grouped[date]) grouped[date] = [];
      grouped[date].push(entry);
    });
    return grouped;
  }, [entries]);
  
  const getRelativeDate = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.getTime() === today.getTime()) return t('common:time.today');
    if (date.getTime() === yesterday.getTime()) return t('common:time.yesterday');
    
    return date.toLocaleDateString(t('common:locale') || 'en-US', { weekday: 'long', day: 'numeric', month: 'short' });
  };
  
  const formatHours = (hours: number) => {
    const h = Math.floor(hours);
    const m = Math.floor((hours - h) * 60);
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
  };

  if (entries.length === 0 && !loadingMore) {
    return (
        <div className="bg-white dark:bg-gray-800 shadow-sm rounded-lg border border-gray-200 dark:border-gray-700 mt-6">
            <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                <Clock className="w-12 h-12 mx-auto mb-4 opacity-30" />
                <h4 className="text-lg font-medium">{t('tracker:recent_entries.no_entries_found')}</h4>
                <p className="text-sm">{t('tracker:recent_entries.no_entries_desc')}</p>
            </div>
        </div>
    );
  }

  return (
    <div className="mt-6">
      {Object.entries(groupEntriesByDate).map(([date, dateEntries]) => {
        const totalHours = dateEntries.reduce((sum, e) => sum + e.hours, 0);
        return (
          <div key={date} className="mb-4">
            <div className="flex justify-between items-center p-2 bg-gray-100 dark:bg-gray-900/50 rounded-t-lg">
              <span className="font-semibold text-sm text-gray-700 dark:text-gray-300">{getRelativeDate(date)}</span>
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-500">{t('tracker:fields.total_time')}:</span>
                <span className="font-bold text-gray-900 dark:text-white">{formatHours(totalHours)}</span>
              </div>
            </div>
            <div className="bg-white dark:bg-gray-800 shadow-sm rounded-b-lg border-x border-b border-gray-200 dark:border-gray-700">
              {dateEntries.map(entry => <EntryRow key={entry.id} entry={entry} {...props} />)}
            </div>
          </div>
        );
      })}
       {hasMore && (
          <div className="flex justify-center mt-4">
            <button onClick={onLoadMore} disabled={loadingMore} className="px-6 py-2 text-sm font-semibold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/50 rounded-full hover:bg-blue-100 dark:hover:bg-blue-900 transition-colors disabled:opacity-50">
              {loadingMore ? t('common:status.loading_more') : t('common:actions.load_more')}
            </button>
          </div>
        )}
    </div>
  );
};

export default RecentEntries;
