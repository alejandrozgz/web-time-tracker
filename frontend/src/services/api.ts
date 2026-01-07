// File: frontend/src/services/api.ts (UPDATED)
import axios, { AxiosInstance } from 'axios';
import {
  LoginData,
  AuthResponse,
  Job,
  JobTask,
  TimeEntry,
  SyncResponse,
  SyncDashboard,
  CreateTimeEntryData,
  BCSyncLog,
  SyncLogFilters,
  SyncStatistics,
  SyncActivity,
  BulkTimeEntrySaveRequest,
  BulkTimeEntrySaveResponse
} from '../types';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3000/api';

class ApiService {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: API_BASE_URL,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // ❌ REMOVER: El interceptor automático del localStorage
    // this.client.interceptors.request.use((config) => {
    //   const token = localStorage.getItem('auth-token');
    //   if (token) {
    //     config.headers.Authorization = `Bearer ${token}`;
    //   }
    //   return config;
    // });
  }

  // 🏢 Configurar tenant dinámicamente
  setTenant(tenantSlug: string): void {
    this.client.defaults.baseURL = `${API_BASE_URL}/${tenantSlug}`;
    console.log(`API configured for tenant: ${tenantSlug}`);
  }

  // 🔐 NUEVO: Configurar token manualmente
  setAuthToken(token: string): void {
    if (token) {
      this.client.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      console.log('Auth token set');
    } else {
      delete this.client.defaults.headers.common['Authorization'];
      console.log('Auth token cleared');
    }
  }

  // 🔐 AUTHENTICATION
  async login(data: LoginData): Promise<AuthResponse> {
    const response = await this.client.post('/auth/login', data);
    return response.data;
  }

  async getCompanies() {
    const response = await this.client.get('/companies');
    return response.data.companies;
  }

  // 📊 JOBS & TASKS
  async getJobs(companyId: string): Promise<{ jobs: Job[]; tasks: JobTask[] }> {
    const response = await this.client.get(`/jobs?companyId=${companyId}`);
    return response.data;
  }

  // ⏱️ TIME ENTRIES
  async getTimeEntries(companyId: string, from?: string, to?: string, limit?: number, offset?: number, resourceNo?: string): Promise<TimeEntry[]> {
    const params = new URLSearchParams();
    params.append('companyId', companyId);
    if (from) params.append('from', from);
    if (to) params.append('to', to);
    if (limit) params.append('limit', limit.toString());
    if (offset !== undefined) params.append('offset', offset.toString());
    if (resourceNo) params.append('resource_no', resourceNo);

    const response = await this.client.get(`/time-entries?${params}`);
    return response.data.entries || [];
  }

  async createTimeEntry(data: CreateTimeEntryData): Promise<TimeEntry> {
    const response = await this.client.post('/time-entries', data);
    return response.data.entry;
  }

  async updateTimeEntry(id: string, data: Partial<Omit<TimeEntry, 'id' | 'created_at' | 'bc_journal_id' | 'bc_batch_name' | 'bc_ledger_id' | 'bc_last_sync_at' | 'companyId'>>): Promise<TimeEntry> {
    const response = await this.client.patch(`/time-entries?id=${id}`, data);
    return response.data.entry;
  }

  async deleteTimeEntry(id: string): Promise<void> {
    await this.client.delete(`/time-entries?id=${id}`);
  }

  // 💾 BULK TIME ENTRY OPERATIONS
  async bulkSaveTimeEntries(data: BulkTimeEntrySaveRequest): Promise<BulkTimeEntrySaveResponse> {
    const response = await this.client.post('/time-entries/bulk', data);
    return response.data;
  }

  // 🔄 BUSINESS CENTRAL SYNC METHODS
  async getSyncDashboard(companyId: string): Promise<SyncDashboard> {
    const response = await this.client.get(`/sync/dashboard?companyId=${companyId}`);
    return response.data;
  }

  async syncToBC(companyId: string): Promise<SyncResponse> {
    const response = await this.client.post('/sync/to-bc', { companyId });
    return response.data;
  }

  async getPendingSyncEntries(companyId: string): Promise<TimeEntry[]> {
    const response = await this.client.get(`/sync/pending?companyId=${companyId}`);
    return response.data.entries || [];
  }

  async refreshApprovalStatus(companyId: string): Promise<{
    success: boolean;
    checked_entries: number;
    updated_entries: number;
    updates?: any[];
    message: string;
  }> {
    const response = await this.client.get(`/sync/refresh-status?companyId=${companyId}`);
    return response.data;
  }

  async retrySyncEntry(entryId: string): Promise<SyncResponse> {
    const response = await this.client.post(`/sync/retry/${entryId}`);
    return response.data;
  }

  async postJournalBatch(batchName: string): Promise<SyncResponse> {
    const response = await this.client.post('/sync/post-journal', { batchName });
    return response.data;
  }

  async getSyncHistory(companyId: string, limit = 10): Promise<any[]> {
    const response = await this.client.get(`/sync/history?companyId=${companyId}&limit=${limit}`);
    return response.data.history || [];
  }

  // 📋 SYNC LOGS METHODS
  async getSyncLogs(companyId: string, filters?: SyncLogFilters): Promise<{ logs: BCSyncLog[]; count: number; limit: number; offset: number }> {
    const params = new URLSearchParams();
    params.append('companyId', companyId);

    if (filters?.operation_type) params.append('operation_type', filters.operation_type);
    if (filters?.log_level) params.append('log_level', filters.log_level);
    if (filters?.date_from) params.append('date_from', filters.date_from);
    if (filters?.date_to) params.append('date_to', filters.date_to);
    if (filters?.limit) params.append('limit', filters.limit.toString());
    if (filters?.offset) params.append('offset', filters.offset.toString());

    const response = await this.client.get(`/sync/logs?${params}`);
    return response.data;
  }

  async getSyncStatistics(companyId: string, dateFrom?: string, dateTo?: string): Promise<SyncStatistics> {
    const params = new URLSearchParams();
    params.append('companyId', companyId);
    if (dateFrom) params.append('date_from', dateFrom);
    if (dateTo) params.append('date_to', dateTo);

    const response = await this.client.get(`/sync/statistics?${params}`);
    return response.data;
  }

  async getSyncActivity(companyId: string, hours: number = 24): Promise<{ activity: SyncActivity[]; hours: number }> {
    const params = new URLSearchParams();
    params.append('companyId', companyId);
    params.append('hours', hours.toString());

    const response = await this.client.get(`/sync/activity?${params}`);
    return response.data;
  }
}

export const apiService = new ApiService();
export default apiService;