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

    // 1. Determine the Base URL (Production vs Local)
    // PRIORITIZE: The explicit Env Var > Vercel URL > Hardcoded Production > Localhost
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL 
      || (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : null) 
      || 'https://nextprepbd.com'; // <--- REPLACE THIS with your actual domain if different

    console.log("Generating reset link for:", siteUrl);

    // 2. Generate the Password Reset Link
    const { data, error } = await supabaseAdmin.auth.admin.generateLink({
      type: 'recovery',
      email: email,
      options: {
        // This ensures the user comes back to the correct live page
        redirectTo: `${siteUrl}/update-password` 
      }
    });

    if (error) throw error;

    // 3. Send via Resend
    const actionLink = data.properties.action_link;

    await resend.emails.send({
      from: 'NextPrep Admin <admin@nextprepbd.com>', // Must be your verified domain
      to: email,
      subject: 'Reset Your Password',
      html: `
        <div style="font-family: sans-serif; padding: 20px; color: #333;">
          <h2 style="color: #2563EB;">Password Reset Request</h2>
          <p>You requested to reset your password for <strong>NextPrepBD</strong>.</p>
          <p>Click the button below to set a new password:</p>
          <a href="${actionLink}" style="background-color: #2563EB; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block; margin: 10px 0;">
            Reset Password
          </a>
          <p style="margin-top: 20px; color: #666; font-size: 12px;">If you didn't ask for this, you can safely ignore this email.</p>
          <p style="color: #aaa; font-size: 10px; margin-top: 10px;">Link valid for 24 hours.</p>
        </div>
      `,
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Reset Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}