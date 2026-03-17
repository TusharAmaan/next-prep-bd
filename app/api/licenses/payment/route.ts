import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2023-10-16',
});

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
);

const LICENSE_PRICING: Record<string, number> = {
  personal: 999, // BDT per month
  team: 4999,
  institution: 49999,
};

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, licenseType, action } = body;

    if (!userId || !licenseType || !LICENSE_PRICING[licenseType]) {
      return NextResponse.json(
        { error: 'Invalid params' },
        { status: 400 }
      );
    }

    if (action === 'create-checkout') {
      // Get or create Stripe customer
      const { data: userProfile } = await supabase
        .from('profiles')
        .select('email, stripe_customer_id')
        .eq('id', userId)
        .single();

      if (!userProfile) {
        return NextResponse.json(
          { error: 'User not found' },
          { status: 404 }
        );
      }

      let customerId = userProfile.stripe_customer_id;

      if (!customerId) {
        const customer = await stripe.customers.create({
          email: userProfile.email,
          metadata: { userId: userId },
        });
        customerId = customer.id;

        // Save customer ID
        await supabase
          .from('profiles')
          .update({ stripe_customer_id: customerId })
          .eq('id', userId);
      }

      // Create checkout session
      const session = await stripe.checkout.sessions.create({
        customer: customerId,
        billing_address_collection: 'required',
        line_items: [
          {
            price_data: {
              currency: 'bdt',
              product_data: {
                name: `${licenseType.charAt(0).toUpperCase() + licenseType.slice(1)} License`,
                description: `Monthly ${licenseType} license`,
              },
              unit_amount: LICENSE_PRICING[licenseType] * 100, // Convert to cents
              recurring: {
                interval: 'month',
                interval_count: 1,
              },
            },
            quantity: 1,
          },
        ],
        mode: 'subscription',
        success_url: `${process.env.NEXT_PUBLIC_APP_URL}/license-success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/license-purchase?plan=${licenseType}`,
        metadata: {
          userId: userId,
          licenseType: licenseType,
        },
      });

      return NextResponse.json({ sessionId: session.id });
    }

    if (action === 'retrieve-session') {
      const { sessionId } = body;

      if (!sessionId) {
        return NextResponse.json(
          { error: 'sessionId required' },
          { status: 400 }
        );
      }

      const session = await stripe.checkout.sessions.retrieve(sessionId);

      return NextResponse.json({
        status: session.payment_status,
        subscription: session.subscription,
      });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error: any) {
    console.error('Payment error:', error);
    return NextResponse.json(
      { error: error?.message || 'Payment processing failed' },
      { status: 500 }
    );
  }
}
