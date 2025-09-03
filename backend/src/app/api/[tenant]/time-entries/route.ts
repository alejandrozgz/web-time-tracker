import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ tenant: string }> }
) {
  try {
    const { tenant: tenantSlug } = await params;
    const url = new URL(request.url);
    const from = url.searchParams.get('from');
    const to = url.searchParams.get('to');

    console.log('🎯 ===== TIME ENTRIES API CALLED =====');
    console.log('🔍 Tenant:', tenantSlug, 'From:', from, 'To:', to);

    // Get tenant from Supabase
    const { data: tenant, error: tenantError } = await supabaseAdmin
      .from('tenants')
      .select('*')
      .eq('slug', tenantSlug)
      .single();

    if (tenantError || !tenant) {
      console.error('❌ Tenant not found:', tenantError);
      return NextResponse.json({ error: 'Tenant not found' }, { status: 404 });
    }

    // For now, return empty array since we don't have time entries yet
    console.log('📂 Returning empty time entries array for now');
    console.log('🔚 ===== END TIME ENTRIES API =====');

    const response = NextResponse.json({
      entries: [],
      source: 'supabase_local'
    });

    // Set CORS headers
    response.headers.set('Access-Control-Allow-Origin', '*');
    response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    return response;

  } catch (error) {
    console.error('❌ Time entries fetch error:', error);
    const errorResponse = NextResponse.json({ 
      error: 'Failed to fetch time entries',
      details: error.message 
    }, { status: 500 });

    errorResponse.headers.set('Access-Control-Allow-Origin', '*');
    return errorResponse;
  }
}

export async function OPTIONS(request: NextRequest) {
  console.log('🔍 CORS preflight request for time-entries');
  const response = new NextResponse(null, { status: 204 });
  response.headers.set('Access-Control-Allow-Origin', '*');
  response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  return response;
}