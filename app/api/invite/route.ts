import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { Resend } from 'resend';
import InvitationEmail from '@/emails/InvitationEmail';

const resend = new Resend(process.env.RESEND_API_KEY);

// *** CHANGE 1: Use SERVICE_ROLE_KEY to bypass RLS errors ***
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY! // Ensure this is in your .env.local
);

export async function POST(req: Request) {
  try {
    const { email, role, invitedByEmail } = await req.json();
    const token = crypto.randomUUID();

    // *** CHANGE 2: Use supabaseAdmin instead of standard client ***
    const { error: dbError } = await supabaseAdmin.from('invitations').insert({
      email,
      role,
      token,
      invited_by: null // Service role doesn't have a user session, which is fine here
    });

    if (dbError) throw new Error(dbError.message);

    const { error: emailError } = await resend.emails.send({
      from: 'NextPrep Admin <admin@nextprepbd.com>',
      to: email,
      subject: `You have been invited to join NextPrepBD`,
      react: InvitationEmail({ token, role, inviterName: invitedByEmail }),
    });

    if (emailError) throw new Error(emailError.message);

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}