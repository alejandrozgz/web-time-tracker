import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ tenant: string }> }
) {
  try {
    const url = new URL(request.url);
    const companyId = url.searchParams.get('companyId');

    if (!companyId) {
      return NextResponse.json({ error: 'Company ID required' }, { status: 400 });
    }

    console.log('📋 Getting pending sync entries for company:', companyId);

    // 📋 Get pending sync entries (simplified schema)
    const { data: entries, error } = await supabaseAdmin
      .from('time_entries')
      .select(`
        id,
        bc_job_id,
        bc_task_id,
        job_name,
        task_description,
        date,
        hours,
        description,
        bc_sync_status,
        created_at,
        last_modified_at,
        bc_last_sync_at
      `)
      .eq('company_id', companyId)
      .in('bc_sync_status', ['local', 'modified', 'error'])
      .eq('is_editable', true)
      .order('date', { ascending: false })
      .order('created_at', { ascending: false });

    if (error) {
      console.error('❌ Pending entries query error:', error);
      throw error;
    }

    console.log(`✅ Found ${entries?.length || 0} pending entries`);

    return NextResponse.json({
      entries: entries || []
    });

  } catch (error) {
    console.error('❌ Get pending entries error:', error);
    return NextResponse.json({ 
      error: 'Failed to get pending entries',
      details: error.message 
    }, { status: 500 });
  }
}