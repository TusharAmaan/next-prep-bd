'use client';

import { useState, useEffect } from 'react';
import { Trophy, Star, Zap, Users, TrendingUp, Lock, CheckCircle, Gift } from 'lucide-react';

interface Badge {
  id: string;
  name: string;
  icon: string;
  points: number;
}

interface Challenge {
  id: string;
  title: string;
  description: string;
  icon: string;
  points: number;
  difficulty: 'easy' | 'medium' | 'hard';
  progress?: number;
  completed?: boolean;
  claimed?: boolean;
}

interface LeaderboardUser {
  id: string;
  full_name: string;
  points: number;
  rank: number;
  rankBadge: string;
}

interface GamificationWidgetProps {
  userId: string;
  segment?: string;
  showLeaderboard?: boolean;
  compact?: boolean;
}

export function GamificationWidget({
  userId,
  segment,
  showLeaderboard = true,
  compact = false,
}: GamificationWidgetProps) {
  const [badges, setBadges] = useState<Badge[]>([]);
  const [userBadges, setUserBadges] = useState<string[]>([]);
  const [dailyChallenges, setDailyChallenges] = useState<Challenge[]>([]);
  const [weeklyChallenges, setWeeklyChallenges] = useState<Challenge[]>([]);
  const [leaderboard, setLeaderboard] = useState<LeaderboardUser[]>([]);
  const [userRank, setUserRank] = useState<number | null>(null);
  const [userPoints, setUserPoints] = useState(0);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'badges' | 'challenges' | 'leaderboard'>('challenges');

  useEffect(() => {
    const fetchGamificationData = async () => {
      try {
        // Fetch available badges
        const badgesResponse = await fetch('/api/gamification/badges');
        const badgesData = await badgesResponse.json();
        setBadges(badgesData.badges);

        // Fetch challenges
        const challengesResponse = await fetch(
          `/api/gamification/challenges?userId=${userId}`
        );
        const challengesData = await challengesResponse.json();
        const daily = challengesData.challenges.filter(
          (c: Challenge) => c.duration_days === 1
        );
        const weekly = challengesData.challenges.filter(
          (c: Challenge) => c.duration_days === 7
        );
        setDailyChallenges(daily);
        setWeeklyChallenges(weekly);

        // Fetch leaderboard
        if (showLeaderboard) {
          const leaderboardResponse = await fetch(
            `/api/gamification/leaderboard?limit=10${segment ? `&segment=${segment}` : ''}`
          );
          const leaderboardData = await leaderboardResponse.json();
          setLeaderboard(leaderboardData.leaderboard);

          const userRankData = leaderboardData.leaderboard.find(
            (u: LeaderboardUser) => u.id === userId
          );
          if (userRankData) {
            setUserRank(userRankData.rank);
            setUserPoints(userRankData.points);
          }
        }

        setLoading(false);
      } catch (error) {
        console.error('Failed to fetch gamification data:', error);
        setLoading(false);
      }
    };

    fetchGamificationData();
  }, [userId, segment, showLeaderboard]);

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy':
        return 'bg-green-50 text-green-600';
      case 'medium':
        return 'bg-orange-50 text-orange-600';
      case 'hard':
        return 'bg-red-50 text-red-600';
      default:
        return 'bg-slate-50 text-slate-600';
    }
  };

  const claimChallenge = async (challengeId: string, points: number) => {
    try {
      const response = await fetch('/api/gamification/challenges', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          challengeId,
          action: 'claim',
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setUserPoints(data.totalPoints);
        // Refresh challenges
        window.location.reload();
      }
    } catch (error) {
      console.error('Failed to claim challenge:', error);
    }
  };

  if (loading) {
    return (
      <div className="animate-pulse space-y-4">
        <div className="h-20 bg-slate-100 rounded-lg"></div>
        <div className="h-40 bg-slate-100 rounded-lg"></div>
      </div>
    );
  }

  if (compact) {
    return (
      <div className="p-6 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl border border-blue-100">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-slate-900 flex items-center gap-2">
            <Star className="w-5 h-5 text-yellow-500" /> Your Progress
          </h3>
          <span className="text-2xl font-black text-blue-600">{userPoints}</span>
        </div>

        {userRank && (
          <div className="flex items-center gap-2 text-sm font-bold text-slate-600">
            <Trophy className="w-4 h-4" />
            Rank #{userRank}
          </div>
        )}

        <div className="mt-4 space-y-2">
          {dailyChallenges.slice(0, 2).map((challenge) => (
            <div
              key={challenge.id}
              className="flex items-center gap-2 text-xs text-slate-600"
            >
              <span className="text-lg">{challenge.icon}</span>
              <span className="flex-1 line-clamp-1">{challenge.title}</span>
              <span className="font-bold text-blue-600">+{challenge.points}</span>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* User Stats Header */}
      <div className="grid grid-cols-3 gap-4 sm:grid-cols-4">
        <div className="p-4 bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl border border-blue-200">
          <Star className="w-6 h-6 text-yellow-500 mb-2" />
          <p className="text-xs text-slate-600 font-bold">Points</p>
          <p className="text-2xl font-black text-blue-600">{userPoints}</p>
        </div>

        {userRank && (
          <div className="p-4 bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl border border-purple-200">
            <Trophy className="w-6 h-6 text-purple-600 mb-2" />
            <p className="text-xs text-slate-600 font-bold">Rank</p>
            <p className="text-2xl font-black text-purple-600">#{userRank}</p>
          </div>
        )}

        <div className="p-4 bg-gradient-to-br from-green-50 to-green-100 rounded-xl border border-green-200">
          <TrendingUp className="w-6 h-6 text-green-600 mb-2" />
          <p className="text-xs text-slate-600 font-bold">Streak</p>
          <p className="text-2xl font-black text-green-600">7🔥</p>
        </div>

        <div className="p-4 bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl border border-orange-200">
          <Zap className="w-6 h-6 text-orange-600 mb-2" />
          <p className="text-xs text-slate-600 font-bold">XP/day</p>
          <p className="text-2xl font-black text-orange-600">150</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-slate-100">
        {['badges', 'challenges', 'leaderboard'].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab as 'badges' | 'challenges' | 'leaderboard')}
            className={`px-4 py-3 font-bold text-sm uppercase tracking-widest transition-colors border-b-2 ${
              activeTab === tab
                ? 'text-blue-600 border-blue-600'
                : 'text-slate-500 border-transparent hover:text-slate-700'
            }`}
          >
            {tab === 'badges' && '🏅 Badges'}
            {tab === 'challenges' && '🎯 Challenges'}
            {tab === 'leaderboard' && '🏆 Leaderboard'}
          </button>
        ))}
      </div>

      {/* Badges Tab */}
      {activeTab === 'badges' && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {badges.map((badge) => (
            <div
              key={badge.id}
              className="p-4 bg-white rounded-xl border border-slate-100 text-center hover:shadow-lg transition-shadow"
            >
              <span className="text-4xl block mb-2">{badge.icon}</span>
              <p className="text-xs font-bold text-slate-700 line-clamp-2">
                {badge.name}
              </p>
              <p className="text-[10px] text-slate-500 mt-1">+{badge.points} pts</p>
            </div>
          ))}
        </div>
      )}

      {/* Challenges Tab */}
      {activeTab === 'challenges' && (
        <div className="space-y-6">
          {/* Daily Challenges */}
          <div>
            <h4 className="font-bold text-slate-900 mb-3">Daily Challenges</h4>
            <div className="space-y-3">
              {dailyChallenges.map((challenge) => (
                <div
                  key={challenge.id}
                  className={`p-4 rounded-xl border ${
                    challenge.claimed
                      ? 'bg-slate-50 border-slate-200'
                      : 'bg-white border-slate-100 hover:border-blue-200'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-2xl">{challenge.icon}</span>
                        <h5 className="font-bold text-slate-900">
                          {challenge.title}
                        </h5>
                      </div>
                      <p className="text-xs text-slate-600 mb-3">
                        {challenge.description}
                      </p>
                      <div className="flex items-center gap-2">
                        <span
                          className={`px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider ${getDifficultyColor(
                            challenge.difficulty
                          )}`}
                        >
                          {challenge.difficulty}
                        </span>
                        <span className="text-[10px] font-bold text-blue-600">
                          +{challenge.points} pts
                        </span>
                      </div>
                    </div>

                    {challenge.claimed ? (
                      <CheckCircle className="w-6 h-6 text-green-500 flex-shrink-0" />
                    ) : (
                      <button
                        onClick={() => claimChallenge(challenge.id, challenge.points)}
                        className="px-3 py-2 bg-blue-600 text-white text-xs font-bold rounded-lg hover:bg-blue-700 transition-colors flex-shrink-0"
                      >
                        Claim
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Weekly Challenges */}
          <div>
            <h4 className="font-bold text-slate-900 mb-3">Weekly Challenges</h4>
            <div className="space-y-3">
              {weeklyChallenges.map((challenge) => (
                <div
                  key={challenge.id}
                  className="p-4 bg-white rounded-xl border border-slate-100"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-2xl">{challenge.icon}</span>
                        <h5 className="font-bold text-slate-900">
                          {challenge.title}
                        </h5>
                      </div>
                      <p className="text-xs text-slate-600 mb-3">
                        {challenge.description}
                      </p>
                      {challenge.progress !== undefined && (
                        <div className="w-full bg-slate-100 rounded-full h-2">
                          <div
                            className="bg-blue-600 h-full rounded-full transition-all"
                            style={{
                              width: `${Math.min(100, (challenge.progress / 10) * 100)}%`,
                            }}
                          ></div>
                        </div>
                      )}
                    </div>
                    <span className="text-sm font-bold text-blue-600 flex-shrink-0">
                      +{challenge.points}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Leaderboard Tab */}
      {activeTab === 'leaderboard' && showLeaderboard && (
        <div className="space-y-3">
          {leaderboard.map((user) => (
            <div
              key={user.id}
              className={`p-4 rounded-xl border ${
                user.id === userId
                  ? 'bg-blue-50 border-blue-200'
                  : 'bg-white border-slate-100'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-2xl font-bold">{user.rankBadge}</span>
                  <div>
                    <p className="font-bold text-slate-900 text-sm">
                      {user.full_name}
                    </p>
                    <p className="text-xs text-slate-500">Rank #{user.rank}</p>
                  </div>
                </div>
                <p className="text-2xl font-black text-blue-600">{user.points}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
