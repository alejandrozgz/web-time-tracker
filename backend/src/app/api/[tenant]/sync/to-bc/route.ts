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

    // 🔍 Get tenant and company
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

    // 🔧 Check if BC sync is enabled
    if (!tenant.oauth_enabled) {
      return NextResponse.json({
        success: false,
        synced_entries: 0,
        failed_entries: 0,
        message: 'Business Central sync not enabled for this tenant'
      });
    }

    // 📊 Get pending entries (using simplified schema with BC data inline)
    const { data: pendingEntries, error: entriesError } = await supabaseAdmin
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
        resource_no,
        bc_sync_status,
        user_id
      `)
      .eq('company_id', companyId)
      .in('bc_sync_status', ['local', 'modified', 'error'])
      .eq('is_editable', true)
      .order('date')
      .order('created_at');

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
    
    // 🎯 Create unique batch name
    const batchName = `WEBAPP_${Date.now()}`;
    let syncedCount = 0;
    let failedCount = 0;
    const errors: string[] = [];

    // 🔄 Process each entry
    for (const entry of pendingEntries) {
      try {
        console.log(`🔄 Syncing entry ${entry.id}: ${entry.description}`);
        console.log(`📊 Job: ${entry.bc_job_id} | Task: ${entry.bc_task_id} | Hours: ${entry.hours}`);

        // 📤 Create Job Journal Line in BC
        const bcJournalLine = await bcClient.createJobJournalLine({
          journalTemplateName: 'JOB',
          journalBatchName: batchName,
          lineNo: 0, // BC will auto-assign
          jobNo: entry.bc_job_id,
          jobTaskNo: entry.bc_task_id,
          type: 'Resource',
          no: entry.resource_no,
          postingDate: entry.date,
          quantity: parseFloat(entry.hours),
          description: entry.description,
          workTypeCode: 'NORMAL',
          unitCost: 0,
          unitPrice: 0
        });

        console.log(`✅ BC Journal Line created:`, bcJournalLine.id || bcJournalLine.systemId);

        // ✅ Update local entry status to 'draft'
        const { error: updateError } = await supabaseAdmin
          .from('time_entries')
          .update({
            bc_sync_status: 'draft',
            bc_journal_id: bcJournalLine.id || bcJournalLine.systemId,
            bc_batch_name: batchName,
            bc_last_sync_at: new Date().toISOString(),
            last_modified_at: new Date().toISOString(),
            is_editable: true // Still editable as draft in BC
          })
          .eq('id', entry.id);

        if (updateError) {
          console.error(`❌ Failed to update entry ${entry.id}:`, updateError);
          failedCount++;
          errors.push(`Entry ${entry.id}: ${updateError.message}`);
        } else {
          syncedCount++;
          console.log(`✅ Entry ${entry.id} synced successfully`);
        }

      } catch (syncError) {
        console.error(`❌ Failed to sync entry ${entry.id}:`, syncError);
        
        // 📝 Mark entry as error
        await supabaseAdmin
          .from('time_entries')
          .update({
            bc_sync_status: 'error',
            bc_last_sync_at: new Date().toISOString(),
            last_modified_at: new Date().toISOString()
          })
          .eq('id', entry.id);

        failedCount++;
        errors.push(`Entry ${entry.id}: ${syncError.message}`);
      }
    }

    console.log(`🔚 Sync completed: ${syncedCount} success, ${failedCount} failed`);
    console.log('🔚 ===== END SYNC TO BC =====');

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