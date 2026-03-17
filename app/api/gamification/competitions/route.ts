import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
);

export async function GET(request: NextRequest) {
  try {
    const userId = request.nextUrl.searchParams.get('userId') || '';
    const limit = Math.min(parseInt(request.nextUrl.searchParams.get('limit') || '10'), 50);

    // Get active team competitions
    const { data: competitions } = await supabase
      .from('team_competitions')
      .select(
        `
        id,
        name,
        description,
        start_date,
        end_date,
        status,
        total_participants,
        icon,
        prize_pool,
        team_competitions_team_scores(
          team_id,
          team_name,
          score,
          rank,
          team_competitions_team_scores(count)
        )
      `
      )
      .eq('status', 'active')
      .limit(limit);

    return NextResponse.json({ competitions: competitions || [] });
  } catch (error) {
    console.error('Get competitions error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch competitions' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, competitionId, action, teamName } = body;

    if (!userId || !competitionId) {
      return NextResponse.json(
        { error: 'Missing userId or competitionId' },
        { status: 400 }
      );
    }

    if (action === 'join') {
      // Add user to competition team
      const { data: user } = await supabase
        .from('profiles')
        .select('full_name, segment')
        .eq('id', userId)
        .single();

      if (!user) {
        return NextResponse.json(
          { error: 'User not found' },
          { status: 404 }
        );
      }

      const { error } = await supabase
        .from('competition_participants')
        .insert({
          competition_id: competitionId,
          user_id: userId,
          team_name: teamName || user.segment,
          joined_at: new Date().toISOString(),
        });

      if (error) throw error;

      return NextResponse.json({
        success: true,
        message: 'Successfully joined competition',
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Competition action error:', error);
    return NextResponse.json(
      { error: 'Failed to perform action' },
      { status: 500 }
    );
  }
}
