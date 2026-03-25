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
  Layers
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

const typeConfig: Record<string, { icon: any, color: string, bg: string }> = {
  blog: { icon: BookOpen, color: "text-purple-600", bg: "bg-purple-50" },
  news: { icon: Newspaper, color: "text-indigo-600", bg: "bg-indigo-50" },
  course: { icon: GraduationCap, color: "text-blue-600", bg: "bg-blue-50" },
  ebook: { icon: Book, color: "text-emerald-600", bg: "bg-emerald-50" },
  lesson_plan: { icon: Layers, color: "text-orange-600", bg: "bg-orange-50" },
  update: { icon: AlertCircle, color: "text-amber-600", bg: "bg-amber-50" },
  question: { icon: HelpCircle, color: "text-rose-600", bg: "bg-rose-50" },
};

export default function SearchResultCard({ item }: { item: SearchResult }) {
  const config = typeConfig[item.type] || typeConfig.blog;
  const Icon = config.icon;

  const formatDate = (dateStr: string) => {
    if (!dateStr) return "";
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return "";
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    return `${months[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()}`;
  };

  return (
    <Link 
      href={item.url}
      className="group block bg-white rounded-[2rem] p-6 border border-slate-100 shadow-sm hover:shadow-2xl hover:-translate-y-1.5 transition-all duration-300 relative overflow-hidden"
    >
      <div className="absolute top-0 right-0 w-32 h-32 bg-slate-50 rounded-full -mr-16 -mt-16 group-hover:bg-indigo-50/50 transition-colors pointer-events-none"></div>
      
      <div className="relative z-10">
        <div className="flex items-start justify-between mb-5">
           <div className={`p-4 rounded-2xl ${config.bg} ${config.color} group-hover:bg-indigo-600 group-hover:text-white transition-all duration-500 shadow-sm`}>
              <Icon className="w-6 h-6" />
           </div>
           <span className={`text-[10px] font-black uppercase tracking-[0.15em] px-4 py-1.5 ${config.bg} ${config.color} rounded-full group-hover:bg-indigo-100 group-hover:text-indigo-600 transition-colors`}>
              {item.displayType}
           </span>
        </div>

        <h3 className="text-xl font-black text-slate-900 mb-3 line-clamp-2 leading-tight group-hover:text-indigo-600 transition-colors">
          {item.title}
        </h3>

        <p className="text-slate-500 text-sm leading-relaxed mb-6 line-clamp-3 font-medium">
          {item.description || "Explore this content to get deeper insights and structured learning materials for your exam preparation."}
        </p>

        <div className="pt-6 border-t border-slate-50 flex items-center justify-between">
           <div className="flex items-center gap-2 text-slate-400">
              <Calendar className="w-3.5 h-3.5" />
              <span className="text-[10px] font-black uppercase tracking-wider">
                {formatDate(item.created_at)}
              </span>
           </div>
           <span className="text-indigo-600 text-xs font-black uppercase tracking-[0.1em] flex items-center gap-1.5 group-hover:gap-3 transition-all">
              Details <ChevronRight className="w-4 h-4" />
           </span>
        </div>
      </div>
    </Link>
  );
}
