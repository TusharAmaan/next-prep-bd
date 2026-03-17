// Regional Payment Configuration
export const REGIONAL_CONFIGS = {
  BD: {
    country: 'Bangladesh',
    currency: 'BDT',
    currencySymbol: '৳',
    currencyCode: 'BDT',
    region: 'SOUTH_ASIA',
    timezone: 'Asia/Dhaka',
    vat: 0.15, // 15% VAT
    serviceCharge: 0.0, // Added by payment gateways
    minPayment: 50, // BDT
    maxPayment: 1000000, // BDT
    paymentMethods: [
      'bkash',
      'nagad',
      'rocket',
      'bank_transfer',
      'credit_card',
      'mobile_wallet',
    ],
    bankCode: 'BD001',
    taxable: true,
  },
  IN: {
    country: 'India',
    currency: 'INR',
    currencySymbol: '₹',
    currencyCode: 'INR',
    region: 'SOUTH_ASIA',
    timezone: 'Asia/Kolkata',
    gst: 0.18, // 18% GST
    tds: 0.01, // 1% TDS on certain transactions
    minPayment: 50,
    maxPayment: 10000000,
    paymentMethods: ['razorpay', 'upi', 'bank_transfer', 'credit_card', 'wallet'],
    bankCode: 'IN001',
    taxable: true,
  },
  PK: {
    country: 'Pakistan',
    currency: 'PKR',
    currencySymbol: '₨',
    currencyCode: 'PKR',
    region: 'SOUTH_ASIA',
    timezone: 'Asia/Karachi',
    sales_tax: 0.17, // 17% Sales Tax
    minPayment: 100,
    maxPayment: 10000000,
    paymentMethods: ['easypaisa', 'jazz_cash', 'bank_transfer', 'credit_card'],
    bankCode: 'PK001',
    taxable: true,
  },
  US: {
    country: 'United States',
    currency: 'USD',
    currencySymbol: '$',
    currencyCode: 'USD',
    region: 'NORTH_AMERICA',
    timezone: 'America/New_York',
    sales_tax: 0.0, // Varies by state
    minPayment: 1,
    maxPayment: 999999,
    paymentMethods: ['stripe', 'credit_card', 'bank_transfer', 'paypal'],
    bankCode: 'US001',
    taxable: false, // Handled per state
  },
  GB: {
    country: 'United Kingdom',
    currency: 'GBP',
    currencySymbol: '£',
    currencyCode: 'GBP',
    region: 'EUROPE',
    timezone: 'Europe/London',
    vat: 0.20, // 20% VAT
    minPayment: 0.5,
    maxPayment: 999999,
    paymentMethods: ['stripe', 'credit_card', 'bank_transfer', 'paypal'],
    bankCode: 'GB001',
    taxable: true,
  },
  AE: {
    country: 'United Arab Emirates',
    currency: 'AED',
    currencySymbol: 'د.إ',
    currencyCode: 'AED',
    region: 'MIDDLE_EAST',
    timezone: 'Asia/Dubai',
    vat: 0.05, // 5% VAT
    minPayment: 5,
    maxPayment: 5000000,
    paymentMethods: ['telr', 'credit_card', 'bank_transfer', 'paypal'],
    bankCode: 'AE001',
    taxable: true,
  },
  SG: {
    country: 'Singapore',
    currency: 'SGD',
    currencySymbol: '$',
    currencyCode: 'SGD',
    region: 'SOUTHEAST_ASIA',
    timezone: 'Asia/Singapore',
    gst: 0.08, // 8% GST
    minPayment: 1,
    maxPayment: 1000000,
    paymentMethods: ['stripe', 'credit_card', 'paynow', 'bank_transfer'],
    bankCode: 'SG001',
    taxable: true,
  },
};

