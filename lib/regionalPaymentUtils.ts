import { REGIONAL_CONFIGS, PAYMENT_GATEWAYS, EXCHANGE_RATES, REGIONAL_PRICING_STRATEGIES, FRAUD_DETECTION_THRESHOLDS } from '@/lib/regionalPaymentConfig';

interface PriceQuote {
  originalAmount: number;
  originalCurrency: string;
  convertedAmount: number;
  convertedCurrency: string;
  exchangeRate: number;
  taxes: number;
  fees: number;
  total: number;
  breakdown: {
    subtotal: number;
    tax: number;
    gatewayFee: number;
    total: number;
  };
}

/**
 * Get regional configuration by country code
 */
export function getRegionalConfig(countryCode: string) {
  return REGIONAL_CONFIGS[countryCode as keyof typeof REGIONAL_CONFIGS] || null;
}

/**
 * Get available payment gateways for a region
 */
export function getAvailablePaymentGateways(countryCode: string): string[] {
  const matrix = {
    BD: ['bkash', 'nagad', 'rocket', 'stripe', 'bank_transfer'],
    IN: ['razorpay', 'upi', 'stripe', 'paypal', 'bank_transfer'],
    PK: ['easypaisa', 'jazz_cash', 'stripe', 'bank_transfer'],
    US: ['stripe', 'paypal', 'bank_transfer'],
    GB: ['stripe', 'paypal', 'bank_transfer'],
    AE: ['telr', 'stripe', 'paypal', 'bank_transfer'],
    SG: ['stripe', 'paypal', 'bank_transfer'],
  };

  return matrix[countryCode as keyof typeof matrix] || ['stripe', 'paypal'];
}

/**
 * Get payment gateway details
 */
export function getGatewayDetails(gatewayId: string) {
  return PAYMENT_GATEWAYS[gatewayId as keyof typeof PAYMENT_GATEWAYS] || null;
}

/**
 * Convert amount between currencies
 */
export function convertCurrency(
  amount: number,
  fromCurrency: string,
  toCurrency: string,
  customRates?: Record<string, number>
): number {
  const rates = customRates || EXCHANGE_RATES.rates;

  if (fromCurrency === toCurrency) {
    return amount;
  }

  const fromRate = rates[fromCurrency as keyof typeof rates] || 1;
  const toRate = rates[toCurrency as keyof typeof rates] || 1;

  const baseAmount = amount / fromRate;
  const convertedAmount = baseAmount * toRate;

  return Math.round(convertedAmount * 100) / 100;
}

/**
 * Calculate pricing for a region
 */
export function calculateRegionalPrice(
  licensePlan: 'personal' | 'team' | 'institution',
  countryCode: string,
  quantity: number = 1
): PriceQuote {
  const regionalConfig = getRegionalConfig(countryCode);
  if (!regionalConfig) {
    throw new Error(`Unsupported country: ${countryCode}`);
  }

  const pricingStrategy = REGIONAL_PRICING_STRATEGIES[licensePlan];
  const basePrice = pricingStrategy[countryCode as keyof typeof pricingStrategy] || pricingStrategy.default;

  // Calculate subtotal
  const subtotal = basePrice * quantity;

  // Calculate tax
  const taxRate = regionalConfig.vat || regionalConfig.gst || regionalConfig.sales_tax || 0;
  const tax = Math.round(subtotal * taxRate * 100) / 100;

  // Get appropriate gateway fee (use Stripe as default)
  const gateway = getGatewayDetails('stripe');
  let gatewayFee = 0;
  if (gateway) {
    // Stripe fee: 2.9% + $0.30 (convert to local currency)
    const fePercentage = subtotal * 0.029;
    const fixedFeeInUsd = 0.3;
    const fixedFeeInLocal = convertCurrency(fixedFeeInUsd, 'USD', regionalConfig.currency);
    gatewayFee = Math.round((fePercentage + fixedFeeInLocal) * 100) / 100;
  }

  // Calculate total
  const total = Math.round((subtotal + tax + gatewayFee) * 100) / 100;

  return {
    originalAmount: basePrice,
    originalCurrency: regionalConfig.currency,
    convertedAmount: subtotal,
    convertedCurrency: regionalConfig.currency,
    exchangeRate: 1,
    taxes: tax,
    fees: gatewayFee,
    total,
    breakdown: {
      subtotal,
      tax,
      gatewayFee,
      total,
    },
  };
}

/**
 * Validate payment amount for region
 */
