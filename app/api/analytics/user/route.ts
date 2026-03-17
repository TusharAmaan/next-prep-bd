import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
);

export async function GET(request: NextRequest) {
  try {
    const userId = request.nextUrl.searchParams.get('userId') || '';
    const metricType = request.nextUrl.searchParams.get('type') || 'overview';

    if (!userId) {
      return NextResponse.json({ error: 'userId required' }, { status: 400 });
    }

    // Fetch user profile data
    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    const analytics: any = {};

    if (metricType === 'overview' || metricType === 'all') {
      // Basic stats
      analytics.overview = {
        totalLessonsCompleted: 0,
        totalQuizzesTaken: 0,
        averageScore: 0,
        studyStreakDays: 0,
        totalPointsEarned: profile?.points || 0,
      };

      // Get courses
      const { data: courses, count: courseCount } = await supabase
        .from('courses')
        .select('id', { count: 'exact' })
        .eq('user_id', userId);

      const { data: enrollments, count: enrollmentCount } = await supabase
        .from('course_enrollments')
        .select('*', { count: 'exact' })
        .eq('user_id', userId);

      analytics.overview.enrolledCourses = enrollmentCount || 0;
      analytics.overview.completedCourses = enrollments?.filter((e: any) => e.completed).length || 0;
      analytics.overview.totalLessonsCompleted = enrollments?.length || 0;
    }

    if (metricType === 'performance' || metricType === 'all') {
      // Subject-wise performance
      const { data: examResults } = await supabase
        .from('exams')
        .select('score, subject_id, created_at, subjects(title)')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(50);

      const performanceBySubject = examResults?.reduce((acc: any, exam: any) => {
        const subject = exam.subjects?.title || 'Unknown';
        if (!acc[subject]) {
          acc[subject] = { scores: [], average: 0 };
        }
        acc[subject].scores.push(exam.score);
        acc[subject].average = acc[subject].scores.reduce((a: number, b: number) => a + b, 0) / acc[subject].scores.length;
        return acc;
      }, {});

      analytics.performance = performanceBySubject || {};
    }

    if (metricType === 'trends' || metricType === 'all') {
      // Monthly learning trends
      const lastSixMonths = Array.from({ length: 6 }, (_, i) => {
        const date = new Date();
        date.setMonth(date.getMonth() - i);
        return {
          month: date.toLocaleDateString('en-US', { month: 'short', year: '2-digit' }),
          date: date,
        };
      }).reverse();

      const { data: activityLogs } = await supabase
        .from('activity_logs')
        .select('created_at')
        .eq('user_id', userId)
        .gte('created_at', new Date(Date.now() - 180 * 24 * 60 * 60 * 1000).toISOString());

      analytics.trends = lastSixMonths.map((month) => {
        const count = activityLogs?.filter((log: any) => {
          const logDate = new Date(log.created_at);
          return (
            logDate.getMonth() === month.date.getMonth() &&
            logDate.getFullYear() === month.date.getFullYear()
          );
        }).length || 0;

        return {
          month: month.month,
          activities: count,
          target: 20,
        };
      });
    }

    if (metricType === 'recommendations' || metricType === 'all') {
      // Personalized recommendations
      const { data: weakSubjects } = await supabase
        .from('exams')
        .select('subject_id, score, subjects(title, id)')
        .eq('user_id', userId)
        .order('score', { ascending: true })
        .limit(5);

      const subjects = weakSubjects?.map((exam: any) => exam.subjects?.title).filter(Boolean) || [];

      // Fetch courses for weak subjects
      const { data: recommendedCourses } = await supabase
        .from('courses')
        .select('id, title, description, difficulty_level')
        .in('segment', subjects)
        .limit(5);

      analytics.recommendations = {
        weakAreas: subjects,
        suggestedCourses: recommendedCourses || [],
        reason: 'Based on your exam performance',
      };
    }

    return NextResponse.json(analytics);
  } catch (error) {
    console.error('Analytics error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch analytics' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, action, metadata } = body;

    if (!userId) {
      return NextResponse.json({ error: 'userId required' }, { status: 400 });
    }

    // Log activity
    const { error } = await supabase.from('activity_logs').insert({
      user_id: userId,
      action,
      metadata: metadata || {},
      created_at: new Date().toISOString(),
    });

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Log activity error:', error);
    return NextResponse.json(
      { error: 'Failed to log activity' },
      { status: 500 }
    );
  }
}
