import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: Request) {
  try {
    const { email } = await req.json();

    // 1. Generate the Password Reset Link (Securely)
    const { data, error } = await supabaseAdmin.auth.admin.generateLink({
      type: 'recovery',
      email: email,
      options: {
        // Redirect user to your update password page
        redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/update-password` 
      }
    });

    if (error) throw error;

    // 2. Send the Link via Resend
    // This guarantees the email lands in the inbox (unlike default Supabase SMTP)
    const actionLink = data.properties.action_link;

    await resend.emails.send({
      from: 'NextPrep Admin <admin@nextprepbd.com>', // Ensure this matches your verified domain
      to: email,
      subject: 'Reset Your Password',
      html: `
        <h2>Password Reset Request</h2>
        <p>You (or an administrator) requested a password reset for your NextPrepBD account.</p>
        <p>Click the button below to set a new password:</p>
        <a href="${actionLink}" style="background-color: #4F46E5; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">
          Reset Password
        </a>
        <p style="margin-top: 20px; color: #666; font-size: 12px;">If you didn't ask for this, you can ignore this email.</p>
      `,
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}