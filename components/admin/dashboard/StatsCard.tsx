"use client";
import { ArrowUpRight, ArrowDownRight } from "lucide-react";

interface StatsCardProps {
  title: string;
  value: string | number;
  trend: string;
  trendUp: boolean;
  icon: React.ReactNode;
  gradient: string; // New Prop for the color
}

export default function StatsCard({ title, value, trend, trendUp, icon, gradient }: StatsCardProps) {
  return (
    <div className={`relative overflow-hidden rounded-2xl p-6 shadow-xl transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl ${gradient} group`}>
      
      {/* DECORATIVE BACKGROUND SHAPES */}
      <div className="absolute top-0 right-0 -mt-4 -mr-4 w-24 h-24 rounded-full bg-white opacity-10 blur-xl group-hover:scale-150 transition-transform duration-500"></div>
      <div className="absolute bottom-0 left-0 -mb-4 -ml-4 w-20 h-20 rounded-full bg-black opacity-5 blur-xl"></div>

      <div className="relative z-10 flex justify-between items-start">
        <div className="flex flex-col">
          <p className="text-xs font-bold uppercase tracking-wider text-white/80 mb-1">{title}</p>
          <h3 className="text-3xl font-black text-white tracking-tight">{value}</h3>
        </div>
        
        {/* ICON CONTAINER */}
        <div className="p-3 bg-white/20 backdrop-blur-sm rounded-xl text-white shadow-inner border border-white/10">
          {icon}
        </div>
      </div>

      {/* FOOTER TREND */}
      <div className="relative z-10 mt-4 flex items-center gap-2">
        <div className={`flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-bold ${trendUp ? 'bg-white/20 text-white' : 'bg-red-500/20 text-white'}`}>
          {trendUp ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
          {trend}
        </div>
        <span className="text-[10px] font-medium text-white/60 uppercase">vs last month</span>
      </div>
    </div>
  );
}