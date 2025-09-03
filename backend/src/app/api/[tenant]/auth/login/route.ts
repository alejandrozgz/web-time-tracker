import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { BusinessCentralClient } from '@/lib/bc-api';

export async function POST(
  request: NextRequest,
  { params }: { params: { tenant: string } }
) {
  try {
    const { username, password, companyId } = await request.json();
    const tenantSlug = params.tenant;

    // Get tenant from Supabase
    const { data: tenant, error: tenantError } = await supabaseAdmin
      .from('tenants')
      .select('*')
      .eq('slug', tenantSlug)
      .single();

    if (tenantError || !tenant) {
      const errorResponse = NextResponse.json({ error: 'Tenant not found' }, { status: 404 });
      errorResponse.headers.set('Access-Control-Allow-Origin', '*');
      return errorResponse;
    }

    // Get company from Supabase
    const { data: company, error: companyError } = await supabaseAdmin
      .from('companies')
      .select('*')
      .eq('id', companyId)
      .eq('tenant_id', tenant.id)
      .single();

    if (companyError || !company) {
      const errorResponse = NextResponse.json({ error: 'Company not found' }, { status: 404 });
      errorResponse.headers.set('Access-Control-Allow-Origin', '*');
      return errorResponse;
    }

    // Demo mode - for development/testing
    if (username === 'demo' && password === '123') {
      const token = Buffer.from(JSON.stringify({
        tenantId: tenant.id,
        companyId: company.id,
        resourceNo: 'DEMO001',
        displayName: 'Demo User',
        webUsername: 'demo',
        exp: Date.now() + (24 * 60 * 60 * 1000) // 24 hours
      })).toString('base64');

      const response = NextResponse.json({
        token,
        user: {
          id: 'DEMO001',
          resourceNo: 'DEMO001',
          displayName: 'Demo User'
        },
        tenant: {
          id: tenant.id,
          slug: tenant.slug,
          name: tenant.name
        },
        company: {
          id: company.id,
          name: company.name
        }
      });

      response.headers.set('Access-Control-Allow-Origin', '*');
      return response;
    }

    // Production mode with OAuth 2.0 (if enabled for this tenant)
    if (tenant.oauth_enabled && tenant.bc_client_id && tenant.bc_client_secret && tenant.bc_tenant_id) {
      try {
        const bcClient = new BusinessCentralClient(tenant, company);

        // Validate resource exists and is active
        const bcResource = await bcClient.validateResourceCredentials(username, '');

        if (!bcResource) {
          const errorResponse = NextResponse.json({ error: 'Invalid credentials or user not found' }, { status: 401 });
          errorResponse.headers.set('Access-Control-Allow-Origin', '*');
          return errorResponse;
        }

        // Create JWT token with BC resource info
        const token = Buffer.from(JSON.stringify({
          tenantId: tenant.id,
          companyId: company.id,
          resourceNo: bcResource.resourceNo,
          displayName: bcResource.displayName,
          webUsername: bcResource.webUsername,
          exp: Date.now() + (24 * 60 * 60 * 1000) // 24 hours
        })).toString('base64');

        const response = NextResponse.json({
          token,
          user: {
            id: bcResource.resourceNo,
            resourceNo: bcResource.resourceNo,
            displayName: bcResource.displayName
          },
          tenant: {
            id: tenant.id,
            slug: tenant.slug,
            name: tenant.name
          },
          company: {
            id: company.id,
            name: company.name
          }
        });

        response.headers.set('Access-Control-Allow-Origin', '*');
        return response;

      } catch (bcError) {
        console.error(`Business Central OAuth error for tenant ${tenant.slug}:`, bcError);
        
        // Fallback to demo mode if BC is unavailable
        const token = Buffer.from(JSON.stringify({
          tenantId: tenant.id,
          companyId: company.id,
          resourceNo: username.toUpperCase(),
          displayName: `${username} (Fallback)`,
          webUsername: username,
          exp: Date.now() + (24 * 60 * 60 * 1000)
        })).toString('base64');

        const response = NextResponse.json({
          token,
          user: {
            id: username.toUpperCase(),
            resourceNo: username.toUpperCase(),
            displayName: `${username} (Fallback)`
          },
          tenant: {
            id: tenant.id,
            slug: tenant.slug,
            name: tenant.name
          },
          company: {
            id: company.id,
            name: company.name
          }
        });

        response.headers.set('Access-Control-Allow-Origin', '*');
        return response;
      }
    }

    // If OAuth not enabled for tenant, show configuration message
    const errorResponse = NextResponse.json({ 
      error: `OAuth not configured for tenant ${tenant.slug}. Contact administrator.` 
    }, { status: 503 });
    errorResponse.headers.set('Access-Control-Allow-Origin', '*');
    return errorResponse;

  } catch (error) {
    console.error('Login error:', error);
    const errorResponse = NextResponse.json(
      { error: 'Authentication failed' },
      { status: 500 }
    );
    errorResponse.headers.set('Access-Control-Allow-Origin', '*');
    return errorResponse;
  }
}