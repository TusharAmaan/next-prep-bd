"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/utils/supabase/client";
import { 
  TrendingUp, 
  Activity, 
  Users, 
  Award, 
  Clock, 
  Search, 
  Filter, 
  Download,
  Loader2,
  BarChart3,
  MousePointer2,
  UserCheck,
  ShieldAlert
} from "lucide-react";

export default function AnalyticsSuite({ darkMode = false }: { darkMode?: boolean }) {
  const supabase = createClient();
  const [studentStats, setStudentStats] = useState<any[]>([]);
  const [activityLogs, setActivityLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [logSearch, setLogSearch] = useState("");

  const fetchData = async () => {
    setLoading(true);
    try {
      const { data: stats } = await supabase
        .from('student_analytics')
        .select('*')
        .order('avg_score', { ascending: false })
        .limit(10);
      
      const { data: logs } = await supabase
        .from('activity_logs')
        .select('*, actor:actor_id(full_name, email)')
        .order('created_at', { ascending: false })
        .limit(20);

      if (stats) setStudentStats(stats);
      if (logs) setActivityLogs(logs);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Analytics Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h2 className="text-3xl font-black text-slate-900 dark:text-white flex items-center gap-3">
            <TrendingUp className="w-8 h-8 text-indigo-600" />
            Platform Intelligence
          </h2>
          <p className="text-slate-500 font-bold mt-1">Advanced metrics and deep system audit trails.</p>
        </div>
        <div className="flex gap-2">
            <button className="bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-700 px-6 py-3 rounded-2xl font-black text-sm flex items-center gap-2 hover:border-indigo-600 transition-all">
                <Download size={18} /> EXPORT PDF
            </button>
            <button onClick={fetchData} className="bg-indigo-600 text-white px-6 py-3 rounded-2xl font-black text-sm shadow-xl shadow-indigo-100 dark:shadow-none hover:bg-indigo-700 transition-all active:scale-95">
                REFRESH DATA
            </button>
        </div>
      </div>

      {/* Grid: Trends & Metrics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Student Performance Trends */}
        <div className="bg-white dark:bg-slate-900 rounded-[40px] border border-slate-200 dark:border-slate-700 shadow-xl p-10 flex flex-col">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-xl font-black text-slate-900 dark:text-white flex items-center gap-2">
              <BarChart3 className="text-emerald-500" /> Academic Leaders
            </h3>
            <span className="text-[10px] bg-emerald-100 text-emerald-700 px-2 py-1 rounded-full font-black">TOP 10 SUBJECTS</span>
          </div>

          <div className="flex-1 space-y-6">
            {loading ? (
              <div className="flex justify-center p-12"><Loader2 className="animate-spin text-emerald-500" /></div>
            ) : studentStats.length === 0 ? (
                <div className="text-center py-20 bg-slate-50 dark:bg-slate-800/50 rounded-3xl border border-dashed border-slate-200 dark:border-slate-700">
                    <p className="font-bold text-slate-400 italic">Insufficient analytical data.</p>
                </div>
            ) : (
              studentStats.map((stat, idx) => (
                <div key={idx} className="space-y-2">
                  <div className="flex justify-between items-center text-sm">
                    <span className="font-black text-slate-700 dark:text-slate-300 uppercase tracking-widest text-[10px]">{stat.subject}</span>
                    <span className="font-black text-slate-900 dark:text-white">{stat.avg_score}% AVG</span>
                  </div>
                  <div className="h-3 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-emerald-500 rounded-full" 
                      style={{ width: `${stat.avg_score}%` }} 
                    />
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Rapid Insights Grid */}
        <div className="grid grid-cols-2 gap-6">
            <div className="bg-white dark:bg-slate-900 p-8 rounded-[40px] border border-slate-200 dark:border-slate-700 shadow-xl flex flex-col justify-between">
                <div className="w-12 h-12 bg-indigo-100/50 rounded-2xl flex items-center justify-center text-indigo-600 mb-4">
                    <MousePointer2 size={24} />
                </div>
                <div>
                    <p className="text-4xl font-black text-slate-900 dark:text-white">1,248</p>
                    <p className="text-xs font-black text-slate-400 uppercase tracking-widest mt-1">Unique Sessions</p>
                </div>
            </div>
            <div className="bg-white dark:bg-slate-900 p-8 rounded-[40px] border border-slate-200 dark:border-slate-700 shadow-xl flex flex-col justify-between">
                <div className="w-12 h-12 bg-emerald-100/50 rounded-2xl flex items-center justify-center text-emerald-600 mb-4">
                    <UserCheck size={24} />
                </div>
                <div>
                    <p className="text-4xl font-black text-slate-900 dark:text-white">84%</p>
                    <p className="text-xs font-black text-slate-400 uppercase tracking-widest mt-1">Retention Rate</p>
                </div>
            </div>
            <div className="bg-white dark:bg-slate-900 p-8 rounded-[40px] border border-slate-200 dark:border-slate-700 shadow-xl flex flex-col justify-between">
                <div className="w-12 h-12 bg-amber-100/50 rounded-2xl flex items-center justify-center text-amber-600 mb-4">
                    <Award size={24} />
                </div>
                <div>
                    <p className="text-4xl font-black text-slate-900 dark:text-white">152</p>
                    <p className="text-xs font-black text-slate-400 uppercase tracking-widest mt-1">Certificates Issued</p>
                </div>
            </div>
            <div className="bg-white dark:bg-slate-900 p-8 rounded-[40px] border border-slate-200 dark:border-slate-700 shadow-xl flex flex-col justify-between">
                <div className="w-12 h-12 bg-rose-100/50 rounded-2xl flex items-center justify-center text-rose-600 mb-4">
                    <ShieldAlert size={24} />
                </div>
                <div>
                    <p className="text-4xl font-black text-slate-900 dark:text-white">03</p>
                    <p className="text-xs font-black text-slate-400 uppercase tracking-widest mt-1">Critical Warnings</p>
                </div>
            </div>
        </div>
      </div>

      {/* Audit Trail Section */}
      <div className="bg-white dark:bg-slate-900 rounded-[40px] border border-slate-200 dark:border-slate-700 shadow-2xl overflow-hidden">
        <div className="p-10 border-b dark:border-slate-700 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
                <h3 className="text-xl font-black text-slate-900 dark:text-white flex items-center gap-2">
                    <Activity className="text-indigo-600" /> Operational Audit Trail
                </h3>
                <p className="text-slate-500 font-bold text-sm mt-1">Forensic log of all administrative and student actions.</p>
            </div>
            <div className="flex gap-4">
                <div className="relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input 
                        type="text" 
                        placeholder="Search logs..."
                        value={logSearch}
                        onChange={(e) => setLogSearch(e.target.value)}
                        className="bg-slate-50 dark:bg-slate-800 border-2 border-transparent focus:border-indigo-600 rounded-2xl py-3 pl-12 pr-6 text-sm font-bold transition-all outline-none"
                    />
                </div>
                <button className="p-3 bg-slate-100 dark:bg-slate-800 rounded-2xl text-slate-500 hover:text-indigo-600 transition-all flex items-center gap-2 font-black text-xs">
                    <Filter size={18} /> FILTERS
                </button>
            </div>
        </div>

        <div className="overflow-x-auto">
            <table className="w-full text-left">
                <thead className="bg-slate-50/50 dark:bg-slate-800/80">
                    <tr>
                        <th className="px-10 py-5 text-xs font-black text-slate-400 uppercase tracking-widest">Actor</th>
                        <th className="px-10 py-5 text-xs font-black text-slate-400 uppercase tracking-widest">Event Type</th>
                        <th className="px-10 py-5 text-xs font-black text-slate-400 uppercase tracking-widest">Details</th>
                        <th className="px-10 py-5 text-xs font-black text-slate-400 uppercase tracking-widest">Timestamp</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {loading ? (
                        <tr><td colSpan={4} className="p-20 text-center"><Loader2 className="animate-spin inline mr-2" /> Working...</td></tr>
                    ) : activityLogs.length === 0 ? (
                        <tr><td colSpan={4} className="p-20 text-center text-slate-400 italic font-bold">No system activity recorded yet.</td></tr>
                    ) : (
                        activityLogs.map((log) => (
                            <tr key={log.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/20 transition-all">
                                <td className="px-10 py-6">
                                    <div className="flex items-center gap-3">
                                        <div className="w-9 h-9 bg-slate-100 dark:bg-slate-800 rounded-xl flex items-center justify-center font-black text-slate-500 text-xs">
                                            {(log.actor?.full_name || 'S').charAt(0)}
                                        </div>
                                        <div>
                                            <p className="font-bold text-slate-900 dark:text-white text-sm">{log.actor?.full_name || 'System'}</p>
                                            <p className="text-[10px] text-slate-400 font-black uppercase">{log.actor?.email || 'AUTOMATED_BOT'}</p>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-10 py-6">
                                    <span className="bg-indigo-50 text-indigo-700 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border border-indigo-100">
                                        {log.action_type || 'SYSTEM_EVENT'}
                                    </span>
                                </td>
                                <td className="px-10 py-6">
                                    <p className="text-sm text-slate-600 dark:text-slate-400 font-bold max-w-md line-clamp-1">{log.details || 'Operational record generated.'}</p>
                                </td>
                                <td className="px-10 py-6">
                                    <div className="flex items-center gap-2 text-slate-400 whitespace-nowrap">
                                        <Clock size={12} />
                                        <span className="text-xs font-bold">{new Date(log.created_at).toLocaleString()}</span>
                                    </div>
                                </td>
                            </tr>
                        ))
                    )}
                </tbody>
            </table>
        </div>
      </div>
    </div>
  );
}
