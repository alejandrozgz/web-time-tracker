// backend/src/app/api/[tenant]/sync/dashboard/route.ts
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

    // 📊 Query dashboard data
    const { data: dashboardData, error } = await supabaseAdmin
      .rpc('get_sync_dashboard', { p_company_id: companyId });

    if (error) throw error;

    const dashboard = dashboardData?.[0] || {
      local_entries: 0,
      draft_entries: 0,
      posted_entries: 0,
      error_entries: 0,
      modified_entries: 0,
      pending_hours: 0
    };

    return NextResponse.json(dashboard);

  } catch (error) {
    console.error('❌ Sync dashboard error:', error);
    return NextResponse.json({ 
      error: 'Failed to load sync dashboard',
      details: error.message 
    }, { status: 500 });
  }
}

// backend/src/app/api/[tenant]/sync/to-bc/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { BusinessCentralClient } from '@/lib/bc-api';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ tenant: string }> }
) {
  try {
    const { companyId } = await request.json();
    const { tenant: tenantSlug } = await params;

    console.log('🔄 ===== SYNC TO BC STARTED =====');
    console.log('🔍 Tenant:', tenantSlug);
    console.log('🔍 Company ID:', companyId);

    if (!companyId) {
      return NextResponse.json({ error: 'Company ID required' }, { status: 400 });
    }

    // Get tenant and company
    const [tenantResult, companyResult] = await Promise.all([
      supabaseAdmin.from('tenants').select('*').eq('slug', tenantSlug).single(),
      supabaseAdmin.from('companies').select('*').eq('id', companyId).single()
    ]);

    const { data: tenant, error: tenantError } = tenantResult;
    const { data: company, error: companyError } = companyResult;

    if (tenantError || !tenant) {
      throw new Error('Tenant not found');
    }
    if (companyError || !company) {
      throw new Error('Company not found');
    }

    // Check if BC sync is enabled
    if (!tenant.oauth_enabled) {
      return NextResponse.json({
        success: false,
        message: 'Business Central sync not enabled for this tenant'
      });
    }

    // 📊 Get pending entries
    const { data: pendingEntries, error: entriesError } = await supabaseAdmin
      .rpc('get_pending_sync_entries', { p_company_id: companyId });

    if (entriesError) throw entriesError;

    if (!pendingEntries || pendingEntries.length === 0) {
      return NextResponse.json({
        success: true,
        synced_entries: 0,
        failed_entries: 0,
        message: 'No entries to sync'
      });
    }

    console.log(`🔍 Found ${pendingEntries.length} entries to sync`);

    // 🚀 Initialize BC Client
    const bcClient = new BusinessCentralClient(tenant, company);
    
    // Create unique batch name
    const batchName = `WEBAPP_${Date.now()}`;
    let syncedCount = 0;
    let failedCount = 0;
    const errors: string[] = [];

    // 🔄 Process each entry
    for (const entry of pendingEntries) {
      try {
        console.log(`🔄 Syncing entry ${entry.id}: ${entry.description}`);

        // 📤 Create Job Journal Line in BC
        const bcJournalLine = await bcClient.createJobJournalLine({
          journalTemplateName: 'JOB',
          journalBatchName: batchName,
          lineNo: 0, // BC will auto-assign
          jobNo: entry.job_bc_id,
          jobTaskNo: entry.task_bc_id,
          type: 'Resource',
          no: entry.resource_no,
          postingDate: entry.date,
          quantity: parseFloat(entry.hours),
          description: entry.description,
          workTypeCode: 'NORMAL',
          unitCost: 0,
          unitPrice: 0
        });

        // ✅ Update local status
        await supabaseAdmin
          .from('time_entries')
          .update({
            bc_sync_status: 'draft',
            bc_journal_id: bcJournalLine.id,
            bc_batch_name: batchName,
            bc_last_sync_at: new Date().toISOString(),
            is_editable: true // Still editable as draft
          })
          .eq('id', entry.id);

        syncedCount++;
        console.log(`✅ Entry ${entry.id} synced successfully`);

      } catch (error) {
        console.error(`❌ Failed to sync entry ${entry.id}:`, error);
        
        // Mark as error
        await supabaseAdmin
          .from('time_entries')
          .update({
            bc_sync_status: 'error',
            bc_last_sync_at: new Date().toISOString()
          })
          .eq('id', entry.id);

        failedCount++;
        errors.push(`Entry ${entry.id}: ${error.message}`);
      }
    }

    // 📊 Create batch record
    if (syncedCount > 0) {
      await supabaseAdmin
        .from('bc_sync_batches')
        .insert({
          tenant_id: tenant.id,
          company_id: companyId,
          batch_name: batchName,
          status: 'draft',
          entries_count: syncedCount,
          total_hours: pendingEntries
            .filter(e => !errors.some(err => err.includes(e.id)))
            .reduce((sum, e) => sum + parseFloat(e.hours), 0)
        });
    }

    console.log('✅ ===== SYNC TO BC COMPLETED =====');
    console.log(`📊 Synced: ${syncedCount}, Failed: ${failedCount}`);

    return NextResponse.json({
      success: true,
      batch_name: syncedCount > 0 ? batchName : undefined,
      synced_entries: syncedCount,
      failed_entries: failedCount,
      errors: errors.length > 0 ? errors : undefined,
      message: `Successfully synced ${syncedCount} entries${failedCount > 0 ? `, ${failedCount} failed` : ''}`
    });

  } catch (error) {
    console.error('❌ Sync to BC error:', error);
    return NextResponse.json({ 
      success: false,
      synced_entries: 0,
      failed_entries: 0,
      message: `Sync failed: ${error.message}`,
      error: 'Failed to sync to Business Central'
    }, { status: 500 });
  }
}

// backend/src/app/api/[tenant]/sync/pending/route.ts
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

    const { data: entries, error } = await supabaseAdmin
      .rpc('get_pending_sync_entries', { p_company_id: companyId });

    if (error) throw error;

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