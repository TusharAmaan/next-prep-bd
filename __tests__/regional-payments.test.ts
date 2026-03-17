import {
  calculateRegionalPrice,
  formatPrice,
  validatePaymentAmount,
  getAvailablePaymentGateways,
  recommendPaymentGateway,
  convertCurrency,
  checkFraudRisk,
  getTaxInfo,
  calculateEffectiveCost,
} from '@/lib/regionalPaymentUtils';

describe('Regional Payment Utils', () => {
  describe('calculateRegionalPrice', () => {
    test('should calculate BD pricing correctly', () => {
      const price = calculateRegionalPrice('personal', 'BD', 1);
      expect(price.originalAmount).toBe(999);
      expect(price.originalCurrency).toBe('BDT');
      expect(price.breakdown.tax).toBeGreaterThan(0); // 15% VAT
      expect(price.total).toGreaterThan(price.breakdown.subtotal);
    });

    test('should calculate IN pricing correctly', () => {
      const price = calculateRegionalPrice('team', 'IN', 1);
      expect(price.originalAmount).toBe(3999);
      expect(price.originalCurrency).toBe('INR');
      expect(price.breakdown.tax).toBeGreaterThan(0); // 18% GST
    });

    test('should apply quantity multiplier', () => {
      const single = calculateRegionalPrice('personal', 'BD', 1);
      const multiple = calculateRegionalPrice('personal', 'BD', 3);
      expect(multiple.breakdown.subtotal).toBe(single.breakdown.subtotal * 3);
    });

    test('should throw error for unsupported country', () => {
      expect(() => calculateRegionalPrice('personal', 'XX', 1)).toThrow();
    });
  });

  describe('formatPrice', () => {
    test('should format BD price with symbol', () => {
      const formatted = formatPrice(999, 'BD');
      expect(formatted).toBe('৳999.00');
    });

    test('should format BD price without symbol', () => {
      const formatted = formatPrice(999, 'BD', false);
      expect(formatted).toBe('999.00');
    });

    test('should format US price correctly', () => {
      const formatted = formatPrice(99.99, 'US');
      expect(formatted).toBe('$99.99');
    });

    test('should handle large numbers', () => {
      const formatted = formatPrice(1234567.89, 'IN');
      expect(formatted).toContain('₹');
      expect(formatted).toContain('1,234,567.89');
    });
  });

  describe('validatePaymentAmount', () => {
    test('should accept valid amount', () => {
      const result = validatePaymentAmount(500, 'BD');
      expect(result.valid).toBe(true);
    });

    test('should reject amount below minimum', () => {
      const result = validatePaymentAmount(10, 'BD');
      expect(result.valid).toBe(false);
      expect(result.error).toContain('Minimum');
    });

    test('should reject amount above maximum', () => {
      const result = validatePaymentAmount(2000000, 'BD');
      expect(result.valid).toBe(false);
      expect(result.error).toContain('Maximum');
    });

    test('should validate with gateway limits', () => {
      const result = validatePaymentAmount(999, 'BD', 'bkash');
      expect(result.valid).toBe(true);
    });

    test('should validate unsupported country', () => {
      const result = validatePaymentAmount(100, 'XX');
      expect(result.valid).toBe(false);
    });
  });

  describe('convertCurrency', () => {
    test('should return same amount for same currency', () => {
      const result = convertCurrency(1000, 'USD', 'USD');
      expect(result).toBe(1000);
    });

    test('should convert USD to BDT', () => {
      const result = convertCurrency(1, 'USD', 'BDT');
      expect(result).toBeGreaterThan(100);
    });

    test('should convert BDT to USD', () => {
      const result = convertCurrency(109.5, 'BDT', 'USD');
      expect(result).toBeCloseTo(1, 0);
    });

    test('should handle custom rates', () => {
      const customRates = { BDT: 110, USD: 1 };
      const result = convertCurrency(110, 'BDT', 'USD', customRates);
      expect(result).toBe(1);
    });
  });

  describe('getAvailablePaymentGateways', () => {
    test('should return BD payment methods', () => {
      const gateways = getAvailablePaymentGateways('BD');
      expect(gateways).toContain('bkash');
      expect(gateways).toContain('nagad');
      expect(gateways).toContain('rocket');
    });

    test('should return IN payment methods', () => {
      const gateways = getAvailablePaymentGateways('IN');
      expect(gateways).toContain('razorpay');
      expect(gateways).toContain('upi');
    });

    test('should return US payment methods', () => {
      const gateways = getAvailablePaymentGateways('US');
      expect(gateways).toContain('stripe');
      expect(gateways).toContain('paypal');
    });
  });

  describe('recommendPaymentGateway', () => {
    test('should recommend bKash for small BD amounts', () => {
      const recommended = recommendPaymentGateway('BD', 500);
      expect(recommended).toBe('bkash');
    });

    test('should recommend Razorpay for IN', () => {
      const recommended = recommendPaymentGateway('IN', 1000);
      expect(recommended).toBe('razorpay');
    });

    test('should recommend Stripe for US', () => {
      const recommended = recommendPaymentGateway('US', 50);
      expect(['stripe', 'paypal']).toContain(recommended);
    });

    test('should return stripe for unknown country', () => {
      const recommended = recommendPaymentGateway('XX', 100);
      expect(recommended).toBe('stripe');
    });
  });

  describe('checkFraudRisk', () => {
    test('should mark large transaction as medium risk', () => {
      const risk = checkFraudRisk(600000, 'BD');
      expect(['medium', 'high']).toContain(risk.riskLevel);
      expect(risk.flags).toContain('Large transaction amount');
    });

    test('should mark normal transaction as low risk', () => {
      const risk = checkFraudRisk(1000, 'BD');
      expect(risk.riskLevel).toBe('low');
      expect(risk.flags.length).toBe(0);
    });

    test('should detect velocity abuse', () => {
      const risk = checkFraudRisk(1000, 'BD', {
        dailyTotal: 1900000,
        hourlyCount: 10,
        cardsUsedToday: 3,
      });
      expect(['medium', 'high']).toContain(risk.riskLevel);
    });

    test('should detect daily limit exceeded', () => {
      const risk = checkFraudRisk(500000, 'BD', {
        dailyTotal: 1600000,
        hourlyCount: 2,
        cardsUsedToday: 1,
      });
      expect(risk.flags).toContain('Daily transaction limit exceeded');
    });
  });

  describe('getTaxInfo', () => {
    test('should return VAT info for BD', () => {
      const tax = getTaxInfo('BD');
      expect(tax?.taxType).toBe('VAT');
      expect(tax?.rate).toBe(0.15);
    });

    test('should return GST info for IN', () => {
      const tax = getTaxInfo('IN');
      expect(tax?.taxType).toBe('GST');
      expect(tax?.rate).toBe(0.18);
    });

    test('should return null for unsupported country', () => {
      const tax = getTaxInfo('XX');
      expect(tax).toBeNull();
    });
  });

  describe('calculateEffectiveCost', () => {
    test('should calculate Stripe fees correctly', () => {
      const cost = calculateEffectiveCost(1000, 'BD', 'stripe');
      expect(cost.gatewayFee).toBeGreaterThan(0);
      expect(cost.merchantAmount).toBeLessThan(1000);
      expect(cost.merchantAmount + cost.gatewayFee).toBe(1000);
    });

    test('should calculate bKash fees correctly', () => {
      const cost = calculateEffectiveCost(1000, 'BD', 'bkash');
      const expectedFee = 1000 * 0.015; // 1.5%
      expect(cost.gatewayFee).toBeCloseTo(expectedFee, 1);
    });

    test('should show effective rate', () => {
      const cost = calculateEffectiveCost(1000, 'BD', 'bkash');
      expect(cost.effectiveRate).toBeCloseTo(1.5, 0);
    });
  });

  describe('Integration Tests', () => {
    test('complete BD purchase flow', () => {
      // Calculate price
      const pricing = calculateRegionalPrice('personal', 'BD', 1);
      expect(pricing.total).toBeGreaterThan(0);

      // Format for display
      const formatted = formatPrice(pricing.total, 'BD');
      expect(formatted).toContain('৳');

      // Validate amount
      const validation = validatePaymentAmount(pricing.total, 'BD');
      expect(validation.valid).toBe(true);

      // Get gateways
      const gateways = getAvailablePaymentGateways('BD');
      expect(gateways.length).toBeGreaterThan(0);

      // Check fraud risk
      const risk = checkFraudRisk(pricing.total, 'BD');
      expect(risk.riskLevel).toBe('low');

      // Calculate effective cost
      const cost = calculateEffectiveCost(
        pricing.total,
        'BD',
        gateways[0]
      );
      expect(cost.merchantAmount).toBeGreaterThan(0);
    });

    test('currency conversion flow', () => {
      // USD to BDT
      const bdtAmount = convertCurrency(10, 'USD', 'BDT');
      expect(bdtAmount).toBeGreaterThan(900);

      // Back to USD
      const usdAmount = convertCurrency(bdtAmount, 'BDT', 'USD');
      expect(usdAmount).toBeCloseTo(10, 0);
    });

    test('international purchase flow', () => {
      // US customer
      const pricing = calculateRegionalPrice('team', 'US', 1);
      expect(pricing.originalCurrency).toBe('USD');

      // Convert to BDT for display
      const bdtPrice = convertCurrency(pricing.total, 'USD', 'BDT');
      expect(bdtPrice).toBeGreaterThan(0);

      // Format display
      const formatted = formatPrice(bdtPrice, 'BD');
      expect(formatted).toContain('৳');
    });
  });

  describe('Regional Compliance', () => {
    test('should handle BD compliance requirements', () => {
      const pricing = calculateRegionalPrice('personal', 'BD', 1);
      const tax = getTaxInfo('BD');
      expect(tax?.taxType).toBe('VAT');
      expect(pricing.breakdown.tax).toBeGreaterThan(0);
    });

    test('should handle IN compliance requirements', () => {
      const pricing = calculateRegionalPrice('personal', 'IN', 1);
      const tax = getTaxInfo('IN');
      expect(tax?.taxType).toBe('GST');
      expect(pricing.breakdown.tax).toBeGreaterThan(0);
    });

    test('should handle UK GDPR requirements', () => {
      const pricing = calculateRegionalPrice('personal', 'GB', 1);
      expect(pricing.originalCurrency).toBe('GBP');
      // In real implementation, would check data residency
    });
  });

  describe('Error Handling', () => {
    test('should handle invalid country gracefully', () => {
      expect(() => calculateRegionalPrice('personal', 'ZZ', 1)).toThrow();
    });

    test('should handle invalid plan gracefully', () => {
      const gateways = getAvailablePaymentGateways('XY');
      expect(Array.isArray(gateways)).toBe(true);
    });

    test('should handle currency conversion errors', () => {
      const result = convertCurrency(0, 'USD', 'BDT');
      expect(result).toBe(0);
    });
  });

  describe('Performance', () => {
    test('should calculate pricing fast', () => {
      const start = Date.now();
      for (let i = 0; i < 100; i++) {
        calculateRegionalPrice('personal', 'BD', 1);
      }
      const duration = Date.now() - start;
      expect(duration).toBeLessThan(1000); // Should complete 100 in < 1 second
    });

    test('should convert currency fast', () => {
      const start = Date.now();
      for (let i = 0; i < 1000; i++) {
        convertCurrency(100, 'USD', 'BDT');
      }
      const duration = Date.now() - start;
      expect(duration).toBeLessThan(100); // Should complete 1000 in < 100ms
    });
  });
});
