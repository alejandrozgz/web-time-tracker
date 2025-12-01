import React, { useState, useEffect } from 'react';
import { RefreshCw, Download, AlertCircle, Info, AlertTriangle, Bug, Trash2 } from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3000/api';

interface LogFile {
  filename: string;
  size: number;
  modified: string;
  date: string;
}

interface LogData {
  filename: string;
  lines: string[];
  totalLines: number;
  size: number;
  modified: string;
}

interface RetentionInfo {
  retentionDays: number;
  maxFileSize: number;
  logsDirectory: string;
}

type LogLevel = 'INFO' | 'WARN' | 'ERROR' | 'DEBUG' | 'ALL';

const SystemLogsViewer: React.FC = () => {
  const [logFiles, setLogFiles] = useState<LogFile[]>([]);
  const [selectedFile, setSelectedFile] = useState<string | null>(null);
  const [logData, setLogData] = useState<LogData | null>(null);
  const [filter, setFilter] = useState<LogLevel>('ALL');
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [retentionInfo, setRetentionInfo] = useState<RetentionInfo | null>(null);
  const [cleaning, setCleaning] = useState(false);

  // Get auth token
  const getAuthToken = () => {
    return localStorage.getItem('admin_token');
  };

  // Fetch list of log files
  const fetchLogFiles = async () => {
    try {
      setRefreshing(true);
      const token = getAuthToken();
      const response = await axios.get(`${API_BASE_URL}/admin/logs`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setLogFiles(response.data.files);
      setRetentionInfo(response.data.retention);

      // Auto-select the most recent file if none selected
      if (!selectedFile && response.data.files.length > 0) {
        setSelectedFile(response.data.files[0].filename);
      }
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to load log files');
    } finally {
      setRefreshing(false);
    }
  };

  // Cleanup old logs
  const handleCleanup = async () => {
    if (!window.confirm(`Are you sure you want to delete log files older than ${retentionInfo?.retentionDays || 30} days?`)) {
      return;
    }

    try {
      setCleaning(true);
      const token = getAuthToken();
      const response = await axios.post(`${API_BASE_URL}/admin/logs`,
        { action: 'cleanup' },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success(response.data.message);

      // Refresh log files list
      await fetchLogFiles();

      // Clear selected file if it was deleted
      if (selectedFile) {
        const stillExists = logFiles.some(f => f.filename === selectedFile);
        if (!stillExists) {
          setSelectedFile(null);
          setLogData(null);
        }
      }
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to cleanup logs');
    } finally {
      setCleaning(false);
    }
  };

  // Fetch specific log file content
  const fetchLogContent = async (filename: string) => {
    try {
      setLoading(true);
      const token = getAuthToken();
      const params: any = { filename, lines: 1000 };
      if (filter !== 'ALL') {
        params.filter = filter;
      }

      const response = await axios.get(`${API_BASE_URL}/admin/logs`, {
        params,
        headers: { Authorization: `Bearer ${token}` }
      });
      setLogData(response.data);
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to load log content');
    } finally {
      setLoading(false);
    }
  };

  // Load log files on mount
  useEffect(() => {
    fetchLogFiles();
  }, []);

  // Load log content when file or filter changes
  useEffect(() => {
    if (selectedFile) {
      fetchLogContent(selectedFile);
    }
  }, [selectedFile, filter]);

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
  };

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleString();
  };

  const getLogLevelIcon = (line: string) => {
    if (line.includes('[ERROR]')) return <AlertCircle className="w-4 h-4 text-red-500" />;
    if (line.includes('[WARN]')) return <AlertTriangle className="w-4 h-4 text-yellow-500" />;
    if (line.includes('[DEBUG]')) return <Bug className="w-4 h-4 text-purple-500" />;
    if (line.includes('[INFO]')) return <Info className="w-4 h-4 text-blue-500" />;
    return null;
  };

  const getLogLevelClass = (line: string): string => {
    if (line.includes('[ERROR]')) return 'text-red-700 bg-red-50';
    if (line.includes('[WARN]')) return 'text-yellow-700 bg-yellow-50';
    if (line.includes('[DEBUG]')) return 'text-purple-700 bg-purple-50';
    if (line.includes('[INFO]')) return 'text-blue-700 bg-blue-50';
    return 'text-gray-700';
  };

  const downloadLog = () => {
    if (!logData) return;

    const blob = new Blob([logData.lines.join('\n')], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = logData.filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);

    toast.success('Log file downloaded');
  };

  return (
    <div className="p-8">
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">System Logs</h1>
            <p className="text-gray-600 mt-2">View backend logs and system activity</p>
          </div>
          <button
            onClick={fetchLogFiles}
            disabled={refreshing}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            <RefreshCw className={`w-5 h-5 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>

        {/* Retention Info */}
        {retentionInfo && (
          <div className="mt-4 flex items-center gap-4 text-sm">
            <span className="text-gray-600">
              <strong>Retention:</strong> {retentionInfo.retentionDays} days
            </span>
            <span className="text-gray-600">
              <strong>Max file size:</strong> {(retentionInfo.maxFileSize / (1024 * 1024)).toFixed(0)} MB
            </span>
            <button
              onClick={handleCleanup}
              disabled={cleaning}
              className="ml-auto flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
            >
              <Trash2 className={`w-4 h-4 ${cleaning ? 'animate-pulse' : ''}`} />
              {cleaning ? 'Cleaning...' : 'Cleanup Old Logs'}
            </button>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Left Sidebar - Log Files */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow p-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">Log Files</h2>
              <button
                onClick={fetchLogFiles}
                disabled={refreshing}
                className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg disabled:opacity-50"
              >
                <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
              </button>
            </div>

            <div className="space-y-2">
              {logFiles.map((file) => (
                <button
                  key={file.filename}
                  onClick={() => setSelectedFile(file.filename)}
                  className={`w-full text-left p-3 rounded-lg transition-colors ${
                    selectedFile === file.filename
                      ? 'bg-blue-50 border-2 border-blue-500'
                      : 'bg-gray-50 hover:bg-gray-100 border-2 border-transparent'
                  }`}
                >
                  <div className="font-medium text-sm">{file.date}</div>
                  <div className="text-xs text-gray-500 mt-1">
                    {formatFileSize(file.size)}
                  </div>
                </button>
              ))}
            </div>

            {logFiles.length === 0 && !refreshing && (
              <div className="text-center text-gray-500 text-sm py-8">
                No log files found
              </div>
            )}
          </div>
        </div>

        {/* Main Content - Log Viewer */}
        <div className="lg:col-span-3">
          <div className="bg-white rounded-lg shadow">
            {/* Controls */}
            <div className="p-4 border-b border-gray-200">
              <div className="flex items-center justify-between flex-wrap gap-4">
                <div className="flex items-center gap-4">
                  <label className="text-sm font-medium text-gray-700">Filter:</label>
                  <select
                    value={filter}
                    onChange={(e) => setFilter(e.target.value as LogLevel)}
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="ALL">All Levels</option>
                    <option value="INFO">INFO</option>
                    <option value="WARN">WARN</option>
                    <option value="ERROR">ERROR</option>
                    <option value="DEBUG">DEBUG</option>
                  </select>
                </div>

                {logData && (
                  <div className="flex items-center gap-4">
                    <span className="text-sm text-gray-600">
                      {logData.totalLines} lines
                    </span>
                    <button
                      onClick={downloadLog}
                      className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                    >
                      <Download className="w-4 h-4" />
                      Download
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Log Content */}
            <div className="p-4">
              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <RefreshCw className="w-8 h-8 animate-spin text-blue-600" />
                </div>
              ) : logData ? (
                <div className="bg-gray-900 rounded-lg p-4 overflow-auto max-h-[calc(100vh-300px)]">
                  <pre className="text-xs font-mono">
                    {logData.lines.map((line, index) => (
                      <div
                        key={index}
                        className={`py-1 px-2 mb-1 rounded flex items-start gap-2 ${getLogLevelClass(line)}`}
                      >
                        <span className="flex-shrink-0 mt-0.5">
                          {getLogLevelIcon(line)}
                        </span>
                        <span className="flex-1 whitespace-pre-wrap break-all">
                          {line}
                        </span>
                      </div>
                    ))}
                  </pre>
                </div>
              ) : (
                <div className="text-center text-gray-500 py-12">
                  Select a log file to view its content
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SystemLogsViewer;