// Payment Gateway Configuration
export const PAYMENT_GATEWAYS = {
  // Bangladesh
  bkash: {
    name: 'bKash',
    country: 'BD',
    type: 'mobile_money',
    currencies: ['BDT'],
    minAmount: 10,
    maxAmount: 100000,
    fee: 0.015, // 1.5%
    settlementCycle: 1, // 1 day
    apiVersion: 'v1.2.0',
    supportedFeatures: ['payment', 'refund', 'settlement'],
    processingTime: '5-10 minutes',
  },
  nagad: {
    name: 'Nagad',
    country: 'BD',
    type: 'mobile_money',
    currencies: ['BDT'],
    minAmount: 10,
    maxAmount: 200000,
    fee: 0.015, // 1.5%
    settlementCycle: 1,
    apiVersion: 'v1.0.0',
    supportedFeatures: ['payment', 'refund', 'settlement'],
    processingTime: '5-10 minutes',
  },
  rocket: {
    name: 'Rocket',
    country: 'BD',
    type: 'mobile_money',
    currencies: ['BDT'],
    minAmount: 10,
    maxAmount: 50000,
    fee: 0.015, // 1.5%
    settlementCycle: 1,
    apiVersion: 'v1.1.0',
    supportedFeatures: ['payment', 'refund', 'settlement'],
    processingTime: '5-10 minutes',
  },

  // India
  razorpay: {
    name: 'Razorpay',
    country: 'IN',
    type: 'payment_gateway',
    currencies: ['INR', 'USD'],
    minAmount: 1,
    maxAmount: 10000000,
    fee: 0.02, // 2% + ₹0
    settlementCycle: 1,
    apiVersion: 'v1',
    supportedFeatures: ['payment', 'refund', 'settlement', 'recurring', 'tokenization'],
    processingTime: 'instant',
  },
  upi: {
    name: 'UPI',
    country: 'IN',
    type: 'bank_transfer',
    currencies: ['INR'],
    minAmount: 1,
    maxAmount: 100000,
    fee: 0.0,
    settlementCycle: 1,
    apiVersion: 'v2',
    supportedFeatures: ['payment', 'refund', 'settlement'],
    processingTime: 'instant',
  },

  // Pakistan
  easypaisa: {
    name: 'Easypaisa',
    country: 'PK',
    type: 'mobile_money',
    currencies: ['PKR'],
    minAmount: 100,
    maxAmount: 500000,
    fee: 0.02, // 2%
    settlementCycle: 1,
    apiVersion: 'v1.0.0',
    supportedFeatures: ['payment', 'refund', 'settlement'],
    processingTime: '10-15 minutes',
  },
  jazz_cash: {
    name: 'JazzCash',
    country: 'PK',
    type: 'mobile_money',
    currencies: ['PKR'],
    minAmount: 100,
    maxAmount: 500000,
    fee: 0.02, // 2%
    settlementCycle: 1,
    apiVersion: 'v2.0.0',
    supportedFeatures: ['payment', 'refund', 'settlement'],
    processingTime: '10-15 minutes',
  },

  // Global
  stripe: {
    name: 'Stripe',
    country: 'GLOBAL',
    type: 'payment_gateway',
    currencies: [
      'USD',
      'EUR',
      'GBP',
      'INR',
      'AED',
      'SGD',
      'BDT',
      'PKR',
    ],
    minAmount: 0.5,
    maxAmount: 999999,
    fee: 0.029, // 2.9% + $0.30
    settlementCycle: 1,
    apiVersion: 'v1',
    supportedFeatures: [
      'payment',
      'refund',
      'settlement',
      'recurring',
      'tokenization',
      'multi_currency',
    ],
    processingTime: 'instant',
  },
  paypal: {
    name: 'PayPal',
    country: 'GLOBAL',
    type: 'payment_gateway',
    currencies: ['USD', 'EUR', 'GBP', 'INR', 'AED', 'SGD'],
    minAmount: 0.01,
    maxAmount: 999999,
    fee: 0.034, // 3.4% + $0.30
    settlementCycle: 1,
    apiVersion: 'v1',
    supportedFeatures: [
      'payment',
      'refund',
      'settlement',
      'recurring',
      'tokenization',
    ],
    processingTime: 'instant',
  },

  // Middle East
  telr: {
    name: 'Telr',
    country: 'AE',
    type: 'payment_gateway',
    currencies: ['AED', 'USD', 'EUR'],
    minAmount: 1,
    maxAmount: 5000000,
    fee: 0.025, // 2.5% + AED 2
    settlementCycle: 1,
    apiVersion: 'v1',
    supportedFeatures: ['payment', 'refund', 'settlement', 'recurring'],
    processingTime: 'instant',
  },
};

// Exchange rates (should be updated from external API)
export const EXCHANGE_RATES = {
  base: 'USD',
  rates: {
    USD: 1.0,
    BDT: 109.5,
    INR: 83.2,
    PKR: 278.5,
    GBP: 0.79,
    EUR: 0.92,
    AED: 3.67,
    SGD: 1.34,
  },
  lastUpdated: new Date().toISOString(),
  ttl: 3600, // 1 hour
};

