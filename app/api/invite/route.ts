import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { Resend } from 'resend';
import InvitationEmail from '@/emails/InvitationEmail';

const resend = new Resend(process.env.RESEND_API_KEY);
// Note: We use Service Role Key here to bypass RLS for sending emails if needed, 
// but standard client works if your RLS policies are correct (which they are).
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);

export async function POST(req: Request) {
  try {
    const { email, role, invitedByEmail } = await req.json();

    // 1. Generate Token
    const token = crypto.randomUUID();

    // 2. Insert into DB (RLS will fail here if user is not Admin)
    const { error: dbError } = await supabase.from('invitations').insert({
      email,
      role,
      token,
      // invited_by is handled by RLS 'default' usually, or passed from client
    });

    if (dbError) throw new Error(dbError.message);

    // 3. Send Email
    const { data, error: emailError } = await resend.emails.send({
      from: 'NextPrep Admin <onboarding@resend.dev>', // Update this if you have a custom domain
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