import React, { useState } from 'react';
import { Clock, Edit2, Save, X, Play } from 'lucide-react';
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

const RecentEntries: React.FC<RecentEntriesProps> = ({
  entries,
  assignments,
  onUpdate,
  onLoadMore,
  hasMore,
  loadingMore
}) => {
  const { t } = useTranslation(['tracker', 'common']);
  const [editingEntryId, setEditingEntryId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({
    startTime: '',
    endTime: ''
  });

  const formatTimeHHMM = (time?: string) => {
    if (!time) return '--:--';
    return time.slice(0, 5);
  };

  const canEditEntry = (entry: TimeEntry) => {
    return entry.bc_sync_status === 'not_synced' || entry.bc_sync_status === 'error';
  };

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
      onUpdate();
    } catch (error: any) {
      toast.error(error.response?.data?.error || t('common:status.error'));
    }
  };

  const handleQuickStart = (entry: TimeEntry) => {
    // This will be handled by parent component
    // We'll emit an event or callback
  };

  const groupEntriesByDate = (entries: TimeEntry[]) => {
    const grouped: { [key: string]: TimeEntry[] } = {};

    entries.forEach(entry => {
      const date = entry.date;
      if (!grouped[date]) {
        grouped[date] = [];
      }
      grouped[date].push(entry);
    });

    return grouped;
  };

  if (entries.length === 0) {
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
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-medium text-gray-900">{t('tracker:recent_entries.title')}</h3>
          {entries.length > 0 && (
            <span className="text-xs text-gray-500">
              {entries.length} {entries.length === 1 ? 'entry' : 'entries'} loaded
            </span>
          )}
        </div>

        <div className="space-y-4">
          {Object.entries(groupEntriesByDate(entries)).map(([date, dateEntries]) => (
            <div key={date} className="space-y-2">
              {/* Date Header */}
              <div className="flex items-center gap-3 px-2 py-2 bg-gray-50 rounded-lg">
                <div className="text-sm font-bold text-gray-800 uppercase tracking-wide">
                  {new Date(date + 'T00:00:00').toLocaleDateString('es-ES', {
                    weekday: 'long',
                    day: 'numeric',
                    month: 'long'
                  })}
                </div>
                <div className="flex-1 h-px bg-gray-300"></div>
                <div className="text-lg font-bold text-blue-600">
                  {dateEntries.reduce((sum, e) => sum + e.hours, 0).toFixed(2)}h
                </div>
              </div>

              {/* Entries for this date */}
              {dateEntries.map((entry) => {
                const project = assignments.jobs.find(j => j.bc_job_id === entry.bc_job_id);
                const task = assignments.tasks.find(t => t.bc_task_id === entry.bc_task_id);
                const isEditing = editingEntryId === entry.id;
                const editable = canEditEntry(entry);

                return (
                  <div key={entry.id} className="flex items-center gap-4 p-3 hover:bg-gray-50 rounded-lg border border-gray-100">
                    {/* Description and Project/Task */}
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
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-gray-500 font-medium">
                          {formatTimeHHMM(entry.start_time)} - {formatTimeHHMM(entry.end_time)}
                        </span>
                        <span className="text-sm font-bold text-gray-900">
                          ({entry.hours.toFixed(2)}h)
                        </span>
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

                    {/* Action buttons - Always visible */}
                    <div className="flex items-center gap-1">
                      {isEditing ? (
                        <>
                          <button
                            onClick={() => handleSaveEdit(entry)}
                            className="p-1.5 text-green-600 hover:bg-green-50 rounded"
                            title="Guardar"
                          >
                            <Save className="w-4 h-4" />
                          </button>
                          <button
                            onClick={handleCancelEdit}
                            className="p-1.5 text-gray-400 hover:bg-gray-100 rounded"
                            title="Cancelar"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </>
                      ) : (
                        <>
                          <button
                            onClick={() => handleStartEdit(entry)}
                            disabled={!editable}
                            className={`p-1.5 rounded transition-colors ${
                              editable
                                ? 'text-orange-600 hover:bg-orange-50 cursor-pointer'
                                : 'text-gray-300 cursor-not-allowed'
                            }`}
                            title={editable ? "Editar horarios" : "No se puede editar (ya sincronizado)"}
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleQuickStart(entry)}
                            className="p-1.5 text-blue-600 hover:bg-blue-50 rounded transition-colors"
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
