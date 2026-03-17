import { NextRequest, NextResponse } from 'next/server';
import {
  getAffiliateProfile,
  createAffiliateAccount,
  getAffiliateByCode,
  getAffiliateStats,
  getAffiliateEarnings,
  requestPayout,
  createReferral,
  getTopAffiliates,
  generateReferralCode,
  generateReferralLink,
} from '@/lib/affiliateUtils';

export async function GET(request: NextRequest) {
  try {
    const userId = request.nextUrl.searchParams.get('userId');
    const action = request.nextUrl.searchParams.get('action') || 'profile';
    const code = request.nextUrl.searchParams.get('code');

    if (action === 'profile' && userId) {
      const profile = await getAffiliateProfile(userId);

      if (!profile) {
        return NextResponse.json(
          { error: 'Affiliate profile not found' },
          { status: 404 }
        );
      }

      const stats = await getAffiliateStats(profile.id);
      const earnings = await getAffiliateEarnings(profile.id);

      return NextResponse.json({
        profile,
        stats,
        earnings,
      });
    }

    if (action === 'affiliate-by-code' && code) {
      const affiliate = await getAffiliateByCode(code);

      if (!affiliate) {
        return NextResponse.json(
          { error: 'Affiliate not found' },
          { status: 404 }
        );
      }

      return NextResponse.json({ affiliate });
    }

    if (action === 'top-affiliates') {
      const limit = parseInt(request.nextUrl.searchParams.get('limit') || '10');
      const topAffiliates = await getTopAffiliates(limit);

      return NextResponse.json({ affiliates: topAffiliates });
    }

    if (action === 'leaderboard') {
      // This would call getAffiliateLeaderboard from utils
      return NextResponse.json({ affiliates: [] });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error: any) {
    console.error('Affiliate API error:', error);
    return NextResponse.json(
      { error: error?.message || 'Failed to fetch affiliate data' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, action } = body;

    if (!userId) {
      return NextResponse.json(
        { error: 'userId required' },
        { status: 400 }
      );
    }

    if (action === 'create-account') {
      // Check if affiliate already exists
      const existing = await getAffiliateProfile(userId);

      if (existing) {
        return NextResponse.json(
          { error: 'Affiliate account already exists' },
          { status: 400 }
        );
      }

      const affiliate = await createAffiliateAccount(userId, body);

      return NextResponse.json({
        success: true,
        affiliate,
        message: 'Affiliate account created successfully',
      });
    }

    if (action === 'create-referral') {
      const { referralCode, referredUserId, licenseType } = body;

      if (!referralCode || !referredUserId || !licenseType) {
        return NextResponse.json(
          { error: 'Missing required fields' },
          { status: 400 }
        );
      }

      const referral = await createReferral(
        referralCode,
        referredUserId,
        licenseType
      );

      return NextResponse.json({
        success: true,
        referral,
      });
    }

    if (action === 'request-payout') {
      const { amount, method, details } = body;

      if (!amount || !method) {
        return NextResponse.json(
          { error: 'Missing required fields' },
          { status: 400 }
        );
      }

      const profile = await getAffiliateProfile(userId);

      if (!profile) {
        return NextResponse.json(
          { error: 'Affiliate profile not found' },
          { status: 404 }
        );
      }

      const payout = await requestPayout(
        profile.id,
        amount,
        method,
        details
      );

      return NextResponse.json({
        success: true,
        payout,
        message: 'Payout request submitted successfully',
      });
    }

    if (action === 'generate-link') {
      const { customSlug } = body;

      const profile = await getAffiliateProfile(userId);

      if (!profile) {
        return NextResponse.json(
          { error: 'Affiliate profile not found' },
          { status: 404 }
        );
      }

      const links = generateReferralLink(profile.referralCode, customSlug);

      return NextResponse.json({
        success: true,
        links,
      });
    }

    if (action === 'update-payout-method') {
      const { method, details } = body;

      // Update would happen in database
      // This is placeholder for actual implementation

      return NextResponse.json({
        success: true,
        message: 'Payout method updated',
      });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error: any) {
    console.error('Affiliate API error:', error);
    return NextResponse.json(
      { error: error?.message || 'Action failed' },
      { status: 500 }
    );
  }
}
