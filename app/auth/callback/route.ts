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

    const { data: { session }, error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error && session) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('role, status')
        .eq('id', session.user.id)
        .single();

      // --- SCENARIO: NO ACCOUNT FOUND (New Google User) ---
      if (!profile) {
        const googleEmail = session.user.email;
        // Sign out immediately so they can sign up fresh
        await supabase.auth.signOut();
        // Redirect to Signup with Email Pre-filled and Alert
        return NextResponse.redirect(`${origin}/signup?alert=no_account&email=${googleEmail}`);
      }

      // --- SCENARIO: EXISTING USER ---
      if (profile.status === 'pending') return NextResponse.redirect(`${origin}/verification-pending`);
      if (profile.role === 'student' || profile.role === 'tutor') return NextResponse.redirect(`${origin}/`);
      return NextResponse.redirect(`${origin}/admin`);
    }
  }

  return NextResponse.redirect(`${origin}/login?error=AuthFailed`);
}