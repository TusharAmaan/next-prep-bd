"use client";

import { useState } from "react";
import Link from "next/link";
import { 
  Database, 
  LayoutGrid, 
  Library, 
  School, 
  FileCheck, 
  Clock, 
  ArrowRight,
  Zap,
  Calendar,
  ChevronRight
} from "lucide-react";

interface QuestionItem {
  id: string | number;
  title: string;
  slug?: string;
  category?: string;
  created_at: string;
  subjects?: { title: string }[] | { title: string } | null;
}

interface QuestionBankSectionProps {
  questions: QuestionItem[];
  segmentSlug: string;
  title?: string;
  subtitle?: string;
  browseAllHref: string;
  defaultSubjectTitle?: string;
}

export default function QuestionBankSection({ 
  questions, 
  segmentSlug, 
  title = "Question Bank", 
  subtitle = "Institutional archives · Board questions",
  browseAllHref,
  defaultSubjectTitle
}: QuestionBankSectionProps) {
  const [activeCategory, setActiveCategory] = useState("All");

  const categories = [
    { name: "All", icon: <LayoutGrid className="w-3.5 h-3.5" /> },
    { name: "Board Question", icon: <Library className="w-3.5 h-3.5" /> },
    { name: "School Question", icon: <School className="w-3.5 h-3.5" /> },
    { name: "Model Test", icon: <FileCheck className="w-3.5 h-3.5" /> }
  ];

  const matchCategory = (q: QuestionItem, categoryName: string) => {
    if (categoryName === "All") return true;
    if (!q.category) return false;
    const qCat = q.category.toLowerCase();
    
    if (categoryName === "Board Question") {
      return qCat.includes("board");
    }
    if (categoryName === "School Question") {
      return qCat.includes("school") || qCat.includes("college") || qCat.includes("institution");
    }
    if (categoryName === "Model Test") {
      return qCat.includes("model");
    }
    return qCat.includes(categoryName.toLowerCase());
  };

  const filteredQuestions = questions.filter(q => matchCategory(q, activeCategory));

  const getQuestionTag = (q: QuestionItem) => {
    if (defaultSubjectTitle) return defaultSubjectTitle;
    
    if (Array.isArray(q.subjects)) {
      return q.subjects[0]?.title || q.category || "General";
    }
    if (q.subjects && typeof q.subjects === "object") {
      return (q.subjects as { title: string }).title || q.category || "General";
    }
    return q.category || "General";
  };

  return (
    <section id="question-bank" className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-2 gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-blue-50 dark:bg-blue-950/20 text-blue-600 dark:text-blue-400 rounded-xl">
            <Database className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-slate-900 dark:text-white tracking-tight">{title}</h2>
            <p className="text-[11px] text-slate-400 dark:text-slate-500">{subtitle}</p>
          </div>
        </div>
        <Link
          href={browseAllHref}
          className="text-[11px] font-bold text-indigo-650 dark:text-indigo-400 flex items-center gap-1 group text-xs whitespace-nowrap"
        >
          <span>Browse all</span>
          <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
        </Link>
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
                  : "bg-white dark:bg-slate-900 text-slate-500 dark:text-slate-400 border-slate-200 dark:border-slate-800 hover:border-indigo-550 dark:hover:border-indigo-500 hover:text-indigo-655 dark:hover:text-indigo-400"
              }`}
            >
              {cat.icon}
              <span>{cat.name}</span>
            </button>
          );
        })}
      </div>

      {/* Content List */}
      {filteredQuestions.length > 0 ? (
        <div className="space-y-3">
          {filteredQuestions.slice(0, 5).map((q) => (            <Link
              href={`/question/${q.slug || q.id}`}
              key={q.id}
              className="group bg-gradient-to-br from-white to-slate-50/40 dark:from-slate-900 dark:to-indigo-950/5 rounded-2xl p-5 border border-slate-200/80 dark:border-slate-800/80 hover:border-indigo-500 dark:hover:border-indigo-500 hover:shadow-lg hover:shadow-indigo-500/5 hover:-translate-y-0.5 transition-all duration-300 flex items-center justify-between gap-4"
            >
              <div className="flex items-center gap-4 min-w-0">
                {/* Q Icon Box */}
                <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950/30 text-indigo-650 dark:text-indigo-400 flex items-center justify-center font-black text-base shrink-0 group-hover:scale-105 group-hover:rotate-3 transition-transform duration-300 shadow-sm">
                  Q
                </div>
                {/* Text Content */}
                <div className="min-w-0 space-y-2">
                  <h3 className="font-bold text-slate-800 dark:text-slate-200 text-xs sm:text-sm group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors truncate max-w-[220px] sm:max-w-md md:max-w-xl leading-tight">
                    {q.title}
                  </h3>
                  <div className="flex flex-wrap items-center gap-2.5 text-[9px] md:text-[10px] font-bold">
                    {/* Subject Tag */}
                    <span className="px-2.5 py-0.5 rounded bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-455 tracking-wider">
                      {getQuestionTag(q)}
                    </span>
                    {/* Category Tag */}
                    {q.category && (
                      <span className={`px-2.5 py-0.5 rounded tracking-wider ${
                        q.category.toLowerCase().includes("board")
                          ? "bg-orange-50 dark:bg-orange-950/40 text-orange-600 dark:text-orange-400"
                          : "bg-slate-55 dark:bg-slate-800 text-slate-550 dark:text-slate-400 border border-slate-100 dark:border-slate-700"
                      }`}>
                        {q.category}
                      </span>
                    )}
                    {/* Date Tag */}
                    <span className="text-slate-400 dark:text-slate-500 flex items-center gap-1 font-semibold">
                      <Calendar className="w-3.5 h-3.5 text-indigo-500/60" />
                      {new Date(q.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                    </span>
                  </div>
                </div>
              </div>
              {/* Chevron icon */}
              <div className="text-slate-350 dark:text-slate-655 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors shrink-0 pr-1">
                <ChevronRight className="w-5 h-5 group-hover:translate-x-0.5 transition-transform duration-300" />
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <div className="p-10 text-center text-slate-450 dark:text-slate-500 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800/80 shadow-sm">
          <Zap className="w-8 h-8 mx-auto mb-2 opacity-50 text-indigo-500" />
          <p className="text-xs font-semibold">No questions found</p>
        </div>
      )}
    </section>
  );
}
