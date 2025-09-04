import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

// GET - Obtener time entries
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ tenant: string }> }
) {
  try {
    const url = new URL(request.url);
    const from = url.searchParams.get('from');
    const to = url.searchParams.get('to');

    let query = supabaseAdmin
      .from('time_entries')
      .select(`
        id,
        job_id,
        task_id,
        date,
        hours,
        description,
        start_time,
        end_time,
        bc_sync_status,
        bc_journal_id,
        bc_batch_name,
        bc_ledger_id,
        last_modified_at,
        bc_last_sync_at,
        is_editable,
        created_at,
        jobs:job_id(id, bc_job_id, name, description),
        job_tasks:task_id(id, bc_task_id, description)
      `)
      .order('date', { ascending: false })
      .order('created_at', { ascending: false });

    if (from) {
      query = query.gte('date', from);
    }
    if (to) {
      query = query.lte('date', to);
    }

    const { data: entries, error } = await query;

    if (error) throw error;

    return NextResponse.json({
      entries: entries || []
    });

  } catch (error) {
    console.error('❌ Get time entries error:', error);
    return NextResponse.json({ 
      error: 'Failed to get time entries',
      details: error.message 
    }, { status: 500 });
  }
}

// POST - Crear time entry
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ tenant: string }> }
) {
  try {
    const timeEntryData = await request.json();
    const { tenant: tenantSlug } = await params;

    console.log('🔍 Creating time entry:', timeEntryData);

    // Validaciones básicas
    if (!timeEntryData.job_id || !timeEntryData.task_id) {
      return NextResponse.json({ error: 'job_id and task_id are required' }, { status: 400 });
    }

    if (!timeEntryData.description || !timeEntryData.date || !timeEntryData.hours) {
      return NextResponse.json({ error: 'description, date and hours are required' }, { status: 400 });
    }

    // Get current user from JWT token
    const authHeader = request.headers.get('authorization');
    let currentResourceId = null;
    
    if (authHeader && authHeader.startsWith('Bearer ')) {
      try {
        const token = authHeader.substring(7);
        const decodedToken = JSON.parse(Buffer.from(token, 'base64').toString());
        
        // Get resource ID from resource number
        const { data: resource } = await supabaseAdmin
          .from('resources')
          .select('id')
          .eq('resource_no', decodedToken.resourceNo)
          .single();
        
        currentResourceId = resource?.id;
      } catch (e) {
        console.log('Could not decode token or find resource');
      }
    }

    // 📊 Preparar datos para insertar
    const insertData = {
      ...timeEntryData,
      resource_id: currentResourceId,
      // 🔄 Campos BC Sync (default values)
      bc_sync_status: 'local',
      bc_journal_id: null,
      bc_batch_name: null,
      bc_ledger_id: null,
      last_modified_at: new Date().toISOString(),
      bc_last_sync_at: null,
      is_editable: true
    };

    // 🗄️ Insertar en Supabase
    const { data: newEntry, error } = await supabaseAdmin
      .from('time_entries')
      .insert(insertData)
      .select(`
        id,
        job_id,
        task_id,
        date,
        hours,
        description,
        start_time,
        end_time,
        bc_sync_status,
        bc_journal_id,
        bc_batch_name,
        bc_ledger_id,
        last_modified_at,
        bc_last_sync_at,
        is_editable,
        created_at,
        jobs:job_id(id, bc_job_id, name, description),
        job_tasks:task_id(id, bc_task_id, description)
      `)
      .single();

    if (error) throw error;

    console.log('✅ Time entry created:', newEntry.id);

    return NextResponse.json({
      entry: newEntry
    });

  } catch (error) {
    console.error('❌ Create time entry error:', error);
    return NextResponse.json({ 
      error: 'Failed to create time entry',
      details: error.message 
    }, { status: 500 });
  }
}

// PATCH - Actualizar time entry
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ tenant: string }> }
) {
  try {
    const url = new URL(request.url);
    const entryId = url.pathname.split('/').pop(); // Obtener ID de la URL
    const updateData = await request.json();

    if (!entryId) {
      return NextResponse.json({ error: 'Entry ID required' }, { status: 400 });
    }

    // 🔍 Verificar si la entry es editable
    const { data: existingEntry, error: fetchError } = await supabaseAdmin
      .from('time_entries')
      .select('id, bc_sync_status, is_editable')
      .eq('id', entryId)
      .single();

    if (fetchError || !existingEntry) {
      return NextResponse.json({ error: 'Time entry not found' }, { status: 404 });
    }

    // ❌ No permitir edición si está posted
    if (!existingEntry.is_editable || existingEntry.bc_sync_status === 'posted') {
      return NextResponse.json({ 
        error: 'Cannot modify entry: already posted in Business Central' 
      }, { status: 400 });
    }

    // 📝 Actualizar entry
    const { data: updatedEntry, error } = await supabaseAdmin
      .from('time_entries')
      .update({
        ...updateData,
        last_modified_at: new Date().toISOString(),
        // Si ya estaba sincronizada, marcar como modificada
        ...(existingEntry.bc_sync_status === 'draft' && { bc_sync_status: 'modified' })
      })
      .eq('id', entryId)
      .select(`
        id,
        job_id,
        task_id,
        date,
        hours,
        description,
        start_time,
        end_time,
        bc_sync_status,
        bc_journal_id,
        bc_batch_name,
        bc_ledger_id,
        last_modified_at,
        bc_last_sync_at,
        is_editable,
        created_at,
        jobs:job_id(id, bc_job_id, name, description),
        job_tasks:task_id(id, bc_task_id, description)
      `)
      .single();

    if (error) throw error;

    return NextResponse.json({
      entry: updatedEntry
    });

  } catch (error) {
    console.error('❌ Update time entry error:', error);
    return NextResponse.json({ 
      error: 'Failed to update time entry',
      details: error.message 
    }, { status: 500 });
  }
}

// DELETE - Eliminar time entry
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ tenant: string }> }
) {
  try {
    const url = new URL(request.url);
    const entryId = url.pathname.split('/').pop();

    if (!entryId) {
      return NextResponse.json({ error: 'Entry ID required' }, { status: 400 });
    }

    // 🔍 Verificar si la entry es editable
    const { data: existingEntry, error: fetchError } = await supabaseAdmin
      .from('time_entries')
      .select('id, bc_sync_status, is_editable')
      .eq('id', entryId)
      .single();

    if (fetchError || !existingEntry) {
      return NextResponse.json({ error: 'Time entry not found' }, { status: 404 });
    }

    // ❌ No permitir eliminación si está posted
    if (!existingEntry.is_editable || existingEntry.bc_sync_status === 'posted') {
      return NextResponse.json({ 
        error: 'Cannot delete entry: already posted in Business Central' 
      }, { status: 400 });
    }

    // 🗑️ Eliminar entry
    const { error } = await supabaseAdmin
      .from('time_entries')
      .delete()
      .eq('id', entryId);

    if (error) throw error;

    return NextResponse.json({
      message: 'Time entry deleted successfully'
    });

  } catch (error) {
    console.error('❌ Delete time entry error:', error);
    return NextResponse.json({ 
      error: 'Failed to delete time entry',
      details: error.message 
    }, { status: 500 });
  }
}