import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
);

export async function GET(request: NextRequest) {
  try {
    const timeframe = request.nextUrl.searchParams.get('timeframe') || 'all-time';
    const segment = request.nextUrl.searchParams.get('segment') || '';
    const limit = Math.min(parseInt(request.nextUrl.searchParams.get('limit') || '50'), 100);
    const offset = parseInt(request.nextUrl.searchParams.get('offset') || '0');

    let query = supabase
      .from('profiles')
      .select(
        'id, full_name, avatar_url, points, badges_count, certificates_count, segment',
        { count: 'exact' }
      )
      .gt('points', 0);

    // Filter by segment if provided
    if (segment) {
      query = query.eq('segment', segment);
    }

    // Filter by timeframe (would need a points_history table for accurate timeframe-based filtering)
    // For now, we'll use total points
    if (timeframe === 'this-week') {
      // This would require tracking points with timestamps
      // Simplified version: just use top performers
    } else if (timeframe === 'this-month') {
      // Similar limitation
    }

    query = query
      .order('points', { ascending: false })
      .limit(limit)
      .offset(offset);

    const { data: leaderboard, count } = await query;

    if (!leaderboard) {
      return NextResponse.json({ leaderboard: [], total: 0 });
    }

    // Format leaderboard with rank and badges
    const ranked = leaderboard.map((user, index) => ({
      ...user,
      rank: offset + index + 1,
      rankBadge: offset + index + 1 <= 3 ? ['🥇', '🥈', '🥉'][index] : '🏅',
    }));

    return NextResponse.json({
      leaderboard: ranked,
      total: count,
      timeframe,
      segment: segment || 'all',
    });
  } catch (error) {
    console.error('Leaderboard error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch leaderboard' },
      { status: 500 }
    );
  }
}
