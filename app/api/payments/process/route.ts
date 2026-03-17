import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import Stripe from 'stripe';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
);

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2023-10-16',
});

interface PaymentRequest {
  userId: string;
  amount: number; // in BDT
  currency: 'BDT' | 'USD';
  method: 'bkash' | 'nagad' | 'rocket' | 'stripe';
  description: string;
  courseId?: string;
  subscriptionPlan?: string;
}

export async function POST(request: NextRequest) {
  try {
    const body: PaymentRequest = await request.json();
    const { userId, amount, currency, method, description, courseId, subscriptionPlan } = body;

    if (!userId || !amount || !method) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Create payment record
    const { data: payment, error: createError } = await supabase
      .from('transactions')
      .insert({
        user_id: userId,
        amount,
        currency,
        payment_method: method,
        description,
        course_id: courseId,
        subscription_plan: subscriptionPlan,
        status: 'pending',
        created_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (createError) throw createError;

    let paymentResponse: any;

    switch (method) {
      case 'bkash':
        paymentResponse = await initiateBKashPayment(amount, payment.id, userId);
        break;
      case 'nagad':
        paymentResponse = await initiateNagadPayment(amount, payment.id, userId);
        break;
      case 'rocket':
        paymentResponse = await initiateRocketPayment(amount, payment.id, userId);
        break;
      case 'stripe':
        paymentResponse = await initiateStripePayment(amount, payment.id);
        break;
      default:
        return NextResponse.json({ error: 'Invalid payment method' }, { status: 400 });
    }

    // Update payment with provider reference
    await supabase
      .from('transactions')
      .update({ payment_provider_ref: paymentResponse.reference })
      .eq('id', payment.id);

    return NextResponse.json({
      success: true,
      paymentId: payment.id,
      ...paymentResponse,
    });
  } catch (error) {
    console.error('Payment error:', error);
    return NextResponse.json(
      { error: 'Payment initiation failed' },
      { status: 500 }
    );
  }
}

async function initiateBKashPayment(
  amount: number,
  paymentId: string,
  userId: string
): Promise<any> {
  // Mock implementation - replace with actual bKash API
  const bkashToken = await getBKashToken();

  return {
    reference: `BKASH_${paymentId}`,
    paymentURL: `https://checkout.bkash.com/payment/${paymentId}`,
    method: 'bkash',
    amount,
    status: 'initiated',
    message: 'Redirecting to bKash payment gateway',
  };
}

async function initiateNagadPayment(
  amount: number,
  paymentId: string,
  userId: string
): Promise<any> {
  // Mock implementation - replace with actual Nagad API
  return {
    reference: `NAGAD_${paymentId}`,
    paymentURL: `https://api.nagad.com.bd/pay/${paymentId}`,
    method: 'nagad',
    amount,
    status: 'initiated',
    message: 'Redirecting to Nagad payment gateway',
  };
}

async function initiateRocketPayment(
  amount: number,
  paymentId: string,
  userId: string
): Promise<any> {
  // Mock implementation - replace with actual Rocket API
  return {
    reference: `ROCKET_${paymentId}`,
    paymentURL: `https://api.rocket.com.bd/initiate/${paymentId}`,
    method: 'rocket',
    amount,
    status: 'initiated',
    message: 'Redirecting to Rocket payment gateway',
  };
}

async function initiateStripePayment(amount: number, paymentId: string): Promise<any> {
  try {
    // Convert BDT to USD if needed (1 USD = ~110 BDT)
    const amountInCents = Math.round((amount / 110) * 100);

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: 'NextPrepBD Course/Subscription',
            },
            unit_amount: amountInCents,
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/payment/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/payment/cancel`,
      metadata: {
        paymentId,
      },
    });

    return {
      reference: session.id,
      paymentURL: session.url,
      method: 'stripe',
      sessionId: session.id,
      status: 'initiated',
      message: 'Redirecting to Stripe checkout',
    };
  } catch (error) {
    console.error('Stripe error:', error);
    throw error;
  }
}

async function getBKashToken(): Promise<string> {
  // Mock token - implement actual OAuth flow with bKash
  return 'mock_bkash_token';
}

// Verify payment webhook
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { paymentId, status, providerId } = body;

    if (!paymentId || !status) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Update payment status
    const { data: payment, error: updateError } = await supabase
      .from('transactions')
      .update({
        status,
        payment_provider_ref: providerId,
        updated_at: new Date().toISOString(),
      })
      .eq('id', paymentId)
      .select()
      .single();

    if (updateError) throw updateError;

    if (status === 'completed') {
      // Grant course access or activate subscription
      if (payment.course_id) {
        await supabase.from('course_enrollments').insert({
          user_id: payment.user_id,
          course_id: payment.course_id,
          enrolled_at: new Date().toISOString(),
        });
      }

      if (payment.subscription_plan) {
        await supabase
          .from('profiles')
          .update({
            subscription_plan: payment.subscription_plan,
            subscription_expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
          })
          .eq('id', payment.user_id);
      }
    }

    return NextResponse.json({
      success: true,
      message: `Payment marked as ${status}`,
      payment,
    });
  } catch (error) {
    console.error('Verification error:', error);
    return NextResponse.json(
      { error: 'Payment verification failed' },
      { status: 500 }
    );
  }
}
