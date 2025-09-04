import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { BusinessCentralClient } from '@/lib/bc-api';

// GET - Obtener jobs y tasks SOLO desde Business Central (tiempo real)
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ tenant: string }> }
) {
  try {
    const { tenant: tenantSlug } = await params;
    
    console.log('🚀 ===== JOBS API (BC Real-Time) =====');
    console.log('🔍 Tenant:', tenantSlug);

    // 🔍 Get current user's resource number from JWT token
    const authHeader = request.headers.get('authorization');
    let currentResourceNo = 'R0010'; // Default for demo
    let companyId = null;
    
    if (authHeader && authHeader.startsWith('Bearer ')) {
      try {
        const token = authHeader.substring(7);
        const decodedToken = JSON.parse(Buffer.from(token, 'base64').toString());
        currentResourceNo = decodedToken.resourceNo || 'R0010';
        companyId = decodedToken.companyId;
        console.log('🔍 Current user resource:', currentResourceNo);
        console.log('🔍 Company ID:', companyId);
      } catch (e) {
        console.log('🔍 Could not decode token, using defaults');
      }
    }

    if (!companyId) {
      return NextResponse.json({ 
        error: 'Company ID required in token' 
      }, { status: 400 });
    }

    // 🏢 Get tenant and company info
    const [tenantResult, companyResult] = await Promise.all([
      supabaseAdmin.from('tenants').select('*').eq('slug', tenantSlug).single(),
      supabaseAdmin.from('companies').select('*').eq('id', companyId).single()
    ]);

    const { data: tenant, error: tenantError } = tenantResult;
    const { data: company, error: companyError } = companyResult;

    if (tenantError || !tenant) {
      console.error('❌ Tenant not found:', tenantError);
      return NextResponse.json({ error: 'Tenant not found' }, { status: 404 });
    }

    if (companyError || !company) {
      console.error('❌ Company not found:', companyError);
      return NextResponse.json({ error: 'Company not found' }, { status: 404 });
    }

    // 🔧 Check if Business Central is configured
    if (!tenant.oauth_enabled || !tenant.bc_tenant_id || !tenant.oauth_access_token) {
      console.error('❌ Business Central not configured for tenant');
      return NextResponse.json({
        error: 'Business Central integration not configured for this tenant',
        configured: false
      }, { status: 400 });
    }

    try {
      console.log('🔗 Connecting to Business Central...');
      
      // 🚀 Initialize BC Client  
      const bcClient = new BusinessCentralClient(tenant, company);
      
      console.log('🔍 Fetching resource assignments from BC...');
      
      // ✅ Get jobs and tasks assigned to current user - SINGLE API CALL
      const assignments = await bcClient.getResourceAssignments(currentResourceNo);
      const { jobs: bcJobs, tasks: bcTasks } = assignments;

      console.log('🔍 BC Response - Jobs:', bcJobs?.length || 0, 'Tasks:', bcTasks?.length || 0);

      if (!bcJobs || !bcTasks) {
        throw new Error('No assignments returned from Business Central');
      }

      // 🔄 Transform BC data to frontend format (in-memory only)
      const jobs = bcJobs.map(job => ({
        id: job.systemId || `bc-job-${job.no}`, // Temporary ID for frontend
        bc_job_id: job.no || job.number,
        name: job.description || job.name || `Job ${job.no}`,
        description: job.description || job.name || ''
      }));

      // 🔄 Transform tasks - already filtered to assigned tasks only  
      const tasks = bcTasks
        .filter(task => task.description && task.description.trim() !== '') // Remove empty descriptions
        .map(task => ({
          id: task.systemId || `bc-task-${task.jobNo}-${task.jobTaskNo}`, // Temporary ID
          job_id: jobs.find(j => j.bc_job_id === task.jobNo)?.id, // Link to parent job
          bc_job_id: task.jobNo,
          bc_task_id: task.jobTaskNo || task.taskNo,
          description: task.description,
          job_name: jobs.find(j => j.bc_job_id === task.jobNo)?.name || 'Unknown Job'
        }))
        .filter(task => task.job_id); // Only tasks with valid parent job

      console.log('✅ BC Data transformed:');
      console.log('📋 Jobs:', jobs.map(j => `${j.bc_job_id}: ${j.name}`));
      console.log('📋 Tasks:', tasks.map(t => `${t.bc_task_id}: ${t.description}`));
      console.log('🔚 ===== END JOBS API =====');

      return NextResponse.json({
        jobs,
        tasks,
        source: 'business_central_real_time',
        configured: true,
        resource_no: currentResourceNo,
        assignments_count: {
          jobs: jobs.length,
          tasks: tasks.length
        }
      });

    } catch (bcError) {
      console.error('❌ Business Central API error:', bcError);
      
      return NextResponse.json({
        error: 'Failed to connect to Business Central',
        details: bcError.message,
        configured: true,
        connection_failed: true
      }, { status: 500 });
    }

  } catch (error) {
    console.error('❌ Jobs API error:', error);
    return NextResponse.json({ 
      error: 'Failed to fetch jobs and tasks',
      details: error.message,
      configured: false
    }, { status: 500 });
  }
}