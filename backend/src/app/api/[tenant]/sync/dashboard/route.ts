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

    if (!companyId) {
      return NextResponse.json({ error: 'Company ID required' }, { status: 400 });
    }

    console.log('📊 Getting sync dashboard for company:', companyId);

    // 📈 Get sync statistics directly from time_entries (simplified schema)
    const { data: stats, error } = await supabaseAdmin
      .from('time_entries')
      .select('bc_sync_status, hours')
      .eq('company_id', companyId);

    if (error) {
      console.error('❌ Dashboard query error:', error);
      throw error;
    }

    // 📊 Calculate dashboard metrics
    const dashboard = {
      company_id: companyId,
      local_entries: stats.filter(e => e.bc_sync_status === 'local').length,
      draft_entries: stats.filter(e => e.bc_sync_status === 'draft').length,
      posted_entries: stats.filter(e => e.bc_sync_status === 'posted').length,
      error_entries: stats.filter(e => e.bc_sync_status === 'error').length,
      modified_entries: stats.filter(e => e.bc_sync_status === 'modified').length,
      total_entries: stats.length,
      pending_hours: stats
        .filter(e => ['local', 'modified', 'error'].includes(e.bc_sync_status))
        .reduce((sum, e) => sum + parseFloat(e.hours || 0), 0),
      total_hours: stats.reduce((sum, e) => sum + parseFloat(e.hours || 0), 0)
    };

    console.log('✅ Dashboard stats:', dashboard);

    return NextResponse.json(dashboard);

  } catch (error) {
    console.error('❌ Sync dashboard error:', error);
    return NextResponse.json({ 
      error: 'Failed to load sync dashboard',
      details: error.message 
    }, { status: 500 });
  }
}