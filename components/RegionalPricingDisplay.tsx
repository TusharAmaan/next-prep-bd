'use client';

import { useState, useEffect } from 'react';
import { calculateRegionalPrice, formatPrice, getTaxInfo } from '@/lib/regionalPaymentUtils';

interface RegionalPricingDisplayProps {
  countryCode: string;
  licensePlan: 'personal' | 'team' | 'institution';
  quantity?: number;
  showBreakdown?: boolean;
  showTaxInfo?: boolean;
}

export default function RegionalPricingDisplay({
  countryCode,
  licensePlan,
  quantity = 1,
  showBreakdown = true,
  showTaxInfo = true,
}: RegionalPricingDisplayProps) {
  const [pricing, setPricing] = useState<any>(null);
  const [taxInfo, setTaxInfo] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPricing();
  }, [countryCode, licensePlan, quantity]);

  const loadPricing = () => {
    try {
      const price = calculateRegionalPrice(licensePlan, countryCode, quantity);
      setPricing(price);

      if (showTaxInfo) {
        const tax = getTaxInfo(countryCode);
        setTaxInfo(tax);
      }
    } finally {
      setLoading(false);
    }
  };

  if (loading || !pricing) {
    return <div className="animate-pulse h-32 bg-gray-200 rounded" />;
  }

  return (
    <div className="space-y-4">
      {/* Main Price Display */}
      <div className="text-center">
        <div className="text-4xl font-bold text-blue-600">
          {formatPrice(pricing.total, countryCode)}
        </div>
        <div className="text-sm text-gray-600 mt-1">
          {licensePlan.charAt(0).toUpperCase() + licensePlan.slice(1)} Plan
          {quantity > 1 && ` × ${quantity}`}
        </div>
      </div>

      {/* Price Breakdown (if enabled) */}
      {showBreakdown && (
        <div className="bg-gray-50 rounded-lg p-4 space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-600">Subtotal:</span>
            <span className="font-medium">
              {formatPrice(pricing.breakdown.subtotal, countryCode)}
            </span>
          </div>

          {taxInfo && pricing.breakdown.tax > 0 && (
            <div className="flex justify-between">
              <span className="text-gray-600">
                {taxInfo.taxType} ({(taxInfo.rate * 100).toFixed(0)}%):
              </span>
              <span className="font-medium">
                {formatPrice(pricing.breakdown.tax, countryCode)}
              </span>
            </div>
          )}

          {pricing.breakdown.gatewayFee > 0 && (
            <div className="flex justify-between">
              <span className="text-gray-600">Payment Fee:</span>
              <span className="font-medium">
                {formatPrice(pricing.breakdown.gatewayFee, countryCode)}
              </span>
            </div>
          )}

          <div className="border-t pt-2 flex justify-between font-bold">
            <span>Total:</span>
            <span className="text-blue-600">
              {formatPrice(pricing.breakdown.total, countryCode)}
            </span>
          </div>
        </div>
      )}

      {/* Tax Information (if enabled) */}
      {showTaxInfo && taxInfo && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-xs text-blue-800">
          <p className="font-semibold mb-1">Tax Information</p>
          <p>
            {taxInfo.description} is included in the total price. Your invoice will
            show itemized tax details.
          </p>
        </div>
      )}

      {/* Pricing Note */}
      <div className="text-xs text-gray-500 text-center">
        Prices are shown in {pricing.originalCurrency}
      </div>
    </div>
  );
}
