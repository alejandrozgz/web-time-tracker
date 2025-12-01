export interface User {
  id: string;
  resourceNo: string;
  displayName: string;
}

export interface Tenant {
  id: string;
  slug: string;
  name: string;
}

export interface Company {
  id: string;
  name: string;
  bc_company_id: string;
}

export interface Job {
  id: string;
  bc_job_id: string;
  name: string;
  description?: string;
}

export interface JobTask {
  id: string;
  job_id: string;
  bc_task_id: string;
  description: string;
}

// 🎯 ENUM PARA ESTADOS DE SYNC BC
export enum BCSyncStatus {
  NOT_SYNCED = 'not_synced',  // Solo en local, editable
  SYNCED = 'synced',          // En BC como Journal Line, editable
  ERROR = 'error'             // Error de sync
}

// 🎯 ENUM PARA APPROVAL STATUS
export enum ApprovalStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected'
}

// 📊 INTERFAZ ACTUALIZADA PARA TIME ENTRY - USANDO BC IDs DIRECTAMENTE
export interface TimeEntry {
  id: string;

  // 🔗 BC IDs DIRECTOS (no foreign keys)
  bc_job_id: string;         // Business Central Job ID
  bc_task_id: string;        // Business Central Task ID
  resource_no: string;       // Business Central Resource No

  // 📅 DATOS DE TIEMPO
  date: string;
  hours: number;
  description: string;
  start_time?: string;
  end_time?: string;

  // 🔄 CAMPOS BC SYNC
  bc_sync_status: string;     // Status: 'not_synced', 'synced', 'error' (or legacy: 'modified', 'pending', 'failed', 'posted')
  bc_journal_id?: string;     // ID del Journal Line en BC
  bc_batch_name?: string;     // Nombre del batch en BC
  bc_ledger_id?: string;      // ID del Ledger Entry tras POST

  // ✅ CAMPOS DE APROBACIÓN (desde BC)
  approval_status?: string;   // 'pending', 'approved', 'rejected'
  bc_comments?: string;       // Comentarios desde BC

  // ⏰ TIMESTAMPS
  created_at: string;
  last_modified_at: string;
  bc_last_sync_at?: string;

  // 🎛️ FLAGS
  is_editable: boolean;       // false si está posted

  // 📊 DATOS JOINED DEL BACKEND (para display) - OPCIONAL
  job_name?: string;          // Para mostrar nombre del job
  task_description?: string;  // Para mostrar descripción de la tarea
}

// 🎯 INTERFAZ ESPECÍFICA PARA CREAR TIME ENTRY
export interface CreateTimeEntryData {
  bc_job_id: string;
  bc_task_id: string;
  date: string;
  hours: number;
  description: string;
  start_time?: string;
  end_time?: string;
  resource_no?: string;
  companyId: string; // Para el backend, no forma parte de TimeEntry
}

// 📦 INTERFAZ PARA BATCH DE SYNC
export interface BCSyncBatch {
  id: string;
  batch_name: string;
  status: 'draft' | 'posting' | 'posted' | 'error';
  entries_count: number;
  total_hours: number;
  created_at: string;
  posted_at?: string;
  error_message?: string;
}

// 📊 RESPUESTA DE SYNC API
export interface SyncResponse {
  success: boolean;
  batch_name?: string;
  synced_entries: number;
  failed_entries: number;
  errors?: string[];
  message: string;
}

// 📈 DASHBOARD DE SYNC
export interface SyncDashboard {
  not_synced_entries: number;
  synced_entries: number;
  error_entries: number;
  pending_hours: number;
}

// 📋 SYNC LOG TYPES
export enum SyncLogLevel {
  INFO = 'info',
  WARNING = 'warning',
  ERROR = 'error',
  SUCCESS = 'success'
}

export enum SyncOperationType {
  SYNC_TO_BC = 'sync_to_bc',
  POST_BATCH = 'post_batch',
  FETCH_FROM_BC = 'fetch_from_bc',
  RETRY = 'retry'
}

export interface BCSyncLog {
  id: string;
  tenant_id: string;
  company_id: string;
  operation_type: SyncOperationType;
  batch_name?: string;
  batch_id?: string;
  time_entry_id?: string;
  log_level: SyncLogLevel;
  message: string;
  details?: Record<string, any>;
  entries_processed?: number;
  entries_succeeded?: number;
  entries_failed?: number;
  total_hours?: number;
  duration_ms?: number;
  user_id?: string;
  resource_no?: string;
  bc_journal_id?: string;
  bc_error_code?: string;
  bc_error_message?: string;
  created_at: string;
}