export function validatePaymentAmount(
  amount: number,
  countryCode: string,
  gatewayId?: string
): { valid: boolean; error?: string } {
  const regionalConfig = getRegionalConfig(countryCode);
  if (!regionalConfig) {
    return { valid: false, error: 'Unsupported country' };
  }

  // Check regional limits
  if (amount < regionalConfig.minPayment) {
    return {
      valid: false,
      error: `Minimum payment is ${regionalConfig.currencySymbol}${regionalConfig.minPayment}`,
    };
  }

  if (amount > regionalConfig.maxPayment) {
    return {
      valid: false,
      error: `Maximum payment is ${regionalConfig.currencySymbol}${regionalConfig.maxPayment}`,
    };
  }

  // Check gateway limits if specified
  if (gatewayId) {
    const gateway = getGatewayDetails(gatewayId);
    if (gateway) {
      const convertedMin = convertCurrency(
        gateway.minAmount,
        gateway.currencies[0],
        regionalConfig.currency
      );
      const convertedMax = convertCurrency(
        gateway.maxAmount,
        gateway.currencies[0],
        regionalConfig.currency
      );

      if (amount < convertedMin) {
        return {
          valid: false,
          error: `${gateway.name} has a minimum of ${regionalConfig.currencySymbol}${Math.ceil(convertedMin)}`,
        };
      }

      if (amount > convertedMax) {
        return {
          valid: false,
          error: `${gateway.name} has a maximum of ${regionalConfig.currencySymbol}${Math.floor(convertedMax)}`,
        };
      }
    }
  }

  return { valid: true };
}

/**
 * Format price for display
 */
export function formatPrice(
  amount: number,
  countryCode: string,
  includeSymbol: boolean = true
): string {
  const regionalConfig = getRegionalConfig(countryCode);
  if (!regionalConfig) {
    return `$${amount.toFixed(2)}`;
  }

  const formatted = amount.toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

  return includeSymbol
    ? `${regionalConfig.currencySymbol}${formatted}`
    : formatted;
}

/**
 * Get tax information for region
 */
export function getTaxInfo(countryCode: string): {
  taxType: string;
  rate: number;
  description: string;
} | null {
  const regionalConfig = getRegionalConfig(countryCode);
  if (!regionalConfig) return null;

  if (regionalConfig.vat !== undefined) {
    return {
      taxType: 'VAT',
      rate: regionalConfig.vat,
      description: `Value Added Tax (${(regionalConfig.vat * 100).toFixed(0)}%)`,
    };
  }

  if (regionalConfig.gst !== undefined) {
    return {
      taxType: 'GST',
      rate: regionalConfig.gst,
      description: `Goods and Services Tax (${(regionalConfig.gst * 100).toFixed(0)}%)`,
    };
  }

  if (regionalConfig.sales_tax !== undefined) {
    return {
      taxType: 'Sales Tax',
      rate: regionalConfig.sales_tax,
      description: `Sales Tax (${(regionalConfig.sales_tax * 100).toFixed(0)}%)`,
    };
  }

  return null;
}

/**
 * Check fraud risk for transaction
 */
export function checkFraudRisk(
  amount: number,
  countryCode: string,
  userTransactionHistory?: {
    dailyTotal: number;
    hourlyCount: number;
    cardsUsedToday: number;
  }
): { riskLevel: 'low' | 'medium' | 'high'; flags: string[] } {
  const thresholds = FRAUD_DETECTION_THRESHOLDS;
  const regionalConfig = getRegionalConfig(countryCode);

  if (!regionalConfig) {
    return { riskLevel: 'low', flags: [] };
  }

  const flags: string[] = [];
  let riskScore = 0;

  // Check large transaction threshold
  const largeTransactionLimit = thresholds.large_transaction[countryCode as keyof typeof thresholds.large_transaction];
  if (amount > largeTransactionLimit) {
    flags.push('Large transaction amount');
    riskScore += 2;
  }

  // Check transaction history
  if (userTransactionHistory) {
    const dailyLimit = thresholds.daily_limit[countryCode as keyof typeof thresholds.daily_limit];
    if (userTransactionHistory.dailyTotal + amount > dailyLimit) {
      flags.push('Daily transaction limit exceeded');
      riskScore += 3;
    }

    const velocityThreshold = thresholds.velocity_check;
    if (userTransactionHistory.hourlyCount >= velocityThreshold.maxTransactionsPerHour) {
      flags.push('Too many transactions in short time');
      riskScore += 2;
    }

    if (userTransactionHistory.cardsUsedToday >= velocityThreshold.maxCardsPerDay) {
      flags.push('Multiple cards used today');
      riskScore += 2;
    }
  }

  let riskLevel: 'low' | 'medium' | 'high' = 'low';
  if (riskScore >= 5) {
    riskLevel = 'high';
  } else if (riskScore >= 2) {
    riskLevel = 'medium';
  }

  return { riskLevel, flags };
}

