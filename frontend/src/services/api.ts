import axios from 'axios';
import { LoginData, AuthResponse, Job, JobTask, TimeEntry } from '../types';

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

  async login(data: LoginData): Promise<AuthResponse> {
    const response = await this.client.post('/auth/login', data);
    return response.data;
  }

  async getCompanies() {
    const response = await this.client.get('/companies');
    return response.data.companies;
  }

  async getJobs(companyId: string): Promise<{ jobs: Job[]; tasks: JobTask[] }> {
    const response = await this.client.get(`/jobs?companyId=${companyId}`);
    return response.data;
  }

  async getTimeEntries(from?: string, to?: string): Promise<TimeEntry[]> {
    const params = new URLSearchParams();
    if (from) params.append('from', from);
    if (to) params.append('to', to);
    
    const response = await this.client.get(`/time-entries?${params}`);
    return response.data.entries || [];
  }

  async createTimeEntry(data: Partial<TimeEntry>): Promise<TimeEntry> {
    const response = await this.client.post('/time-entries', data);
    return response.data.entry;
  }

  async updateTimeEntry(id: string, data: Partial<TimeEntry>): Promise<TimeEntry> {
    const response = await this.client.patch(`/time-entries/${id}`, data);
    return response.data.entry;
  }

  async deleteTimeEntry(id: string): Promise<void> {
    await this.client.delete(`/time-entries/${id}`);
  }
}

export const apiService = new ApiService();
export default apiService;