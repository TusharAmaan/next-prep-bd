import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseClient'; // Ensure this path matches your setup
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, email, subject, message } = body;

    // 1. Save to Supabase Database
    const { error: dbError } = await supabase
      .from('messages')
      .insert([{ name, email, subject, message }]);

    if (dbError) {
      return NextResponse.json({ error: dbError.message }, { status: 500 });
    }

    // 2. Send Email Notification to YOU
    const { data, error: emailError } = await resend.emails.send({
      from: 'NextPrepBD Contact <onboarding@resend.dev>', // Use this until you verify your domain
      to: ['support@nextprepbd.com'], // The email receiving the message
      replyTo: email, // So you can hit "Reply" and email the student directly
      subject: `New Message: ${subject}`,
      html: `
        <h2>New Contact Form Submission</h2>
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Subject:</strong> ${subject}</p>
        <br/>
        <p><strong>Message:</strong></p>
        <p style="background: #f3f4f6; padding: 15px; border-radius: 5px;">${message}</p>
      `,
    });

    if (emailError) {
      console.error("Email failed:", emailError);
      // We don't fail the request if email fails, as long as DB saved it.
    }

    return NextResponse.json({ success: true });

  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}