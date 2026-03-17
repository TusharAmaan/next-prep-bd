import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
);

// In-memory store for active connections (in production, use Redis)
const activeConnections = new Map<string, ReadableStreamDefaultController>();

export async function GET(request: NextRequest) {
  try {
    const userId = request.nextUrl.searchParams.get('userId') || 'anonymous';

    const stream = new ReadableStream({
      start(controller) {
        // Store the connection
        activeConnections.set(userId, controller);
        console.log(`User ${userId} connected to notifications`);

        // Send keepalive every 30 seconds
        const keepaliveInterval = setInterval(() => {
          try {
            controller.enqueue(`data: ${JSON.stringify({ type: 'keepalive' })}\n\n`);
          } catch (error) {
            clearInterval(keepaliveInterval);
            activeConnections.delete(userId);
          }
        }, 30000);

        // Cleanup on disconnect
        const originalReturn = controller.close.bind(controller);
        controller.close = function () {
          clearInterval(keepaliveInterval);
          activeConnections.delete(userId);
          console.log(`User ${userId} disconnected`);
          originalReturn();
        };
      },
    });

    return new NextResponse(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
        'X-Accel-Buffering': 'no',
      },
    });
  } catch (error) {
    console.error('Stream error:', error);
    return NextResponse.json({ error: 'Stream failed' }, { status: 500 });
  }
}

// Export for use in other files
export function getActiveConnections() {
  return activeConnections;
}
