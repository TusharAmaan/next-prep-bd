import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
);

interface LearningPathRequest {
  userId: string;
  targetGoal: string;
  currentLevel: 'beginner' | 'intermediate' | 'advanced';
  availableHoursPerWeek: number;
  preferredSubjects?: string[];
  learningStyle?: 'visual' | 'practical' | 'theory' | 'mixed';
}

// This would integrate with OpenAI/Claude API
export async function POST(request: NextRequest) {
  try {
    const body: LearningPathRequest = await request.json();
    const {
      userId,
      targetGoal,
      currentLevel,
      availableHoursPerWeek,
      preferredSubjects,
      learningStyle,
    } = body;

    if (!userId || !targetGoal) {
      return NextResponse.json(
        { error: 'userId and targetGoal required' },
        { status: 400 }
      );
    }

    // Fetch user's exam history and performance
    const { data: userPerformance } = await supabase
      .from('exams')
      .select('score, subject_id, subjects(title)')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(20);

    // Calculate average by subject
    const subjectScores: Record<string, number[]> = {};
    userPerformance?.forEach((exam: any) => {
      const subject = exam.subjects?.title || 'Unknown';
      if (!subjectScores[subject]) subjectScores[subject] = [];
      subjectScores[subject].push(exam.score);
    });

    const subjectAverages = Object.entries(subjectScores).map(([subject, scores]) => ({
      subject,
      average: scores.reduce((a, b) => a + b, 0) / scores.length,
    }));

    // Identify weak areas (scores below 70%)
    const weakAreas = subjectAverages.filter((s) => s.average < 70).map((s) => s.subject);
    const strongAreas = subjectAverages.filter((s) => s.average >= 80).map((s) => s.subject);

    // Generate learning path recommendation (simplified - would use AI API in production)
    const learningPath = generateLearningPath(
      targetGoal,
      currentLevel,
      availableHoursPerWeek,
      weakAreas,
      strongAreas,
      preferredSubjects || []
    );

    // Save personalized learning path to database
    const { error: saveError } = await supabase
      .from('personalized_learning_paths')
      .insert({
        user_id: userId,
        goal: targetGoal,
        current_level: currentLevel,
        recommended_path: learningPath,
        weak_areas: weakAreas,
        strong_areas: strongAreas,
        created_at: new Date().toISOString(),
        target_completion_date: new Date(
          Date.now() + learningPath.durationWeeks * 7 * 24 * 60 * 60 * 1000
        ).toISOString(),
      });

    if (saveError) throw saveError;

    return NextResponse.json({
      success: true,
      learningPath,
      analysis: {
        weakAreas,
        strongAreas,
        subjectPerformance: subjectAverages,
      },
    });
  } catch (error) {
    console.error('Learning path error:', error);
    return NextResponse.json(
      { error: 'Failed to generate learning path' },
      { status: 500 }
    );
  }
}

// GET endpoint to retrieve user's personalized learning path
export async function GET(request: NextRequest) {
  try {
    const userId = request.nextUrl.searchParams.get('userId') || '';

    if (!userId) {
      return NextResponse.json(
        { error: 'userId required' },
        { status: 400 }
      );
    }

    const { data: path, error } = await supabase
      .from('personalized_learning_paths')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .single();

    if (error && error.code !== 'PGRST116') throw error;

    if (!path) {
      return NextResponse.json({ path: null, message: 'No learning path found' });
    }

    // Get progress on the learning path
    const { data: enrollments } = await supabase
      .from('course_enrollments')
      .select('*')
      .eq('user_id', userId)
      .in('course_id', path.recommended_path?.courses?.map((c: any) => c.id) || []);

    return NextResponse.json({
      path,
      progress: {
        totalCourses: path.recommended_path?.courses?.length || 0,
        completedCourses: enrollments?.filter((e: any) => e.completed).length || 0,
        currentWeek: calculateCurrentWeek(path.created_at),
        totalWeeks: path.recommended_path?.durationWeeks || 0,
      },
    });
  } catch (error) {
    console.error('Get learning path error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch learning path' },
      { status: 500 }
    );
  }
}

interface RecommendedCourse {
  id: string;
  title: string;
  difficulty: string;
  duration: number;
}

interface CourseWeek {
  week: number;
  courses: RecommendedCourse[];
  focus: string;
}

interface LearningPath {
  title: string;
  durationWeeks: number;
  weeklySchedule: CourseWeek[];
  courses: RecommendedCourse[];
}

function generateLearningPath(
  goal: string,
  level: string,
  hoursPerWeek: number,
  weakAreas: string[],
  strongAreas: string[],
  preferences: string[]
): LearningPath {
  // Simplified algorithm - would be AI-powered in production
  const isAccelerated = hoursPerWeek >= 15;
  const durationWeeks = isAccelerated ? 4 : 8;

  const schedule: CourseWeek[] = [];

  // Foundation week(s) - focus on weak areas
  if (weakAreas.length > 0) {
    schedule.push({
      week: 1,
      courses: [
        {
          id: '1',
          title: `${weakAreas[0]} Fundamentals`,
          difficulty: 'beginner',
          duration: 5,
        },
      ],
      focus: `Master ${weakAreas[0]} basics`,
    });
  }

  // Intermediate weeks - build on strengths and address weaknesses
  for (let i = 2; i <= Math.ceil(durationWeeks / 2); i++) {
    schedule.push({
      week: i,
      courses: [
        {
          id: `${i}`,
          title: `${goal} - Intermediate Level`,
          difficulty: 'intermediate',
          duration: 7,
        },
      ],
      focus: `Build advanced skills in ${goal}`,
    });
  }

  // Advanced weeks - specialization
  for (let i = Math.ceil(durationWeeks / 2) + 1; i <= durationWeeks; i++) {
    schedule.push({
      week: i,
      courses: [
        {
          id: `${i}`,
          title: `${goal} - Advanced Topics`,
          difficulty: 'advanced',
          duration: 10,
        },
      ],
      focus: 'Master advanced concepts and applications',
    });
  }

  return {
    title: `${durationWeeks}-Week ${goal} Masterclass`,
    durationWeeks,
    weeklySchedule: schedule,
    courses: schedule.flatMap((w) => w.courses),
  };
}

function calculateCurrentWeek(startDate: string): number {
  const weeks = Math.floor(
    (Date.now() - new Date(startDate).getTime()) / (7 * 24 * 60 * 60 * 1000)
  );
  return Math.max(1, weeks + 1);
}
