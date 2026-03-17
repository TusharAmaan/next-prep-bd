'use client';

import { useState } from 'react';
import { loadStripe } from '@stripe/js';
import { useRouter } from 'next/navigation';

interface License {
  type: string;
  seats: number;
  features: string[];
  maxUsers: number;
  price: number;
}

export default function LicensePurchase() {
  const [licenses, setLicenses] = useState<License[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const router = useRouter();

  // Fetch available licenses
  const fetchLicenses = async () => {
    try {
      const res = await fetch('/api/licenses/manage?action=list');
      const data = await res.json();
      setLicenses(data.licenses);
    } catch (error) {
      console.error('Failed to fetch licenses:', error);
    }
  };

  // Handle purchase
  const handlePurchase = async (planType: string) => {
    setLoading(true);
    try {
      const user = await fetch('/api/auth/user').then((r) => r.json());

      if (!user?.id) {
        router.push('/login');
        return;
      }

      // Create checkout session
      const res = await fetch('/api/licenses/payment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id,
          licenseType: planType,
          action: 'create-checkout',
        }),
      });

      const { sessionId, error } = await res.json();

      if (error) {
        alert(`Error: ${error}`);
        setLoading(false);
        return;
      }

      // Redirect to Stripe checkout
      const stripe = await loadStripe(
        process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
      );
      await stripe?.redirectToCheckout({ sessionId });
    } catch (error) {
      console.error('Purchase error:', error);
      alert('Failed to process purchase');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 py-12 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Choose Your Plan
          </h1>
          <p className="text-xl text-gray-600">
            Select the perfect plan for your needs
          </p>
        </div>

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-3 gap-8 mb-12">
          {licenses.map((license) => (
            <div
              key={license.type}
              className={`rounded-lg shadow-lg overflow-hidden transition-all ${
                selectedPlan === license.type
                  ? 'ring-4 ring-blue-500 scale-105'
                  : 'hover:shadow-xl'
              }`}
            >
              <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-6 text-white">
                <h3 className="text-2xl font-bold mb-2">
                  {license.type.charAt(0).toUpperCase() + license.type.slice(1)}
                </h3>
                <div className="text-4xl font-bold mb-2">
                  ৳{license.price.toLocaleString()}
                </div>
                <p className="text-blue-100">per month</p>
              </div>

              <div className="p-6">
                <div className="mb-6">
                  <p className="text-gray-600 mb-4">
                    Up to{' '}
                    <span className="font-bold text-gray-900">
                      {license.maxUsers}
                    </span>{' '}
                    users
                  </p>
                </div>

                {/* Features List */}
                <ul className="space-y-3 mb-8">
                  {license.features.map((feature, idx) => (
                    <li
                      key={idx}
                      className="flex items-center text-gray-700"
                    >
                      <svg
                        className="w-5 h-5 text-green-500 mr-3"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                      {feature}
                    </li>
                  ))}
                </ul>

                {/* Purchase Button */}
                <button
                  onClick={() => {
                    setSelectedPlan(license.type);
                    handlePurchase(license.type);
                  }}
                  disabled={loading && selectedPlan === license.type}
                  className="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 px-4 rounded-lg transition-colors disabled:opacity-50"
                >
                  {loading && selectedPlan === license.type
                    ? 'Processing...'
                    : 'Get Started'}
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* FAQ Section */}
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">
            Frequently Asked Questions
          </h2>

          <div className="space-y-6">
            <div className="bg-white p-6 rounded-lg shadow">
              <h4 className="font-bold text-lg mb-2">Can I change plans?</h4>
              <p className="text-gray-700">
                Yes, you can upgrade or downgrade your plan anytime from your
                account settings.
              </p>
            </div>

            <div className="bg-white p-6 rounded-lg shadow">
              <h4 className="font-bold text-lg mb-2">
                Is there a free trial?
              </h4>
              <p className="text-gray-700">
                All plans include a 7-day free trial. No credit card required.
              </p>
            </div>

            <div className="bg-white p-6 rounded-lg shadow">
              <h4 className="font-bold text-lg mb-2">
                What payment methods do you accept?
              </h4>
              <p className="text-gray-700">
                We accept credit cards (Visa, Mastercard), bKash, Nagad, and
                Rocket.
              </p>
            </div>

            <div className="bg-white p-6 rounded-lg shadow">
              <h4 className="font-bold text-lg mb-2">
                Can I cancel anytime?
              </h4>
              <p className="text-gray-700">
                Yes, cancel anytime. Your subscription will remain active until
                the end of the billing period.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
