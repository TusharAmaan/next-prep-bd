// License Configuration
export const LICENSE_CONFIG = {
  // License types with their default settings
  TYPES: {
    PERSONAL: 'personal',
    TEAM: 'team',
    INSTITUTION: 'institution',
  },

  // License status constants
  STATUS: {
    ACTIVE: 'active',
    SUSPENDED: 'suspended',
    EXPIRED: 'expired',
  },

  // License member roles
  ROLES: {
    ADMIN: 'admin',
    MEMBER: 'member',
  },

  // License features
  FEATURES: {
    personal: [
      'Basic courses',
      'Limited quizzes',
      'Community access',
      'Basic support',
      '1 User seat',
    ],
    team: [
      'Unlimited courses',
      'All quizzes',
      'Team analytics',
      'Priority support',
      'Custom content',
      'Up to 5 user seats',
      'Team collaboration',
      'Advanced reporting',
    ],
    institution: [
      'Unlimited everything',
      'Admin dashboard',
      'Advanced analytics',
      'API access',
      '24/7 support',
      'SSO integration',
      'Custom branding',
      'Up to 100 user seats',
      'Dedicated account manager',
      'Custom integrations',
    ],
  },

  // License seats
  SEATS: {
    personal: 1,
    team: 5,
    institution: 100,
  },

  // Pricing (in BDT)
  PRICING: {
    personal: 999,
    team: 4999,
    institution: 49999,
  },

  // Trial period (in days)
  TRIAL_DAYS: 7,

  // Billing cycle (in days)
  BILLING_CYCLE: 30,

  // Invitation expiry (in days)
  INVITATION_EXPIRY: 7,

  // Maximum upgrades per month
  MAX_UPGRADES_PER_MONTH: 3,
};

// Stripe configuration
export const STRIPE_CONFIG = {
  CURRENCY: 'bdt',
  // Product IDs should be set in environment variables
  PRODUCT_IDS: {
    personal: process.env.STRIPE_PRODUCT_ID_PERSONAL || '',
    team: process.env.STRIPE_PRODUCT_ID_TEAM || '',
    institution: process.env.STRIPE_PRODUCT_ID_INSTITUTION || '',
  },
};

// Feature access control
export const FEATURE_ACCESS = {
  personal: {
    courses: {
      max: 5,
      type: 'basic',
    },
    quizzes: {
      max: 10,
      type: 'limited',
    },
    storage: 1024 * 1024 * 100, // 100MB
    apiCalls: 1000, // per day
    support: 'community',
    analytics: false,
  },
  team: {
    courses: {
      max: Infinity,
      type: 'all',
    },
    quizzes: {
      max: Infinity,
      type: 'all',
    },
    storage: 1024 * 1024 * 1024, // 1GB
    apiCalls: 10000, // per day
    support: 'priority',
    analytics: true,
  },
  institution: {
    courses: {
      max: Infinity,
      type: 'all',
    },
    quizzes: {
      max: Infinity,
      type: 'all',
    },
    storage: 1024 * 1024 * 1024 * 10, // 10GB
    apiCalls: 100000, // per day
    support: '24/7',
    analytics: true,
    ssoDomain: true,
    customBranding: true,
  },
};

// Error messages
export const LICENSE_ERRORS = {
  INVALID_LICENSE: 'Invalid or expired license',
  LICENSE_EXPIRED: 'Your license has expired',
  LICENSE_SUSPENDED: 'Your license has been suspended',
  LIMIT_EXCEEDED: 'You have exceeded your plan limits',
  SEATS_FULL: 'All available seats are in use',
  INVALID_INVITATION: 'Invalid or expired invitation',
  NO_LICENSE: 'No active license found',
  UNAUTHORIZED: 'You do not have permission to access this resource',
};

// Success messages
export const LICENSE_SUCCESS = {
  LICENSE_PURCHASED: 'License purchased successfully',
  LICENSE_UPGRADED: 'License upgraded successfully',
  LICENSE_CANCELLED: 'License cancelled successfully',
  MEMBER_ADDED: 'Member added to license',
  MEMBER_REMOVED: 'Member removed from license',
  INVITATION_SENT: 'Invitation sent successfully',
  INVITATION_ACCEPTED: 'Invitation accepted',
};
