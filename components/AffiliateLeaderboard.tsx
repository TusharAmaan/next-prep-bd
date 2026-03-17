'use client';

import { useState, useEffect } from 'react';
import { AFFILIATE_CONFIG } from '@/lib/affiliateConfig';

interface Affiliate {
  id: string;
  user_id: string;
  user_name: string;
  tier: string;
  total_earnings: number;
  total_referrals: number;
  rank: number;
}

type Period = 'week' | 'month' | 'all-time';

export default function AffiliateLeaderboard() {
  const [leaderboard, setLeaderboard] = useState<Affiliate[]>([]);
  const [period, setPeriod] = useState<Period>('month');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchLeaderboard();
  }, [period]);

  const fetchLeaderboard = async () => {
    try {
      setLoading(true);
      const res = await fetch(
        `/api/affiliate/manage?action=top-affiliates&period=${period}&limit=100`
      );

      if (!res.ok) throw new Error('Failed to fetch leaderboard');

      const data = await res.json();
      setLeaderboard(data.affiliates || []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const getTierColor = (tier: string) => {
    const colors: Record<string, string> = {
      bronze: 'bg-amber-100 text-amber-900',
      silver: 'bg-slate-100 text-slate-900',
      gold: 'bg-yellow-100 text-yellow-900',
      platinum: 'bg-purple-100 text-purple-900',
    };
    return colors[tier.toLowerCase()] || 'bg-gray-100 text-gray-900';
  };

  const getMedalEmoji = (rank: number) => {
    if (rank === 1) return '🥇';
    if (rank === 2) return '🥈';
    if (rank === 3) return '🥉';
    return `#${rank}`;
  };

  return (
    <div className="max-w-6xl mx-auto py-8 px-4">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          Affiliate Leaderboard
        </h1>

        {/* Period Selector */}
        <div className="flex gap-2">
          {(['week', 'month', 'all-time'] as const).map((p) => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
                period === p
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              {p.replace('-', ' ').toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      {/* Error State */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-800 mb-6">
          {error}
        </div>
      )}

      {/* Loading State */}
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        </div>
      ) : leaderboard.length === 0 ? (
        <div className="bg-gray-50 rounded-lg p-8 text-center text-gray-600">
          <p>No affiliates yet for this period</p>
        </div>
      ) : (
        /* Leaderboard Table */
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b-2 border-gray-300">
                <th className="text-left py-4 px-4 font-bold text-gray-900">
                  Rank
                </th>
                <th className="text-left py-4 px-4 font-bold text-gray-900">
                  Affiliate
                </th>
                <th className="text-center py-4 px-4 font-bold text-gray-900">
                  Tier
                </th>
                <th className="text-right py-4 px-4 font-bold text-gray-900">
                  Referrals
                </th>
                <th className="text-right py-4 px-4 font-bold text-gray-900">
                  Earnings
                </th>
              </tr>
            </thead>

            <tbody>
              {leaderboard.map((affiliate, index) => (
                <tr
                  key={affiliate.id}
                  className={`border-b border-gray-200 hover:bg-blue-50 transition-colors ${
                    index < 3 ? 'bg-yellow-50' : ''
                  }`}
                >
                  <td className="py-4 px-4">
                    <div className="flex items-center justify-center w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 text-white font-bold text-lg">
                      {getMedalEmoji(affiliate.rank || index + 1)}
                    </div>
                  </td>

                  <td className="py-4 px-4">
                    <div>
                      <p className="font-semibold text-gray-900">
                        {affiliate.user_name || `Affiliate #${affiliate.id}`}
                      </p>
                      <p className="text-xs text-gray-600">
                        {affiliate.user_id}
                      </p>
                    </div>
                  </td>

                  <td className="py-4 px-4 text-center">
                    <span
                      className={`inline-block px-3 py-1 rounded-full text-sm font-semibold ${getTierColor(
                        affiliate.tier
                      )}`}
                    >
                      {(affiliate.tier || 'Bronze').charAt(0).toUpperCase() +
                        (affiliate.tier || 'Bronze').slice(1)}
                    </span>
                  </td>

                  <td className="py-4 px-4 text-right">
                    <p className="font-bold text-gray-900">
                      {affiliate.total_referrals.toLocaleString()}
                    </p>
                  </td>

                  <td className="py-4 px-4 text-right">
                    <p className="font-bold text-green-600 text-lg">
                      ৳{(affiliate.total_earnings || 0).toLocaleString()}
                    </p>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Reward Tiers Info */}
      <div className="mt-12 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Commission Tiers</h2>

        <div className="grid md:grid-cols-4 gap-6">
          {Object.entries(AFFILIATE_CONFIG.TIERS).map(([tier, config]: any) => (
            <div key={tier} className="bg-white rounded-lg p-4 shadow">
              <div className={`inline-block px-3 py-1 rounded-full text-sm font-bold mb-3 ${getTierColor(tier)}`}>
                {config.name}
              </div>

              <p className="text-2xl font-bold text-gray-900 mb-2">
                {config.commission_percentage}%
              </p>

              <p className="text-sm text-gray-600 mb-3">
                Commission Rate
              </p>

              <ul className="text-xs text-gray-700 space-y-1">
                <li>
                  💰 ৳{(config.monthly_bonus || 0).toLocaleString()} monthly bonus
                </li>
                <li>
                  📊 {config.referral_threshold} referrals to unlock
                </li>
              </ul>
            </div>
          ))}
        </div>
      </div>

      {/* Stats Footer */}
      <div className="mt-8 border-t border-gray-300 pt-8">
        <h3 className="text-lg font-bold text-gray-900 mb-4">How We Rank</h3>

        <div className="space-y-3 text-sm text-gray-700">
          <p>
            🏆 <strong>Rankings are calculated by total earnings</strong> during the selected period
          </p>
          <p>
            📈 <strong>Tier promotions</strong> are based on referral count, not earnings
          </p>
          <p>
            ⏱️ <strong>Weekly leaderboard</strong> resets every Monday
          </p>
          <p>
            📅 <strong>Monthly leaderboard</strong> resets on the 1st of each month
          </p>
          <p>
            ∞ <strong>All-time leaderboard</strong> includes lifetime earnings since signup
          </p>
        </div>
      </div>
    </div>
  );
}
