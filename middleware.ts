import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

// --- 1. RATE LIMIT CONFIG ---
const ipCache = new Map<string, { count: number; lastReset: number }>();
const RATE_LIMIT = 50; // Max requests per user
const WINDOW_MS = 60 * 1000; // 1 Minute

export async function middleware(request: NextRequest) {
  
  // --- LAYER 1: RATE LIMITING (Existing) ---
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

  // --- LAYER 2: SUPABASE SETUP ---
  let response = NextResponse.next({
    request: { headers: request.headers },
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

  // 1. Get the User
  const { data: { user } } = await supabase.auth.getUser()

  // --- LAYER 3: ROUTE & ROLE PROTECTION (Updated) ---
  
  const path = request.nextUrl.pathname;
  const isAdminRoute = path.startsWith('/admin');
  const isTutorRoute = path.startsWith('/tutor');
  const isAuthRoute = path.startsWith('/login') || path.startsWith('/register');

  // A. Protect Private Routes (Admin/Tutor)
  if ((isAdminRoute || isTutorRoute) && !user) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  // B. Role-Based Access Control (RBAC)
  if (user) {
    // Fetch Role from Metadata or DB (DB is safer for critical checks)
    let role = user.user_metadata?.role;
    
    // If role isn't in metadata, fetch it securely from profiles
    if (!role) {
       const { data: profile } = await supabase
         .from('profiles')
         .select('role')
         .eq('id', user.id)
         .single();
       role = profile?.role;
    }

    // Rule 1: Admin Dashboard -> Only 'admin'
    if (isAdminRoute && role !== 'admin') {
      // Kick unauthorized users to student dashboard
      return NextResponse.redirect(new URL('/student/dashboard', request.url)); 
    }

    // Rule 2: Tutor Dashboard -> 'tutor' OR 'admin'
    if (isTutorRoute && role !== 'tutor' && role !== 'admin') {
      return NextResponse.redirect(new URL('/student/dashboard', request.url));
    }

    // Rule 3: Smart Login Redirect
    // If logged in & accessing /login, send to their correct dashboard
    if (isAuthRoute) {
        if (role === 'admin') return NextResponse.redirect(new URL('/admin', request.url));
        if (role === 'tutor') return NextResponse.redirect(new URL('/tutor/dashboard', request.url));
        return NextResponse.redirect(new URL('/student/dashboard', request.url));
    }
  }

  return response
}

export const config = {
  matcher: [
    // Include /tutor in the matcher now
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}