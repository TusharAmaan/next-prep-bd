import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { createClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');

  if (code) {
    const cookieStore = await cookies();

    // 1. Standard Client (for checking session)
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

    // 2. Admin Client (for DELETING the stub user)
    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY! // Ensure this is in your .env.local
    );

    const { data: { session }, error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error && session) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('role, status')
        .eq('id', session.user.id)
        .single();

      // --- SCENARIO: NO PROFILE FOUND (New Google User) ---
      if (!profile) {
        const googleEmail = session.user.email;
        const userId = session.user.id;

        // CRITICAL FIX: Delete the "Stub" Google User.
        // This frees up the email so they can sign up manually on the next page.
        await supabaseAdmin.auth.admin.deleteUser(userId);
        
        // Sign out from the browser side too
        await supabase.auth.signOut();

        // Redirect to Signup with Email Pre-filled
        return NextResponse.redirect(`${origin}/signup?alert=no_account&email=${googleEmail}`);
      }

      // --- EXISTING USER LOGIC ---
      if (profile.status === 'pending') return NextResponse.redirect(`${origin}/verification-pending`);
      
      // Redirect Students/Tutors to Home, Others to Admin
      if (profile.role === 'student' || profile.role === 'tutor') {
        return NextResponse.redirect(`${origin}/`);
      } else {
        return NextResponse.redirect(`${origin}/admin`);
      }
    }
  }

  return NextResponse.redirect(`${origin}/login?error=AuthFailed`);
}