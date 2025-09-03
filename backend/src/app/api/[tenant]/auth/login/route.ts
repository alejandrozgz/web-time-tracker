import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { BusinessCentralClient } from '@/lib/bc-api';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ tenant: string }> }
) {
  try {
    const { tenant: tenantSlug } = await params;
    const url = new URL(request.url);
    const companyId = url.searchParams.get('companyId');

    console.log('🔍 Jobs API called:', { tenantSlug, companyId });

    if (!companyId) {
      return NextResponse.json({ error: 'Company ID required' }, { status: 400 });
    }

    // Get tenant from Supabase
    const { data: tenant, error: tenantError } = await supabaseAdmin
      .from('tenants')
      .select('*')
      .eq('slug', tenantSlug)
      .single();

    console.log('🔍 Tenant found:', tenant?.slug, 'OAuth enabled:', tenant?.oauth_enabled);

    if (tenantError || !tenant) {
      console.error('❌ Tenant not found:', tenantError);
      return NextResponse.json({ error: 'Tenant not found' }, { status: 404 });
    }

    // Get company from Supabase  
    const { data: company, error: companyError } = await supabaseAdmin
      .from('companies')
      .select('*')
      .eq('id', companyId)
      .eq('tenant_id', tenant.id)
      .single();

    console.log('🔍 Company found:', company?.name, 'BC Company ID:', company?.bc_company_id);

    if (companyError || !company) {
      console.error('❌ Company not found:', companyError);
      return NextResponse.json({ error: 'Company not found' }, { status: 404 });
    }

    // If OAuth is enabled, try to get from Business Central
    if (tenant.oauth_enabled && tenant.bc_client_id && tenant.bc_client_secret && tenant.bc_tenant_id) {
      console.log('🔍 Attempting to fetch from Business Central...');
      
      try {
        const bcClient = new BusinessCentralClient(tenant, company);
        
        console.log('🔍 BC Client created, fetching jobs and tasks...');
        
        const [bcJobs, bcTasks] = await Promise.all([
          bcClient.getJobs(),
          bcClient.getAllJobTasks()
        ]);

        console.log('🔍 BC Response - Jobs:', bcJobs?.length || 0, 'Tasks:', bcTasks?.length || 0);
        console.log('🔍 Jobs data:', JSON.stringify(bcJobs, null, 2));
        console.log('🔍 Tasks data:', JSON.stringify(bcTasks, null, 2));

        // Transform BC data to our format
        const jobs = bcJobs.map(job => ({
          id: job.systemId || job.id,
          bc_job_id: job.no || job.number,
          name: job.description || job.name,
          description: job.description
        }));

        const tasks = bcTasks.map(task => ({
          id: task.systemId || task.id,
          job_id: jobs.find(j => j.bc_job_id === task.jobNo)?.id,
          bc_task_id: task.jobTaskNo || task.taskNo,
          description: task.description
        }));

        console.log('🔍 Transformed data - Jobs:', jobs.length, 'Tasks:', tasks.length);

        return NextResponse.json({
          jobs,
          tasks,
          source: 'business_central'
        });

      } catch (bcError) {
        console.error('❌ Business Central error:', bcError);
        
        // Fallback to local data if BC fails
        console.log('🔍 Falling back to local Supabase data...');
      }
    } else {
      console.log('🔍 OAuth not configured, using local Supabase data...');
    }

    // Fallback: Fetch from local Supabase database
    const [jobsResult, tasksResult] = await Promise.all([
      supabaseAdmin
        .from('jobs')
        .select('*')
        .eq('company_id', companyId)
        .eq('status', 'active')
        .order('name'),
      
      supabaseAdmin
        .from('job_tasks')
        .select('*')
        .eq('company_id', companyId)
        .eq('status', 'active')
        .order('description')
    ]);

    console.log('🔍 Supabase data - Jobs:', jobsResult.data?.length || 0, 'Tasks:', tasksResult.data?.length || 0);

    if (jobsResult.error) {
      console.error('❌ Supabase jobs error:', jobsResult.error);
      throw jobsResult.error;
    }
    if (tasksResult.error) {
      console.error('❌ Supabase tasks error:', tasksResult.error);
      throw tasksResult.error;
    }

    return NextResponse.json({
      jobs: jobsResult.data || [],
      tasks: tasksResult.data || [],
      source: 'supabase_local'
    });

  } catch (error) {
    console.error('❌ Jobs fetch error:', error);
    return NextResponse.json({ 
      error: 'Failed to fetch jobs',
      details: error.message 
    }, { status: 500 });
  }
}