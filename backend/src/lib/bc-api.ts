interface BCTokenResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
}

export class BusinessCentralClient {
  private baseUrl: string;
  private companyId: string;
  private clientId?: string;
  private clientSecret?: string;
  private azureTenantId?: string;
  private accessToken?: string;
  private tokenExpiry?: number;

  constructor(tenant: any, company: any) {
    // ✅ URL CORREGIDA con ruta completa
    this.baseUrl = `https://api.businesscentral.dynamics.com/v2.0/${tenant.bc_tenant_id}/${tenant.bc_environment}/api/timetracker/atp/v1.0`;
    this.companyId = company.bc_company_id;
    
    // OAuth config from tenant
    this.clientId = tenant.bc_client_id;
    this.clientSecret = tenant.bc_client_secret;
    this.azureTenantId = tenant.bc_tenant_id;
  }

  private async getAccessToken(): Promise<string> {
    if (!this.clientId || !this.clientSecret || !this.azureTenantId) {
      throw new Error('OAuth not configured for this tenant');
    }

    // Check if current token is still valid
    if (this.accessToken && this.tokenExpiry && Date.now() < this.tokenExpiry) {
      return this.accessToken;
    }

    // Get new token using client credentials flow
    const tokenUrl = `https://login.microsoftonline.com/${this.azureTenantId}/oauth2/v2.0/token`;
    
    const params = new URLSearchParams({
      grant_type: 'client_credentials',
      client_id: this.clientId,
      client_secret: this.clientSecret,
      scope: `https://api.businesscentral.dynamics.com/.default`
    });

    const response = await fetch(tokenUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: params
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Failed to get OAuth token: ${error}`);
    }

    const tokenData: BCTokenResponse = await response.json();
    
    this.accessToken = tokenData.access_token;
    this.tokenExpiry = Date.now() + (tokenData.expires_in * 1000) - 60000; // 1 minute buffer
    
    return this.accessToken;
  }

  private async getHeaders(): Promise<Record<string, string>> {
    const token = await this.getAccessToken();
    
    return {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'Authorization': `Bearer ${token}`
    };
  }

  async validateResourceCredentials(username: string, password: string) {
    try {
      const headers = await this.getHeaders();
      
      // ✅ URL corregida con la ruta completa
      const url = `${this.baseUrl}/companies(${this.companyId})/resourceAuth?$filter=webUsername eq '${username}'`;
      
      console.log('🔍 BC Auth URL:', url); // Para debug
      
      const response = await fetch(url, {
        headers
      });

      console.log('🔍 BC Auth Response Status:', response.status); // Para debug
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('🔍 BC Auth Error Response:', errorText); // Para debug
        throw new Error(`BC Authentication failed: ${response.status} - ${errorText}`);
      }

      const data = await response.json();
      console.log('🔍 BC Auth Data:', data); // Para debug
      
      if (!data.value || data.value.length === 0) {
        throw new Error('Invalid credentials - user not found');
      }

      const resource = data.value[0];
      
      return {
        resourceNo: resource.resourceNo,
        displayName: resource.name || resource.displayName,
        webUsername: resource.webUsername,
        isActive: resource.blocked !== true
      };
    } catch (error) {
      console.error('BC Auth error:', error);
      throw error; // ✅ Re-throw para que no haga fallback
    }
  }

  async getJobs(): Promise<any[]> {
    try {
      const headers = await this.getHeaders();
      
      const response = await fetch(`${this.baseUrl}/companies(${this.companyId})/jobs`, {
        headers
      });

      if (!response.ok) throw new Error('Failed to fetch jobs');

      const data = await response.json();
      return data.value || [];
    } catch (error) {
      console.error('BC Jobs error:', error);
      return [];
    }
  }

  async getJobTasks(jobId: string): Promise<any[]> {
    try {
      const headers = await this.getHeaders();
      
      const response = await fetch(`${this.baseUrl}/companies(${this.companyId})/jobTasks?$filter=jobNo eq '${jobId}'`, {
        headers
      });

      if (!response.ok) throw new Error('Failed to fetch job tasks');

      const data = await response.json();
      return data.value || [];
    } catch (error) {
      console.error('BC Job Tasks error:', error);
      return [];
    }
  }

  async createTimeEntry(timeEntry: any): Promise<any> {
    try {
      const headers = await this.getHeaders();
      
      const response = await fetch(`${this.baseUrl}/companies(${this.companyId})/timeEntries`, {
        method: 'POST',
        headers,
        body: JSON.stringify(timeEntry)
      });

      if (!response.ok) throw new Error('Failed to create time entry');

      return await response.json();
    } catch (error) {
      console.error('BC Create Time Entry error:', error);
      throw error;
    }
  }

  async getTimeEntries(resourceNo?: string, dateFrom?: string, dateTo?: string): Promise<any[]> {
    try {
      const headers = await this.getHeaders();
      
      let url = `${this.baseUrl}/companies(${this.companyId})/timeEntries`;
      
      const filters = [];
      if (resourceNo) filters.push(`resourceNo eq '${resourceNo}'`);
      if (dateFrom) filters.push(`date ge ${dateFrom}`);
      if (dateTo) filters.push(`date le ${dateTo}`);
      
      if (filters.length > 0) {
        url += `?$filter=${filters.join(' and ')}`;
      }
      
      const response = await fetch(url, { headers });

      if (!response.ok) throw new Error('Failed to fetch time entries');

      const data = await response.json();
      return data.value || [];
    } catch (error) {
      console.error('BC Time Entries error:', error);
      return [];
    }
  }
}