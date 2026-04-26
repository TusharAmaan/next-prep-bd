"use client";

import React, { useEffect, useState, useMemo } from "react";
import { createClient } from "@/utils/supabase/client";
import { Trophy, Medal, Star, Flame, Search, ChevronLeft, Shield } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface LeaderboardUser {
  id: string;
  full_name: string;
  batch: string;
  gamification_points: number;
  gamification_rank: string;
  avatar_url?: string;
}

export default function LeaderboardPage() {
  const supabase = createClient();
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"global" | "batch">("global");
  const [users, setUsers] = useState<LeaderboardUser[]>([]);
  const [currentUser, setCurrentUser] = useState<LeaderboardUser | null>(null);
  const [currentUserRank, setCurrentUserRank] = useState<number>(0);

  useEffect(() => {
    fetchLeaderboard();
  }, [filter]);

  const fetchLeaderboard = async () => {
    setLoading(true);
    try {
      const { data: authData } = await supabase.auth.getUser();
      if (!authData?.user) {
        router.push("/login");
        return;
      }
      const userId = authData.user.id;

      // 1. Get current user's profile
      const { data: profile } = await supabase
        .from('profiles')
        .select('id, full_name, batch, gamification_points, gamification_rank, avatar_url')
        .eq('id', userId)
        .single();
      
      if (profile) setCurrentUser(profile as LeaderboardUser);

      // 2. Fetch Top 50 Users
      let query = supabase
        .from('profiles')
        .select('id, full_name, batch, gamification_points, gamification_rank, avatar_url')
        .order('gamification_points', { ascending: false })
        .limit(50);

      if (filter === "batch" && profile?.batch) {
        query = query.eq('batch', profile.batch);
      }

      const { data: topUsers } = await query;
      if (topUsers) setUsers(topUsers as LeaderboardUser[]);

      // 3. Calculate exact rank of current user
      if (profile) {
        let rankQuery = supabase
          .from('profiles')
          .select('id', { count: 'exact', head: true })
          .gt('gamification_points', profile.gamification_points || 0);
        
        if (filter === "batch" && profile.batch) {
          rankQuery = rankQuery.eq('batch', profile.batch);
        }

        const { count } = await rankQuery;
        setCurrentUserRank((count || 0) + 1);
      }

    } catch (err) {
      console.error("Failed to fetch leaderboard:", err);
    } finally {
      setLoading(false);
    }
  };

  const getRankStyle = (index: number) => {
    if (index === 0) return "bg-gradient-to-r from-amber-200 via-amber-400 to-amber-500 text-amber-900 border-amber-300 shadow-[0_0_20px_rgba(251,191,36,0.4)] scale-[1.02] z-10";
    if (index === 1) return "bg-gradient-to-r from-slate-200 via-slate-300 to-slate-400 text-slate-800 border-slate-300 shadow-md";
    if (index === 2) return "bg-gradient-to-r from-orange-200 via-orange-300 to-orange-400 text-orange-900 border-orange-300 shadow-md";
    return "bg-white border-slate-100 hover:border-indigo-100 text-slate-700";
  };

  return (
    <div className="min-h-screen bg-[#FAFBFD] pt-24 pb-32 font-sans selection:bg-indigo-100 selection:text-indigo-900 relative">
      <div className="absolute top-0 right-0 w-[800px] h-[600px] bg-gradient-to-bl from-amber-200/20 via-rose-200/10 to-transparent blur-[100px] pointer-events-none z-0" />
      
      <div className="max-w-3xl mx-auto px-4 sm:px-6 relative z-10">
        
        {/* Header */}
        <div className="mb-8">
          <Link href="/student/dashboard" className="inline-flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-indigo-600 transition-colors mb-6">
            <ChevronLeft className="w-4 h-4" /> Back to Dashboard
          </Link>
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 bg-gradient-to-br from-amber-400 to-orange-500 rounded-xl flex items-center justify-center shadow-lg shadow-orange-500/20">
                  <Trophy className="w-5 h-5 text-white" />
                </div>
                <h1 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight">Hall of Fame</h1>
              </div>
              <p className="text-slate-500 font-medium">Compete, earn points, and climb the ranks.</p>
            </div>
            
            <div className="flex bg-slate-200/50 p-1 rounded-xl w-full md:w-auto">
              <button 
                onClick={() => setFilter("global")}
                className={`flex-1 md:flex-none px-6 py-2.5 rounded-lg text-sm font-bold transition-all ${filter === "global" ? "bg-white text-indigo-600 shadow-sm" : "text-slate-500 hover:text-slate-700"}`}
              >
                Global
              </button>
              <button 
                onClick={() => setFilter("batch")}
                className={`flex-1 md:flex-none px-6 py-2.5 rounded-lg text-sm font-bold transition-all ${filter === "batch" ? "bg-white text-indigo-600 shadow-sm" : "text-slate-500 hover:text-slate-700"}`}
              >
                My Batch
              </button>
            </div>
          </div>
        </div>

        {/* Leaderboard List */}
        {loading ? (
          <div className="flex justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
          </div>
        ) : (
          <div className="space-y-3">
            {users.map((user, index) => {
              const isCurrent = currentUser?.id === user.id;
              const rank = index + 1;
              return (
                <div 
                  key={user.id} 
                  className={`flex items-center p-4 sm:p-5 rounded-2xl border transition-all duration-300 ${getRankStyle(index)} ${isCurrent ? 'ring-2 ring-indigo-500 shadow-lg' : ''}`}
                >
                  <div className="flex-shrink-0 w-8 sm:w-12 text-center">
                    {rank === 1 ? <Medal className="w-8 h-8 text-amber-700 mx-auto drop-shadow-sm" /> : 
                     rank === 2 ? <Medal className="w-7 h-7 text-slate-700 mx-auto" /> : 
                     rank === 3 ? <Medal className="w-6 h-6 text-orange-800 mx-auto" /> : 
                     <span className="text-lg font-black text-slate-400">#{rank}</span>}
                  </div>
                  
                  <div className="ml-4 sm:ml-6 flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <h3 className={`text-base sm:text-lg font-bold truncate ${rank <= 3 ? 'text-inherit' : 'text-slate-900'}`}>
                        {user.full_name} {isCurrent && "(You)"}
                      </h3>
                      {rank <= 3 && <Shield className="w-4 h-4 opacity-50 shrink-0" />}
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                      <span className={`text-[10px] sm:text-xs font-bold px-2 py-0.5 rounded uppercase ${rank <= 3 ? 'bg-black/10' : 'bg-slate-100 text-slate-500'}`}>
                        {user.batch || "General"}
                      </span>
                      <span className={`text-[10px] sm:text-xs font-bold flex items-center gap-1 ${rank <= 3 ? 'text-black/60' : 'text-slate-400'}`}>
                        {user.gamification_rank}
                      </span>
                    </div>
                  </div>
                  
                  <div className="ml-4 text-right shrink-0">
                    <div className={`text-xl sm:text-2xl font-black flex items-center justify-end gap-1 ${rank === 1 ? 'text-amber-900' : rank === 2 ? 'text-slate-800' : rank === 3 ? 'text-orange-900' : 'text-indigo-600'}`}>
                      {user.gamification_points} <Star className="w-4 h-4 fill-current opacity-50" />
                    </div>
                    <div className={`text-[10px] font-bold tracking-widest uppercase ${rank <= 3 ? 'text-black/50' : 'text-slate-400'}`}>Points</div>
                  </div>
                </div>
              );
            })}

            {users.length === 0 && (
              <div className="py-20 text-center bg-white rounded-3xl border border-dashed border-slate-200">
                <Shield className="w-16 h-16 text-slate-200 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-slate-900">No contenders yet</h3>
                <p className="text-slate-500 mt-2">The arena is waiting. Be the first to earn points!</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Sticky Current User Footer (Clash of Clans style) */}
      {currentUser && !loading && currentUserRank > 50 && (
        <div className="fixed bottom-0 left-0 w-full bg-slate-900 border-t border-slate-800 p-4 z-50 animate-in slide-in-from-bottom-full duration-500 shadow-[0_-10px_40px_rgba(0,0,0,0.2)]">
          <div className="max-w-3xl mx-auto flex items-center justify-between px-2 sm:px-6">
            <div className="flex items-center gap-4 sm:gap-6">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-slate-800 rounded-xl flex items-center justify-center border border-slate-700 text-white font-black text-lg shadow-inner">
                #{currentUserRank}
              </div>
              <div>
                <h3 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
                  {currentUser.full_name} <span className="text-[10px] bg-indigo-500 text-white px-2 py-0.5 rounded-full uppercase">You</span>
                </h3>
                <p className="text-xs font-medium text-slate-400">{currentUser.gamification_rank} • {currentUser.batch || "General"}</p>
              </div>
            </div>
            <div className="text-right">
              <div className="text-xl sm:text-2xl font-black text-amber-400 flex items-center justify-end gap-1">
                {currentUser.gamification_points} <Star className="w-4 h-4 fill-current opacity-50" />
              </div>
              <div className="text-[10px] font-bold tracking-widest text-slate-500 uppercase">Points</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
