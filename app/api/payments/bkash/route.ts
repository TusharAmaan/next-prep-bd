import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';

// bKash payment processing
export async function POST(request: NextRequest) {
  try {
    const { action, payload } = await request.json();

    if (action === 'initiate-payment') {
      return await initiatePayment(payload);
    }

    if (action === 'verify-payment') {
      return await verifyPayment(payload);
    }

    if (action === 'refund') {
      return await initiateRefund(payload);
    }

    return NextResponse.json(
      { error: 'Invalid action' },
      { status: 400 }
    );
  } catch (error: any) {
    console.error('bKash payment error:', error);
    return NextResponse.json(
      { error: error?.message || 'Payment processing failed' },
      { status: 500 }
    );
  }
}

async function initiatePayment(payload: any) {
  try {
    const {
      amount,
      orderId,
      customerName,
      customerEmail,
      customerPhone,
      referenceId,
    } = payload;

    const bkashApiUrl = process.env.BKASH_API_URL || 'https://checkout.sandbox.bka.sh/api/checkout/page';
    const merchantId = process.env.BKASH_MERCHANT_ID;
    const token = await getBkashToken();

    const requestBody = {
      mode: '0011',
      payerReference: referenceId,
      callbackURL: `${process.env.NEXT_PUBLIC_APP_URL}/api/payments/bkash/callback`,
      amount,
      orderId,
      currency: 'BDT',
      intent: 'sale',
      merchantInvoiceNumber: `INV-${orderId}-${Date.now()}`,
      merchantAssignedCustomerMsisdn: customerPhone,
    };

    const response = await fetch(`${bkashApiUrl}/create`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
        'X-App-Key': process.env.BKASH_APP_KEY || '',
      },
      body: JSON.stringify(requestBody),
    });

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(
        { error: data.statusMessage || 'Failed to initiate payment' },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      paymentId: data.paymentID,
      redirectUrl: data.bkashURL,
      status: data.status,
    });
  } catch (error: any) {
    console.error('bKash initiate error:', error);
    return NextResponse.json(
      { error: error?.message || 'Failed to initiate payment' },
      { status: 500 }
    );
  }
}

async function verifyPayment(payload: any) {
  try {
    const { paymentId, transactionId } = payload;

    const token = await getBkashToken();
    const response = await fetch(
      `${process.env.BKASH_API_URL}/execute`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
          'X-App-Key': process.env.BKASH_APP_KEY || '',
        },
        body: JSON.stringify({ paymentID: paymentId }),
      }
    );

    const data = await response.json();

    if (!response.ok || data.statusCode !== '0000') {
      return NextResponse.json(
        { error: data.statusMessage || 'Payment verification failed' },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      transactionId: data.trxID,
      amount: data.amount,
      status: data.status,
      paidAt: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error('bKash verify error:', error);
    return NextResponse.json(
      { error: error?.message || 'Payment verification failed' },
      { status: 500 }
    );
  }
}

async function initiateRefund(payload: any) {
  try {
    const { transactionId, amount, reason } = payload;

    const token = await getBkashToken();
    const response = await fetch(
      `${process.env.BKASH_API_URL}/refund`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
          'X-App-Key': process.env.BKASH_APP_KEY || '',
        },
        body: JSON.stringify({
          trxID: transactionId,
          amount,
          reason,
          sku: 'REFUND',
        }),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(
        { error: data.statusMessage || 'Refund failed' },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      refundId: data.refundTrxID,
      status: data.status,
      refundedAt: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error('bKash refund error:', error);
    return NextResponse.json(
      { error: error?.message || 'Refund processing failed' },
      { status: 500 }
    );
  }
}

/**
 * Get bKash access token
 */
async function getBkashToken(): Promise<string> {
  try {
    const response = await fetch(
      `${process.env.BKASH_API_URL}/token/grant`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          app_key: process.env.BKASH_APP_KEY || '',
          app_secret: process.env.BKASH_APP_SECRET || '',
        }).toString(),
      }
    );

    const data = await response.json();
    return data.id_token;
  } catch (error) {
    console.error('Failed to get bKash token:', error);
    throw error;
  }
}

/**
 * Callback handler for bKash payments
 */
export async function GET(request: NextRequest) {
  try {
    const paymentId = request.nextUrl.searchParams.get('paymentID');
    const status = request.nextUrl.searchParams.get('status');

    if (!paymentId) {
      return NextResponse.json(
        { error: 'Payment ID required' },
        { status: 400 }
      );
    }

    // Redirect with payment info
    const callbackUrl = new URL(
      '/payment-callback',
      process.env.NEXT_PUBLIC_APP_URL
    );
    callbackUrl.searchParams.set('gateway', 'bkash');
    callbackUrl.searchParams.set('paymentId', paymentId);
    callbackUrl.searchParams.set('status', status || 'UNKNOWN');

    return NextResponse.redirect(callbackUrl);
  } catch (error: any) {
    console.error('bKash callback error:', error);
    return NextResponse.json(
      { error: error?.message || 'Callback processing failed' },
      { status: 500 }
    );
  }
}
