import { NextRequest, NextResponse } from 'next/server';
import { calculateRegionalPrice, formatPrice, validatePaymentAmount, getAvailablePaymentGateways, recommendPaymentGateway } from '@/lib/regionalPaymentUtils';

export async function GET(request: NextRequest) {
  try {
    const countryCode = request.nextUrl.searchParams.get('country') || 'US';
    const action = request.nextUrl.searchParams.get('action') || 'pricing';

    if (action === 'pricing') {
      const licensePlan = request.nextUrl.searchParams.get('plan') || 'personal';
      const quantity = parseInt(request.nextUrl.searchParams.get('quantity') || '1');

      if (!['personal', 'team', 'institution'].includes(licensePlan)) {
        return NextResponse.json(
          { error: 'Invalid license plan' },
          { status: 400 }
        );
      }

      const pricing = calculateRegionalPrice(
        licensePlan as 'personal' | 'team' | 'institution',
        countryCode,
        quantity
      );

      return NextResponse.json({
        plan: licensePlan,
        country: countryCode,
        pricing,
        formattedTotal: formatPrice(pricing.total, countryCode),
      });
    }

    if (action === 'gateways') {
      const gateways = getAvailablePaymentGateways(countryCode);
      return NextResponse.json({
        country: countryCode,
        availableGateways: gateways,
      });
    }

    if (action === 'recommend') {
      const amount = parseFloat(request.nextUrl.searchParams.get('amount') || '0');
      const userType = request.nextUrl.searchParams.get('userType') || 'individual';

      const recommended = recommendPaymentGateway(
        countryCode,
        amount,
        userType as 'individual' | 'business'
      );

      return NextResponse.json({
        country: countryCode,
        amount,
        recommendedGateway: recommended,
      });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error: any) {
    console.error('Regional pricing error:', error);
    return NextResponse.json(
      { error: error?.message || 'Failed to fetch regional pricing' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { countryCode, amount, gatewayId, action } = body;

    if (!countryCode || !amount) {
      return NextResponse.json(
        { error: 'countryCode and amount required' },
        { status: 400 }
      );
    }

    if (action === 'validate') {
      const validation = validatePaymentAmount(amount, countryCode, gatewayId);

      if (!validation.valid) {
        return NextResponse.json(
          { valid: false, error: validation.error },
          { status: 400 }
        );
      }

      return NextResponse.json({ valid: true });
    }

    if (action === 'quote') {
      const licensePlan = body.plan || 'personal';
      const quantity = body.quantity || 1;

      const pricing = calculateRegionalPrice(
        licensePlan as 'personal' | 'team' | 'institution',
        countryCode,
        quantity
      );

      // Validate the amount
      const validation = validatePaymentAmount(pricing.total, countryCode, gatewayId);

      return NextResponse.json({
        quote: pricing,
        formattedTotal: formatPrice(pricing.total, countryCode),
        valid: validation.valid,
        error: validation.error,
      });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error: any) {
    console.error('Regional payment error:', error);
    return NextResponse.json(
      { error: error?.message || 'Payment processing failed' },
      { status: 500 }
    );
  }
}
