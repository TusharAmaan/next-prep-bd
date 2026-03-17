import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
);

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId } = body;

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID required' },
        { status: 400 }
      );
    }

    const { error } = await supabase
      .from('notifications')
      .delete()
      .eq('user_id', userId);

    if (error) throw error;

    return NextResponse.json({ success: true, message: 'All notifications cleared' });
  } catch (error) {
    console.error('Clear notifications error:', error);
    return NextResponse.json(
      { error: 'Failed to clear notifications' },
      { status: 500 }
    );
  }
}
