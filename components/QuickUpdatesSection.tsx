"use client";

import { useState } from "react";
import Link from "next/link";
import { 
  Bell, 
  LayoutGrid, 
  Calendar, 
  FileText, 
  Trophy, 
  CalendarDays, 
  Download, 
  ArrowRight,
  Rss
} from "lucide-react";

interface UpdateItem {
  id: string | number;
  title: string;
  type: string; // 'routine' | 'syllabus' | 'exam_result' | etc.
  created_at: string;
  attachment_url?: string;
}

interface QuickUpdatesSectionProps {
  updates: UpdateItem[];
  segmentSlug: string;
}

export default function QuickUpdatesSection({ updates, segmentSlug }: QuickUpdatesSectionProps) {
  const [activeCategory, setActiveCategory] = useState("All");

  const categories = [
    { name: "All", icon: <LayoutGrid className="w-3.5 h-3.5" /> },
    { name: "Exam Routine", icon: <Calendar className="w-3.5 h-3.5" /> },
    { name: "Full Syllabus", icon: <FileText className="w-3.5 h-3.5" /> },
    { name: "Board Results", icon: <Trophy className="w-3.5 h-3.5" /> }
  ];

  const filteredUpdates = updates.filter(upd => {
    if (activeCategory === "All") return true;
    if (activeCategory === "Exam Routine") return upd.type === "routine";
    if (activeCategory === "Full Syllabus") return upd.type === "syllabus";
    if (activeCategory === "Board Results") return upd.type === "exam_result";
    return true;
  });

  return (
    <section className="space-y-4">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="p-2.5 bg-orange-50 dark:bg-orange-950/20 text-orange-600 dark:text-orange-400 rounded-xl">
          <Bell className="w-5 h-5" />
        </div>
        <div>
          <h2 className="text-sm font-bold text-slate-900 dark:text-white tracking-tight">Quick Updates</h2>
          <p className="text-[11px] text-slate-400 dark:text-slate-500">Routines, syllabi, and board results</p>
        </div>
      </div>

      {/* Filter Row */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 -ml-1 pl-1 hide-scrollbar">
        {categories.map((cat) => {
          const isActive = activeCategory === cat.name;
          return (
            <button
              key={cat.name}
              onClick={() => setActiveCategory(cat.name)}
              className={`px-4 py-1.5 rounded-full text-[11px] whitespace-nowrap font-bold tracking-wide transition-all border shrink-0 flex items-center gap-1.5 ${
                isActive
                  ? "bg-slate-900 dark:bg-indigo-600 text-white border-slate-900 dark:border-indigo-600 shadow-md"
                  : "bg-white dark:bg-slate-900 text-slate-500 dark:text-slate-400 border-slate-200 dark:border-slate-800 hover:border-indigo-550 dark:hover:border-indigo-500 hover:text-indigo-650 dark:hover:text-indigo-400"
              }`}
            >
              {cat.icon}
              <span>{cat.name}</span>
            </button>
          );
        })}
      </div>

      {/* Content List */}
      {filteredUpdates.length > 0 ? (
        <div className="space-y-3">
          {filteredUpdates.slice(0, 5).map((upd) => (
            <Link
              key={upd.id}
              href={`/resources/${segmentSlug}/updates/${upd.id}`}
              className="group bg-gradient-to-br from-white to-slate-50/40 dark:from-slate-900 dark:to-indigo-950/5 p-4 rounded-xl border border-slate-200 dark:border-slate-800/80 flex items-center justify-between hover:border-indigo-500 dark:hover:border-indigo-500 hover:shadow-lg hover:shadow-indigo-500/5 hover:-translate-y-0.5 transition-all duration-300"
            >
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-lg bg-orange-50 dark:bg-orange-950/20 text-orange-500 group-hover:scale-105 transition-transform duration-300 shadow-sm">
                  <CalendarDays className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate max-w-[240px] md:max-w-md group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                    {upd.title}
                  </h4>
                  <span className="text-[9px] font-bold text-slate-400 dark:text-slate-500 tracking-wider">
                    {upd.type === "exam_result" ? "Result" : upd.type === "routine" ? "Routine" : "Syllabus"} ·{" "}
                    {new Date(upd.created_at).toLocaleDateString()}
                  </span>
                </div>
              </div>
              {upd.attachment_url ? (
                <span className="text-[10px] font-bold tracking-wider px-3 py-2 bg-slate-50 dark:bg-slate-850 hover:bg-indigo-600 hover:text-white dark:hover:bg-indigo-600 dark:hover:text-white text-slate-655 dark:text-slate-300 rounded-lg transition-colors flex items-center gap-1 shadow-sm shrink-0">
                  <Download className="w-3.5 h-3.5" />
                  <span>View</span>
                </span>
              ) : (
                <span className="text-[9px] font-bold text-indigo-650 dark:text-indigo-400 flex items-center gap-1 group-hover:translate-x-0.5 transition-transform duration-300">
                  Read <ArrowRight className="w-3 h-3" />
                </span>
              )}
            </Link>
          ))}
        </div>
      ) : (
        <div className="bg-white dark:bg-slate-900/50 p-8 rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-800 text-center text-slate-400 dark:text-slate-500">
          <Rss className="w-8 h-8 mx-auto mb-2 opacity-30 animate-pulse text-indigo-500" />
          <p className="text-xs font-semibold">No updates found for "{activeCategory}"</p>
          <span className="text-[10px] mt-1 block">Try selecting another filter above</span>
        </div>
      )}
    </section>
  );
}
