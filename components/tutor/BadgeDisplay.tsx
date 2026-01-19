"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { ShieldCheck, PenTool, BookOpen, User, Star } from "lucide-react";

// Map icon strings to Lucide components
const iconMap: any = {
  'shield-check': ShieldCheck,
  'pen-tool': PenTool,
  'book-open': BookOpen,
  'user': User,
  'medal-star': Star
};

export default function BadgeDisplay({ userId }: { userId: string }) {
  const [badges, setBadges] = useState<any[]>([]);

  useEffect(() => {
    const fetchBadges = async () => {
      const { data } = await supabase
        .from('user_badges')
        .select('badge:badges(name, icon_key, description)')
        .eq('user_id', userId);
      
      setBadges(data || []);
    };
    if (userId) fetchBadges();
  }, [userId]);

  if (badges.length === 0) return null;

  return (
    <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
      <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Achievements</h3>
      <div className="flex flex-wrap gap-3">
        {badges.map((b: any, i) => {
          const Icon = iconMap[b.badge.icon_key] || Star;
          return (
            <div key={i} className="group relative flex items-center gap-2 px-3 py-1.5 bg-indigo-50 text-indigo-700 rounded-lg border border-indigo-100 cursor-help">
              <Icon className="w-4 h-4" />
              <span className="text-xs font-bold">{b.badge.name}</span>
              
              {/* Tooltip */}
              <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-32 bg-slate-800 text-white text-[10px] p-2 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none text-center">
                {b.badge.description}
                <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-slate-800"></div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}