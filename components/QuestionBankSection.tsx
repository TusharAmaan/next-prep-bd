"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { 
  Database, 
  LayoutGrid, 
  Award, 
  School, 
  FileCheck, 
  ArrowRight,
  Search,
  X,
  ChevronDown,
  ChevronUp,
  Calendar,
  BookOpen,
  Sparkles,
  ExternalLink
} from "lucide-react";

export interface QuestionItem {
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
  initialLimit?: number;
}

export default function QuestionBankSection({ 
  questions, 
  segmentSlug, 
  title = "Question Bank", 
  subtitle = "Institutional archives & previous board examination solutions",
  browseAllHref,
  defaultSubjectTitle,
  initialLimit = 4
}: QuestionBankSectionProps) {
  const [activeCategory, setActiveCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [isExpanded, setIsExpanded] = useState(false);

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

  // Compute category counts
  const counts = useMemo(() => {
    return {
      All: questions.length,
      "Board Question": questions.filter(q => matchCategory(q, "Board Question")).length,
      "School Question": questions.filter(q => matchCategory(q, "School Question")).length,
      "Model Test": questions.filter(q => matchCategory(q, "Model Test")).length
    };
  }, [questions]);

  const categories = [
    { name: "All", label: "All Questions", count: counts.All, icon: <LayoutGrid className="w-3.5 h-3.5" /> },
    { name: "Board Question", label: "Board Questions", count: counts["Board Question"], icon: <Award className="w-3.5 h-3.5" /> },
    { name: "School Question", label: "School Tests", count: counts["School Question"], icon: <School className="w-3.5 h-3.5" /> },
    { name: "Model Test", label: "Model Tests", count: counts["Model Test"], icon: <FileCheck className="w-3.5 h-3.5" /> }
  ];

  // Filter questions
  const filteredQuestions = useMemo(() => {
    return questions.filter(q => {
      if (!matchCategory(q, activeCategory)) return false;

      if (!searchQuery.trim()) return true;
      const query = searchQuery.toLowerCase();
      const subjectTag = Array.isArray(q.subjects) 
        ? q.subjects[0]?.title 
        : (q.subjects as { title: string })?.title || "";

      return (
        q.title.toLowerCase().includes(query) ||
        (q.category && q.category.toLowerCase().includes(query)) ||
        subjectTag.toLowerCase().includes(query)
      );
    });
  }, [questions, activeCategory, searchQuery]);

  // Sliced items
  const displayedQuestions = isExpanded 
    ? filteredQuestions 
    : filteredQuestions.slice(0, initialLimit);

  const hasMore = filteredQuestions.length > initialLimit;

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

  const getCategoryBadge = (category?: string) => {
    if (!category) return null;
    const cat = category.toLowerCase();
    if (cat.includes("board")) {
      return {
        label: "Board Exam",
        icon: <Award className="w-3 h-3 text-amber-500" />,
        classes: "bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border-amber-200/80 dark:border-amber-800/60"
      };
    }
    if (cat.includes("school") || cat.includes("college")) {
      return {
        label: "Top School",
        icon: <School className="w-3 h-3 text-emerald-500" />,
        classes: "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border-emerald-200/80 dark:border-emerald-800/60"
      };
    }
    if (cat.includes("model")) {
      return {
        label: "Model Test",
        icon: <FileCheck className="w-3 h-3 text-purple-500" />,
        classes: "bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300 border-purple-200/80 dark:border-purple-800/60"
      };
    }
    return {
      label: category,
      icon: <Sparkles className="w-3 h-3 text-indigo-500" />,
      classes: "bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700"
    };
  };

  return (
    <section id="question-bank" className="space-y-4">
      {/* SECTION HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-1 border-b border-slate-200/60 dark:border-slate-800/60">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center shrink-0 shadow-md shadow-indigo-500/20">
            <Database className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base sm:text-lg font-black text-slate-900 dark:text-white tracking-tight">
                {title}
              </h2>
              <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-950/50 text-blue-700 dark:text-blue-300">
                {questions.length} Items
              </span>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
              {subtitle}
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
              <span>{isExpanded ? "Show Less" : `Show All (${filteredQuestions.length})`}</span>
              {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </button>
          )}

          <Link
            href={browseAllHref}
            className="text-xs font-bold px-3 py-1.5 rounded-xl bg-indigo-500/10 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-600 hover:text-white dark:hover:bg-indigo-600 dark:hover:text-white transition-all flex items-center gap-1"
            title="Browse all questions in filtered repository"
          >
            <span>Full Archive</span>
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
                onClick={() => setActiveCategory(cat.name)}
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
            placeholder="Search questions, boards, years..."
            className="w-full pl-8 pr-7 py-1.5 text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/40 text-slate-800 dark:text-slate-200 placeholder:text-slate-400 font-medium transition-all"
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
      {displayedQuestions.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
          {displayedQuestions.map((q) => {
            const subjectTag = getQuestionTag(q);
            const catBadge = getCategoryBadge(q.category);

            return (
              <Link
                key={q.id}
                href={`/question/${q.slug || q.id}`}
                className="group relative bg-white dark:bg-[#0c1222] border border-slate-200/90 dark:border-slate-800 rounded-2xl p-4 sm:p-5 flex flex-col justify-between hover:border-indigo-400/70 dark:hover:border-indigo-500/50 hover:shadow-xl hover:shadow-indigo-500/5 hover:-translate-y-0.5 transition-all duration-300"
              >
                {/* Ambient glow in corner on hover */}
                <div className="absolute top-0 right-0 w-28 h-28 bg-gradient-to-bl from-indigo-500/5 to-transparent rounded-tr-2xl pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity" />

                <div>
                  {/* Top Badges Row */}
                  <div className="flex items-center justify-between gap-2 mb-2.5">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      {/* Subject Tag */}
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg text-[10px] font-bold bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 border border-indigo-200/80 dark:border-indigo-800/60">
                        <BookOpen className="w-3 h-3 text-indigo-500" />
                        <span>{subjectTag}</span>
                      </span>

                      {/* Category Badge */}
                      {catBadge && (
                        <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg text-[10px] font-bold border ${catBadge.classes}`}>
                          {catBadge.icon}
                          <span>{catBadge.label}</span>
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-1 text-[11px] font-semibold text-slate-400 dark:text-slate-500 shrink-0">
                      <Calendar className="w-3 h-3" />
                      <span>{new Date(q.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</span>
                    </div>
                  </div>

                  {/* Question Title */}
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors line-clamp-2 leading-snug mb-3">
                    {q.title}
                  </h3>
                </div>

                {/* Card Footer: Action & metadata */}
                <div className="pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between gap-2 text-xs">
                  <span className="text-[11px] font-semibold text-slate-400 dark:text-slate-500">
                    Comprehensive Solution & MCQ
                  </span>

                  <span className="inline-flex items-center gap-1 px-3 py-1 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 font-bold group-hover:bg-indigo-600 group-hover:text-white transition-all text-xs">
                    <span>Solve / View</span>
                    <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      ) : (
        <div className="bg-white dark:bg-slate-900/50 p-8 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800 text-center text-slate-400 dark:text-slate-500">
          <Database className="w-8 h-8 mx-auto mb-2 opacity-30 text-indigo-500" />
          <p className="text-xs font-semibold">No questions found matching your filter</p>
          <button
            onClick={() => { setActiveCategory("All"); setSearchQuery(""); }}
            className="mt-2 text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline"
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
            className="w-full sm:w-auto px-6 py-2.5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0c1222] hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xs inline-flex items-center justify-center gap-2 shadow-xs transition-all hover:border-indigo-400 dark:hover:border-indigo-500"
          >
            <span>
              {isExpanded 
                ? "Show Less" 
                : `Show All Questions (${filteredQuestions.length} of ${questions.length})`}
            </span>
            {isExpanded ? (
              <ChevronUp className="w-4 h-4 text-indigo-500" />
            ) : (
              <ChevronDown className="w-4 h-4 text-indigo-500" />
            )}
          </button>
        </div>
      )}
    </section>
  );
}
