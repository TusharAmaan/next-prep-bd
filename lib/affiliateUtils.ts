import { createClient } from '@supabase/supabase-js';
import { AFFILIATE_CONFIG, AFFILIATE_METRICS } from '@/lib/affiliateConfig';
import crypto from 'crypto';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
);

interface AffiliateProfile {
  id: string;
  userId: string;
  status: string;
  tier: string;
  referralCode: string;
  totalReferrals: number;
  totalCommissions: number;
  totalEarnings: number;
  createdAt: string;
}

/**
 * Get affiliate profile
 */
export async function getAffiliateProfile(userId: string): Promise<AffiliateProfile | null> {
  try {
    const { data, error } = await supabase
      .from('affiliates')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error && error.code !== 'PGRST116') {
      throw error;
    }

    return data || null;
  } catch (error) {
    console.error('Error fetching affiliate profile:', error);
    return null;
  }
}

/**
 * Create affiliate account
 */
export async function createAffiliateAccount(userId: string, userData?: any) {
  try {
    const referralCode = generateReferralCode();

    const { data, error } = await supabase
      .from('affiliates')
      .insert({
        user_id: userId,
        referral_code: referralCode,
        status: 'pending', // Pending approval
        tier: 'TIER_1',
        total_referrals: 0,
        total_commissions: 0,
        total_earnings: 0,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) throw error;

    return data;
  } catch (error) {
    console.error('Error creating affiliate account:', error);
    throw error;
  }
}

/**
 * Generate referral code
 */
export function generateReferralCode(length: number = 8): string {
  return crypto
    .randomBytes(length)
    .toString('hex')
    .toUpperCase()
    .substring(0, length);
}

/**
 * Generate referral link
 */
export function generateReferralLink(code: string, customSlug?: string): {
  standardLink: string;
  customLink?: string;
} {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://example.com';

  const standardLink = `${baseUrl}/join?ref=${code}`;
  const customLink = customSlug
    ? `${baseUrl}/refr/${customSlug}`
    : undefined;

  return { standardLink, customLink };
}

/**
 * Get affiliate by referral code
 */
export async function getAffiliateByCode(code: string) {
  try {
    const { data, error } = await supabase
      .from('affiliates')
      .select('*')
      .eq('referral_code', code)
      .single();

    if (error && error.code !== 'PGRST116') {
      throw error;
    }

    return data || null;
  } catch (error) {
    console.error('Error fetching affiliate by code:', error);
    return null;
  }
}

/**
 * Calculate commission based on purchase amount and tier
 */
export function calculateCommission(
  amount: number,
  tier: string,
  licensePlan: string = 'personal'
): number {
  const tierConfig = AFFILIATE_CONFIG.COMMISSION_TIERS[tier as keyof typeof AFFILIATE_CONFIG.COMMISSION_TIERS];

  if (!tierConfig) {
    return 0;
  }

  // Use tier commission rate, falling back to license-based rate
  const commissionRate = tierConfig.commission;

  return Math.round(amount * commissionRate * 100) / 100;
}

/**
 * Get affiliate tier based on referral count
 */
export function getAffiliateTier(referralCount: number): string {
  const tiers = Object.entries(AFFILIATE_CONFIG.COMMISSION_TIERS)
    .sort(([, a], [, b]) => b.minReferrals - a.minReferrals);

  for (const [tierKey, tierConfig] of tiers) {
    if (referralCount >= tierConfig.minReferrals) {
      return tierKey;
    }
  }

  return 'TIER_1';
}

/**
 * Get tier details
 */
export function getTierDetails(tier: string) {
  return AFFILIATE_CONFIG.COMMISSION_TIERS[tier as keyof typeof AFFILIATE_CONFIG.COMMISSION_TIERS];
}

/**
 * Track referral click
 */
export async function trackReferralClick(code: string, sourceUrl: string, ipAddress: string) {
  try {
    const affiliate = await getAffiliateByCode(code);

    if (!affiliate) {
      return null;
    }

    const { data, error } = await supabase
      .from('referral_clicks')
      .insert({
        affiliate_id: affiliate.id,
        referral_code: code,
        source_url: sourceUrl,
        ip_address: ipAddress,
        clicked_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) throw error;

    return data;
  } catch (error) {
    console.error('Error tracking referral click:', error);
    return null;
  }
}

/**
 * Create a referral from click to conversion
 */
export async function createReferral(
  code: string,
  referredUserId: string,
  licenseType: string
) {
  try {
    const affiliate = await getAffiliateByCode(code);

    if (!affiliate) {
      throw new Error('Invalid referral code');
    }

    // Prevent self-referral if not allowed
    if (!AFFILIATE_CONFIG.FRAUD.SELF_REFERRAL_ALLOWED) {
      if (affiliate.user_id === referredUserId) {
        throw new Error('Self-referral not allowed');
      }
    }

    const { data, error } = await supabase
      .from('referrals')
      .insert({
        affiliate_id: affiliate.id,
        referral_code: code,
        referred_user_id: referredUserId,
        license_type: licenseType,
        status: 'registered',
        created_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) throw error;

    return data;
  } catch (error) {
    console.error('Error creating referral:', error);
    throw error;
  }
}

/**
 * Record commission from referral
 */
export async function recordCommission(
  affiliateId: string,
  referralId: string,
  amount: number,
  currency: string,
  licenseType: string
) {
  try {
    const affiliate = await supabase
      .from('affiliates')
      .select('tier')
      .eq('id', affiliateId)
      .single();

    if (!affiliate.data) {
      throw new Error('Affiliate not found');
    }

    const commission = calculateCommission(amount, affiliate.data.tier, licenseType);

    const { data, error } = await supabase
      .from('commissions')
      .insert({
        affiliate_id: affiliateId,
        referral_id: referralId,
        amount: amount,
        commission_amount: commission,
        currency: currency,
        status: 'held', // Held for HOLD_PERIOD_DAYS
        hold_until: new Date(
          Date.now() + AFFILIATE_CONFIG.RULES.HOLD_PERIOD_DAYS * 24 * 60 * 60 * 1000
        ).toISOString(),
        created_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) throw error;

    // Update affiliate stats
    await supabase
      .from('affiliates')
      .update({
        total_commissions: (affiliate.data.total_commissions || 0) + 1,
        total_earnings: (affiliate.data.total_earnings || 0) + commission,
        updated_at: new Date().toISOString(),
      })
      .eq('id', affiliateId);

    return data;
  } catch (error) {
    console.error('Error recording commission:', error);
    throw error;
  }
}

/**
 * Get affiliate earnings
 */
export async function getAffiliateEarnings(affiliateId: string) {
  try {
    const { data: commissions, error } = await supabase
      .from('commissions')
      .select('*')
      .eq('affiliate_id', affiliateId);

    if (error) throw error;

    const total = commissions?.reduce((sum, c) => sum + (c.commission_amount || 0), 0) || 0;
    const pending = commissions
      ?.filter((c) => c.status === 'held' || c.status === 'pending')
      .reduce((sum, c) => sum + (c.commission_amount || 0), 0) || 0;
    const paid = commissions
      ?.filter((c) => c.status === 'paid')
      .reduce((sum, c) => sum + (c.commission_amount || 0), 0) || 0;

    return {
      total,
      pending,
      paid,
      available: total - pending,
    };
  } catch (error) {
    console.error('Error calculating earnings:', error);
    return { total: 0, pending: 0, paid: 0, available: 0 };
  }
}

/**
 * Request payout
 */
export async function requestPayout(
  affiliateId: string,
  amount: number,
  payoutMethod: string,
  payoutDetails: any
) {
  try {
    // Check minimum payout requirement
    if (amount < AFFILIATE_CONFIG.RULES.MIN_PAYOUT) {
      throw new Error(
        `Minimum payout amount is ${AFFILIATE_CONFIG.RULES.MIN_PAYOUT} BDT`
      );
    }

    // Check available balance
    const earnings = await getAffiliateEarnings(affiliateId);
    if (amount > earnings.available) {
      throw new Error('Insufficient available balance');
    }

    const { data, error } = await supabase
      .from('payouts')
      .insert({
        affiliate_id: affiliateId,
        amount: amount,
        method: payoutMethod,
        details: payoutDetails,
        status: 'pending',
        requested_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) throw error;

    return data;
  } catch (error) {
    console.error('Error requesting payout:', error);
    throw error;
  }
}

/**
 * Get affiliate statistics
 */
export async function getAffiliateStats(affiliateId: string) {
  try {
    const [
      clicksRes,
      referralsRes,
      commissionsRes,
      conversionRes,
    ] = await Promise.all([
      supabase
        .from('referral_clicks')
        .select('id', { count: 'exact' })
        .eq('affiliate_id', affiliateId),
      supabase
        .from('referrals')
        .select('status', { count: 'exact' })
        .eq('affiliate_id', affiliateId),
      supabase
        .from('commissions')
        .select('commission_amount')
        .eq('affiliate_id', affiliateId)
        .eq('status', 'paid'),
      supabase
        .from('referrals')
        .select('id', { count: 'exact' })
        .eq('affiliate_id', affiliateId)
        .eq('status', 'purchased'),
    ]);

    const totalClicks = clicksRes.count || 0;
    const totalReferrals = referralsRes.count || 0;
    const totalEarnings = commissionsRes.data?.reduce((sum, c) => sum + (c.commission_amount || 0), 0) || 0;
    const purchasedReferrals = conversionRes.count || 0;

    const conversionRate = totalClicks > 0 
      ? Math.round((totalReferrals / totalClicks) * 10000) / 100
      : 0;

    const ctr = totalClicks > 0
      ? Math.round((purchasedReferrals / totalClicks) * 10000) / 100
      : 0;

    return {
      totalClicks,
      totalReferrals,
      totalEarnings,
      purchasedReferrals,
      conversionRate,
      ctr,
      epc: totalClicks > 0 ? totalEarnings / totalClicks : 0,
    };
  } catch (error) {
    console.error('Error fetching affiliate stats:', error);
    return {
      totalClicks: 0,
      totalReferrals: 0,
      totalEarnings: 0,
      purchasedReferrals: 0,
      conversionRate: 0,
      ctr: 0,
      epc: 0,
    };
  }
}

/**
 * Get top affiliates
 */
export async function getTopAffiliates(limit: number = 10) {
  try {
    const { data, error } = await supabase
      .from('affiliates')
      .select('*, total_earnings')
      .eq('status', 'approved')
      .order('total_earnings', { ascending: false })
      .limit(limit);

    if (error) throw error;

    return data || [];
  } catch (error) {
    console.error('Error fetching top affiliates:', error);
    return [];
  }
}

/**
 * Check fraud risk for referral
 */
export function checkFraudRisk(referral: any): {
  isFraudulent: boolean;
  riskScore: number;
  flags: string[];
} {
  const flags: string[] = [];
  let riskScore = 0;

  // Check for high refund rate
  if (referral.refundRate > AFFILIATE_CONFIG.RESTRICTIONS.AUTO_BAN_CRITERIA.REFUND_RATE_THRESHOLD) {
    flags.push('High refund rate');
    riskScore += 30;
  }

  // Check for multiple chargebacks
  if (referral.chargebackCount >= AFFILIATE_CONFIG.RESTRICTIONS.AUTO_BAN_CRITERIA.CHARGEBACK_COUNT) {
    flags.push('Multiple chargebacks');
    riskScore += 40;
  }

  // Check for invalid traffic
  if (referral.invalidTrafficRatio > AFFILIATE_CONFIG.RESTRICTIONS.AUTO_BAN_CRITERIA.INVALID_TRAFFIC_RATIO) {
    flags.push('High invalid traffic');
    riskScore += 35;
  }

  return {
    isFraudulent: riskScore >= 50,
    riskScore,
    flags,
  };
}

/**
 * Get seasonal bonus multiplier
 */
export function getSeasonalBonus(): number {
  const month = new Date().getMonth();
  const monthMap: Record<number, string> = {
    0: 'JAN',
    1: 'FEB',
    2: 'MAR',
    3: 'APR',
    4: 'MAY',
    5: 'JUN',
    6: 'JUL',
    7: 'AUG',
    8: 'SEP',
    9: 'OCT',
    10: 'NOV',
    11: 'DEC',
  };

  const monthKey = monthMap[month];
  return (AFFILIATE_CONFIG.INCENTIVES.SEASONAL_BONUS_RATES as any)[monthKey] || 1.0;
}

/**
 * Get milestone bonus if any
 */
export function getMilestoneBonus(referralCount: number): number {
  const bonuses = AFFILIATE_CONFIG.INCENTIVES.MILESTONE_BONUSES as Record<string, number>;

  for (const [milestone, bonus] of Object.entries(bonuses)) {
    if (referralCount === parseInt(milestone)) {
      return bonus;
    }
  }

  return 0;
}

/**
 * Validate affiliate account for payment
 */
export async function validateAffiliateForPayout(affiliateId: string): Promise<{
  valid: boolean;
  errors: string[];
}> {
  try {
    const affiliate = await supabase
      .from('affiliates')
      .select('*')
      .eq('id', affiliateId)
      .single();

    const errors: string[] = [];

    if (!affiliate.data) {
      errors.push('Affiliate not found');
      return { valid: false, errors };
    }

    if (affiliate.data.status !== 'approved') {
      errors.push(`Affiliate status is ${affiliate.data.status}, must be approved`);
    }

    if (!affiliate.data.payout_method) {
      errors.push('Payout method not configured');
    }

    if (!affiliate.data.payout_details) {
      errors.push('Payout details not configured');
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  } catch (error) {
    console.error('Error validating affiliate:', error);
    return {
      valid: false,
      errors: ['Error validating affiliate account'],
    };
  }
}

/**
 * Process held commissions after hold period
 */
export async function releaseHeldCommissions() {
  try {
    const now = new Date().toISOString();

    const { data, error } = await supabase
      .from('commissions')
      .update({ status: 'earned' })
      .eq('status', 'held')
      .lte('hold_until', now)
      .select();

    if (error) throw error;

    return data?.length || 0;
  } catch (error) {
    console.error('Error releasing held commissions:', error);
    return 0;
  }
}

/**
 * Get affiliate leaderboard
 */
export async function getAffiliateLeaderboard(period: 'week' | 'month' | 'all' = 'month') {
  try {
    const now = new Date();
    let startDate = new Date();

    if (period === 'week') {
      startDate.setDate(now.getDate() - 7);
    } else if (period === 'month') {
      startDate.setMonth(now.getMonth() - 1);
    }

    const query = supabase
      .from('commissions')
      .select(
        `
        affiliate_id,
        commission_amount,
        affiliates(referral_code, tier)
      `
      )
      .eq('status', 'paid');

    if (period !== 'all') {
      query.gte('created_at', startDate.toISOString());
    }

    const { data, error } = await query;

    if (error) throw error;

    // Group by affiliate and sum earnings
    const leaderboard: Record<string, any> = {};

    data?.forEach((item: any) => {
      const affiliateId = item.affiliate_id;
      if (!leaderboard[affiliateId]) {
        leaderboard[affiliateId] = {
          affiliateId,
          earnings: 0,
          tier: item.affiliates?.tier,
          referralCode: item.affiliates?.referral_code,
        };
      }
      leaderboard[affiliateId].earnings += item.commission_amount || 0;
    });

    return Object.values(leaderboard)
      .sort((a: any, b: any) => b.earnings - a.earnings)
      .slice(0, 100);
  } catch (error) {
    console.error('Error fetching leaderboard:', error);
    return [];
  }
}
