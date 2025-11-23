import axios, { AxiosInstance } from 'axios';
import {
  TenantFull,
  CreateTenantData,
  UpdateTenantData,
  CompanyFull,
  CreateCompanyData,
  UpdateCompanyData,
  TimeEntryAdmin,
  AdminDashboardStats,
  AdminTimeEntryFilters,
  AdminCompanyFilters
} from '../types';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3000/api';

class AdminApiService {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: `${API_BASE_URL}/admin`,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }

  setAuthToken(token: string): void {
    if (token) {
      this.client.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    } else {
      delete this.client.defaults.headers.common['Authorization'];
    }
  }

  // ========== TENANTS ==========

  async getTenants(filters?: { is_active?: boolean; search?: string; limit?: number; offset?: number }) {
    const params = new URLSearchParams();
    if (filters?.is_active !== undefined) params.append('is_active', filters.is_active.toString());
    if (filters?.search) params.append('search', filters.search);
    if (filters?.limit) params.append('limit', filters.limit.toString());
    if (filters?.offset) params.append('offset', filters.offset.toString());

    const response = await this.client.get(`/tenants?${params}`);
    return response.data as { tenants: TenantFull[]; count: number; limit: number; offset: number };
  }

  async getTenant(id: string) {
    const response = await this.client.get(`/tenants/${id}`);
    return response.data.tenant as TenantFull;
  }

  async createTenant(data: CreateTenantData) {
    const response = await this.client.post('/tenants', data);
    return response.data.tenant as TenantFull;
  }

  async updateTenant(id: string, data: UpdateTenantData) {
    const response = await this.client.patch(`/tenants/${id}`, data);
    return response.data.tenant as TenantFull;
  }

  async deleteTenant(id: string) {
    await this.client.delete(`/tenants/${id}`);
  }

  // ========== COMPANIES ==========

  async getCompanies(filters?: AdminCompanyFilters) {
    const params = new URLSearchParams();
    if (filters?.tenant_id) params.append('tenant_id', filters.tenant_id);
    if (filters?.is_active !== undefined) params.append('is_active', filters.is_active.toString());
    if (filters?.search) params.append('search', filters.search);
    if (filters?.limit) params.append('limit', filters.limit.toString());
    if (filters?.offset) params.append('offset', filters.offset.toString());

    const response = await this.client.get(`/companies?${params}`);
    return response.data as { companies: CompanyFull[]; count: number; limit: number; offset: number };
  }

  async createCompany(data: CreateCompanyData) {
    const response = await this.client.post('/companies', data);
    return response.data.company as CompanyFull;
  }

  // ========== TIME ENTRIES ==========

  async getTimeEntries(filters?: AdminTimeEntryFilters) {
    const params = new URLSearchParams();
    if (filters?.tenant_id) params.append('tenant_id', filters.tenant_id);
    if (filters?.company_id) params.append('company_id', filters.company_id);
    if (filters?.resource_no) params.append('resource_no', filters.resource_no);
    if (filters?.bc_sync_status) params.append('bc_sync_status', filters.bc_sync_status);
    if (filters?.date_from) params.append('date_from', filters.date_from);
    if (filters?.date_to) params.append('date_to', filters.date_to);
    if (filters?.limit) params.append('limit', filters.limit.toString());
    if (filters?.offset) params.append('offset', filters.offset.toString());

    const response = await this.client.get(`/time-entries?${params}`);
    return response.data as { entries: TimeEntryAdmin[]; count: number; limit: number; offset: number };
  }

  // ========== DASHBOARD ==========

  async getDashboardStats() {
    const response = await this.client.get('/dashboard');
    return response.data as AdminDashboardStats;
  }
}

export const adminApiService = new AdminApiService();
export default adminApiService;
