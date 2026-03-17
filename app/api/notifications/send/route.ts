import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
);

interface NotificationPayload {
  type: 'course_update' | 'exam_result' | 'message' | 'achievement' | 'assignment' | 'announcement';
  title: string;
  message: string;
  recipientId: string;
  recipientIds?: string[];
  icon?: string;
  action?: string;
  actionUrl?: string;
  metadata?: Record<string, any>;
}

export async function POST(request: NextRequest) {
  try {
    const body: NotificationPayload = await request.json();
    const {
      type,
      title,
      message,
      recipientId,
      recipientIds,
      icon,
      action,
      actionUrl,
      metadata,
    } = body;

    if (!type || !title || !message) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const recipients = recipientIds || (recipientId ? [recipientId] : []);
    if (recipients.length === 0) {
      return NextResponse.json(
        { error: 'No recipients specified' },
        { status: 400 }
      );
    }

    // Store notification in database
    const notifications = recipients.map((userId) => ({
      user_id: userId,
      type,
      title,
      message,
      icon: icon || getIconForType(type),
      action,
      action_url: actionUrl,
      metadata: metadata || {},
      is_read: false,
      created_at: new Date().toISOString(),
    }));

    const { error: insertError } = await supabase
      .from('notifications')
      .insert(notifications);

    if (insertError) throw insertError;

    // Emit real-time event via SSE (for connected clients only)
    const notificationEvent = {
      type: 'notification',
      data: {
        id: Math.random().toString(36).substr(2, 9),
        type,
        title,
        message,
        icon: icon || getIconForType(type),
        actionUrl,
        timestamp: new Date().toISOString(),
      },
    };

    return NextResponse.json({
      success: true,
      notification: notificationEvent,
      recipientCount: recipients.length,
    });
  } catch (error) {
    console.error('Notification error:', error);
    return NextResponse.json(
      { error: 'Failed to send notification' },
      { status: 500 }
    );
  }
}

function getIconForType(type: string): string {
  const iconMap: Record<string, string> = {
    course_update: '📚',
    exam_result: '📝',
    message: '💬',
    achievement: '🏆',
    assignment: '✅',
    announcement: '📢',
  };
  return iconMap[type] || '🔔';
}

// GET endpoint to retrieve user notifications
export async function GET(request: NextRequest) {
  try {
    const userId = request.nextUrl.searchParams.get('userId');
    const isRead = request.nextUrl.searchParams.get('isRead');
    const limit = Math.min(parseInt(request.nextUrl.searchParams.get('limit') || '50'), 100);

    if (!userId) {
      return NextResponse.json(
        { error: 'userId required' },
        { status: 400 }
      );
    }

    let query = supabase
      .from('notifications')
      .select('*', { count: 'exact' })
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (isRead !== null) {
      query = query.eq('is_read', isRead === 'true');
    }

    query = query.limit(limit);

    const { data, count, error } = await query;

    if (error) throw error;

    return NextResponse.json({
      notifications: data || [],
      total: count || 0,
    });
  } catch (error) {
    console.error('Fetch notifications error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch notifications' },
      { status: 500 }
    );
  }
}
