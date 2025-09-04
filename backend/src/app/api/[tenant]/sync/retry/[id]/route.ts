import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { BusinessCentralClient } from '@/lib/bc-api';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ tenant: string; id: string }> }
) {
  try {
    const { tenant: tenantSlug, id: entryId } = await params;

    console.log('🔄 ===== RETRY SYNC ENTRY =====');
    console.log('🔍 Tenant:', tenantSlug);
    console.log('🔍 Entry ID:', entryId);

    if (!entryId) {
      return NextResponse.json({ error: 'Entry ID required' }, { status: 400 });
    }

    // 🔍 Get the specific entry that failed
    const { data: entry, error: entryError } = await supabaseAdmin
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
        user_id,
        company_id,
        is_editable
      `)
      .eq('id', entryId)
      .single();

    if (entryError || !entry) {
      console.error('❌ Entry not found:', entryError);
      return NextResponse.json({ error: 'Time entry not found' }, { status: 404 });
    }

    // ✅ Verify entry can be retried
    if (!entry.is_editable) {
      return NextResponse.json({ 
        error: 'Entry cannot be retried: already posted in Business Central' 
      }, { status: 400 });
    }

    if (!['error', 'local', 'modified'].includes(entry.bc_sync_status)) {
      return NextResponse.json({ 
        error: `Entry cannot be retried: current status is '${entry.bc_sync_status}'` 
      }, { status: 400 });
    }

    // 🔍 Get tenant and company info
    const [tenantResult, companyResult] = await Promise.all([
      supabaseAdmin.from('tenants').select('*').eq('slug', tenantSlug).single(),
      supabaseAdmin.from('companies').select('*').eq('id', entry.company_id).single()
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
        message: 'Business Central sync not enabled for this tenant'
      });
    }

    console.log(`🔄 Retrying sync for entry: ${entry.description}`);
    console.log(`📊 Job: ${entry.bc_job_id} | Task: ${entry.bc_task_id} | Hours: ${entry.hours}`);

    try {
      // 🚀 Initialize BC Client
      const bcClient = new BusinessCentralClient(tenant, company);
      
      // 🎯 Create unique batch name for retry
      const batchName = `RETRY_${Date.now()}`;

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

      // ✅ Update entry status to 'draft' (successfully synced)
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
        .eq('id', entryId);

      if (updateError) {
        console.error(`❌ Failed to update entry status:`, updateError);
        throw updateError;
      }

      console.log(`✅ Entry ${entryId} retry successful`);
      console.log('🔚 ===== END RETRY SYNC =====');

      return NextResponse.json({
        success: true,
        synced_entries: 1,
        failed_entries: 0,
        batch_name: batchName,
        message: 'Entry retried successfully and synced to Business Central'
      });

    } catch (syncError) {
      console.error(`❌ Retry sync failed:`, syncError);
      
      // 📝 Keep entry as error but update timestamp
      await supabaseAdmin
        .from('time_entries')
        .update({
          bc_sync_status: 'error',
          bc_last_sync_at: new Date().toISOString(),
          last_modified_at: new Date().toISOString()
        })
        .eq('id', entryId);

      return NextResponse.json({
        success: false,
        synced_entries: 0,
        failed_entries: 1,
        message: `Retry failed: ${syncError.message}`,
        error: syncError.message
      }, { status: 500 });
    }

  } catch (error) {
    console.error('❌ Retry sync error:', error);
    return NextResponse.json({ 
      success: false,
      synced_entries: 0,
      failed_entries: 1,
      message: `Retry failed: ${error.message}`,
      error: 'Failed to retry sync to Business Central'
    }, { status: 500 });
  }
}