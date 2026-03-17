import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
);

interface Challenge {
  id: string;
  title: string;
  description: string;
  icon: string;
  points: number;
  difficulty: 'easy' | 'medium' | 'hard';
  requirements: {
    type: 'lessons_completed' | 'quizzes_taken' | 'consecutive_days' | 'score_average';
    target: number;
  };
  duration_days: number;
  active: boolean;
}

const DAILY_CHALLENGES: Challenge[] = [
  {
    id: 'daily_quiz',
    title: 'Daily Quiz Challenge',
    description: 'Take and pass 3 quizzes',
    icon: '📝',
    points: 50,
    difficulty: 'easy',
    requirements: { type: 'quizzes_taken', target: 3 },
    duration_days: 1,
    active: true,
  },
  {
    id: 'lesson_marathon',
    title: 'Lesson Marathon',
    description: 'Complete 5 lessons in a day',
    icon: '🎯',
    points: 75,
    difficulty: 'medium',
    requirements: { type: 'lessons_completed', target: 5 },
    duration_days: 1,
    active: true,
  },
  {
    id: 'perfect_score',
    title: 'Perfect Score Challenge',
    description: 'Score 100% on any quiz',
    icon: '💯',
    points: 100,
    difficulty: 'hard',
    requirements: { type: 'score_average', target: 100 },
    duration_days: 1,
    active: true,
  },
];

const WEEKLY_CHALLENGES: Challenge[] = [
  {
    id: 'weekly_grind',
    title: 'Weekly Grind',
    description: 'Complete 25 lessons this week',
    icon: '🔥',
    points: 200,
    difficulty: 'medium',
    requirements: { type: 'lessons_completed', target: 25 },
    duration_days: 7,
    active: true,
  },
  {
    id: 'consistency_king',
    title: 'Consistency King',
    description: 'Learn for 7 consecutive days',
    icon: '👑',
    points: 250,
    difficulty: 'hard',
    requirements: { type: 'consecutive_days', target: 7 },
    duration_days: 7,
    active: true,
  },
];

export async function GET(request: NextRequest) {
  try {
    const type = request.nextUrl.searchParams.get('type') || 'all';
    const userId = request.nextUrl.searchParams.get('userId') || '';

    let challenges: Challenge[] = [];

    if (type === 'daily' || type === 'all') {
      challenges.push(...DAILY_CHALLENGES);
    }
    if (type === 'weekly' || type === 'all') {
      challenges.push(...WEEKLY_CHALLENGES);
    }

    // If userId provided, get their progress
    if (userId) {
      const { data: userProgress } = await supabase
        .from('challenge_progress')
        .select('*')
        .eq('user_id', userId);

      challenges = challenges.map((challenge) => {
        const progress = userProgress?.find((p) => p.challenge_id === challenge.id);
        return {
          ...challenge,
          progress: progress?.progress || 0,
          completed: progress?.completed || false,
          claimed: progress?.claimed || false,
        };
      });
    }

    return NextResponse.json({ challenges });
  } catch (error) {
    console.error('Get challenges error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch challenges' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, challengeId, action } = body;

    if (!userId || !challengeId) {
      return NextResponse.json(
        { error: 'Missing userId or challengeId' },
        { status: 400 }
      );
    }

    if (action === 'claim') {
      // Mark challenge as claimed and award points
      const { error } = await supabase
        .from('challenge_progress')
        .update({ claimed: true, claimed_at: new Date().toISOString() })
        .eq('user_id', userId)
        .eq('challenge_id', challengeId);

      if (error) throw error;

      // Find challenge to get points
      const challenge = [...DAILY_CHALLENGES, ...WEEKLY_CHALLENGES].find(
        (c) => c.id === challengeId
      );

      if (challenge) {
        // Award points
        const { data: profile } = await supabase
          .from('profiles')
          .select('points')
          .eq('id', userId)
          .single();

        const newPoints = (profile?.points || 0) + challenge.points;
        await supabase
          .from('profiles')
          .update({ points: newPoints })
          .eq('id', userId);

        return NextResponse.json({
          success: true,
          pointsAwarded: challenge.points,
          totalPoints: newPoints,
        });
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Update challenge error:', error);
    return NextResponse.json(
      { error: 'Failed to update challenge' },
      { status: 500 }
    );
  }
}
