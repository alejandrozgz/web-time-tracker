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

export interface TimeEntry {
  id: string;
  job_id: string;
  task_id: string;
  date: string;
  hours: number;
  description: string;
  start_time?: string;
  end_time?: string;
  // Para datos joined del backend
  jobs?: Job;
  job_tasks?: JobTask;
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