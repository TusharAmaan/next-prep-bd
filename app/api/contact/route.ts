import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseClient'; 
import { Resend } from 'resend';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, email, subject, message } = body;

    // 1. Save to Supabase (Always works)
    const { error: dbError } = await supabase
      .from('messages')
      .insert([{ name, email, subject, message }]);

    if (dbError) {
      return NextResponse.json({ error: dbError.message }, { status: 500 });
    }

    // 2. Send Email (Only if Key exists)
    const apiKey = process.env.RESEND_API_KEY;
    
    if (apiKey) {
      const resend = new Resend(apiKey);
      
      await resend.emails.send({
        from: 'NextPrepBD Contact <onboarding@resend.dev>',
        to: ['support@nextprepbd.com'], 
        replyTo: email,
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
    } else {
      console.warn("RESEND_API_KEY is missing. Email not sent, but message saved to DB.");
    }

    return NextResponse.json({ success: true });

  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}