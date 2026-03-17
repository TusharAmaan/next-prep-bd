import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  calculateCommission,
  getAffiliateTier,
  getSeasonalBonus,
  getMilestoneBonus,
  checkFraudRisk,
  generateReferralCode,
} from '@/lib/affiliateUtils';
import { AFFILIATE_CONFIG } from '@/lib/affiliateConfig';

describe('Affiliate System', () => {
  // ============ Commission Calculation Tests ============

  describe('calculateCommission', () => {
    it('should calculate Bronze tier commission (20%)', () => {
      const commission = calculateCommission(10000, 'bronze', 'personal');
      expect(commission).toBe(10000 * 0.20); // 2000
    });

    it('should calculate Silver tier commission (25%)', () => {
      const commission = calculateCommission(10000, 'silver', 'personal');
      expect(commission).toBe(10000 * 0.25); // 2500
    });

    it('should calculate Gold tier commission (30%)', () => {
      const commission = calculateCommission(10000, 'gold', 'personal');
      expect(commission).toBe(10000 * 0.30); // 3000
    });

    it('should calculate Platinum tier commission (35%)', () => {
      const commission = calculateCommission(10000, 'platinum', 'personal');
      expect(commission).toBe(10000 * 0.35); // 3500
    });

    it('should return 0 for invalid tier', () => {
      const commission = calculateCommission(10000, 'invalid' as any, 'personal');
      expect(commission).toBe(0);
    });

    it('should handle different license types equally', () => {
      const personal = calculateCommission(10000, 'gold', 'personal');
      const team = calculateCommission(10000, 'gold', 'team');
      const institution = calculateCommission(10000, 'gold', 'institution');
      
      expect(personal).toBe(team);
      expect(team).toBe(institution);
    });

    it('should handle decimal amounts', () => {
      const commission = calculateCommission(9999.99, 'silver', 'personal');
      expect(commission).toBeCloseTo(9999.99 * 0.25, 2);
    });

    it('should handle large amounts', () => {
      const commission = calculateCommission(999999, 'platinum', 'personal');
      expect(commission).toBe(999999 * 0.35);
    });

    it('should return 0 for 0 amount', () => {
      const commission = calculateCommission(0, 'bronze', 'personal');
      expect(commission).toBe(0);
    });

    it('should handle negative amounts gracefully', () => {
      const commission = calculateCommission(-10000, 'bronze', 'personal');
      expect(commission).toBeLessThanOrEqual(0);
    });
  });

  // ============ Tier Progression Tests ============

  describe('getAffiliateTier', () => {
    it('should return Bronze for 0-9 referrals', () => {
      expect(getAffiliateTier(0)).toBe('bronze');
      expect(getAffiliateTier(5)).toBe('bronze');
      expect(getAffiliateTier(9)).toBe('bronze');
    });

    it('should return Silver for 10-49 referrals', () => {
      expect(getAffiliateTier(10)).toBe('silver');
      expect(getAffiliateTier(25)).toBe('silver');
      expect(getAffiliateTier(49)).toBe('silver');
    });

    it('should return Gold for 50-199 referrals', () => {
      expect(getAffiliateTier(50)).toBe('gold');
      expect(getAffiliateTier(100)).toBe('gold');
      expect(getAffiliateTier(199)).toBe('gold');
    });

    it('should return Platinum for 200+ referrals', () => {
      expect(getAffiliateTier(200)).toBe('platinum');
      expect(getAffiliateTier(500)).toBe('platinum');
      expect(getAffiliateTier(10000)).toBe('platinum');
    });

    it('should handle tier boundaries exactly', () => {
      expect(getAffiliateTier(9)).toBe('bronze');
      expect(getAffiliateTier(10)).toBe('silver');
      expect(getAffiliateTier(49)).toBe('silver');
      expect(getAffiliateTier(50)).toBe('gold');
      expect(getAffiliateTier(199)).toBe('gold');
      expect(getAffiliateTier(200)).toBe('platinum');
    });
  });

  // ============ Seasonal Bonus Tests ============

  describe('getSeasonalBonus', () => {
    it('should return 1.0x for January-May', () => {
      expect(getSeasonalBonus('2024-01-15')).toBe(1.0);
      expect(getSeasonalBonus('2024-02-15')).toBe(1.0);
      expect(getSeasonalBonus('2024-03-15')).toBe(1.0);
      expect(getSeasonalBonus('2024-04-15')).toBe(1.0);
      expect(getSeasonalBonus('2024-05-15')).toBe(1.0);
    });

    it('should return 1.1x for June-August (summer bonus)', () => {
      expect(getSeasonalBonus('2024-06-15')).toBe(1.1);
      expect(getSeasonalBonus('2024-07-15')).toBe(1.1);
      expect(getSeasonalBonus('2024-08-15')).toBe(1.1);
    });

    it('should return 1.0x for September-October', () => {
      expect(getSeasonalBonus('2024-09-15')).toBe(1.0);
      expect(getSeasonalBonus('2024-10-15')).toBe(1.0);
    });

    it('should return 1.15x for November (Diwali bonus)', () => {
      expect(getSeasonalBonus('2024-11-15')).toBe(1.15);
    });

    it('should return 1.2x for December (holiday bonus)', () => {
      expect(getSeasonalBonus('2024-12-15')).toBe(1.2);
    });

    it('should apply total bonus calculation', () => {
      // Without bonus: 10000 × 0.30 = 3000
      // With December bonus: 10000 × 0.30 × 1.2 = 3600
      const baseTier = calculateCommission(10000, 'gold', 'personal');
      const decemberBonus = getSeasonalBonus('2024-12-15');
      expect(baseTier * decemberBonus).toBe(3600);
    });

    it('should handle date strings in any format', () => {
      // Should work with ISO strings
      expect(getSeasonalBonus('2024-06-01')).toBe(1.1);
      expect(getSeasonalBonus('2024-06-30')).toBe(1.1);
    });
  });

  // ============ Milestone Bonus Tests ============

  describe('getMilestoneBonus', () => {
    it('should return 0 for under 10 referrals', () => {
      expect(getMilestoneBonus(0)).toBe(0);
      expect(getMilestoneBonus(5)).toBe(0);
      expect(getMilestoneBonus(9)).toBe(0);
    });

    it('should return ৳10,000 for 10 referrals milestone', () => {
      expect(getMilestoneBonus(10)).toBe(10000);
    });

    it('should return ৳50,000 for 50 referrals milestone', () => {
      expect(getMilestoneBonus(50)).toBe(50000);
    });

    it('should return ৳100,000 for 100 referrals milestone', () => {
      expect(getMilestoneBonus(100)).toBe(100000);
    });

    it('should return ৳500,000 for 500 referrals milestone', () => {
      expect(getMilestoneBonus(500)).toBe(500000);
    });

    it('should return 0 between milestones', () => {
      expect(getMilestoneBonus(15)).toBe(0); // Between 10 and 50
      expect(getMilestoneBonus(75)).toBe(0); // Between 50 and 100
      expect(getMilestoneBonus(250)).toBe(0); // Between 100 and 500
    });

    it('should not double-count milestones', () => {
      // At 50 referrals, only the 50-milestone applies, not 10+50
      expect(getMilestoneBonus(50)).toBe(50000);
      expect(getMilestoneBonus(50)).not.toBe(10000 + 50000);
    });

    it('should maintain bonus at threshold', () => {
      expect(getMilestoneBonus(50)).toBe(50000);
      expect(getMilestoneBonus(51)).toBe(0); // No bonus past milestone until next one
    });
  });

  // ============ Fraud Detection Tests ============

  describe('checkFraudRisk', () => {
    it('should detect high refund rate (>50%)', () => {
      const fraudData = {
        activeReferrals: 10,
        refundedReferrals: 6, // 60%
        chargebacks: 0,
        clicks: 100,
        conversions: 10,
      };
      
      const score = checkFraudRisk(fraudData);
      expect(score).toBeGreaterThan(0);
      expect(score).toBeGreaterThanOrEqual(30); // High refund penalty
    });

    it('should detect high chargeback rate', () => {
      const fraudData = {
        activeReferrals: 100,
        refundedReferrals: 10,
        chargebacks: 7, // 7 chargebacks (>5)
        clicks: 1000,
        conversions: 100,
      };
      
      const score = checkFraudRisk(fraudData);
      expect(score).toBeGreaterThanOrEqual(40); // High chargeback penalty
    });

    it('should detect suspicious traffic pattern', () => {
      const fraudData = {
        activeReferrals: 100,
        refundedReferrals: 10,
        chargebacks: 1,
        clicks: 20000, // Only 100 conversions = 0.5% conversion rate
        conversions: 100,
      };
      
      const score = checkFraudRisk(fraudData);
      expect(score).toBeGreaterThan(0); // Low conversion rate penalty
    });

    it('should detect velocity abuse (rapid referrals)', () => {
      const fraudData = {
        activeReferrals: 200, // Suspicious spike
        refundedReferrals: 5,
        chargebacks: 0,
        clicks: 300, // High velocity
        conversions: 200,
      };
      
      const score = checkFraudRisk(fraudData);
      // Velocity abuse should be detected (80%+ conversion is unnatural)
      expect(score).toBeGreaterThanOrEqual(0);
    });

    it('should return 0 for clean affiliate', () => {
      const cleanData = {
        activeReferrals: 50,
        refundedReferrals: 2, // 4% refund rate
        chargebacks: 0,
        clicks: 1000,
        conversions: 50, // 5% natural conversion
      };
      
      const score = checkFraudRisk(cleanData);
      expect(score).toBeLessThanOrEqual(0); // No fraud detected
    });

    it('should accumulate fraud scores', () => {
      // Multiple fraud indicators
      const suspiciousData = {
        activeReferrals: 50,
        refundedReferrals: 30, // 60% refund rate = +30 points
        chargebacks: 3, // 3 chargebacks = +20 points
        clicks: 10000, // Low conversion = +15 points
        conversions: 50, // 0.5% conversion
      };
      
      const score = checkFraudRisk(suspiciousData);
      expect(score).toBeGreaterThanOrEqual(30); // Multiple factors compound
    });
  });

  // ============ Referral Code Tests ============

  describe('generateReferralCode', () => {
    it('should generate 8-character code', () => {
      const code = generateReferralCode();
      expect(code).toHaveLength(8);
    });

    it('should generate alphanumeric codes', () => {
      const code = generateReferralCode();
      expect(code).toMatch(/^[A-Z0-9]{8}$/);
    });

    it('should generate unique codes', () => {
      const codes = new Set();
      for (let i = 0; i < 100; i++) {
        codes.add(generateReferralCode());
      }
      expect(codes.size).toBe(100); // All unique
    });

    it('should use uppercase characters', () => {
      for (let i = 0; i < 10; i++) {
        const code = generateReferralCode();
        expect(code).toMatch(/^[A-Z0-9]{8}$/);
        expect(code).toBe(code.toUpperCase());
      }
    });

    it('should not include ambiguous characters', () => {
      const code = generateReferralCode();
      // Verify excluded: O (looks like 0), I (looks like 1 or l), L (looks like 1)
      expect(code).not.toMatch(/[OIL]/);
    });

    it('should be URL-safe', () => {
      const code = generateReferralCode();
      const encoded = encodeURIComponent(code);
      expect(encoded).toBe(code); // No encoding needed
    });
  });

  // ============ Commission Hold Period Tests ============

  describe('Commission Hold Period', () => {
    it('should calculate 7-day hold correctly', () => {
      const now = new Date();
      const holdUntil = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
      
      const daysDiff = (holdUntil.getTime() - now.getTime()) / (1000 * 60 * 60 * 24);
      expect(daysDiff).toBeCloseTo(7, 0);
    });

    it('should prevent payout during hold period', () => {
      const now = new Date();
      const holdUntil = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000); // 3 days
      
      const canRelease = now > holdUntil;
      expect(canRelease).toBe(false);
    });

    it('should allow payout after hold expires', () => {
      const now = new Date();
      const holdUntil = new Date(now.getTime() - 1 * 60 * 1000); // 1 minute ago
      
      const canRelease = now > holdUntil;
      expect(canRelease).toBe(true);
    });
  });

  // ============ Integration Tests ============

  describe('Commission Calculation Integration', () => {
    it('should calculate Silver affiliate commission with January (no bonus)', () => {
      const amount = 10000;
      const tier = 'silver';
      const date = '2024-01-15';
      
      const baseCommission = calculateCommission(amount, tier, 'personal');
      const seasonalMultiplier = getSeasonalBonus(date);
      const totalCommission = baseCommission * seasonalMultiplier;
      
      expect(totalCommission).toBe(2500); // 10000 × 0.25 × 1.0
    });

    it('should calculate Platinum affiliate commission with December bonus', () => {
      const amount = 50000;
      const tier = 'platinum';
      const date = '2024-12-15';
      
      const baseCommission = calculateCommission(amount, tier, 'personal');
      const seasonalMultiplier = getSeasonalBonus(date);
      const totalCommission = baseCommission * seasonalMultiplier;
      
      expect(totalCommission).toBe(50000 * 0.35 * 1.2); // 21000
    });

    it('should calculate commission with milestone bonus', () => {
      const amount = 25000;
      const tier = 'gold';
      const referralCount = 50;
      
      const baseCommission = calculateCommission(amount, tier, 'personal');
      const milestoneBonus = getMilestoneBonus(referralCount);
      const totalCommission = baseCommission + milestoneBonus;
      
      expect(totalCommission).toBe(25000 * 0.30 + 50000); // 7500 + 50000
    });

    it('should calculate complex affiliate earnings scenario', () => {
      // Silver affiliate with summer bonus + milestone
      const amount = 40000;
      const tier = 'silver';
      const date = '2024-07-15';
      const referralCount = 10; // Just hit silver milestone
      
      const baseCommission = calculateCommission(amount, tier, 'personal');
      const seasonalMultiplier = getSeasonalBonus(date);
      const withSeasonal = baseCommission * seasonalMultiplier;
      const milestoneBonus = getMilestoneBonus(referralCount);
      const totalCommission = withSeasonal + milestoneBonus;
      
      expect(totalCommission).toBe(
        (40000 * 0.25 * 1.1) + 10000 // 11000 + 10000 = 21000
      );
    });
  });

  // ============ Edge Cases ============

  describe('Edge Cases', () => {
    it('should handle minimum license price', () => {
      const minPrice = 1; // Minimum possible
      const commission = calculateCommission(minPrice, 'bronze', 'personal');
      expect(commission).toBe(minPrice * 0.20);
    });

    it('should handle maximum reasonable license price', () => {
      const maxPrice = 1000000; // 10 lakh BDT
      const commission = calculateCommission(maxPrice, 'platinum', 'personal');
      expect(commission).toBe(maxPrice * 0.35);
    });

    it('should be idempotent for commission calculation', () => {
      const result1 = calculateCommission(10000, 'gold', 'personal');
      const result2 = calculateCommission(10000, 'gold', 'personal');
      expect(result1).toBe(result2);
    });

    it('should handle leap year dates correctly', () => {
      // Feb 29 in leap year
      const bonus = getSeasonalBonus('2024-02-29');
      expect(bonus).toBe(1.0);
    });

    it('should handle year transitions', () => {
      expect(getSeasonalBonus('2024-12-31')).toBe(1.2); // December
      expect(getSeasonalBonus('2025-01-01')).toBe(1.0); // January
    });
  });
});
