import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Use Service Role to bypass security and update roles
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: Request) {
  try {
    const { email, token, userId } = await req.json();

    // 1. Verify the invitation exists
    const { data: invite, error: inviteError } = await supabaseAdmin
      .from('invitations')
      .select('*')
      .eq('email', email)
      .eq('token', token)
      .single();

    if (inviteError || !invite) throw new Error("Invalid or expired invitation.");

    // 2. Update the user's profile with the assigned role
    const { error: updateError } = await supabaseAdmin
      .from('profiles')
      .update({ role: invite.role }) // Apply the role from the invite
      .eq('id', userId);

    if (updateError) throw updateError;

    // 3. Delete the invitation (One-time use)
    await supabaseAdmin.from('invitations').delete().eq('id', invite.id);

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}