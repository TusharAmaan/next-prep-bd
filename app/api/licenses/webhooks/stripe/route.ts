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

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET || '';

export async function POST(request: NextRequest) {
  try {
    const body = await request.text();
    const signature = request.headers.get('stripe-signature') || '';

    // Verify webhook signature
    let event: Stripe.Event;
    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
    } catch (error: any) {
      console.error('Webhook signature verification failed:', error.message);
      return NextResponse.json(
        { error: 'Invalid signature' },
        { status: 400 }
      );
    }

    // Handle different event types
    switch (event.type) {
      case 'checkout.session.completed':
        await handleCheckoutCompleted(event.data.object as Stripe.Checkout.Session);
        break;

      case 'customer.subscription.updated':
        await handleSubscriptionUpdated(event.data.object as Stripe.Subscription);
        break;

      case 'customer.subscription.deleted':
        await handleSubscriptionDeleted(event.data.object as Stripe.Subscription);
        break;

      case 'invoice.payment_succeeded':
        await handleInvoicePaymentSucceeded(event.data.object as Stripe.Invoice);
        break;

      case 'invoice.payment_failed':
        await handleInvoicePaymentFailed(event.data.object as Stripe.Invoice);
        break;

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Webhook error:', error);
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    );
  }
}

// Handle successful checkout
async function handleCheckoutCompleted(session: Stripe.Checkout.Session) {
  try {
    const metadata = session.metadata || {};
    const userId = metadata.userId;
    const licenseType = metadata.licenseType;
    const subscriptionId = session.subscription as string;

    if (!userId || !licenseType) {
      console.error('Missing userId or licenseType in metadata');
      return;
    }

    // Get license type pricing
    const LICENSE_TYPES: Record<string, { maxUsers: number; expiresAt: Date }> = {
      personal: {
        maxUsers: 1,
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      },
      team: {
        maxUsers: 5,
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      },
      institution: {
        maxUsers: 100,
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      },
    };

    const licenseConfig = LICENSE_TYPES[licenseType];
    if (!licenseConfig) {
      console.error('Invalid license type:', licenseType);
      return;
    }

    // Create or update license
    const { data: existingLicense } = await supabase
      .from('licenses')
      .select('id')
      .eq('owner_id', userId)
      .eq('type', licenseType)
      .single();

    if (existingLicense) {
      // Update existing license
      await supabase
        .from('licenses')
        .update({
          stripe_subscription_id: subscriptionId,
          expires_at: licenseConfig.expiresAt.toISOString(),
          status: 'active',
          updated_at: new Date().toISOString(),
        })
        .eq('id', existingLicense.id);
    } else {
      // Create new license
      const { data: newLicense, error } = await supabase
        .from('licenses')
        .insert({
          owner_id: userId,
          type: licenseType,
          max_users: licenseConfig.maxUsers,
          stripe_subscription_id: subscriptionId,
          expires_at: licenseConfig.expiresAt.toISOString(),
          status: 'active',
          purchased_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (error) {
        console.error('Error creating license:', error);
        return;
      }

      // Add owner as first member
      await supabase.from('license_members').insert({
        license_id: newLicense.id,
        user_id: userId,
        role: 'admin',
        added_at: new Date().toISOString(),
      });
    }

    console.log(`License created/updated for user ${userId}`);
  } catch (error) {
    console.error('Error handling checkout completion:', error);
  }
}

// Handle subscription updated
async function handleSubscriptionUpdated(subscription: Stripe.Subscription) {
  try {
    const subscriptionId = subscription.id;
    const customerId = subscription.customer as string;

    // Find license and update
    const { data: license } = await supabase
      .from('licenses')
      .select('id')
      .eq('stripe_subscription_id', subscriptionId)
      .single();

    if (!license) {
      console.log('License not found for subscription:', subscriptionId);
      return;
    }

    const status = subscription.status === 'active' ? 'active' : 'suspended';

    // Calculate new expiry date
    const expiryDate = new Date(subscription.current_period_end * 1000);

    await supabase
      .from('licenses')
      .update({
        status: status as 'active' | 'suspended' | 'expired',
        expires_at: expiryDate.toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('id', license.id);

    console.log(`License updated: ${license.id}`);
  } catch (error) {
    console.error('Error handling subscription update:', error);
  }
}

// Handle subscription cancelled
async function handleSubscriptionDeleted(subscription: Stripe.Subscription) {
  try {
    const subscriptionId = subscription.id;

    // Find license and mark as expired
    const { data: license } = await supabase
      .from('licenses')
      .select('id')
      .eq('stripe_subscription_id', subscriptionId)
      .single();

    if (!license) {
      console.log('License not found for subscription:', subscriptionId);
      return;
    }

    await supabase
      .from('licenses')
      .update({
        status: 'expired',
        updated_at: new Date().toISOString(),
      })
      .eq('id', license.id);

    console.log(`License marked as expired: ${license.id}`);
  } catch (error) {
    console.error('Error handling subscription deletion:', error);
  }
}

// Handle invoice payment succeeded
async function handleInvoicePaymentSucceeded(invoice: Stripe.Invoice) {
  try {
    console.log(`Payment succeeded for invoice: ${invoice.id}`);
    // Additional logic for payment success if needed
  } catch (error) {
    console.error('Error handling invoice payment success:', error);
  }
}

// Handle invoice payment failed
async function handleInvoicePaymentFailed(invoice: Stripe.Invoice) {
  try {
    console.log(`Payment failed for invoice: ${invoice.id}`);
    // Additional logic for payment failure if needed
  } catch (error) {
    console.error('Error handling invoice payment failure:', error);
  }
}
