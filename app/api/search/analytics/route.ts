import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
);

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { query, resultCount, userSegment, timestamp } = body;

    if (!query) {
      return NextResponse.json({ error: 'Query required' }, { status: 400 });
    }

    // Insert search analytics record
    const { error } = await supabase.from('search_analytics').insert({
      query: query.toLowerCase().trim(),
      result_count: resultCount || 0,
      user_segment: userSegment,
      timestamp: timestamp || new Date().toISOString(),
    });

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Analytics error:', error);
    return NextResponse.json({ error: 'Failed to track search' }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const days = parseInt(searchParams.get('days') || '30');

    // Get all search analytics records for the period
    const { data: searchLogs, error } = await supabase
      .from('search_analytics')
      .select('query')
      .gte('timestamp', new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString());

    if (error) throw error;

    // Count manually in code (Supabase limitation on grouping)
    const trendMap = new Map<string, number>();
    (searchLogs || []).forEach((log: any) => {
      const query = log.query.toLowerCase().trim();
      trendMap.set(query, (trendMap.get(query) || 0) + 1);
    });

    // Convert to array and sort
    const trends = Array.from(trendMap.entries())
      .map(([query, count]) => ({ query, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 50);

    return NextResponse.json({
      trends,
      period: `Last ${days} days`,
    });
  } catch (error) {
    console.error('Trends error:', error);
    return NextResponse.json({ error: 'Failed to fetch trends' }, { status: 500 });
  }
}
