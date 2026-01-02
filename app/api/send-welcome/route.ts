import { WelcomeTemplate } from '@/components/emails/WelcomeTemplate';
import { Resend } from 'resend';
import { NextResponse } from 'next/server';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: Request) {
  try {
    const { email, name } = await request.json();

    const data = await resend.emails.send({
      from: 'NextPrepBD <onboarding@resend.dev>', // If you have a custom domain, use hello@nextprepbd.com
      to: [email],
      subject: 'Welcome to NextPrepBD! 🚀',
      react: WelcomeTemplate({ userFirstname: name }),
    });

    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error }, { status: 500 });
  }
}