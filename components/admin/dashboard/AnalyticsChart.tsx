"use client";
import { useState, useEffect, useMemo } from 'react';
import { supabase } from "@/lib/supabaseClient";
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, BarChart, Bar, Legend, ComposedChart, Line
} from 'recharts';
import { 
  TrendingUp, PieChart as PieIcon, BarChart3, Activity, 
  Loader2, Calendar, Download, Filter 
} from 'lucide-react';

// --- CUSTOM TOOLTIP COMPONENT ---
const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white p-4 border border-slate-100 shadow-xl rounded-xl">
        <p className="text-xs font-bold text-slate-400 mb-2 uppercase tracking-wider">{label}</p>
        {payload.map((entry: any, index: number) => (
          <div key={index} className="flex items-center gap-2 mb-1 last:mb-0">
            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }} />
            <span className="text-sm font-medium text-slate-600 capitalize">{entry.name}:</span>
            <span className="text-sm font-black text-slate-900">{entry.value}</span>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

export default function AnalyticsChart() {
  const [activeTab, setActiveTab] = useState<'growth' | 'dist' | 'seg' | 'vel'>('growth');
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('30d'); // 7d, 30d, 90d
  
  const [data, setData] = useState<any>({
      growth: [],
      distribution: [],
      segments: [],
      velocity: []
  });

  // --- FETCH DATA ---
  useEffect(() => {
    const fetchAnalytics = async () => {
        setLoading(true);
        try {
            // Using your existing RPC. 
            // Ideally, you'd pass 'timeRange' to this RPC to filter on the backend.
            const { data: analytics, error } = await supabase.rpc('get_admin_analytics');

            if (error) throw error;
            if (analytics) {
                setData(analytics);
            }
        } catch (err) {
            console.error("Analytics Error:", err);
        } finally {
            setLoading(false);
        }
    };
    fetchAnalytics();
  }, [timeRange]);

  // --- DYNAMIC SUMMARY STATS ---
  const summaryStats = useMemo(() => {
      if (activeTab === 'growth') {
          const totalUsers = data.growth.reduce((acc: number, curr: any) => acc + (curr.users || 0), 0);
          const totalUploads = data.growth.reduce((acc: number, curr: any) => acc + (curr.uploads || 0), 0);
          return [
              { label: 'Total Growth', value: `+${totalUsers + totalUploads}`, color: 'text-indigo-600' },
              { label: 'User Efficiency', value: `${(totalUploads / (totalUsers || 1)).toFixed(1)} posts/user`, color: 'text-emerald-600' }
          ];
      }
      if (activeTab === 'dist') {
          const topCategory = [...data.distribution].sort((a: any, b: any) => b.value - a.value)[0];
          return [
              { label: 'Dominant Type', value: topCategory?.name || 'N/A', color: 'text-blue-600' },
              { label: 'Diversity', value: `${data.distribution.length} Types`, color: 'text-slate-600' }
          ];
      }
      return [];
  }, [activeTab, data]);

  return (
    <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm h-full flex flex-col min-h-[450px]">
      
      {/* 1. HEADER & CONTROLS */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
            <h3 className="font-bold text-slate-800 flex items-center gap-2">
                Platform Insights
                <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-500 text-[10px] font-bold uppercase tracking-wide">
                    Live
                </span>
            </h3>
            <p className="text-xs text-slate-400 mt-1">Real-time performance metrics across the system.</p>
        </div>
        
        <div className="flex items-center gap-2">
            {/* Time Filter (Visual Only unless backend supports it) */}
            <div className="hidden md:flex items-center bg-slate-50 rounded-lg p-1 border border-slate-200">
                {['7d', '30d', '90d'].map((range) => (
                    <button
                        key={range}
                        onClick={() => setTimeRange(range)}
                        className={`px-3 py-1 text-xs font-bold rounded-md transition-all ${timeRange === range ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
                    >
                        {range.toUpperCase()}
                    </button>
                ))}
            </div>

            {/* Export Button (Placeholder for functionality) */}
            <button className="p-2 text-slate-400 hover:bg-slate-50 rounded-lg border border-transparent hover:border-slate-200 transition-all" title="Export CSV">
                <Download className="w-4 h-4" />
            </button>
        </div>
      </div>

      {/* 2. NAVIGATION TABS & SUMMARY */}
      <div className="space-y-4 mb-6">
          <div className="flex overflow-x-auto pb-1 gap-1 border-b border-slate-100">
            {[
                { id: 'growth', label: 'Growth Trends', icon: TrendingUp },
                { id: 'dist', label: 'Content Mix', icon: PieIcon },
                { id: 'seg', label: 'Topic Focus', icon: BarChart3 },
                { id: 'vel', label: 'Admin Activity', icon: Activity },
            ].map((tab: any) => (
                <button 
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)} 
                    className={`flex items-center gap-2 px-4 py-3 text-sm font-bold border-b-2 transition-all whitespace-nowrap ${activeTab === tab.id ? 'border-indigo-600 text-indigo-600 bg-indigo-50/50' : 'border-transparent text-slate-500 hover:text-slate-800 hover:bg-slate-50'}`}
                >
                    <tab.icon className="w-4 h-4" /> {tab.label}
                </button>
            ))}
          </div>

          {/* Quick Summary Bar */}
          {summaryStats.length > 0 && (
              <div className="flex gap-6 animate-in fade-in slide-in-from-left-2">
                  {summaryStats.map((stat, i) => (
                      <div key={i}>
                          <p className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">{stat.label}</p>
                          <p className={`text-lg font-black ${stat.color}`}>{stat.value}</p>
                      </div>
                  ))}
              </div>
          )}
      </div>

      {/* 3. CHART AREA */}
      <div className="flex-1 w-full min-h-[300px] relative bg-slate-50/30 rounded-xl border border-slate-100/50 p-2">
        {loading ? (
            <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-400 gap-2">
                <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
                <span className="text-xs font-medium">Crunching numbers...</span>
            </div>
        ) : (
            <ResponsiveContainer width="100%" height="100%">
                
                {/* --- A. GROWTH TRENDS (Area + Line) --- */}
                {activeTab === 'growth' ? (
                    <AreaChart data={data.growth} margin={{ top: 20, right: 10, left: -20, bottom: 0 }}>
                        <defs>
                            <linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3}/>
                                <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                            </linearGradient>
                            <linearGradient id="colorUploads" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                                <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                        <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 11}} dy={10} minTickGap={30} />
                        <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 11}} />
                        <Tooltip content={<CustomTooltip />} />
                        <Legend verticalAlign="top" height={36} iconType="circle" />
                        
                        <Area type="monotone" dataKey="users" name="Active Users" stroke="#6366f1" strokeWidth={3} fillOpacity={1} fill="url(#colorUsers)" />
                        <Area type="monotone" dataKey="uploads" name="Content Added" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#colorUploads)" />
                    </AreaChart>

                // --- B. CONTENT DISTRIBUTION (Donut) ---
                ) : activeTab === 'dist' ? (
                    <PieChart>
                        <Pie 
                            data={data.distribution} 
                            cx="50%" cy="50%" 
                            innerRadius={80} 
                            outerRadius={110} 
                            paddingAngle={4} 
                            dataKey="value"
                            stroke="none"
                        >
                            {data.distribution.map((entry: any, index: number) => (
                                <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                        </Pie>
                        <Tooltip content={<CustomTooltip />} />
                        <Legend verticalAlign="middle" align="right" layout="vertical" iconType="circle" wrapperStyle={{ marginRight: '20px' }}/>
                        {/* Center Label Overlay */}
                        <text x="50%" y="50%" textAnchor="middle" dominantBaseline="middle" className="fill-slate-700 font-black text-xl">
                            {data.distribution.reduce((a:any, b:any) => a + b.value, 0)}
                        </text>
                        <text x="50%" y="56%" textAnchor="middle" dominantBaseline="middle" className="fill-slate-400 text-xs font-bold uppercase tracking-wider">
                            Total Items
                        </text>
                    </PieChart>

                // --- C. SEGMENTS (Bar - Horizontal Layout preferred for long labels) ---
                ) : activeTab === 'seg' ? (
                    <BarChart data={data.segments} layout="vertical" margin={{ top: 20, right: 30, left: 40, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e2e8f0" />
                        <XAxis type="number" hide />
                        <YAxis dataKey="name" type="category" width={80} axisLine={false} tickLine={false} tick={{fill: '#475569', fontSize: 11, fontWeight: 600}} />
                        <Tooltip content={<CustomTooltip />} />
                        <Bar dataKey="count" name="Resources" radius={[0, 4, 4, 0]} barSize={24}>
                            {data.segments.map((entry: any, index: number) => (
                                <Cell key={`cell-${index}`} fill={index % 2 === 0 ? '#3b82f6' : '#60a5fa'} />
                            ))}
                        </Bar>
                    </BarChart>

                // --- D. VELOCITY (Composed Bar + Line) ---
                ) : (
                    <ComposedChart data={data.velocity} margin={{ top: 20, right: 10, left: -20, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                        <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 11}} dy={10} />
                        <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 11}} />
                        <Tooltip content={<CustomTooltip />} />
                        <Bar dataKey="count" name="Daily Uploads" fill="#f59e0b" radius={[4, 4, 0, 0]} barSize={20} />
                        <Line type="monotone" dataKey="count" stroke="#d97706" strokeWidth={2} dot={{ r: 4, fill: '#d97706', strokeWidth: 2, stroke: '#fff' }} />
                    </ComposedChart>
                )}
            </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}