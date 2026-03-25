"use client";

import { 
  Filter, 
  ChevronRight, 
  Layers, 
  Newspaper, 
  BookOpen, 
  GraduationCap, 
  Book, 
  AlertCircle, 
  HelpCircle 
} from "lucide-react";

type FilterType = {
  id: string;
  label: string;
  icon: any;
};

const filters: FilterType[] = [
  { id: "all", label: "All Contents", icon: Layers },
  { id: "news", label: "News & Events", icon: Newspaper },
  { id: "blog", label: "Educational Blogs", icon: BookOpen },
  { id: "course", label: "Premium Courses", icon: GraduationCap },
  { id: "ebook", label: "Ebooks & Guides", icon: Book },
  { id: "lesson_plan", label: "Lesson Plans", icon: Layers },
  { id: "update", label: "Segment Updates", icon: AlertCircle },
  { id: "question", label: "Question Bank", icon: HelpCircle },
];

interface SearchSidebarProps {
  activeType: string;
  onTypeChange: (type: string) => void;
  totalResults: number;
}

export default function SearchSidebar({ activeType, onTypeChange, totalResults }: SearchSidebarProps) {
  return (
    <div className="space-y-8 sticky top-24">
      <div className="bg-white rounded-[2.5rem] p-8 border border-slate-100 shadow-sm animate-in fade-in slide-in-from-left-4 duration-500">
        <h3 className="text-xl font-black text-slate-900 mb-8 flex items-center gap-3">
          <div className="p-2 bg-indigo-50 rounded-xl">
            <Filter className="w-5 h-5 text-indigo-600" />
          </div>
          Filter by Type
        </h3>

        <div className="space-y-3">
          {filters.map((f) => {
            const Icon = f.icon;
            const isActive = activeType === f.id;
            
            return (
              <button
                key={f.id}
                onClick={() => onTypeChange(f.id)}
                className={`w-full group flex items-center justify-between px-5 py-3.5 rounded-2xl text-[11px] font-black uppercase tracking-wider transition-all duration-300 transform active:scale-95 ${
                  isActive
                    ? "bg-indigo-600 text-white shadow-xl shadow-indigo-100 translate-x-1"
                    : "text-slate-500 hover:bg-slate-50 hover:text-slate-900 border border-transparent hover:border-slate-100"
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`w-4 h-4 transition-transform group-hover:scale-110 ${isActive ? "text-white" : "text-slate-400 group-hover:text-indigo-600"}`} />
                  {f.label}
                </div>
                <ChevronRight className={`w-3.5 h-3.5 transition-opacity ${isActive ? "opacity-100" : "opacity-0 group-hover:opacity-50"}`} />
              </button>
            );
          })}
        </div>
      </div>

      <div className="bg-gradient-to-br from-slate-900 to-indigo-950 rounded-[2.5rem] p-8 text-white relative overflow-hidden shadow-2xl">
         <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-400/10 rounded-full blur-3xl -mr-16 -mt-16"></div>
         <h4 className="text-lg font-black mb-3 leading-tight relative z-10">Can't find what you're looking for?</h4>
         <p className="text-slate-400 text-xs mb-6 font-medium leading-relaxed relative z-10">Try searching for broader keywords like "SSC" or "HSC" to see all related materials.</p>
         <div className="text-[10px] font-black uppercase tracking-widest text-indigo-400 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-indigo-400 animate-pulse"></span>
            {totalResults} Live Results
         </div>
      </div>
    </div>
  );
}
