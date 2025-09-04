import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

// GET - Obtener time entries (con datos BC inline)
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ tenant: string }> }
) {
  try {
    const url = new URL(request.url);
    const from = url.searchParams.get('from');
    const to = url.searchParams.get('to');
    
    // 🔍 Get current user from JWT token
    const authHeader = request.headers.get('authorization');
    let currentUserId = null;
    let companyId = null;
    
    if (authHeader && authHeader.startsWith('Bearer ')) {
      try {
        const token = authHeader.substring(7);
        const decodedToken = JSON.parse(Buffer.from(token, 'base64').toString());
        currentUserId = decodedToken.userId;
        companyId = decodedToken.companyId;
      } catch (e) {
        console.log('Could not decode token');
      }
    }

    if (!currentUserId || !companyId) {
      return NextResponse.json({ 
        error: 'Authentication required' 
      }, { status: 401 });
    }

    console.log('🔍 Fetching time entries for user:', currentUserId, 'company:', companyId);

    // 📊 Query time entries with BC data inline (no joins needed)
    let query = supabaseAdmin
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
        start_time,
        end_time,
        bc_sync_status,
        bc_journal_id,
        bc_batch_name,
        bc_ledger_id,
        last_modified_at,
        bc_last_sync_at,
        is_editable,
        created_at
      `)
      .eq('user_id', currentUserId)
      .eq('company_id', companyId)
      .order('date', { ascending: false })
      .order('created_at', { ascending: false });

    // 📅 Apply date filters
    if (from) {
      query = query.gte('date', from);
    }
    if (to) {
      query = query.lte('date', to);
    }

    const { data: entries, error } = await query;

    if (error) {
      console.error('❌ Query error:', error);
      throw error;
    }

    console.log('✅ Found', entries?.length || 0, 'time entries');

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

// POST - Crear time entry (con datos BC inline)
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ tenant: string }> }
) {
  try {
    const timeEntryData = await request.json();
    const { tenant: tenantSlug } = await params;

    console.log('🔍 Creating time entry:', timeEntryData);

    // 🔍 Get current user from JWT token
    const authHeader = request.headers.get('authorization');
    let currentUserId = null;
    let companyId = null;
    let resourceNo = null;
    
    if (authHeader && authHeader.startsWith('Bearer ')) {
      try {
        const token = authHeader.substring(7);
        const decodedToken = JSON.parse(Buffer.from(token, 'base64').toString());
        currentUserId = decodedToken.userId;
        companyId = decodedToken.companyId;
        resourceNo = decodedToken.resourceNo;
      } catch (e) {
        console.log('Could not decode token');
      }
    }

    if (!currentUserId || !companyId || !resourceNo) {
      return NextResponse.json({ 
        error: 'Authentication required' 
      }, { status: 401 });
    }

    // ✅ Validaciones básicas
    const requiredFields = ['bc_job_id', 'bc_task_id', 'job_name', 'task_description', 'description', 'date', 'hours'];
    
    for (const field of requiredFields) {
      if (!timeEntryData[field]) {
        return NextResponse.json({ 
          error: `Field '${field}' is required` 
        }, { status: 400 });
      }
    }

    // ✅ Validar horas
    if (timeEntryData.hours <= 0 || timeEntryData.hours > 24) {
      return NextResponse.json({ 
        error: 'Hours must be between 0 and 24' 
      }, { status: 400 });
    }

    // 📊 Preparar datos para insertar (con BC data inline)
    const insertData = {
      user_id: currentUserId,
      company_id: companyId,
      
      // ✅ BC Data inline (no foreign keys)
      bc_job_id: timeEntryData.bc_job_id,
      bc_task_id: timeEntryData.bc_task_id,
      job_name: timeEntryData.job_name,
      task_description: timeEntryData.task_description,
      
      // ⏰ Time data
      date: timeEntryData.date,
      hours: parseFloat(timeEntryData.hours),
      description: timeEntryData.description,
      start_time: timeEntryData.start_time || null,
      end_time: timeEntryData.end_time || null,
      
      // 🔄 BC Sync fields (default values)
      bc_sync_status: 'local',
      bc_journal_id: null,
      bc_batch_name: null,
      bc_ledger_id: null,
      last_modified_at: new Date().toISOString(),
      bc_last_sync_at: null,
      is_editable: true,
      
      // 🔍 Resource info for BC sync
      resource_no: resourceNo
    };

    // 🗄️ Insertar en Supabase
    const { data: newEntry, error } = await supabaseAdmin
      .from('time_entries')
      .insert(insertData)
      .select(`
        id,
        bc_job_id,
        bc_task_id,
        job_name,
        task_description,
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
        created_at
      `)
      .single();

    if (error) {
      console.error('❌ Insert error:', error);
      throw error;
    }

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
    const entryId = url.pathname.split('/').pop();
    const updateData = await request.json();

    if (!entryId) {
      return NextResponse.json({ error: 'Entry ID required' }, { status: 400 });
    }

    console.log('🔄 Updating time entry:', entryId, updateData);

    // 🔍 Verificar si la entry existe y es editable
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
        error: 'Cannot edit entry: already posted in Business Central' 
      }, { status: 400 });
    }

    // ✅ Validar horas si se está actualizando
    if (updateData.hours && (updateData.hours <= 0 || updateData.hours > 24)) {
      return NextResponse.json({ 
        error: 'Hours must be between 0 and 24' 
      }, { status: 400 });
    }

    // 📝 Preparar datos de actualización
    const updateFields = {
      ...updateData,
      last_modified_at: new Date().toISOString(),
      // 🔄 Si estaba synced, marcarlo como modified
      bc_sync_status: existingEntry.bc_sync_status === 'draft' ? 'modified' : 'local'
    };

    // Limpiar campos que no deben actualizarse
    delete updateFields.id;
    delete updateFields.created_at;
    delete updateFields.user_id;
    delete updateFields.company_id;

    // 🔄 Actualizar en Supabase
    const { data: updatedEntry, error } = await supabaseAdmin
      .from('time_entries')
      .update(updateFields)
      .eq('id', entryId)
      .select(`
        id,
        bc_job_id,
        bc_task_id,
        job_name,
        task_description,
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
        created_at
      `)
      .single();

    if (error) {
      console.error('❌ Update error:', error);
      throw error;
    }

    console.log('✅ Time entry updated:', updatedEntry.id);

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

    console.log('🗑️ Deleting time entry:', entryId);

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

    if (error) {
      console.error('❌ Delete error:', error);
      throw error;
    }

    console.log('✅ Time entry deleted:', entryId);

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