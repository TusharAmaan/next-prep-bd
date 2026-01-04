"use client";
import { useState, useMemo } from "react";
import Link from "next/link";
import { Search, Filter, FileText, PlayCircle, HelpCircle, ChevronRight, BookOpen, Clock } from "lucide-react";

export default function ResourceFilterView({ 
  items, 
  initialType, 
  segmentTitle,
  subjects 
}: { 
  items: any[], 
  initialType: string, 
  segmentTitle: string,
  subjects: any[] 
}) {
  const [activeCategory, setActiveCategory] = useState("All");
  const [activeSubject, setActiveSubject] = useState("All");
  const [search, setSearch] = useState("");

  // 1. DYNAMIC CATEGORY EXTRACTION
  // We only show categories that actually exist in the data
  const categories = useMemo(() => {
    const cats = new Set(items.map(i => i.category).filter(Boolean));
    return ["All", ...Array.from(cats)];
  }, [items]);

  // 2. ROBUST FILTERING LOGIC
  const filteredItems = items.filter(item => {
    // Category Filter
    const matchCategory = activeCategory === "All" || item.category === activeCategory;
    
    // Subject Filter (Robust check for array or object)
    const itemSubject = Array.isArray(item.subjects) ? item.subjects[0]?.title : item.subjects?.title;
    const matchSubject = activeSubject === "All" || itemSubject === activeSubject;

    // Search Filter
    const matchSearch = !search || item.title.toLowerCase().includes(search.toLowerCase());

    return matchCategory && matchSubject && matchSearch;
  });

  // Helper for icons
  const getIcon = (type: string) => {
    if (type === 'pdf') return <FileText className="w-5 h-5 text-red-500" />;
    if (type === 'video') return <PlayCircle className="w-5 h-5 text-blue-500" />;
    return <HelpCircle className="w-5 h-5 text-[#3498db]" />;
  };

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-8 py-8 -mt-8 relative z-20">
      
      {/* FILTER BAR CONTAINER */}
      <div className="bg-white rounded-2xl shadow-xl border border-slate-100 p-6 mb-8 animate-in fade-in slide-in-from-bottom-4">
        
        {/* Top Row: Search & Subject Filter */}
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          {/* Search */}
          <div className="relative flex-grow">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input 
              type="text" 
              placeholder={`Search ${initialType === 'question' ? 'questions' : 'materials'}...`}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-700 outline-none focus:ring-2 focus:ring-[#3498db] transition-all"
            />
          </div>

          {/* Subject Dropdown */}
          <div className="min-w-[200px] relative">
             <BookOpen className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
             <select 
               value={activeSubject}
               onChange={(e) => setActiveSubject(e.target.value)}
               className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-700 outline-none focus:ring-2 focus:ring-[#3498db] appearance-none cursor-pointer"
             >
               <option value="All">All Subjects</option>
               {subjects.map((sub: any) => (
                 <option key={sub.id} value={sub.title}>{sub.title}</option>
               ))}
             </select>
          </div>
        </div>

        {/* Bottom Row: Category Pills (Synchronous) */}
        {categories.length > 1 && (
          <div className="flex flex-wrap gap-2">
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat as string)}
                className={`px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wide transition-all border ${
                  activeCategory === cat 
                  ? 'bg-[#3498db] text-white border-[#3498db] shadow-md transform scale-105' 
                  : 'bg-white text-slate-500 border-slate-200 hover:border-[#3498db] hover:text-[#3498db]'
                }`}
              >
                {cat as string}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* RESULTS LIST */}
      <div className="grid gap-4">
        {filteredItems.length > 0 ? (
          filteredItems.map((item) => (
            <div key={item.id} className="group bg-white rounded-xl p-5 border border-slate-200 hover:border-[#3498db] shadow-sm hover:shadow-lg transition-all duration-300 flex flex-col md:flex-row md:items-center gap-5">
              
              {/* Icon Box */}
              <div className="w-12 h-12 rounded-xl bg-slate-50 flex items-center justify-center shrink-0 border border-slate-100 group-hover:bg-[#3498db]/10 transition-colors">
                {getIcon(item.type)}
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-2 mb-2">
                   {/* Subject Tag (Colored #3498db) */}
                   <span className="text-[10px] font-black text-white bg-[#3498db] px-2 py-0.5 rounded shadow-sm">
                      {Array.isArray(item.subjects) ? item.subjects[0]?.title : (item.subjects?.title || "General")}
                   </span>
                   {/* Category Tag */}
                   {item.category && (
                     <span className="text-[10px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded border border-slate-200 uppercase">
                        {item.category}
                     </span>
                   )}
                   {/* Date */}
                   <span className="text-[10px] font-bold text-slate-400 flex items-center gap-1">
                      <Clock className="w-3 h-3" /> {new Date(item.created_at).toLocaleDateString()}
                   </span>
                </div>
                
                <h3 className="text-lg font-bold text-slate-800 group-hover:text-[#3498db] transition-colors leading-snug">
                  {item.type === 'question' ? (
                      <Link href={`/question/${item.slug || item.id}`} className="block hover:underline decoration-[#3498db]/30 underline-offset-4">
                        {item.title}
                      </Link>
                  ) : (
                      <a href={item.content_url} target="_blank" rel="noopener noreferrer" className="block hover:underline decoration-[#3498db]/30 underline-offset-4">
                        {item.title}
                      </a>
                  )}
                </h3>
              </div>

              {/* Action Button */}
              <div className="shrink-0">
                 {item.type === 'question' ? (
                    <Link href={`/question/${item.slug || item.id}`} className="flex items-center gap-2 px-5 py-2.5 bg-slate-900 text-white text-xs font-bold rounded-lg hover:bg-[#3498db] transition-colors shadow-lg shadow-slate-200">
                       View Solution <ChevronRight className="w-3 h-3" />
                    </Link>
                 ) : (
                    <a href={item.content_url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 px-5 py-2.5 bg-slate-50 text-slate-700 border border-slate-200 text-xs font-bold rounded-lg hover:bg-slate-100 hover:text-[#3498db] transition-colors">
                       {item.type === 'pdf' ? 'Download PDF' : 'Watch Video'}
                    </a>
                 )}
              </div>
            </div>
          ))
        ) : (
          <div className="bg-white rounded-2xl p-12 text-center border-2 border-dashed border-slate-200">
             <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-300">
                <Filter className="w-8 h-8" />
             </div>
             <h3 className="text-lg font-bold text-slate-600">No items found</h3>
             <p className="text-slate-400 text-sm">Try changing your filters or search term.</p>
          </div>
        )}
      </div>
    </div>
  );
}