import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ tenant: string }> }
) {
  try {
    const { tenant: tenantSlug } = await params;
    const url = new URL(request.url);
    const companyId = url.searchParams.get('companyId');

    console.log('🔍 ===== GET PENDING SYNC ENTRIES =====');
    console.log('🔍 Tenant:', tenantSlug);
    console.log('🔍 Company ID:', companyId);

    if (!companyId) {
      return NextResponse.json({ error: 'Company ID required' }, { status: 400 });
    }

    // 📊 Get pending entries using the SQL function
    const { data: entries, error } = await supabaseAdmin
      .rpc('get_pending_sync_entries', { p_company_id: companyId });

    if (error) {
      console.error('❌ Error getting pending entries:', error);
      throw error;
    }

    console.log(`📊 Found ${entries?.length || 0} pending entries`);

    return NextResponse.json({
      entries: entries || [],
      count: entries?.length || 0
    });

  } catch (error) {
    console.error('❌ Get pending entries error:', error);
    return NextResponse.json({ 
      error: 'Failed to get pending entries',
      details: error.message,
      entries: [],
      count: 0
    }, { status: 500 });
  }
}