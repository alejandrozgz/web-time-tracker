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
  LOCAL = 'local',           // Solo en local, editable
  MODIFIED = 'modified',     // Modificado tras sync, necesita re-sync
  DRAFT = 'draft',           // En BC como Journal Line, editable
  POSTING = 'posting',       // En proceso de registro
  POSTED = 'posted',         // Registrado en BC, INMUTABLE
  ERROR = 'error'            // Error de sync
}

// 📊 INTERFAZ EXTENDIDA PARA TIME ENTRY
export interface TimeEntry {
  id: string;
  job_id: string;
  task_id: string;
  date: string;
  hours: number;
  description: string;
  start_time?: string;
  end_time?: string;
  
  // 🔄 CAMPOS BC SYNC
  bc_sync_status: BCSyncStatus;
  bc_journal_id?: string;     // ID del Journal Line en BC
  bc_batch_name?: string;     // Nombre del batch en BC
  bc_ledger_id?: string;      // ID del Ledger Entry tras POST
  
  // ⏰ TIMESTAMPS
  created_at: string;
  last_modified_at: string;
  bc_last_sync_at?: string;
  
  // 🎛️ FLAGS
  is_editable: boolean;       // false si está posted
  
  // 📊 DATOS JOINED DEL BACKEND (para display)
  jobs?: Job;
  job_tasks?: JobTask;
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
  company_name: string;
  local_entries: number;
  draft_entries: number;
  posted_entries: number;
  error_entries: number;
  modified_entries: number;
  pending_hours: number;
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