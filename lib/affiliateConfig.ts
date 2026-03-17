// Affiliate Program Configuration
export const AFFILIATE_CONFIG = {
  // Commission tiers based on referral count
  COMMISSION_TIERS: {
    TIER_1: {
      name: 'Bronze',
      minReferrals: 0,
      commission: 0.20, // 20%
      monthlyBonus: 0,
      customLink: false,
      dedicatedSupport: false,
    },
    TIER_2: {
      name: 'Silver',
      minReferrals: 10,
      commission: 0.25, // 25%
      monthlyBonus: 5000, // BDT
      customLink: true,
      dedicatedSupport: false,
    },
    TIER_3: {
      name: 'Gold',
      minReferrals: 50,
      commission: 0.30, // 30%
      monthlyBonus: 15000, // BDT
      customLink: true,
      dedicatedSupport: true,
      exclusiveMaterials: true,
    },
    TIER_4: {
      name: 'Platinum',
      minReferrals: 200,
      commission: 0.35, // 35%
      monthlyBonus: 50000, // BDT
      customLink: true,
      dedicatedSupport: true,
      exclusiveMaterials: true,
      marketingFunds: 10000, // BDT
    },
  },

  // License commission mapping
  COMMISSION_BY_LICENSE: {
    personal: 0.20,
    team: 0.25,
    institution: 0.30,
  },

  // Affiliate statuses
  STATUS: {
    PENDING: 'pending',
    APPROVED: 'approved',
    SUSPENDED: 'suspended',
    INACTIVE: 'inactive',
    TERMINATED: 'terminated',
  },

  // Referral statuses
  REFERRAL_STATUS: {
    CLICKED: 'clicked',
    REGISTERED: 'registered',
    TRIAL: 'trial',
    PURCHASED: 'purchased',
    ACTIVE: 'active',
    CHURNED: 'churned',
    CANCELLED: 'cancelled',
  },

  // Commission statuses
  COMMISSION_STATUS: {
    PENDING: 'pending',
    EARNED: 'earned',
    HELD: 'held',
    PAID: 'paid',
    REFUNDED: 'refunded',
  },

  // Payout methods
  PAYOUT_METHODS: {
    BANK_TRANSFER: 'bank_transfer',
    BKASH: 'bkash',
    NAGAD: 'nagad',
    PAYPAL: 'paypal',
    WALLET: 'wallet',
  },

  // Payout statuses
  PAYOUT_STATUS: {
    PENDING: 'pending',
    PROCESSING: 'processing',
    COMPLETED: 'completed',
    FAILED: 'failed',
    CANCELLED: 'cancelled',
  },

  // Cookie settings
  COOKIE: {
    DURATION_DAYS: 30, // 30-day cookie window
    NAME: 'aff_ref',
  },

  // Referral link settings
  LINK: {
    RETENTION_DAYS: 30, // Links active for 30 days
    MAX_CUSTOM_LINKS: 5,
    PREFIX: 'ref',
  },

  // Commission rules
  RULES: {
    MIN_PAYOUT: 5000, // BDT - minimum amount to request payout
    PAYOUT_FREQUENCY: 'monthly', // monthly or on-demand
    HOLD_PERIOD_DAYS: 7, // Hold commissions for 7 days before paying (chargeback protection)
    PAYOUT_DAY_OF_MONTH: 15, // Pay on 15th of each month
  },

  // Fraud prevention
  FRAUD: {
    SELF_REFERRAL_ALLOWED: false,
    FAMILY_REFERRAL_ALLOWED: false,
    MIN_DAYS_BETWEEN_BANS: 30,
    SUSPICIOUS_ACTIVITY_HOLD_DAYS: 14,
  },

  // Marketing materials
  MATERIALS: {
    BANNERS: [
      {
        id: 'banner_300x250',
        size: '300x250',
        type: 'square',
      },
      {
        id: 'banner_728x90',
        size: '728x90',
        type: 'leaderboard',
      },
      {
        id: 'banner_160x600',
        size: '160x600',
        type: 'skyscraper',
      },
    ],
    EMAIL_TEMPLATES: [
      'welcome',
      'monthly_stats',
      'commission_earned',
      'payout_processed',
      'performance_tips',
    ],
  },

  // Performance thresholds
  PERFORMANCE: {
    GOOD_CONVERSION_RATE: 10, // %
    EXCELLENT_CONVERSION_RATE: 20, // %
    INACTIVE_THRESHOLD_DAYS: 90, // Inactive if no clicks in 90 days
    MIN_REFERRALS_FOR_DASHBOARD_STATS: 5,
  },

  // Bonus & Incentives
  INCENTIVES: {
    SEASONAL_BONUS_RATES: {
      JAN: 1.0, // Normal rate
      FEB: 1.0,
      MAR: 1.0,
      APR: 1.0,
      MAY: 1.0,
      JUN: 1.1, // 10% bonus
      JUL: 1.1,
      AUG: 1.1,
      SEP: 1.0,
      OCT: 1.0,
      NOV: 1.15, // 15% bonus (Black Friday prep)
      DEC: 1.2, // 20% bonus (Holiday)
    },
    MILESTONE_BONUSES: {
      10: 10000, // 10 referrals = 10k BDT
      50: 50000, // 50 referrals = 50k BDT
      100: 100000, // 100 referrals = 100k BDT
      500: 500000, // 500 referrals = 500k BDT
    },
  },

  // Communication
  COMMUNICATION: {
    ENABLE_WEEKLY_STATS: true,
    ENABLE_COMMISSION_NOTIFICATIONS: true,
    ENABLE_PAYOUT_NOTIFICATIONS: true,
    ENABLE_TIP_EMAILS: true,
  },

  // Affiliate features
  FEATURES: {
    REAL_TIME_TRACKING: true,
    CUSTOM_LINKS: true,
    PROMOTIONAL_MATERIALS: true,
    PERFORMANCE_DASHBOARD: true,
    COMMISSION_CALCULATOR: true,
    REFERRAL_CODES: true,
    DEEP_LINKING: true,
    API_ACCESS: false, // Premium feature
  },

  // Restrictions
  RESTRICTIONS: {
    BAN_REASONS: [
      'self_referral',
      'fraud',
      'trademark_violation',
      'misleading_claims',
      'spam',
      'malware',
      'sexual_content',
      'hate_speech',
    ],
    AUTO_BAN_CRITERIA: {
      REFUND_RATE_THRESHOLD: 0.5, // 50% refund rate
      CHARGEBACK_COUNT: 5,
      INVALID_TRAFFIC_RATIO: 0.3, // 30% invalid
    },
  },
};

