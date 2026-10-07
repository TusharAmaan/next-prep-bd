"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { 
  BellRing, 
  LayoutGrid, 
  Calendar, 
  FileText, 
  Trophy, 
  Download, 
  ArrowRight,
  Search,
  X,
  ChevronDown,
  ChevronUp,
  Sparkles,
  ExternalLink,
  Clock
} from "lucide-react";

export interface UpdateItem {
  id: string | number;
  title: string;
  type: string; // 'routine' | 'syllabus' | 'exam_result' | etc.
  created_at: string;
  attachment_url?: string;
}

interface QuickUpdatesSectionProps {
  updates: UpdateItem[];
  segmentSlug: string;
  initialLimit?: number;
}

export default function QuickUpdatesSection({ 
  updates, 
  segmentSlug, 
  initialLimit = 4 
}: QuickUpdatesSectionProps) {
  const [activeCategory, setActiveCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [isExpanded, setIsExpanded] = useState(false);

  // Compute category counts
  const counts = useMemo(() => {
    return {
      All: updates.length,
      "Exam Routine": updates.filter(u => u.type === "routine").length,
      "Full Syllabus": updates.filter(u => u.type === "syllabus").length,
      "Board Results": updates.filter(u => u.type === "exam_result").length
    };
  }, [updates]);

  const categories = [
    { name: "All", label: "All", count: counts.All, icon: <LayoutGrid className="w-3.5 h-3.5" /> },
    { name: "Exam Routine", label: "Exam Routine", count: counts["Exam Routine"], icon: <Calendar className="w-3.5 h-3.5" /> },
    { name: "Full Syllabus", label: "Full Syllabus", count: counts["Full Syllabus"], icon: <FileText className="w-3.5 h-3.5" /> },
    { name: "Board Results", label: "Board Results", count: counts["Board Results"], icon: <Trophy className="w-3.5 h-3.5" /> }
  ];

  // Filter updates by category and search
  const filteredUpdates = useMemo(() => {
    return updates.filter(upd => {
      // Category match
      let catMatch = true;
      if (activeCategory === "Exam Routine") catMatch = upd.type === "routine";
      else if (activeCategory === "Full Syllabus") catMatch = upd.type === "syllabus";
      else if (activeCategory === "Board Results") catMatch = upd.type === "exam_result";

      if (!catMatch) return false;

      // Search match
      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase();
      return (
        upd.title.toLowerCase().includes(q) ||
        upd.type.toLowerCase().includes(q)
      );
    });
  }, [updates, activeCategory, searchQuery]);

  // Sliced items based on expansion state
  const displayedUpdates = isExpanded 
    ? filteredUpdates 
    : filteredUpdates.slice(0, initialLimit);

  const hasMore = filteredUpdates.length > initialLimit;

  // Helpers for category styling
  const getTypeBadge = (type: string) => {
    switch (type) {
      case "routine":
        return {
          label: "Exam Routine",
          icon: <Calendar className="w-3 h-3 text-emerald-500" />,
          classes: "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border-emerald-200/80 dark:border-emerald-800/60"
        };
      case "syllabus":
        return {
          label: "Syllabus",
          icon: <FileText className="w-3 h-3 text-indigo-500" />,
          classes: "bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 border-indigo-200/80 dark:border-indigo-800/60"
        };
      case "exam_result":
        return {
          label: "Board Result",
          icon: <Trophy className="w-3 h-3 text-amber-500" />,
          classes: "bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border-amber-200/80 dark:border-amber-800/60"
        };
      default:
        return {
          label: "Official Notice",
          icon: <BellRing className="w-3 h-3 text-blue-500" />,
          classes: "bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 border-blue-200/80 dark:border-blue-800/60"
        };
    }
  };

  const isRecent = (dateStr: string) => {
    try {
      const diffDays = (new Date().getTime() - new Date(dateStr).getTime()) / (1000 * 60 * 60 * 24);
      return diffDays <= 45;
    } catch {
      return false;
    }
  };

  return (
    <section id="quick-updates" className="space-y-4">
      {/* SECTION HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-1 border-b border-slate-200/60 dark:border-slate-800/60">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-amber-500 to-orange-500 text-white flex items-center justify-center shrink-0 shadow-md shadow-orange-500/20">
            <BellRing className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base sm:text-lg font-black text-slate-900 dark:text-white tracking-tight">
                Quick Updates
              </h2>
              <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-orange-100 dark:bg-orange-950/50 text-orange-700 dark:text-orange-300">
                {updates.length} Available
              </span>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
              Official exam routines, revised syllabi & institutional schedules
            </p>
          </div>
        </div>

        {/* Top Header Actions */}
        <div className="flex items-center gap-2 self-start sm:self-auto">
          {hasMore && (
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="text-xs font-bold px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 hover:border-indigo-300 dark:hover:border-indigo-600 transition-all flex items-center gap-1.5 shadow-2xs"
            >
              <span>{isExpanded ? "Show Less" : `Show All (${filteredUpdates.length})`}</span>
              {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </button>
          )}

          <Link
            href={`/resources/${segmentSlug}/updates`}
            className="text-xs font-bold px-3 py-1.5 rounded-xl bg-orange-500/10 dark:bg-orange-500/20 text-orange-600 dark:text-orange-400 hover:bg-orange-500 hover:text-white dark:hover:bg-orange-500 dark:hover:text-white transition-all flex items-center gap-1"
            title="Browse all updates in full directory"
          >
            <span>Directory</span>
            <ExternalLink className="w-3 h-3" />
          </Link>
        </div>
      </div>

      {/* FILTER BAR & SEARCH INPUT */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5 pt-1">
        {/* Category Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          {categories.map((cat) => {
            const isActive = activeCategory === cat.name;
            return (
              <button
                key={cat.name}
                onClick={() => {
                  setActiveCategory(cat.name);
                }}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all border shrink-0 flex items-center gap-1.5 ${
                  isActive
                    ? "bg-slate-900 dark:bg-indigo-600 text-white border-slate-900 dark:border-indigo-600 shadow-sm"
                    : "bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 hover:text-slate-900 dark:hover:text-white"
                }`}
              >
                {cat.icon}
                <span>{cat.label}</span>
                <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-extrabold ${
                  isActive
                    ? "bg-white/20 text-white"
                    : "bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400"
                }`}>
                  {cat.count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Live Search */}
        <div className="relative min-w-[200px] sm:w-64">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search updates & schools..."
            className="w-full pl-8 pr-7 py-1.5 text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500/40 text-slate-800 dark:text-slate-200 placeholder:text-slate-400 font-medium transition-all"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* 2-COLUMN RESPONSIVE CARD GRID */}
      {displayedUpdates.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
          {displayedUpdates.map((upd) => {
            const badge = getTypeBadge(upd.type);
            const recent = isRecent(upd.created_at);

            return (
              <Link
                key={upd.id}
                href={`/resources/${segmentSlug}/updates/${upd.id}`}
                className="group relative bg-white dark:bg-[#0c1222] border border-slate-200/90 dark:border-slate-800 rounded-2xl p-4 sm:p-5 flex flex-col justify-between hover:border-orange-400/70 dark:hover:border-orange-500/50 hover:shadow-xl hover:shadow-orange-500/5 hover:-translate-y-0.5 transition-all duration-300"
              >
                {/* Ambient glow in corner on hover */}
                <div className="absolute top-0 right-0 w-28 h-28 bg-gradient-to-bl from-orange-500/5 to-transparent rounded-tr-2xl pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity" />

                <div>
                  {/* Top Badge & Date Row */}
                  <div className="flex items-center justify-between gap-2 mb-2.5">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg text-[10px] font-bold border ${badge.classes}`}>
                        {badge.icon}
                        <span>{badge.label}</span>
                      </span>

                      {recent && (
                        <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md text-[9px] font-extrabold bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 border border-rose-200/60 dark:border-rose-900/60 animate-pulse">
                          <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                          NEW
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-1 text-[11px] font-semibold text-slate-400 dark:text-slate-500 shrink-0">
                      <Clock className="w-3 h-3" />
                      <span>{new Date(upd.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</span>
                    </div>
                  </div>

                  {/* Title */}
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-orange-600 dark:group-hover:text-orange-400 transition-colors line-clamp-2 leading-snug mb-3">
                    {upd.title}
                  </h3>
                </div>

                {/* Card Footer: Action button & attachment indicators */}
                <div className="pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between gap-2 text-xs">
                  <div className="flex items-center gap-1.5 text-[11px] font-semibold text-slate-500 dark:text-slate-400">
                    {upd.attachment_url ? (
                      <span className="inline-flex items-center gap-1 text-slate-600 dark:text-slate-300">
                        <Download className="w-3.5 h-3.5 text-orange-500" />
                        <span>PDF Attached</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-slate-400">
                        <FileText className="w-3.5 h-3.5" />
                        <span>Standard Routine</span>
                      </span>
                    )}
                  </div>

                  {upd.attachment_url ? (
                    <span className="inline-flex items-center gap-1 px-3 py-1 rounded-xl bg-orange-50 dark:bg-orange-950/40 text-orange-600 dark:text-orange-400 font-bold group-hover:bg-orange-500 group-hover:text-white transition-all text-xs">
                      <span>View PDF</span>
                      <Download className="w-3 h-3" />
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-orange-600 dark:text-orange-400 font-bold group-hover:translate-x-0.5 transition-transform text-xs">
                      <span>Read details</span>
                      <ArrowRight className="w-3 h-3" />
                    </span>
                  )}
                </div>
              </Link>
            );
          })}
        </div>
      ) : (
        <div className="bg-white dark:bg-slate-900/50 p-8 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800 text-center text-slate-400 dark:text-slate-500">
          <BellRing className="w-8 h-8 mx-auto mb-2 opacity-30 text-orange-500" />
          <p className="text-xs font-semibold">No updates found for this search/filter</p>
          <button
            onClick={() => { setActiveCategory("All"); setSearchQuery(""); }}
            className="mt-2 text-xs font-bold text-orange-600 dark:text-orange-400 hover:underline"
          >
            Reset Filters
          </button>
        </div>
      )}

      {/* BOTTOM "SHOW ALL" / "SHOW LESS" TOGGLE */}
      {hasMore && (
        <div className="pt-2 text-center">
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="w-full sm:w-auto px-6 py-2.5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0c1222] hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xs inline-flex items-center justify-center gap-2 shadow-xs transition-all hover:border-orange-400 dark:hover:border-orange-500"
          >
            <span>
              {isExpanded 
                ? "Show Less" 
                : `Show All Updates (${filteredUpdates.length} of ${updates.length})`}
            </span>
            {isExpanded ? (
              <ChevronUp className="w-4 h-4 text-orange-500" />
            ) : (
              <ChevronDown className="w-4 h-4 text-orange-500" />
            )}
          </button>
        </div>
      )}
    </section>
  );
}
