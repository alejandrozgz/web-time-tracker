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
    // URL correcta con tenant BC en la ruta
    this.baseUrl = `https://api.businesscentral.dynamics.com/v2.0/${tenant.bc_tenant_id}/${tenant.bc_environment}/api/timetracker/v1`;
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
      
      // URL completa con tenant en el path
      const response = await fetch(`${this.baseUrl}/companies(${this.companyId})/resourceAuth?$filter=webUsername eq '${username}'`, {
        headers
      });

      if (!response.ok) throw new Error('Authentication failed');

      const data = await response.json();
      if (!data.value || data.value.length === 0) {
        throw new Error('Invalid credentials');
      }

      const resource = data.value[0];
      
      return {
        resourceNo: resource.resourceNo,
        displayName: resource.name,