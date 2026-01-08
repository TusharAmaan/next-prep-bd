"use client";
import { useState, useEffect } from 'react';
import { supabase } from "@/lib/supabaseClient";
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, BarChart, Bar, Legend
} from 'recharts';
import { TrendingUp, PieChart as PieIcon, BarChart3, Activity, Loader2 } from 'lucide-react';

export default function AnalyticsChart() {
  const [activeTab, setActiveTab] = useState<'growth' | 'dist' | 'seg' | 'vel'>('growth');
  const [loading, setLoading] = useState(true);
  
  // INITIAL STATE (Prevents crash if data is missing)
  const [data, setData] = useState<any>({
      growth: [],
      distribution: [],
      segments: [],
      velocity: []
  });

  useEffect(() => {
    const fetchOptimizedData = async () => {
        setLoading(true);
        try {
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
    fetchOptimizedData();
  }, []);

  return (
    <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm h-full flex flex-col min-h-[400px]">
      
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
            <h3 className="font-bold text-slate-800">Platform Analytics</h3>
            <p className="text-xs text-slate-400 font-medium">
                {loading ? 'Calculating...' : 'Live Server Data'}
            </p>
        </div>
        
        <div className="flex bg-slate-50 p-1 rounded-lg border border-slate-200">
            {['growth', 'dist', 'seg', 'vel'].map((tab: any) => (
                <button 
                    key={tab}
                    onClick={() => setActiveTab(tab)} 
                    className={`p-2 rounded-md transition-all ${activeTab === tab ? 'bg-white shadow text-indigo-600' : 'text-slate-400 hover:text-slate-600'}`}
                >
                    {tab === 'growth' && <TrendingUp className="w-4 h-4" />}
                    {tab === 'dist' && <PieIcon className="w-4 h-4" />}
                    {tab === 'seg' && <BarChart3 className="w-4 h-4" />}
                    {tab === 'vel' && <Activity className="w-4 h-4" />}
                </button>
            ))}
        </div>
      </div>

      {/* CHARTS */}
      <div className="flex-1 w-full min-h-[280px] relative">
        {loading ? (
            <div className="absolute inset-0 flex items-center justify-center text-slate-400">
                <Loader2 className="w-8 h-8 animate-spin" />
            </div>
        ) : (
            <ResponsiveContainer width="100%" height="100%">
                
                {/* 1. GROWTH (Area Chart) */}
                {activeTab === 'growth' ? (
                    <AreaChart data={data.growth} margin={{ top: 10, right: 0, left: -25, bottom: 0 }}>
                        <defs>
                            <linearGradient id="colorUploads" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#6366f1" stopOpacity={0.2}/>
                                <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                            </linearGradient>
                            <linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#10b981" stopOpacity={0.2}/>
                                <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                        <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 11}} dy={10} />
                        {/* FIX: allowDecimals={false} ensures integer-only Y-axis */}
                        <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 11}} allowDecimals={false} />
                        <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                        <Legend iconType="circle" wrapperStyle={{ paddingTop: '20px' }}/>
                        
                        {/* FIX: type="linear" removes the weird wobbly lines */}
                        <Area type="linear" dataKey="uploads" name="New Uploads" stroke="#6366f1" strokeWidth={3} fillOpacity={1} fill="url(#colorUploads)" />
                        <Area type="linear" dataKey="users" name="New Users" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#colorUsers)" />
                    </AreaChart>

                // 2. DISTRIBUTION (Pie Chart)
                ) : activeTab === 'dist' ? (
                    <PieChart>
                        <Pie data={data.distribution} cx="50%" cy="50%" innerRadius={60} outerRadius={85} paddingAngle={5} dataKey="value">
                            {data.distribution.map((entry: any, index: number) => (
                                <Cell key={`cell-${index}`} fill={entry.color} stroke="none" />
                            ))}
                        </Pie>
                        <Tooltip contentStyle={{ borderRadius: '12px', border: 'none' }} />
                        <Legend verticalAlign="middle" align="right" layout="vertical" iconType="circle" />
                    </PieChart>

                // 3. SEGMENTS (Bar Chart)
                ) : activeTab === 'seg' ? (
                    <BarChart data={data.segments} margin={{ top: 10, right: 0, left: -25, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                        <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 10}} dy={10} interval={0} />
                        <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 11}} allowDecimals={false} />
                        <Tooltip cursor={{fill: '#f1f5f9'}} contentStyle={{ borderRadius: '12px', border: 'none' }} />
                        <Bar dataKey="count" name="Resources" fill="#3b82f6" radius={[4, 4, 0, 0]} barSize={40} />
                    </BarChart>

                // 4. VELOCITY (Bar Chart)
                ) : (
                    <BarChart data={data.velocity} margin={{ top: 10, right: 0, left: -25, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                        <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 11}} dy={10} />
                        <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 11}} allowDecimals={false} />
                        <Tooltip cursor={{fill: '#f1f5f9'}} contentStyle={{ borderRadius: '12px', border: 'none' }} />
                        <Bar dataKey="count" name="Uploads" fill="#8b5cf6" radius={[4, 4, 0, 0]} barSize={30} />
                    </BarChart>
                )}
            </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}