import { ArrowUpRight, ArrowDownRight, MoreHorizontal } from "lucide-react";

interface StatsCardProps {
  title: string;
  value: string | number;
  trend?: string;
  trendUp?: boolean;
  icon: React.ReactNode;
  colorClass: string; // e.g., "bg-blue-500"
}

export default function StatsCard({ title, value, trend, trendUp, icon, colorClass }: StatsCardProps) {
  return (
    <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
      <div className="flex justify-between items-start mb-4">
        <div className={`p-3 rounded-xl text-white shadow-lg shadow-black/5 ${colorClass}`}>
          {icon}
        </div>
        <button className="text-slate-300 hover:text-slate-600 transition-colors"><MoreHorizontal className="w-5 h-5" /></button>
      </div>
      <div>
        <h3 className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-1">{title}</h3>
        <h2 className="text-3xl font-black text-slate-800">{value}</h2>
      </div>
      {trend && (
        <div className={`flex items-center gap-1 mt-3 text-xs font-bold ${trendUp ? 'text-emerald-600' : 'text-red-500'}`}>
          {trendUp ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
          <span>{trend}</span>
          <span className="text-slate-400 font-medium ml-1">vs last month</span>
        </div>
      )}
      {/* Decorative Blob */}
      <div className={`absolute -right-4 -bottom-4 w-24 h-24 rounded-full opacity-10 transition-transform group-hover:scale-110 ${colorClass}`}></div>
    </div>
  );
}