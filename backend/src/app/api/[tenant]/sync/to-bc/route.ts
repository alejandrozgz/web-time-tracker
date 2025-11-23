import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { BusinessCentralClient } from '@/lib/bc-api';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ tenant: string }> }
) {
  const startTime = Date.now();

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
      const duration = Date.now() - startTime;

      // Log the failed attempt
      await supabaseAdmin.from('bc_sync_logs').insert({
        tenant_id: tenant.id,
        company_id: companyId,
        operation_type: 'sync_to_bc',
        log_level: 'warning',
        message: 'Business Central sync not enabled for this tenant',
        duration_ms: duration,
        entries_processed: 0,
        entries_succeeded: 0,
        entries_failed: 0
      });

      return NextResponse.json({
        success: false,
        synced_entries: 0,
        failed_entries: 0,
        message: 'Business Central sync not enabled for this tenant'
      });
    }

    // 📊 Get pending entries
    const { data: pendingEntries, error: entriesError } = await supabaseAdmin
      .rpc('get_pending_sync_entries', { p_company_id: companyId });

    if (entriesError) throw entriesError;

    if (!pendingEntries || pendingEntries.length === 0) {
      const duration = Date.now() - startTime;

      // Log no entries to sync
      await supabaseAdmin.from('bc_sync_logs').insert({
        tenant_id: tenant.id,
        company_id: companyId,
        operation_type: 'sync_to_bc',
        log_level: 'info',
        message: 'No entries to sync',
        duration_ms: duration,
        entries_processed: 0,
        entries_succeeded: 0,
        entries_failed: 0
      });

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
    const batchName = 'TT-WEB';
    let syncedCount = 0;
    let failedCount = 0;
    const errors: string[] = [];
    const errorDetails: any[] = [];

    // 🔄 Process each entry
    for (const entry of pendingEntries) {
      try {
        console.log(`🔄 Syncing entry ${entry.id}: ${entry.description}`);

        // 📤 Create Job Journal Line in BC
        const bcJournalLine = await bcClient.createJobJournalLine({
		  journalTemplateName: 'PROJECT',
		  journalBatchName: batchName,
		  lineNo: 0,
		  jobNo: entry.job_bc_id,
		  jobTaskNo: entry.task_bc_id,
		  type: 'Resource',
		  no: entry.resource_no,
		  postingDate: entry.date,
		  quantity: parseFloat(entry.hours),
		  description: entry.description
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

        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        const errorCode = (error as any)?.code || (error as any)?.error?.code;

        // Mark as error
        await supabaseAdmin
          .from('time_entries')
          .update({
            bc_sync_status: 'error',
            bc_last_sync_at: new Date().toISOString()
          })
          .eq('id', entry.id);

        // Log individual entry error
        await supabaseAdmin.from('bc_sync_logs').insert({
          tenant_id: tenant.id,
          company_id: companyId,
          operation_type: 'sync_to_bc',
          batch_name: batchName,
          time_entry_id: entry.id,
          log_level: 'error',
          message: `Failed to sync entry: ${entry.description}`,
          bc_error_code: errorCode,
          bc_error_message: errorMessage,
          resource_no: entry.resource_no,
          details: {
            entry_id: entry.id,
            job_bc_id: entry.job_bc_id,
            task_bc_id: entry.task_bc_id,
            hours: entry.hours,
            date: entry.date,
            error: errorMessage,
            stack: error instanceof Error ? error.stack : undefined
          }
        });

        failedCount++;
        errors.push(`Entry ${entry.id}: ${errorMessage}`);
        errorDetails.push({
          entry_id: entry.id,
          error: errorMessage,
          code: errorCode
        });
      }
    }

    // Calculate total hours
    const totalHours = pendingEntries
      .filter((e: any) => !errors.some(err => err.includes(e.id)))
      .reduce((sum: number, e: any) => sum + parseFloat(e.hours), 0);

    const duration = Date.now() - startTime;

    // 📊 Create batch record
    let batchId: string | undefined;
    if (syncedCount > 0) {
      const { data: batchData } = await supabaseAdmin
        .from('bc_sync_batches')
        .insert({
          tenant_id: tenant.id,
          company_id: companyId,
          batch_name: batchName,
          status: 'draft',
          entries_count: syncedCount,
          total_hours: totalHours
        })
        .select('id')
        .single();

      batchId = batchData?.id;
    }

    // Log the overall sync operation
    await supabaseAdmin.from('bc_sync_logs').insert({
      tenant_id: tenant.id,
      company_id: companyId,
      operation_type: 'sync_to_bc',
      batch_name: batchName,
      batch_id: batchId,
      log_level: failedCount > 0 ? (syncedCount > 0 ? 'warning' : 'error') : 'success',
      message: `Sync completed: ${syncedCount} succeeded, ${failedCount} failed`,
      entries_processed: pendingEntries.length,
      entries_succeeded: syncedCount,
      entries_failed: failedCount,
      total_hours: totalHours,
      duration_ms: duration,
      details: {
        batch_name: batchName,
        errors: errorDetails.length > 0 ? errorDetails : undefined
      }
    });

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
    console.error('❌ Sync error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    const duration = Date.now() - startTime;

    // Try to log the error (best effort)
    try {
      const { companyId } = await request.json();
      const { tenant: tenantSlug } = await params;

      const { data: tenant } = await supabaseAdmin
        .from('tenants')
        .select('id')
        .eq('slug', tenantSlug)
        .single();

      if (tenant) {
        await supabaseAdmin.from('bc_sync_logs').insert({
          tenant_id: tenant.id,
          company_id: companyId,
          operation_type: 'sync_to_bc',
          log_level: 'error',
          message: 'Sync operation failed with critical error',
          bc_error_message: errorMessage,
          duration_ms: duration,
          entries_processed: 0,
          entries_succeeded: 0,
          entries_failed: 0,
          details: {
            error: errorMessage,
            stack: error instanceof Error ? error.stack : undefined
          }
        });
      }
    } catch (logError) {
      console.error('Failed to log error:', logError);
    }

    return NextResponse.json({
      success: false,
      synced_entries: 0,
      failed_entries: 0,
      error: 'Sync failed',
      details: errorMessage
    }, { status: 500 });
  }
}