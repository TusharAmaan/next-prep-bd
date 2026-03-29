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
    <div className="space-y-6 md:space-y-8 lg:sticky lg:top-32 h-fit">
      <div className="bg-white dark:bg-slate-900 rounded-[1.5rem] md:rounded-[2.5rem] p-6 md:p-10 border border-slate-100 dark:border-slate-800 shadow-xl dark:shadow-indigo-900/10 animate-in fade-in slide-in-from-left-4 duration-700">
        <h3 className="text-lg md:text-xl font-black text-slate-900 dark:text-white mb-6 md:mb-8 flex items-center gap-3 md:gap-4 uppercase tracking-tighter">
          <div className="p-2.5 md:p-3 bg-indigo-50 dark:bg-indigo-900/20 rounded-xl md:rounded-2xl">
            <Filter className="w-4 h-4 md:w-5 md:h-5 text-indigo-600 dark:text-indigo-400" />
          </div>
          Refine Results
        </h3>

        <div className="space-y-3">
          {filters.map((f) => {
            const Icon = f.icon;
            const isActive = activeType === f.id;
            
            return (
              <button
                key={f.id}
                onClick={() => onTypeChange(f.id)}
                className={`w-full group flex items-center justify-between px-4 md:px-6 py-3 md:py-4 rounded-xl md:rounded-2xl text-[9px] md:text-[10px] font-black uppercase tracking-widest transition-all duration-500 transform active:scale-95 ${
                  isActive
                    ? "bg-indigo-600 text-white shadow-2xl shadow-indigo-600/30 translate-x-1"
                    : "text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white border border-transparent hover:border-slate-100 dark:hover:border-slate-700 md:hover:translate-x-1 font-bold md:font-black"
                }`}
              >
                <div className="flex items-center gap-4">
                  <Icon className={`w-4 h-4 transition-transform duration-500 group-hover:scale-125 ${isActive ? "text-white" : "text-slate-400 group-hover:text-indigo-600 dark:group-hover:text-indigo-400"}`} />
                  {f.label}
                </div>
                <ChevronRight className={`w-3.5 h-3.5 transition-all duration-500 ${isActive ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0"}`} />
              </button>
            );
          })}
        </div>
      </div>

      <div className="bg-slate-900 dark:bg-indigo-950 rounded-[1.5rem] md:rounded-[2.5rem] p-8 md:p-10 text-white relative overflow-hidden shadow-2xl group border border-white/5 mx-2 md:mx-0">
         <div className="absolute top-0 right-0 w-40 h-40 bg-indigo-400/10 rounded-full blur-3xl -mr-20 -mt-20 group-hover:scale-150 transition-transform duration-1000"></div>
         <h4 className="text-lg md:text-xl font-black mb-3 md:mb-4 uppercase tracking-tighter leading-none relative z-10">Searching <br className="hidden md:block"/>Problems?</h4>
         <p className="text-slate-400 text-[9px] md:text-[10px] mb-6 md:mb-8 font-black uppercase tracking-widest leading-loose relative z-10 opacity-80">Try generic keywords like "SSC" or "Admission" for better results.</p>
         <div className="text-[9px] md:text-[10px] font-black uppercase tracking-[0.2em] text-indigo-400 bg-indigo-400/10 px-4 py-2 rounded-lg md:rounded-xl flex items-center gap-3 w-fit border border-indigo-400/20 relative z-10">
            <span className="w-2.5 h-2.5 rounded-full bg-indigo-400 animate-pulse shadow-[0_0_15px_rgba(129,140,248,0.5)]"></span>
            {totalResults} Live Records
         </div>
      </div>
    </div>
  );
}
