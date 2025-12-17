import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

// --- 1. RATE LIMIT CONFIG ---
const ipCache = new Map<string, { count: number; lastReset: number }>();
const RATE_LIMIT = 50; // Max requests per user
const WINDOW_MS = 60 * 1000; // 1 Minute

export async function middleware(request: NextRequest) {
  
  // --- LAYER 1: RATE LIMITING ---
  // Only check rate limit for API and Admin routes to keep the site fast
  if (request.nextUrl.pathname.startsWith('/api') || request.nextUrl.pathname.startsWith('/admin')) {
    const ip = request.headers.get('x-forwarded-for') || '127.0.0.1';
    const now = Date.now();
    const record = ipCache.get(ip) || { count: 0, lastReset: now };

    if (now - record.lastReset > WINDOW_MS) {
      record.count = 0;
      record.lastReset = now;
    }

    if (record.count >= RATE_LIMIT) {
      return new NextResponse(
        JSON.stringify({ error: "Too many requests. Please try again later." }),
        { status: 429, headers: { 'Content-Type': 'application/json' } }
      );
    }
    
    record.count += 1;
    ipCache.set(ip, record);
  }

  // --- LAYER 2: SUPABASE AUTHENTICATION ---
  // This part ensures your login cookies are handled correctly
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value
        },
        set(name: string, value: string, options: CookieOptions) {
          request.cookies.set({ name, value, ...options })
          response = NextResponse.next({ request: { headers: request.headers } })
          response.cookies.set({ name, value, ...options })
        },
        remove(name: string, options: CookieOptions) {
          request.cookies.set({ name, value: '', ...options })
          response = NextResponse.next({ request: { headers: request.headers } })
          response.cookies.set({ name, value: '', ...options })
        },
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()

  // --- LAYER 3: ROUTE PROTECTION ---
  
  // 1. If trying to access Admin but NOT logged in -> Go to Login
  if (request.nextUrl.pathname.startsWith('/admin') && !user) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  // 2. If trying to access Login but ALREADY logged in -> Go to Admin
  if (request.nextUrl.pathname.startsWith('/login') && user) {
    return NextResponse.redirect(new URL('/admin', request.url))
  }

  return response
}

export const config = {
  matcher: [
    // Match everything EXCEPT static files (images, fonts, etc.)
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}