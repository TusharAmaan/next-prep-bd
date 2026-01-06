"use client";
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, 
  Tooltip, ResponsiveContainer 
} from 'recharts';

const data = [
  { name: 'Mon', users: 40, views: 240 },
  { name: 'Tue', users: 30, views: 139 },
  { name: 'Wed', users: 20, views: 980 },
  { name: 'Thu', users: 27, views: 390 },
  { name: 'Fri', users: 18, views: 480 },
  { name: 'Sat', users: 23, views: 380 },
  { name: 'Sun', users: 34, views: 430 },
];

export default function AnalyticsChart() {
  return (
    <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm h-full flex flex-col">
      <div className="flex justify-between items-center mb-6">
        <div>
            <h3 className="font-bold text-slate-800">Platform Analytics</h3>
            <p className="text-xs text-slate-400 font-medium">User activity this week</p>
        </div>
        <select className="text-xs font-bold bg-slate-50 border border-slate-200 rounded-lg px-2 py-1 outline-none text-slate-600">
            <option>Last 7 Days</option>
            <option>Last 30 Days</option>
        </select>
      </div>

      <div className="flex-1 w-full min-h-[250px]">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="colorViews" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
            <XAxis 
                dataKey="name" 
                axisLine={false} 
                tickLine={false} 
                tick={{fill: '#94a3b8', fontSize: 12}} 
                dy={10}
            />
            <YAxis 
                axisLine={false} 
                tickLine={false} 
                tick={{fill: '#94a3b8', fontSize: 12}} 
            />
            <Tooltip 
                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 20px -2px rgba(0,0,0,0.1)' }}
                itemStyle={{ color: '#1e293b', fontWeight: 'bold', fontSize: '12px' }}
            />
            <Area 
                type="monotone" 
                dataKey="views" 
                stroke="#6366f1" 
                strokeWidth={3}
                fillOpacity={1} 
                fill="url(#colorViews)" 
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}