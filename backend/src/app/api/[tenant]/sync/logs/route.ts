import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ tenant: string }> }
) {
  try {
    const { tenant: tenantSlug } = await params;
    const { searchParams } = new URL(request.url);

    const companyId = searchParams.get('companyId');
    const operation_type = searchParams.get('operation_type');
    const log_level = searchParams.get('log_level');
    const date_from = searchParams.get('date_from');
    const date_to = searchParams.get('date_to');
    const limit = parseInt(searchParams.get('limit') || '100');
    const offset = parseInt(searchParams.get('offset') || '0');

    if (!companyId) {
      return NextResponse.json({ error: 'Company ID required' }, { status: 400 });
    }

    // Get tenant
    const { data: tenant, error: tenantError } = await supabaseAdmin
      .from('tenants')
      .select('*')
      .eq('slug', tenantSlug)
      .single();

    if (tenantError || !tenant) {
      return NextResponse.json({ error: 'Tenant not found' }, { status: 404 });
    }

    // Call the stored procedure to get sync logs
    const { data: logs, error: logsError } = await supabaseAdmin
      .rpc('get_sync_logs', {
        p_company_id: companyId,
        p_operation_type: operation_type || null,
        p_log_level: log_level || null,
        p_date_from: date_from ? new Date(date_from).toISOString() : null,
        p_date_to: date_to ? new Date(date_to).toISOString() : null,
        p_limit: limit,
        p_offset: offset
      });

    if (logsError) {
      console.error('Error fetching sync logs:', logsError);
      throw logsError;
    }

    return NextResponse.json({
      logs: logs || [],
      count: logs?.length || 0,
      limit,
      offset
    });

  } catch (error) {
    console.error('Error in sync logs route:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { error: 'Failed to fetch sync logs', details: errorMessage },
      { status: 500 }
    );
  }
}
