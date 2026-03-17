import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
);

// Define badge tiers and requirements
const BADGE_DEFINITIONS = {
  first_lesson: { name: 'First Step', points: 10, icon: '👶' },
  lesson_streak_7: { name: '7-Day Warrior', points: 50, icon: '🔥' },
  lesson_streak_30: { name: 'Month Master', points: 200, icon: '⭐' },
  quiz_ace: { name: 'Quiz Ace', points: 75, icon: '🎯' },
  helper: { name: 'Community Helper', points: 100, icon: '🤝' },
  top_performer: { name: 'Top Performer', points: 300, icon: '🏆' },
  course_completer: { name: 'Course Master', points: 150, icon: '🎓' },
  speed_demon: { name: 'Speed Demon', points: 80, icon: '⚡' },
  knowledge_seeker: { name: 'Knowledge Seeker', points: 120, icon: '🧠' },
  social_butterfly: { name: 'Social Butterfly', points: 90, icon: '🦋' },
};

interface AwardBadgeRequest {
  userId: string;
  badgeId: keyof typeof BADGE_DEFINITIONS;
  reason?: string;
}

export async function POST(request: NextRequest) {
  try {
    const body: AwardBadgeRequest = await request.json();
    const { userId, badgeId, reason } = body;

    if (!userId || !badgeId || !BADGE_DEFINITIONS[badgeId]) {
      return NextResponse.json(
        { error: 'Invalid userId or badgeId' },
        { status: 400 }
      );
    }

    const badge = BADGE_DEFINITIONS[badgeId];

    // Check if user already has this badge
    const { data: existingBadge, error: checkError } = await supabase
      .from('user_badges')
      .select('id')
      .eq('user_id', userId)
      .eq('badge_id', badgeId)
      .single();

    if (checkError && checkError.code !== 'PGRST116') throw checkError;

    if (existingBadge) {
      return NextResponse.json(
        { error: 'User already has this badge' },
        { status: 409 }
      );
    }

    // Award badge
    const { error: insertError } = await supabase
      .from('user_badges')
      .insert({
        user_id: userId,
        badge_id: badgeId,
        earned_at: new Date().toISOString(),
        reason: reason || '',
      });

    if (insertError) throw insertError;

    // Add points
    const { data: profile } = await supabase
      .from('profiles')
      .select('points')
      .eq('id', userId)
      .single();

    const currentPoints = profile?.points || 0;
    const newPoints = currentPoints + badge.points;

    await supabase
      .from('profiles')
      .update({ points: newPoints })
      .eq('id', userId);

    return NextResponse.json({
      success: true,
      badge: {
        id: badgeId,
        name: badge.name,
        icon: badge.icon,
        points: badge.points,
      },
      newTotalPoints: newPoints,
    });
  } catch (error) {
    console.error('Award badge error:', error);
    return NextResponse.json(
      { error: 'Failed to award badge' },
      { status: 500 }
    );
  }
}

// GET endpoint to list all available badges
export async function GET(request: NextRequest) {
  try {
    return NextResponse.json({
      badges: Object.entries(BADGE_DEFINITIONS).map(([id, def]) => ({
        id,
        name: def.name,
        icon: def.icon,
        points: def.points,
      })),
    });
  } catch (error) {
    console.error('Get badges error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch badges' },
      { status: 500 }
    );
  }
}
