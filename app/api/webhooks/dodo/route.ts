import { NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { createClient } from '@supabase/supabase-js'; // Use admin client to bypass RLS
import { Webhook } from 'standardwebhooks';

// Initialize Admin Supabase Client (Service Role Key required)
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: Request) {
  const payload = await req.text();
  const headersList = await headers();
  const sig = headersList.get('webhook-signature') || '';
  const webhookId = headersList.get('webhook-id') || '';
  const timestamp = headersList.get('webhook-timestamp') || '';

  // 1. Verify Webhook Signature
  const wh = new Webhook(process.env.DODO_WEBHOOK_SECRET!);
  try {
    wh.verify(payload, {
        "webhook-id": webhookId,
        "webhook-signature": sig,
        "webhook-timestamp": timestamp
    });
  } catch (err) {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
  }

  const event = JSON.parse(payload);

  // 2. Handle Successful Payment
  if (event.type === 'payment.succeeded') {
    const { metadata, total_amount, currency } = event.data;
    const userId = metadata.user_id;
    const planType = metadata.plan_type; // 'pro_monthly' or 'pro_yearly'

    // A. Log Transaction
    await supabaseAdmin.from('transactions').insert({
      user_id: userId,
      amount: total_amount / 100, // Dodo usually sends cents
      currency: currency,
      payment_method: 'dodo',
      transaction_id: event.data.payment_id,
      plan_type: planType,
      status: 'approved' // Auto-approved
    });

    // B. Update Profile Subscription
    const expiryDate = new Date();
    expiryDate.setDate(expiryDate.getDate() + (planType === 'pro_monthly' ? 30 : 365));

    await supabaseAdmin.from('profiles').update({
      subscription_plan: 'pro',
      subscription_status: 'active',
      subscription_expiry: expiryDate.toISOString(),
      max_questions: 10000 // Unlimited limit
    }).eq('id', userId);
  }

  return NextResponse.json({ received: true });
}