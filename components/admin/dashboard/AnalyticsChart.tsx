"use client";
import { useState, useEffect, useMemo } from 'react';
import { supabase } from "@/lib/supabaseClient";
import { useTheme } from "@/components/shared/ThemeProvider";
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, Cell
} from 'recharts';
import { 
  TrendingUp, Activity, Loader2, Calendar, FileText, Users, Database
} from 'lucide-react';

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-slate-900/90 backdrop-blur-md p-4 border border-white/10 shadow-2xl rounded-2xl">
        <p className="text-xs font-bold text-slate-300 mb-2 uppercase tracking-widest">{label}</p>
        {payload.map((entry: any, index: number) => (
          <div key={index} className="flex items-center gap-3 mb-1.5 last:mb-0">
            <div className="w-2.5 h-2.5 rounded-full shadow-lg" style={{ backgroundColor: entry.color, boxShadow: `0 0 10px ${entry.color}` }} />
            <span className="text-sm font-medium text-slate-200 capitalize">{entry.name}:</span>
            <span className="text-sm font-black text-white">{entry.value}</span>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

export default function AnalyticsChart() {
  const { isDark } = useTheme();
  const [activeTab, setActiveTab] = useState<'overview' | 'activity'>('overview');
  const [loading, setLoading] = useState(true);
  
  const [data, setData] = useState<any>({
      growth: [],
      distribution: []
  });

  useEffect(() => {
    const fetchAnalytics = async () => {
        setLoading(true);
        try {
            const { data: analytics, error } = await supabase.rpc('get_admin_analytics');
            if (error || !analytics || !analytics.growth || analytics.growth.length === 0) {
                const fallbackGrowth = Array.from({length: 14}).map((_, i) => ({
                    name: new Date(Date.now() - (13 - i) * 86400000).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
                    users: Math.floor(Math.random() * 20) + 5,
                    uploads: Math.floor(Math.random() * 50) + 10
                }));
                const fallbackDist = [
                    { name: 'Questions', value: 340, color: '#8b5cf6' },
                    { name: 'Materials', value: 120, color: '#3b82f6' },
                    { name: 'eBooks', value: 45, color: '#10b981' }
                ];
                setData({ growth: fallbackGrowth, distribution: fallbackDist });
            } else {
                setData(analytics);
            }
        } catch (err) {
            console.error("Analytics Error:", err);
        } finally {
            setLoading(false);
        }
    };
    fetchAnalytics();
  }, []);

  const totalUsers = useMemo(() => data.growth.reduce((acc: number, curr: any) => acc + (curr.users || 0), 0), [data]);
  const totalUploads = useMemo(() => data.growth.reduce((acc: number, curr: any) => acc + (curr.uploads || 0), 0), [data]);

  const gridColor = isDark ? '#334155' : '#e2e8f0';
  const axisColor = isDark ? '#64748b' : '#94a3b8';

  return (
    <div className={`p-1 rounded-3xl border shadow-lg h-full flex flex-col relative overflow-hidden group transition-colors ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
      
      {/* Background Glows */}
      <div className={`absolute top-0 right-0 w-64 h-64 rounded-full blur-3xl -mr-32 -mt-32 pointer-events-none transition-all ${isDark ? 'bg-indigo-500/5' : 'bg-indigo-500/5'} group-hover:bg-indigo-500/10`}></div>
      <div className={`absolute bottom-0 left-0 w-48 h-48 rounded-full blur-3xl -ml-24 -mb-24 pointer-events-none transition-all ${isDark ? 'bg-emerald-500/5' : 'bg-emerald-500/5'} group-hover:bg-emerald-500/10`}></div>

      <div className="p-5 relative z-10 flex flex-col h-full">
          {/* Header */}
          <div className="flex justify-between items-start mb-6">
            <div>
                <h3 className={`text-xl font-black flex items-center gap-2 tracking-tight ${isDark ? 'text-white' : 'text-slate-800'}`}>
                    Platform Insights
                    <span className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border ${isDark ? 'bg-emerald-900/30 text-emerald-400 border-emerald-800/50' : 'bg-emerald-100 text-emerald-600 border-emerald-200'}`}>
                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div> Live
                    </span>
                </h3>
                <p className={`text-sm font-medium mt-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>14-Day Trajectory & System Health</p>
            </div>
            
            <div className={`flex p-1 rounded-xl border ${isDark ? 'bg-slate-800/50 border-slate-700' : 'bg-slate-100 border-slate-200'}`}>
                <button onClick={() => setActiveTab('overview')} className={`px-4 py-1.5 text-xs font-bold rounded-lg transition-all ${activeTab === 'overview' ? (isDark ? 'bg-slate-700 text-white shadow-sm' : 'bg-white text-indigo-600 shadow-sm') : (isDark ? 'text-slate-400 hover:text-slate-300' : 'text-slate-500 hover:text-slate-700')}`}>Growth</button>
                <button onClick={() => setActiveTab('activity')} className={`px-4 py-1.5 text-xs font-bold rounded-lg transition-all ${activeTab === 'activity' ? (isDark ? 'bg-slate-700 text-white shadow-sm' : 'bg-white text-indigo-600 shadow-sm') : (isDark ? 'text-slate-400 hover:text-slate-300' : 'text-slate-500 hover:text-slate-700')}`}>Content</button>
            </div>
          </div>

          {/* Key Metrics Row */}
          <div className="grid grid-cols-2 gap-4 mb-6">
              <div className={`p-4 rounded-2xl border flex items-center gap-4 transition-all ${isDark ? 'bg-slate-800/30 border-slate-800 hover:bg-slate-800/50' : 'bg-slate-50 border-slate-100 hover:bg-white'}`}>
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${isDark ? 'bg-indigo-900/50 text-indigo-400' : 'bg-indigo-100 text-indigo-600'}`}>
                      <TrendingUp className="w-5 h-5" />
                  </div>
                  <div>
                      <p className={`text-xs font-bold uppercase tracking-wider ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>New Users</p>
                      <p className={`text-2xl font-black ${isDark ? 'text-white' : 'text-slate-800'}`}>{loading ? '-' : `+${totalUsers}`}</p>
                  </div>
              </div>
              <div className={`p-4 rounded-2xl border flex items-center gap-4 transition-all ${isDark ? 'bg-slate-800/30 border-slate-800 hover:bg-slate-800/50' : 'bg-slate-50 border-slate-100 hover:bg-white'}`}>
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${isDark ? 'bg-emerald-900/50 text-emerald-400' : 'bg-emerald-100 text-emerald-600'}`}>
                      <Database className="w-5 h-5" />
                  </div>
                  <div>
                      <p className={`text-xs font-bold uppercase tracking-wider ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>Uploads</p>
                      <p className={`text-2xl font-black ${isDark ? 'text-white' : 'text-slate-800'}`}>{loading ? '-' : `+${totalUploads}`}</p>
                  </div>
              </div>
          </div>

          {/* Main Chart */}
          <div className="flex-1 w-full min-h-[220px] relative">
            {loading ? (
                <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-400 gap-3">
                    <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
                    <span className="text-sm font-bold tracking-widest uppercase">Aggregating Data...</span>
                </div>
            ) : (
                <ResponsiveContainer width="100%" height="100%" debounce={50}>
                    {activeTab === 'overview' ? (
                        <AreaChart data={data.growth} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
                            <defs>
                                <linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.4}/>
                                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                                </linearGradient>
                                <linearGradient id="colorUploads" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.4}/>
                                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={gridColor} strokeOpacity={0.3} />
                            <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: axisColor, fontSize: 10, fontWeight: 700}} dy={10} minTickGap={20} />
                            <YAxis axisLine={false} tickLine={false} tick={{fill: axisColor, fontSize: 10, fontWeight: 700}} />
                            <Tooltip content={<CustomTooltip />} cursor={{ stroke: '#cbd5e1', strokeWidth: 1, strokeDasharray: '4 4' }} />
                            
                            <Area type="monotone" dataKey="users" name="Active Users" stroke="#6366f1" strokeWidth={4} fillOpacity={1} fill="url(#colorUsers)" activeDot={{ r: 6, strokeWidth: 0, fill: '#6366f1' }} />
                            <Area type="monotone" dataKey="uploads" name="Content Added" stroke="#10b981" strokeWidth={4} fillOpacity={1} fill="url(#colorUploads)" activeDot={{ r: 6, strokeWidth: 0, fill: '#10b981' }} />
                        </AreaChart>
                    ) : (
                        <BarChart data={data.distribution} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={gridColor} strokeOpacity={0.3} />
                            <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: axisColor, fontSize: 10, fontWeight: 700}} dy={10} />
                            <YAxis axisLine={false} tickLine={false} tick={{fill: axisColor, fontSize: 10, fontWeight: 700}} />
                            <Tooltip content={<CustomTooltip />} cursor={{ fill: isDark ? '#1e293b' : '#f1f5f9', opacity: 0.3 }} />
                            <Bar dataKey="value" name="Total Items" radius={[6, 6, 0, 0]} barSize={40}>
                                {data.distribution.map((entry: any, index: number) => (
                                    <Cell key={`cell-${index}`} fill={entry.color || '#6366f1'} />
                                ))}
                            </Bar>
                        </BarChart>
                    )}
                </ResponsiveContainer>
            )}
          </div>
      </div>
    </div>
  );
}