/**
 * Get settlement information for gateway
 */
export function getSettlementInfo(gatewayId: string): {
  settlementCycle: number;
  minimumSettlement: number;
  holdPeriod: number;
  description: string;
} | null {
  const gateway = getGatewayDetails(gatewayId);
  if (!gateway) return null;

  return {
    settlementCycle: gateway.settlementCycle,
    minimumSettlement: gateway.type === 'mobile_money' ? 1000 : 10000,
    holdPeriod: gateway.type === 'mobile_money' ? 0 : 1,
    description: `${gateway.name} processes settlements every ${gateway.settlementCycle} day(s)`,
  };
}

/**
 * Recommend best payment gateway for region
 */
export function recommendPaymentGateway(
  countryCode: string,
  amount: number,
  userType: 'individual' | 'business' = 'individual'
): string {
  const availableGateways = getAvailablePaymentGateways(countryCode);
  const regionalConfig = getRegionalConfig(countryCode);

  if (!regionalConfig) {
    return 'stripe';
  }

  // Priority scoring logic
  const scores: Record<string, number> = {};

  for (const gatewayId of availableGateways) {
    const gateway = getGatewayDetails(gatewayId);
    if (!gateway) continue;

    let score = 100;

    // Local payment methods get higher priority
    if (gateway.country === countryCode) {
      score += 30;
    }

    // Check amount compatibility
    const convertedMin = convertCurrency(gateway.minAmount, gateway.currencies[0], regionalConfig.currency);
    const convertedMax = convertCurrency(gateway.maxAmount, gateway.currencies[0], regionalConfig.currency);

    if (amount >= convertedMin && amount <= convertedMax) {
      score += 20;
    }

    // Lower fees are better
    score -= gateway.fee * 1000;

    // Mobile money for lower amounts in developing markets
    if (
      amount < 5000 &&
      (countryCode === 'BD' || countryCode === 'PK' || countryCode === 'IN') &&
      gateway.type === 'mobile_money'
    ) {
      score += 20;
    }

    scores[gatewayId] = score;
  }

  // Return gateway with highest score
  return Object.entries(scores).sort(([, a], [, b]) => b - a)[0]?.[0] || 'stripe';
}

/**
 * Get currency details
 */
export function getCurrencyDetails(currencyCode: string): {
  code: string;
  symbol: string;
  name: string;
  countries: string[];
} | null {
  const currencies: Record<string, any> = {
    BDT: {
      code: 'BDT',
      symbol: '৳',
      name: 'Bangladeshi Taka',
      countries: ['BD'],
    },
    INR: {
      code: 'INR',
      symbol: '₹',
      name: 'Indian Rupee',
      countries: ['IN'],
    },
    PKR: {
      code: 'PKR',
      symbol: '₨',
      name: 'Pakistani Rupee',
      countries: ['PK'],
    },
    USD: {
      code: 'USD',
      symbol: '$',
      name: 'US Dollar',
      countries: ['US'],
    },
    GBP: {
      code: 'GBP',
      symbol: '£',
      name: 'British Pound',
      countries: ['GB'],
    },
    EUR: {
      code: 'EUR',
      symbol: '€',
      name: 'Euro',
      countries: ['EU'],
    },
    AED: {
      code: 'AED',
      symbol: 'د.إ',
      name: 'UAE Dirham',
      countries: ['AE'],
    },
    SGD: {
      code: 'SGD',
      symbol: '$',
      name: 'Singapore Dollar',
      countries: ['SG'],
    },
  };

  return currencies[currencyCode] || null;
}

/**
 * Calculate effective cost with all fees
 */
export function calculateEffectiveCost(
  amount: number,
  countryCode: string,
  gatewayId: string
): {
  merchantAmount: number;
  gatewayFee: number;
  effectiveRate: number;
} {
  const gateway = getGatewayDetails(gatewayId);
  const regionalConfig = getRegionalConfig(countryCode);

  if (!gateway || !regionalConfig) {
    return { merchantAmount: amount, gatewayFee: 0, effectiveRate: 0 };
  }

  // Calculate fee based on gateway structure
  let gatewayFee = 0;

  if (gateway.fee < 1) {
    // Percentage fee
    gatewayFee = amount * gateway.fee;
  } else {
    // Fixed fee (in cents for most gateways)
    gatewayFee = gateway.fee;
  }

  const merchantAmount = amount - gatewayFee;
  const effectiveRate = (gatewayFee / amount) * 100;

  return {
    merchantAmount: Math.round(merchantAmount * 100) / 100,
    gatewayFee: Math.round(gatewayFee * 100) / 100,
    effectiveRate: Math.round(effectiveRate * 100) / 100,
  };
}
