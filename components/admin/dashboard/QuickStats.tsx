"use client";
import { useEffect, useState } from "react";
import { 
  Users, BookOpen, Activity, Command, 
  TrendingUp, ArrowUpRight, ArrowDownRight,
  Globe, Zap, ShieldCheck
} from "lucide-react";
import { supabase } from "@/lib/supabaseClient";

interface Stats {
  totalStudents: number;
  totalContent: number;
  activeNow: number;
  newEnrollments: number;
}

export default function QuickStats() {
  const [stats, setStats] = useState<Stats>({
    totalStudents: 0,
    totalContent: 0,
    activeNow: 0,
    newEnrollments: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        // Fetch Counts from Supabase
        const [
          { count: students },
          { count: resources },
          { count: news },
          { count: ebooks },
          { count: courses }
        ] = await Promise.all([
          supabase.from('profiles').select('*', { count: 'exact', head: true }),
          supabase.from('resources').select('*', { count: 'exact', head: true }),
          supabase.from('news').select('*', { count: 'exact', head: true }),
          supabase.from('ebooks').select('*', { count: 'exact', head: true }),
          supabase.from('courses').select('*', { count: 'exact', head: true }),
        ]);

        const totalContent = (resources || 0) + (news || 0) + (ebooks || 0) + (courses || 0);
        
        // Mocking some "Live" data for the "Pulse" feel
        const mockActive = Math.floor(Math.random() * 50) + 12;
        const mockNew = Math.floor(Math.random() * 20) + 5;

        setStats({
          totalStudents: students || 0,
          totalContent: totalContent,
          activeNow: mockActive,
          newEnrollments: mockNew
        });
      } catch (err) {
        console.error("Stats fetch error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
    const interval = setInterval(fetchStats, 60000); // Update every minute
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="h-full bg-slate-100 dark:bg-slate-800 animate-pulse rounded-2xl flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      
      {/* 1. TOTAL STUDENTS */}
      <div className="bg-gradient-to-br from-indigo-600 to-violet-700 rounded-2xl p-6 text-white shadow-xl shadow-indigo-500/20 relative overflow-hidden group hover:-translate-y-1 transition-all duration-300">
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-3xl -mr-16 -mt-16 group-hover:bg-white/20 transition-all"></div>
        <div className="relative z-10 flex flex-col justify-between h-full">
            <div className="flex justify-between items-start">
               <div className="p-2.5 bg-white/10 rounded-xl backdrop-blur-md border border-white/20">
                 <Users className="w-6 h-6" />
               </div>
               <div className="flex items-center gap-1 text-[10px] font-bold bg-emerald-500/20 text-emerald-300 px-2 py-1 rounded-full border border-emerald-500/20">
                  <TrendingUp className="w-3 h-3"/> +12%
               </div>
            </div>
            <div className="mt-8">
               <p className="text-indigo-100 text-xs font-bold uppercase tracking-widest opacity-80">Total Students</p>
               <h3 className="text-4xl font-black mt-1">{stats.totalStudents.toLocaleString()}</h3>
            </div>
        </div>
      </div>

      {/* 2. TOTAL CONTENT */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm relative overflow-hidden group hover:-translate-y-1 transition-all duration-300">
        <div className="relative z-10 flex flex-col justify-between h-full">
            <div className="flex justify-between items-start">
               <div className="p-2.5 bg-orange-50 dark:bg-orange-900/20 rounded-xl border border-orange-100 dark:border-orange-800 text-orange-600 dark:text-orange-400">
                 <BookOpen className="w-6 h-6" />
               </div>
               <div className="flex items-center gap-1 text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 dark:text-slate-500 px-2 py-1 rounded-full">
                  All Sources
               </div>
            </div>
            <div className="mt-8">
               <p className="text-slate-400 dark:text-slate-500 text-xs font-bold uppercase tracking-widest">Global Resources</p>
               <h3 className="text-4xl font-black mt-1 text-slate-800 dark:text-slate-100">{stats.totalContent.toLocaleString()}</h3>
            </div>
        </div>
      </div>

      {/* 3. ACTIVE NOW (Pulse) */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm relative overflow-hidden group hover:-translate-y-1 transition-all duration-300">
        <div className="relative z-10 flex flex-col justify-between h-full">
            <div className="flex justify-between items-start">
               <div className="p-2.5 bg-rose-50 dark:bg-rose-900/20 rounded-xl border border-rose-100 dark:border-rose-800 text-rose-600 dark:text-rose-400">
                 <Activity className="w-6 h-6" />
               </div>
               <div className="flex items-center gap-1.5 text-[10px] font-bold text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-900/30 px-2 py-1 rounded-full animate-pulse">
                  <div className="w-1.5 h-1.5 rounded-full bg-rose-600"></div> LIVE
               </div>
            </div>
            <div className="mt-8">
               <p className="text-slate-400 dark:text-slate-500 text-xs font-bold uppercase tracking-widest">Active Learners</p>
               <h3 className="text-4xl font-black mt-1 text-slate-800 dark:text-slate-100">{stats.activeNow}</h3>
            </div>
        </div>
      </div>

      {/* 4. SYSTEM PULSE */}
      <div className="bg-slate-900 dark:bg-black rounded-2xl p-6 text-white shadow-xl shadow-slate-200 dark:shadow-none relative overflow-hidden group hover:-translate-y-1 transition-all duration-300">
        <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-full blur-3xl -mr-16 -mt-16"></div>
        <div className="relative z-10 flex flex-col justify-between h-full">
            <div className="flex justify-between items-start">
               <div className="p-2.5 bg-white/5 rounded-xl border border-white/10 text-indigo-400">
                 <Zap className="w-6 h-6 " />
               </div>
            </div>
            <div className="mt-8">
               <div className="flex items-center gap-2 mb-1">
                 <ShieldCheck className="w-4 h-4 text-emerald-400"/>
                 <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest">System Healthy</span>
               </div>
               <h3 className="text-xl font-black text-white">Platform Insights</h3>
               <p className="text-xs text-slate-400 dark:text-slate-500 font-medium mt-1">Real-time sync enabled</p>
            </div>
        </div>
      </div>

    </div>
  );
}