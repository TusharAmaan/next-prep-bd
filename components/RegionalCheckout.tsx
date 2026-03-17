'use client';

import { useState, useEffect } from 'react';
import { calculateRegionalPrice, formatPrice, getAvailablePaymentGateways, getGatewayDetails } from '@/lib/regionalPaymentUtils';

interface RegionalCheckoutProps {
  licensePlan: 'personal' | 'team' | 'institution';
  countryCode: string;
  quantity?: number;
  onSuccess?: (paymentDetails: any) => void;
}

export default function RegionalCheckout({
  licensePlan,
  countryCode,
  quantity = 1,
  onSuccess,
}: RegionalCheckoutProps) {
  const [pricing, setPricing] = useState<any>(null);
  const [availableGateways, setAvailableGateways] = useState<string[]>([]);
  const [selectedGateway, setSelectedGateway] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Fetch pricing on mount
  useEffect(() => {
    fetchPricing();
    fetchGateways();
  }, [licensePlan, countryCode, quantity]);

  const fetchPricing = async () => {
    try {
      const price = calculateRegionalPrice(licensePlan, countryCode, quantity);
      setPricing(price);
    } catch (err: any) {
      setError(err.message);
    }
  };

  const fetchGateways = async () => {
    try {
      const gateways = getAvailablePaymentGateways(countryCode);
      setAvailableGateways(gateways);
      setSelectedGateway(gateways[0] || 'stripe');
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handlePayment = async () => {
    setLoading(true);
    setError('');

    try {
      // Process payment based on selected gateway
      if (selectedGateway === 'bkash') {
        await processBkashPayment();
      } else if (selectedGateway === 'nagad') {
        await processNagadPayment();
      } else if (selectedGateway === 'razorpay') {
        await processRazorpayPayment();
      } else if (selectedGateway === 'stripe') {
        await processStripePayment();
      } else {
        throw new Error(`Gateway ${selectedGateway} not supported`);
      }
    } catch (err: any) {
      setError(err.message || 'Payment processing failed');
    } finally {
      setLoading(false);
    }
  };

  const processBkashPayment = async () => {
    const response = await fetch('/api/payments/bkash', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'initiate-payment',
        payload: {
          amount: pricing.total,
          orderId: `ORD-${Date.now()}`,
          customerName: 'User',
          customerEmail: 'user@example.com',
          customerPhone: '8801XXXXXXXXX',
          referenceId: `REF-${Date.now()}`,
        },
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error);
    }

    // Redirect to bKash checkout
    window.location.href = data.redirectUrl;
  };

  const processNagadPayment = async () => {
    // Nagad payment implementation
    console.log('Processing Nagad payment...');
    // Similar to bKash
  };

  const processRazorpayPayment = async () => {
    // Razorpay payment implementation
    console.log('Processing Razorpay payment...');
  };

  const processStripePayment = async () => {
    // Stripe payment implementation
    console.log('Processing Stripe payment...');
  };

  const gateway = getGatewayDetails(selectedGateway);

  if (!pricing) {
    return <div className="animate-pulse">Loading pricing...</div>;
  }

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      {/* Pricing Summary */}
      <div className="mb-8 p-6 bg-gray-50 rounded-lg">
        <h2 className="text-2xl font-bold mb-4">Order Summary</h2>

        <div className="space-y-2 mb-6">
          <div className="flex justify-between">
            <span>Plan:</span>
            <span className="font-semibold">
              {licensePlan.charAt(0).toUpperCase() + licensePlan.slice(1)}
            </span>
          </div>
          <div className="flex justify-between">
            <span>Quantity:</span>
            <span className="font-semibold">{quantity}</span>
          </div>
          <div className="flex justify-between">
            <span>Subtotal:</span>
            <span className="font-semibold">
              {formatPrice(pricing.breakdown.subtotal, countryCode)}
            </span>
          </div>
          <div className="flex justify-between">
            <span>Tax:</span>
            <span className="font-semibold">
              {formatPrice(pricing.breakdown.tax, countryCode)}
            </span>
          </div>
          <div className="flex justify-between">
            <span>Gateway Fee:</span>
            <span className="font-semibold">
              {formatPrice(pricing.breakdown.gatewayFee, countryCode)}
            </span>
          </div>
          <div className="border-t pt-2 flex justify-between">
            <span className="font-bold">Total:</span>
            <span className="text-xl font-bold text-blue-600">
              {formatPrice(pricing.breakdown.total, countryCode)}
            </span>
          </div>
        </div>
      </div>

      {/* Payment Method Selection */}
      <div className="mb-8">
        <h3 className="text-lg font-bold mb-4">Select Payment Method</h3>

        <div className="grid grid-cols-2 gap-3">
          {availableGateways.map((gatewayId) => {
            const gw = getGatewayDetails(gatewayId);
            if (!gw) return null;

            return (
              <button
                key={gatewayId}
                onClick={() => setSelectedGateway(gatewayId)}
                className={`p-4 border-2 rounded-lg transition-all ${
                  selectedGateway === gatewayId
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="font-semibold">{gw.name}</div>
                <div className="text-xs text-gray-600">
                  Fee: {(gw.fee * 100).toFixed(1)}%
                </div>
                <div className="text-xs text-gray-500 mt-1">
                  {gw.processingTime}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Gateway Details */}
      {gateway && (
        <div className="mb-8 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <p className="text-sm text-blue-800">
            <span className="font-semibold">{gateway.name}:</span> Settlement in{' '}
            {gateway.settlementCycle} day(s). Processing time: {gateway.processingTime}
          </p>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-800">
          {error}
        </div>
      )}

      {/* Pay Button */}
      <button
        onClick={handlePayment}
        disabled={loading || !selectedGateway}
        className="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 px-4 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? 'Processing...' : `Pay ${formatPrice(pricing.total, countryCode)}`}
      </button>

      {/* Security Badge */}
      <div className="mt-6 text-center text-xs text-gray-600">
        <div className="flex items-center justify-center gap-2">
          <svg
            className="w-4 h-4"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path d="M10 1a4.5 4.5 0 00-4.5 4.5V9H5a2 2 0 00-2 2v6a2 2 0 002 2h10a2 2 0 002-2v-6a2 2 0 00-2-2h-.5V5.5A4.5 4.5 0 0010 1zm3 8V5.5a3 3 0 10-6 0V9h6z" />
          </svg>
          Payments are secure and encrypted
        </div>
      </div>
    </div>
  );
}
