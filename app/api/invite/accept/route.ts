import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// ADMIN CLIENT (Bypasses RLS)
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: Request) {
  try {
    const { email, token, userId } = await req.json();

    console.log("Processing Invite for:", email, "Token:", token);

    // 1. Verify invitation (Case Insensitive Email Check)
    const { data: invite, error: inviteError } = await supabaseAdmin
      .from('invitations')
      .select('*')
      .ilike('email', email) // ilike = case insensitive
      .eq('token', token)
      .single();

    if (inviteError || !invite) {
      console.error("Invite not found:", inviteError);
      return NextResponse.json({ error: "Invalid or expired invitation link." }, { status: 400 });
    }

    // 2. Update Role (Force the upgrade)
    const { error: updateError } = await supabaseAdmin
      .from('profiles')
      .update({ role: invite.role })
      .eq('id', userId);

    if (updateError) {
      console.error("Profile update failed:", updateError);
      throw new Error("Failed to assign role.");
    }

    // 3. Delete used invitation
    await supabaseAdmin.from('invitations').delete().eq('id', invite.id);

    return NextResponse.json({ success: true, role: invite.role });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}