export interface SyncLogFilters {
  operation_type?: SyncOperationType;
  log_level?: SyncLogLevel;
  date_from?: string;
  date_to?: string;
  limit?: number;
  offset?: number;
}

export interface SyncStatistics {
  total_operations: number;
  successful_operations: number;
  failed_operations: number;
  total_entries_processed: number;
  total_entries_succeeded: number;
  total_entries_failed: number;
  total_hours: number;
  avg_duration_ms: number;
  last_sync_at?: string;
  errors_by_code: Record<string, number>;
}

export interface SyncActivity {
  hour_start: string;
  total_syncs: number;
  successful_syncs: number;
  failed_syncs: number;
  entries_synced: number;
  hours_synced: number;
}

export interface Assignment {
  jobs: Job[];
  tasks: JobTask[];
}

export interface LoginData {
  username: string;
  password: string;
  companyId: string;
}

export interface AuthResponse {
  token: string;
  user: User;
  tenant: Tenant;
  company: Company;
}

// ======================================
// ADMIN PORTAL TYPES
// ======================================

// Full Tenant interface for admin operations
export interface TenantFull {
  id: string;
  slug: string;
  name: string;
  bc_base_url: string;
  bc_environment: string;
  bc_tenant_id?: string;
  bc_client_id?: string;
  bc_client_secret?: string;
  oauth_enabled: boolean;
  settings?: Record<string, any>;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface CreateTenantData {
  slug: string;
  name: string;
  bc_base_url: string;
  bc_environment?: string;
  bc_tenant_id?: string;
  bc_client_id?: string;
  bc_client_secret?: string;
  oauth_enabled?: boolean;
  settings?: Record<string, any>;
}

export interface UpdateTenantData {
  name?: string;
  bc_base_url?: string;
  bc_environment?: string;
  bc_tenant_id?: string;
  bc_client_id?: string;
  bc_client_secret?: string;
  oauth_enabled?: boolean;
  settings?: Record<string, any>;
  is_active?: boolean;
}

// Resource (User) interface for admin
export interface ResourceFull {
  id: string;
  tenant_id: string;
  company_id: string;
  resource_no: string;
  display_name: string;
  web_username?: string;
  permissions?: Record<string, any>;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  // Joined data
  tenant_name?: string;
  company_name?: string;
}

export interface CreateResourceData {
  tenant_id: string;
  company_id: string;
  resource_no: string;
  display_name: string;
  web_username?: string;
  web_password?: string;
  permissions?: Record<string, any>;
}

export interface UpdateResourceData {
  display_name?: string;
  web_username?: string;
  web_password?: string;
  permissions?: Record<string, any>;
  is_active?: boolean;
}

// Company interface for admin
export interface CompanyFull {
  id: string;
  tenant_id: string;
  bc_company_id: string;
  name: string;
  bc_web_service_url?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  // Joined data
  tenant_name?: string;
  tenant_slug?: string;
}

export interface CreateCompanyData {
  tenant_id: string;
  bc_company_id: string;
  name: string;
  bc_web_service_url?: string;
}

export interface UpdateCompanyData {
  name?: string;
  bc_web_service_url?: string;
  is_active?: boolean;
}

// Time Entry for admin (with all relations)
export interface TimeEntryAdmin extends TimeEntry {
  tenant_id?: string;
  company_id?: string;
  tenant_name?: string;
  company_name?: string;
  resource_display_name?: string;
}

// Admin dashboard statistics
export interface AdminDashboardStats {
  total_tenants: number;
  active_tenants: number;
  total_companies: number;
  total_users: number;
  active_users: number;
  total_time_entries: number;
  total_hours_tracked: number;
  entries_by_status: {
    local: number;
    draft: number;
    posted: number;
    error: number;
    modified: number;
  };
  recent_syncs: number;
  failed_syncs: number;
}

// Filters for admin queries
export interface AdminTimeEntryFilters {
  tenant_id?: string;
  company_id?: string;
  resource_no?: string;
  bc_sync_status?: string;
  date_from?: string;
  date_to?: string;
  limit?: number;
  offset?: number;
}

export interface AdminResourceFilters {
  tenant_id?: string;
  company_id?: string;
  is_active?: boolean;
  search?: string;
  limit?: number;
  offset?: number;
}

export interface AdminCompanyFilters {
  tenant_id?: string;
  is_active?: boolean;
  search?: string;
  limit?: number;
  offset?: number;
}