// Regional pricing strategies
export const REGIONAL_PRICING_STRATEGIES = {
  personal: {
    BD: 999,
    IN: 799,
    PK: 1999,
    US: 9.99,
    GB: 7.99,
    AE: 35.99,
    SG: 13.99,
    default: 'USD',
  },
  team: {
    BD: 4999,
    IN: 3999,
    PK: 9999,
    US: 49.99,
    GB: 39.99,
    AE: 179.99,
    SG: 69.99,
    default: 'USD',
  },
  institution: {
    BD: 49999,
    IN: 39999,
    PK: 99999,
    US: 499.99,
    GB: 399.99,
    AE: 1799.99,
    SG: 699.99,
    default: 'USD',
  },
};

// Regional payment success rates (for analytics)
export const PAYMENT_SUCCESS_RATES = {
  bkash: 0.98,
  nagad: 0.96,
  rocket: 0.95,
  razorpay: 0.99,
  upi: 0.95,
  easypaisa: 0.92,
  jazz_cash: 0.93,
  stripe: 0.99,
  paypal: 0.98,
  telr: 0.97,
};

// Regional compliance & regulations
export const REGIONAL_COMPLIANCE = {
  BD: {
    regulations: ['BB_AML', 'BD_TAX_LAW'],
    requiredDocuments: ['NID', 'TIN'],
    complianceChecks: ['AML', 'KYC'],
    dataResidency: 'BD',
  },
  IN: {
    regulations: ['RBI_GUIDELINES', 'FEMA', 'GST'],
    requiredDocuments: ['PAN', 'GSTIN', 'AADHAR'],
    complianceChecks: ['AML', 'KYC', 'GST_COMPLIANCE'],
    dataResidency: 'IN',
  },
  PK: {
    regulations: ['SBP_REGULATIONS', 'REMITTANCE_CONTROLS'],
    requiredDocuments: ['CNIC', 'NTN'],
    complianceChecks: ['AML', 'KYC'],
    dataResidency: 'PK',
  },
  US: {
    regulations: ['PCI_DSS', 'ADA_COMPLIANCE', 'STATE_LAWS'],
    requiredDocuments: ['SSN', 'DL'],
    complianceChecks: ['AML', 'KYC'],
    dataResidency: 'US',
  },
  GB: {
    regulations: ['FCA_GUIDELINES', 'GDPR', 'PSD2'],
    requiredDocuments: ['PASSPORT', 'PROOF_OF_ADDRESS'],
    complianceChecks: ['AML', 'KYC', 'GDPR'],
    dataResidency: 'EU',
  },
  AE: {
    regulations: ['ADCB_GUIDELINES', 'UAE_TAX_LAW'],
    requiredDocuments: ['EMIRATE_ID', 'TRADE_LICENSE'],
    complianceChecks: ['AML', 'KYC'],
    dataResidency: 'AE',
  },
  SG: {
    regulations: ['MAS_GUIDELINES', 'PDPA'],
    requiredDocuments: ['NRIC', 'FIN'],
    complianceChecks: ['AML', 'KYC'],
    dataResidency: 'SG',
  },
};

// Payment method availability by region
export const GATEWAY_AVAILABILITY_MATRIX = {
  BD: ['bkash', 'nagad', 'rocket', 'stripe', 'bank_transfer'],
  IN: ['razorpay', 'upi', 'stripe', 'paypal', 'bank_transfer'],
  PK: ['easypaisa', 'jazz_cash', 'stripe', 'bank_transfer'],
  US: ['stripe', 'paypal', 'bank_transfer'],
  GB: ['stripe', 'paypal', 'bank_transfer'],
  AE: ['telr', 'stripe', 'paypal', 'bank_transfer'],
  SG: ['stripe', 'paypal', 'bank_transfer'],
};

// Fraud detection thresholds by region
export const FRAUD_DETECTION_THRESHOLDS = {
  large_transaction: {
    BD: 500000, // BDT
    IN: 100000, // INR
    PK: 1000000, // PKR
    US: 5000, // USD
    GB: 4000, // GBP
    AE: 20000, // AED
    SG: 7000, // SGD
  },
  daily_limit: {
    BD: 2000000,
    IN: 500000,
    PK: 5000000,
    US: 50000,
    GB: 40000,
    AE: 500000,
    SG: 100000,
  },
  velocity_check: {
    maxTransactionsPerHour: 5,
    maxTransactionsPerDay: 50,
    maxCardsPerDay: 3,
  },
};
