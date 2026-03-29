"use client";

import Link from "next/link";
import { 
  BookOpen, 
  Newspaper, 
  GraduationCap, 
  Book, 
  AlertCircle, 
  HelpCircle, 
  ChevronRight, 
  Calendar,
  Layers,
  Sparkles
} from "lucide-react";

export type SearchResult = {
  id: string | number;
  title: string;
  description: string;
  type: string;
  displayType: string;
  url: string;
  created_at: string;
  category?: string;
  author?: string;
  instructor_name?: string;
};

const typeConfig: Record<string, { icon: any, color: string, darkColor: string, bg: string, darkBg: string }> = {
  blog: { icon: BookOpen, color: "text-purple-600", darkColor: "text-purple-400", bg: "bg-purple-50", darkBg: "bg-purple-900/20" },
  news: { icon: Newspaper, color: "text-indigo-600", darkColor: "text-indigo-400", bg: "bg-indigo-50", darkBg: "bg-indigo-900/20" },
  course: { icon: GraduationCap, color: "text-blue-600", darkColor: "text-blue-400", bg: "bg-blue-50", darkBg: "bg-blue-900/20" },
  ebook: { icon: Book, color: "text-emerald-600", darkColor: "text-emerald-400", bg: "bg-emerald-50", darkBg: "bg-emerald-900/20" },
  lesson_plan: { icon: Layers, color: "text-orange-600", darkColor: "text-orange-400", bg: "bg-orange-50", darkBg: "bg-orange-900/20" },
  update: { icon: AlertCircle, color: "text-amber-600", darkColor: "text-amber-400", bg: "bg-amber-50", darkBg: "bg-amber-900/20" },
  question: { icon: HelpCircle, color: "text-rose-600", darkColor: "text-rose-400", bg: "bg-rose-50", darkBg: "bg-rose-900/20" },
};

export default function SearchResultCard({ item }: { item: SearchResult }) {
  const config = typeConfig[item.type] || typeConfig.blog;
  const Icon = config.icon;

  const formatDate = (dateStr: string) => {
    if (!dateStr) return "Recent Archive";
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return "Recent Archive";
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  return (
    <Link 
      href={item.url}
      className="group block bg-white dark:bg-slate-900 rounded-[1.5rem] md:rounded-[2.5rem] p-5 md:p-8 border border-slate-100 dark:border-slate-800 shadow-xl dark:shadow-indigo-900/5 hover:shadow-2xl dark:hover:shadow-indigo-600/10 hover:-translate-y-1 md:hover:-translate-y-2 transition-all duration-500 relative overflow-hidden"
    >
      <div className="absolute top-0 right-0 w-32 md:w-40 h-32 md:h-40 bg-slate-50 dark:bg-slate-800/50 rounded-full -mr-16 md:-mr-20 -mt-16 md:-mt-20 group-hover:bg-indigo-500/10 transition-colors duration-700 pointer-events-none"></div>
      
      <div className="relative z-10">
        <div className="flex items-start justify-between mb-4 md:mb-8">
           <div className={`p-3 md:p-5 rounded-xl md:rounded-2xl ${config.bg} dark:bg-slate-800 ${config.color} dark:${config.darkColor} group-hover:bg-indigo-600 group-hover:text-white dark:group-hover:bg-indigo-500 transition-all duration-500 shadow-inner`}>
              <Icon className="w-5 h-5 md:w-7 md:h-7" />
           </div>
           <span className={`text-[8px] md:text-[9px] font-black uppercase tracking-widest px-3 md:px-5 py-1.5 md:py-2 ${config.bg} dark:bg-indigo-500/10 ${config.color} dark:text-indigo-400 rounded-lg md:rounded-xl group-hover:bg-indigo-100 dark:group-hover:bg-indigo-500 group-hover:text-indigo-600 dark:group-hover:text-white transition-all duration-500 border border-transparent dark:border-indigo-500/20`}>
              {item.displayType}
           </span>
        </div>

        <h3 className="text-xl md:text-2xl font-black text-slate-900 dark:text-white mb-3 md:mb-4 line-clamp-2 uppercase tracking-tighter leading-tight group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors duration-300">
          {item.title}
        </h3>

        <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed mb-8 line-clamp-3 font-medium">
          {item.description || "Discover premium academic insights and structured learning resources designed specifically for your success."}
        </p>

        <div className="pt-4 md:pt-8 border-t border-slate-50 dark:border-slate-800/50 flex items-center justify-between">
           <div className="flex items-center gap-2 md:gap-3 text-slate-400 dark:text-slate-500">
              <Calendar className="w-3.5 h-3.5 md:w-4 md:h-4 text-indigo-400" />
              <span className="text-[9px] md:text-[10px] font-black uppercase tracking-[0.2em]">
                {formatDate(item.created_at)}
              </span>
           </div>
           <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400 text-[9px] md:text-[10px] font-black uppercase tracking-widest md:group-hover:translate-x-2 transition-transform duration-500">
              Access Now <ChevronRight className="w-3.5 h-3.5 md:w-4 md:h-4" />
           </div>
        </div>
      </div>
    </Link>
  );
}
