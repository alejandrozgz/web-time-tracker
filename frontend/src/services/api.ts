import axios from 'axios';
import { LoginData, AuthResponse, Job, JobTask, TimeEntry, SyncResponse, SyncDashboard, CreateTimeEntryData } from '../types';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3000/api';
const TENANT = process.env.REACT_APP_TENANT || 'empresa-demo';

class ApiService {
  private client = axios.create({
    baseURL: `${API_BASE_URL}/${TENANT}`,
    headers: {
      'Content-Type': 'application/json',
    },
  });

  constructor() {
    this.client.interceptors.request.use((config) => {
      const token = localStorage.getItem('auth-token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    });
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

  // ⏱️ TIME ENTRIES - UPDATED WITH PROPER TYPES
  async getTimeEntries(companyId: string, from?: string, to?: string): Promise<TimeEntry[]> {
    const params = new URLSearchParams();
    params.append('companyId', companyId);
    if (from) params.append('from', from);
    if (to) params.append('to', to);
    
    const response = await this.client.get(`/time-entries?${params}`);
    return response.data.entries || [];
  }

  // 🎯 UPDATED: Use CreateTimeEntryData interface
  async createTimeEntry(data: CreateTimeEntryData): Promise<TimeEntry> {
    const response = await this.client.post('/time-entries', data);
    return response.data.entry;
  }

  async updateTimeEntry(id: string, data: Partial<Omit<TimeEntry, 'id' | 'created_at' | 'bc_journal_id' | 'bc_batch_name' | 'bc_ledger_id' | 'bc_last_sync_at' | 'companyId'>>): Promise<TimeEntry> {
    const response = await this.client.patch(`/time-entries/${id}`, data);
    return response.data.entry;
  }

  async deleteTimeEntry(id: string): Promise<void> {
    await this.client.delete(`/time-entries/${id}`);
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

  async retrySyncEntry(entryId: string): Promise<SyncResponse> {
    const response = await this.client.post(`/sync/retry/${entryId}`);
    return response.data;
  }

  // 📮 POST JOURNAL (FUTURO - Hacer entries inmutables)
  async postJournalBatch(batchName: string): Promise<SyncResponse> {
    const response = await this.client.post('/sync/post-journal', { batchName });
    return response.data;
  }

  // 📊 SYNC STATUS
  async getSyncHistory(companyId: string, limit = 10): Promise<any[]> {
    const response = await this.client.get(`/sync/history?companyId=${companyId}&limit=${limit}`);
    return response.data.history || [];
  }
}

export const apiService = new ApiService();
export default apiService;