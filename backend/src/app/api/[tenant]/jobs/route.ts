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

    // Fetch jobs and tasks for the company
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

    if (jobsResult.error) throw jobsResult.error;
    if (tasksResult.error) throw tasksResult.error;

    return NextResponse.json({
      jobs: jobsResult.data || [],
      tasks: tasksResult.data || []
    });

  } catch (error) {
    console.error('Jobs fetch error:', error);
    return NextResponse.json({ error: 'Failed to fetch jobs' }, { status: 500 });
  }
}