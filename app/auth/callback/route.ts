import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');

  if (code) {
    const cookieStore = await cookies();

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) { return cookieStore.get(name)?.value; },
          set(name: string, value: string, options: CookieOptions) { cookieStore.set({ name, value, ...options }); },
          remove(name: string, options: CookieOptions) { cookieStore.set({ name, value: '', ...options }); },
        },
      }
    );

    // 1. Exchange Code for Session
    const { data: { session }, error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error && session) {
      // 2. Check if Profile Exists
      const { data: profile } = await supabase
        .from('profiles')
        .select('role, status')
        .eq('id', session.user.id)
        .single();

      // --- SCENARIO: NO ACCOUNT FOUND ---
      if (!profile) {
        // User logged in with Google, but has no profile in our DB.
        // Action: Sign them out immediately and send to Signup.
        await supabase.auth.signOut();
        return NextResponse.redirect(`${origin}/signup?alert=no_account`);
      }

      // --- SCENARIO: PENDING ACCOUNT ---
      if (profile.status === 'pending') {
        return NextResponse.redirect(`${origin}/verification-pending`);
      }

      // --- SCENARIO: EXISTING USER REDIRECTS ---
      // Requirement: Student/Tutor -> Home. Others -> Dashboard.
      if (profile.role === 'student' || profile.role === 'tutor') {
        return NextResponse.redirect(`${origin}/`);
      } else {
        return NextResponse.redirect(`${origin}/admin`);
      }
    }
  }

  return NextResponse.redirect(`${origin}/login?error=AuthFailed`);
}