'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { getTierDetails, generateReferralLink } from '@/lib/affiliateUtils';

interface AffiliateProfile {
  id: string;
  tier: string;
  referral_code: string;
  total_referrals: number;
  status: string;
  created_at: string;
}

interface Stats {
  totalClicks: number;
  totalReferrals: number;
  totalEarnings: number;
  purchasedReferrals: number;
  conversionRate: number;
  ctr: number;
  epc: number;
}

interface Earnings {
  total: number;
  pending: number;
  paid: number;
  available: number;
}

export default function AffiliateDashboard() {
  const { data: session } = useSession();
  const [profile, setProfile] = useState<AffiliateProfile | null>(null);
  const [stats, setStats] = useState<Stats | null>(null);
  const [earnings, setEarnings] = useState<Earnings | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    if (session?.user?.id) {
      fetchData();
    }
  }, [session?.user?.id]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await fetch(
        `/api/affiliate/manage?userId=${session?.user?.id}&action=profile`
      );

      if (!res.ok) {
        if (res.status === 404) {
          setError('Not an affiliate yet');
          return;
        }
        throw new Error('Failed to fetch affiliate data');
      }

      const data = await res.json();
      setProfile(data.profile);
      setStats(data.stats);
      setEarnings(data.earnings);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-yellow-800">
          <p className="font-semibold mb-2">{error}</p>
          <button
            onClick={() => window.location.href = '/affiliate-signup'}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Join Affiliate Program
          </button>
        </div>
      </div>
    );
  }

  if (!profile) {
    return <div>No affiliate profile found</div>;
  }

  const tierDetails = getTierDetails(profile.tier);
  const { standardLink, customLink } = generateReferralLink(profile.referral_code);

  return (
    <div className="max-w-6xl mx-auto py-8 px-4">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Affiliate Dashboard
        </h1>
        <p className="text-gray-600">
          Tier: <span className="font-bold">{tierDetails?.name || 'Bronze'}</span>
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-gray-600 text-sm font-semibold mb-1">
            Total Clicks
          </div>
          <div className="text-3xl font-bold text-gray-900">
            {stats?.totalClicks || 0}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-gray-600 text-sm font-semibold mb-1">
            Referrals
          </div>
          <div className="text-3xl font-bold text-blue-600">
            {stats?.totalReferrals || 0}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-gray-600 text-sm font-semibold mb-1">
            Conversion Rate
          </div>
          <div className="text-3xl font-bold text-green-600">
            {(stats?.conversionRate || 0).toFixed(2)}%
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-gray-600 text-sm font-semibold mb-1">
            Total Earnings
          </div>
          <div className="text-3xl font-bold text-purple-600">
            ৳{(stats?.totalEarnings || 0).toLocaleString()}
          </div>
        </div>
      </div>

      {/* Earnings Summary */}
      <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
        <h2 className="text-2xl font-bold mb-6">Earnings Summary</h2>

        <div className="grid md:grid-cols-4 gap-6">
          <div className="border-l-4 border-blue-500 pl-4">
            <p className="text-gray-600 text-sm">Total Earned</p>
            <p className="text-2xl font-bold text-gray-900">
              ৳{(earnings?.total || 0).toLocaleString()}
            </p>
          </div>

          <div className="border-l-4 border-orange-500 pl-4">
            <p className="text-gray-600 text-sm">Pending</p>
            <p className="text-2xl font-bold text-gray-900">
              ৳{(earnings?.pending || 0).toLocaleString()}
            </p>
          </div>

          <div className="border-l-4 border-green-500 pl-4">
            <p className="text-gray-600 text-sm">Available</p>
            <p className="text-2xl font-bold text-gray-900">
              ৳{(earnings?.available || 0).toLocaleString()}
            </p>
          </div>

          <div className="flex items-end">
            <button
              disabled={(earnings?.available || 0) < 5000}
              className="w-full px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Request Payout
            </button>
          </div>
        </div>

        {(earnings?.available || 0) < 5000 && (
          <p className="text-sm text-gray-600 mt-4">
            Minimum payout amount is ৳5,000. You need ৳{(5000 - (earnings?.available || 0)).toLocaleString()} more.
          </p>
        )}
      </div>

      {/* Tabs */}
      <div className="mb-6 border-b border-gray-200">
        <div className="flex gap-4">
          {['overview', 'referral-links', 'materials', 'settings'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 font-semibold transition-colors ${
                activeTab === tab
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              {tab.replace('-', ' ').toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content: Referral Links */}
      {activeTab === 'referral-links' && (
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h3 className="text-xl font-bold mb-6">Your Referral Links</h3>

          <div className="space-y-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Standard Referral Link
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={standardLink}
                  readOnly
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg bg-gray-50"
                />
                <button
                  onClick={() => navigator.clipboard.writeText(standardLink)}
                  className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                >
                  Copy
                </button>
              </div>
              <p className="text-xs text-gray-600 mt-1">
                Share this link to earn commissions from referrals
              </p>
            </div>

            {customLink && (
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Custom Referral Link
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={customLink}
                    readOnly
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg bg-gray-50"
                  />
                  <button
                    onClick={() => navigator.clipboard.writeText(customLink)}
                    className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                  >
                    Copy
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tab Content: Materials */}
      {activeTab === 'materials' && (
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h3 className="text-xl font-bold mb-6">Marketing Materials</h3>

          <div className="grid md:grid-cols-3 gap-6">
            <div className="border border-gray-200 rounded-lg p-4 text-center hover:shadow-lg transition-shadow cursor-pointer">
              <div className="bg-gray-100 h-40 rounded mb-3 flex items-center justify-center">
                <span className="text-gray-400">300×250</span>
              </div>
              <p className="text-sm font-semibold mb-2">Square Banner</p>
              <button className="text-blue-500 hover:underline text-sm">
                Download
              </button>
            </div>

            <div className="border border-gray-200 rounded-lg p-4 text-center hover:shadow-lg transition-shadow cursor-pointer">
              <div className="bg-gray-100 h-40 rounded mb-3 flex items-center justify-center">
                <span className="text-gray-400">728×90</span>
              </div>
              <p className="text-sm font-semibold mb-2">Leaderboard Banner</p>
              <button className="text-blue-500 hover:underline text-sm">
                Download
              </button>
            </div>

            <div className="border border-gray-200 rounded-lg p-4 text-center hover:shadow-lg transition-shadow cursor-pointer">
              <div className="bg-gray-100 h-40 rounded mb-3 flex items-center justify-center">
                <span className="text-gray-400">160×600</span>
              </div>
              <p className="text-sm font-semibold mb-2">Skyscraper Banner</p>
              <button className="text-blue-500 hover:underline text-sm">
                Download
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Tab Content: Settings */}
      {activeTab === 'settings' && (
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h3 className="text-xl font-bold mb-6">Account Settings</h3>

          <div className="space-y-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Payout Method
              </label>
              <select className="w-full px-4 py-2 border border-gray-300 rounded-lg">
                <option>Select payout method</option>
                <option>Bank Transfer</option>
                <option>bKash</option>
                <option>Nagad</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Payment Email
              </label>
              <input
                type="email"
                placeholder="your@email.com"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
              />
            </div>

            <button className="w-full px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600">
              Save Settings
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
