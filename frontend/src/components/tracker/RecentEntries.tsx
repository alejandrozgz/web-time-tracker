import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Clock, Edit2, Trash2, Tag, Save, X, ChevronDown, ChevronUp } from 'lucide-react';
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

  const canEditEntry = (entry: TimeEntry) => {
    // Allow editing if:
    // 1. not_synced or error status
    // 2. synced but rejected (can be modified and re-synced)
    if (entry.bc_sync_status === 'not_synced' || entry.bc_sync_status === 'error') {
      return true;
    }

    if (entry.bc_sync_status === 'synced' && entry.approval_status === 'rejected') {
      return true;
    }

    return false;
  };

  const canDeleteEntry = (entry: TimeEntry) => {
    // Same logic as edit
    if (entry.bc_sync_status === 'not_synced' || entry.bc_sync_status === 'error') {
      return true;
    }

    if (entry.bc_sync_status === 'synced' && entry.approval_status === 'rejected') {
      return true;
    }

    return false;
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
      } catch (error: any) {
        toast.error(error.response?.data?.error || t('common:status.error'));
      }
    }
  };

  const formatTimeHHMM = (time?: string) => {
    if (!time) return '--:--';
    return time.slice(0, 5);
  };

  const editable = canEditEntry(entry);
  const deletable = canDeleteEntry(entry);

  // Get styling based on approval status - UX optimized
  const getEntryStyle = () => {
    if (entry.bc_sync_status !== 'synced') {
      return {
        borderColor: 'border-gray-200',
        hoverColor: 'hover:bg-gray-50',
        statusDot: null
      };
    }

    const status = entry.approval_status || 'pending';

    switch (status) {
      case 'approved':
        return {
          borderColor: 'border-l-4 border-l-green-500 border-t border-r border-b border-gray-200',
          hoverColor: 'hover:bg-green-50/30',
          statusDot: <span className="w-2 h-2 rounded-full bg-green-500 flex-shrink-0" title="Aprobado"></span>
        };
      case 'rejected':
        return {
          borderColor: 'border-l-4 border-l-red-500 border-t border-r border-b border-gray-200',
          hoverColor: 'hover:bg-red-50/30',
          statusDot: <span className="w-2 h-2 rounded-full bg-red-500 flex-shrink-0" title="Rechazado"></span>
        };
      case 'pending':
      default:
        return {
          borderColor: 'border-l-4 border-l-amber-500 border-t border-r border-b border-gray-200',
          hoverColor: 'hover:bg-amber-50/30',
          statusDot: <span className="w-2 h-2 rounded-full bg-amber-500 flex-shrink-0" title="Pendiente"></span>
        };
    }
  };

  const entryStyle = getEntryStyle();

  if (isEditing) {
    return (
      <div className="flex items-center gap-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
        <input
          type="text"
          value={editForm.description}
          onChange={e => setEditForm(p => ({...p, description: e.target.value}))}
          className="flex-1 min-w-0 px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder={t('tracker:fields.description_placeholder')}
        />

        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setShowProjectDropdown(!showProjectDropdown)}
            className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-700 font-medium"
          >
            <Tag className="w-3 h-3"/>
            <span className="truncate max-w-[120px]">{project?.name || t('tracker:fields.select_project')}</span>
          </button>
          {showProjectDropdown && (
            <div className="absolute top-full right-0 mt-2 w-screen sm:w-[500px] max-w-[calc(100vw-2rem)] bg-white border border-gray-200 rounded-lg shadow-2xl z-20">
              <div className="p-3 border-b border-gray-200">
                <h3 className="font-semibold text-gray-900 text-sm">{t('tracker:fields.select_task')}</h3>
              </div>
              <div className="max-h-[40vh] overflow-y-auto">
                {assignments.jobs.map(job => (
                  <div key={job.id}>
                    <div className="px-4 py-2 bg-gray-50">
                      <span className="font-medium text-gray-800 text-xs">{job.name}</span>
                    </div>
                    {assignments.tasks.filter(t => t.job_id === job.id).map(task => (
                      <button
                        key={task.id}
                        onClick={() => {
                          setSelectedProject(job.id);
                          setSelectedTask(task.id);
                          setShowProjectDropdown(false);
                        }}
                        className={`w-full text-left px-6 py-2 text-xs transition-colors ${
                          selectedTask === task.id
                            ? 'bg-blue-600 text-white'
                            : 'text-gray-600 hover:bg-gray-100'
                        }`}
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

        <div className="flex items-center gap-2">
          <input
            type="time"
            value={editForm.startTime}
            onChange={e => setEditForm(p => ({...p, startTime: e.target.value}))}
            className="px-2 py-1 border border-gray-300 rounded text-xs focus:outline-none focus:ring-2 focus:ring-blue-500 w-20"
          />
          <span className="text-gray-400">-</span>
          <input
            type="time"
            value={editForm.endTime}
            onChange={e => setEditForm(p => ({...p, endTime: e.target.value}))}
            className="px-2 py-1 border border-gray-300 rounded text-xs focus:outline-none focus:ring-2 focus:ring-blue-500 w-20"
          />
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={handleSaveEdit}
            className="p-1.5 text-green-600 hover:bg-green-50 rounded transition-colors"
            title={t('common:actions.save')}
          >
            <Save className="w-4 h-4"/>
          </button>
          <button
            onClick={handleCancelEdit}
            className="p-1.5 text-gray-400 hover:bg-gray-100 rounded transition-colors"
            title={t('common:actions.cancel')}
          >
            <X className="w-4 h-4"/>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-1">
      <div className={`p-3 rounded-lg bg-white ${entryStyle.borderColor} ${entryStyle.hoverColor} transition-colors`}>
        {/* Desktop Layout */}
        <div className="hidden sm:flex items-center gap-4">
          {/* Description and Project/Task */}
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900 truncate">
              {entry.description}
            </p>
            <p className="text-xs text-gray-500">
              {project?.name} • {assignments.tasks.find(t => t.bc_task_id === entry.bc_task_id)?.description}
            </p>
          </div>

          {/* Time section */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-500 font-medium">
              {formatTimeHHMM(entry.start_time)} - {formatTimeHHMM(entry.end_time)}
            </span>
            <span className="text-sm font-bold text-gray-900">
              ({entry.hours.toFixed(2)}h)
            </span>
          </div>

          {/* Status Dot - Only if synced */}
          {entry.bc_sync_status === 'synced' && entryStyle.statusDot && (
            <div className="flex items-center gap-2">
              {entryStyle.statusDot}
            </div>
          )}

          {/* Badge de estado sync */}
          <span className={`px-2 py-1 rounded-full text-xs font-medium flex-shrink-0 ${
            entry.bc_sync_status === 'not_synced' ? 'bg-orange-100 text-orange-700' :
            entry.bc_sync_status === 'synced' ? 'bg-blue-100 text-blue-700' :
            entry.bc_sync_status === 'error' ? 'bg-red-100 text-red-700' :
            'bg-gray-100 text-gray-700'
          }`}>
            {t(`tracker:sync_status.${entry.bc_sync_status}`) || entry.bc_sync_status}
          </span>

          {/* Action buttons */}
          <div className="flex items-center gap-1">
            <button
              onClick={handleStartEdit}
              disabled={!editable}
              className={`p-1.5 rounded transition-colors ${
                editable
                  ? 'text-orange-600 hover:bg-orange-50 cursor-pointer'
                  : 'text-gray-300 cursor-not-allowed'
              }`}
              title={editable ? t('common:actions.edit') : "No se puede editar"}
            >
              <Edit2 className="w-4 h-4"/>
            </button>
            <button
              onClick={handleDelete}
              disabled={!deletable}
              className={`p-1.5 rounded transition-colors ${
                deletable
                  ? 'text-red-600 hover:bg-red-50 cursor-pointer'
                  : 'text-gray-300 cursor-not-allowed'
              }`}
              title={deletable ? t('common:actions.delete') : "No se puede eliminar"}
            >
              <Trash2 className="w-4 h-4"/>
            </button>
          </div>
        </div>

        {/* Mobile Layout */}
        <div className="sm:hidden space-y-2">
          {/* Top row: Description */}
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900">
                {entry.description}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                {project?.name} • {assignments.tasks.find(t => t.bc_task_id === entry.bc_task_id)?.description}
              </p>
            </div>

            {/* Action buttons - Mobile */}
            <div className="flex items-center gap-1 flex-shrink-0">
              <button
                onClick={handleStartEdit}
                disabled={!editable}
                className={`p-1.5 rounded transition-colors ${
                  editable
                    ? 'text-orange-600 hover:bg-orange-50 cursor-pointer'
                    : 'text-gray-300 cursor-not-allowed'
                }`}
                title={editable ? t('common:actions.edit') : "No se puede editar"}
              >
                <Edit2 className="w-4 h-4"/>
              </button>
              <button
                onClick={handleDelete}
                disabled={!deletable}
                className={`p-1.5 rounded transition-colors ${
                  deletable
                    ? 'text-red-600 hover:bg-red-50 cursor-pointer'
                    : 'text-gray-300 cursor-not-allowed'
                }`}
                title={deletable ? t('common:actions.delete') : "No se puede eliminar"}
              >
                <Trash2 className="w-4 h-4"/>
              </button>
            </div>
          </div>

          {/* Bottom row: Time and status */}
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-500 font-medium">
                {formatTimeHHMM(entry.start_time)} - {formatTimeHHMM(entry.end_time)}
              </span>
              <span className="text-sm font-bold text-gray-900">
                ({entry.hours.toFixed(2)}h)
              </span>
            </div>

            <div className="flex items-center gap-2 flex-shrink-0">
              {/* Status Dot - Only if synced */}
              {entry.bc_sync_status === 'synced' && entryStyle.statusDot && (
                <div className="flex items-center">
                  {entryStyle.statusDot}
                </div>
              )}

              {/* Badge de estado sync */}
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                entry.bc_sync_status === 'not_synced' ? 'bg-orange-100 text-orange-700' :
                entry.bc_sync_status === 'synced' ? 'bg-blue-100 text-blue-700' :
                entry.bc_sync_status === 'error' ? 'bg-red-100 text-red-700' :
                'bg-gray-100 text-gray-700'
              }`}>
                {t(`tracker:sync_status.${entry.bc_sync_status}`) || entry.bc_sync_status}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Comments section if rejected - shown below the entry */}
      {entry.approval_status === 'rejected' && entry.bc_comments && (
        <div className="ml-3 px-3 py-2 text-xs text-red-700 bg-red-50 border border-red-200 rounded-lg">
          <span className="font-semibold">{t('tracker:approval_status.rejection_reason')}: </span>{entry.bc_comments}
        </div>
      )}
    </div>
  );
};


const RecentEntries: React.FC<RecentEntriesProps> = (props) => {
  const { t } = useTranslation(['tracker', 'common']);
  const { entries, loadingMore, hasMore, onLoadMore } = props;
  const [collapsedDates, setCollapsedDates] = useState<Set<string>>(new Set());

  const groupEntriesByDate = useMemo(() => {
    const grouped: { [key: string]: TimeEntry[] } = {};
    entries.forEach(entry => {
      const date = entry.date;
      if (!grouped[date]) grouped[date] = [];
      grouped[date].push(entry);
    });
    return grouped;
  }, [entries]);

  const toggleDateCollapse = (date: string) => {
    setCollapsedDates(prev => {
      const newSet = new Set(prev);
      if (newSet.has(date)) {
        newSet.delete(date);
      } else {
        newSet.add(date);
      }
      return newSet;
    });
  };

  if (entries.length === 0 && !loadingMore) {
    return (
      <div className="bg-white shadow-sm rounded-lg border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-medium text-gray-900">{t('tracker:recent_entries.title')}</h3>
        </div>
        <div className="text-center py-8 text-gray-500">
          <Clock className="w-8 h-8 mx-auto mb-2 opacity-50" />
          <p className="text-sm">{t('tracker:recent_entries.no_entries')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white shadow-sm rounded-lg border border-gray-200">
      <div className="p-6">
        {/* Header with title and legend */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <h3 className="text-sm font-medium text-gray-900">{t('tracker:recent_entries.title')}</h3>

          {/* Approval Status Legend - Compact */}
          <div className="flex items-center gap-3 text-xs bg-gray-50 px-3 py-2 rounded-md border border-gray-200">
            <span className="text-gray-500 font-medium">{t('tracker:approval_status.legend')}:</span>
            <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full bg-amber-500"></div>
              <span className="text-gray-700">{t('tracker:approval_status.pending')}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full bg-green-500"></div>
              <span className="text-gray-700">{t('tracker:approval_status.approved')}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full bg-red-500"></div>
              <span className="text-gray-700">{t('tracker:approval_status.rejected')}</span>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          {Object.entries(groupEntriesByDate).map(([date, dateEntries]) => {
            const isCollapsed = collapsedDates.has(date);

            return (
              <div key={date} className="space-y-2">
                {/* Date Header - Clickeable */}
                <button
                  onClick={() => toggleDateCollapse(date)}
                  className="w-full flex items-center gap-3 px-2 py-2 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <div className="text-sm font-bold text-gray-800 uppercase tracking-wide">
                    {new Date(date + 'T00:00:00').toLocaleDateString(t('common:locale'), {
                      weekday: 'long',
                      day: 'numeric',
                      month: 'long'
                    })}
                  </div>
                  <div className="flex-1 h-px bg-gray-300"></div>
                  <div className="text-lg font-bold text-blue-600">
                    {dateEntries.reduce((sum, e) => sum + e.hours, 0).toFixed(2)}h
                  </div>
                  {isCollapsed ? (
                    <ChevronDown className="w-5 h-5 text-gray-500 flex-shrink-0" />
                  ) : (
                    <ChevronUp className="w-5 h-5 text-gray-500 flex-shrink-0" />
                  )}
                </button>

                {/* Entries for this date - Collapsible */}
                {!isCollapsed && dateEntries.map((entry) => (
                  <EntryRow key={entry.id} entry={entry} {...props} />
                ))}
              </div>
            );
          })}

          {/* Load More Button */}
          {hasMore && (
            <div className="flex justify-center pt-4">
              <button
                onClick={onLoadMore}
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
      </div>
    </div>
  );
};

export default RecentEntries;