// Affiliate program terms
export const AFFILIATE_TERMS = {
  VERSION: '1.0',
  LAST_UPDATED: '2024-01-01',
  PAYMENT_TERMS: '30 days after month end',
  COMMISSION_CALCULATION: 'Per referral license purchase',
  COOKIE_DURATION: '30 days',
  TERMINATION_NOTICE: '30 days written notice',
};

// Default affiliate URL structure
export const AFFILIATE_URL_PATTERNS = {
  REFERRAL_LINK: '/join?ref={code}',
  CUSTOM_LINK: '/refr/{slug}',
  EMAIL_CAMPAIGN: '/email?ref={code}&campaign={campaign}',
  SOCIAL_CAMPAIGN: '/social?ref={code}&platform={platform}',
  AD_CAMPAIGN: '/ad?ref={code}&adset={adset}',
};

// Affiliate achievement badges
export const AFFILIATE_BADGES = {
  FIRST_REFERRAL: {
    name: 'First Blood',
    icon: '🎯',
    requirement: 1,
  },
  TOP_PERFORMER: {
    name: 'Top Performer',
    icon: '🏆',
    requirement: 'top_10_percent',
  },
  CONSISTENCY: {
    name: 'Consistent Earner',
    icon: '📈',
    requirement: '12_months_active',
  },
  REFERRAL_MASTER: {
    name: 'Referral Master',
    icon: '👑',
    requirement: 500,
  },
  SOCIAL_BUTTERFLY: {
    name: 'Social Butterfly',
    icon: '🦋',
    requirement: 'social_campaign_100',
  },
  BRAND_AMBASSADOR: {
    name: 'Brand Ambassador',
    icon: '⭐',
    requirement: 'tier_platinum',
  },
};

// Email templates for affiliates
export const AFFILIATE_EMAIL_TEMPLATES = {
  welcome: {
    subject: 'Welcome to {brandName} Affiliate Program!',
    key: 'affiliate_welcome',
  },
  commission_earned: {
    subject: 'Commission Earned! {amount} {currency}',
    key: 'commission_earned',
  },
  monthly_stats: {
    subject: 'Your Monthly Affiliate Report - {month}',
    key: 'monthly_stats',
  },
  payout_processed: {
    subject: 'Your Affiliate Payout Has Been Processed',
    key: 'payout_processed',
  },
  performance_tips: {
    subject: 'Tips to Boost Your Affiliate Earnings',
    key: 'performance_tips',
  },
  tier_upgrade: {
    subject: 'Congratulations! You\'ve Been Promoted to {tier}',
    key: 'tier_upgrade',
  },
  policy_violation: {
    subject: 'Important: Policy Violation Notice',
    key: 'policy_violation',
  },
};

// Affiliate analytics metrics
export const AFFILIATE_METRICS = {
  CLICKS: 'clicks',
  IMPRESSIONS: 'impressions',
  CONVERSION_RATE: 'conversion_rate',
  CTR: 'ctr', // Click-through rate
  REFERRALS: 'referrals',
  COMMISSIONS: 'commissions',
  EARNINGS_PER_CLICK: 'epc',
  CUSTOMER_LIFETIME_VALUE: 'clv',
  ACTIVE_REFERRALS: 'active_referrals',
  TIER: 'tier',
};
