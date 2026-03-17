import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
);

export async function GET(request: NextRequest) {
  try {
    const institutionId = request.nextUrl.searchParams.get('institutionId') || '';
    const period = request.nextUrl.searchParams.get('period') || '30'; // days

    if (!institutionId) {
      return NextResponse.json(
        { error: 'institutionId required' },
        { status: 400 }
      );
    }

    const periodDays = parseInt(period);
    const startDate = new Date(Date.now() - periodDays * 24 * 60 * 60 * 1000);

    // Get institution stats
    const { data: members, count: memberCount } = await supabase
      .from('profiles')
      .select('*', { count: 'exact' })
      .eq('institution_id', institutionId);

    // Course enrollment stats
    const { data: enrollments, count: enrollmentCount } = await supabase
      .from('course_enrollments')
      .select('* , profiles(institution_id)', { count: 'exact' })
      .gte('created_at', startDate.toISOString());

    const institutionEnrollments = enrollments?.filter(
      (e: any) => e.profiles?.institution_id === institutionId
    ).length || 0;

    // Average completion rate
    const completionRate =
      members && members.length > 0
        ? Math.round(
            ((members.filter((m: any) => m.certification_count > 0).length /
              members.length) *
              100)
          )
        : 0;

    // Most popular courses
    const { data: topCourses } = await supabase
      .from('courses')
      .select('id, title, enrollment_count')
      .order('enrollment_count', { ascending: false })
      .limit(5);

    // Member activity distribution
    const { data: activityLogs } = await supabase
      .from('activity_logs')
      .select('user_id, count(*) as count')
      .gte('created_at', startDate.toISOString())
      .group_by('user_id')
      .order('count', { ascending: false });

    const activeMembers = activityLogs?.filter((log: any) => log.count > 0).length || 0;
    const activityRate = Math.round((activeMembers / (memberCount || 1)) * 100);

    // Revenue (placeholder - would need payment data)
    const { data: transactions } = await supabase
      .from('transactions')
      .select('amount')
      .eq('status', 'completed')
      .gte('created_at', startDate.toISOString());

    const totalRevenue = transactions?.reduce((sum: number, t: any) => sum + (t.amount || 0), 0) || 0;

    // Subject wise enrollment
    const { data: subjectEnrollments } = await supabase
      .from('course_enrollments')
      .select('courses(subjects(title))')
      .gte('created_at', startDate.toISOString());

    const subjectStats = subjectEnrollments?.reduce((acc: any, enrollment: any) => {
      const subject = enrollment.courses?.subjects?.title || 'Unknown';
      acc[subject] = (acc[subject] || 0) + 1;
      return acc;
    }, {});

    return NextResponse.json({
      overview: {
        totalMembers: memberCount || 0,
        activeMembers,
        activityRate,
        totalEnrollments: institutionEnrollments,
        completionRate,
        totalRevenue,
      },
      topCourses: topCourses || [],
      subjectStats: subjectStats || {},
      period: `Last ${periodDays} days`,
    });
  } catch (error) {
    console.error('Institution analytics error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch analytics' },
      { status: 500 }
    );
  }
}
