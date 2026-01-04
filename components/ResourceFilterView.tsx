"use client";
import { useState, useMemo } from "react";
import Link from "next/link";
import { Search, Filter, FileText, PlayCircle, HelpCircle, ChevronRight, BookOpen, Clock, Calendar, Download } from "lucide-react";

export default function ResourceFilterView({ 
  items, 
  initialType, 
  initialCategory, // Catch the category from URL for initial state
  segmentTitle
}: { 
  items: any[], 
  initialType: string, 
  initialCategory?: string,
  segmentTitle: string
}) {
  // Initialize state with URL param if present, else 'All'
  const [activeCategory, setActiveCategory] = useState(initialCategory || "All");
  const [activeSubject, setActiveSubject] = useState("All");
  const [search, setSearch] = useState("");

  // 1. DYNAMIC EXTRACTION (The Fix)
  // Extract Categories & Subjects ONLY from the items currently available.
  const { categories, subjects } = useMemo(() => {
    const cats = new Set<string>();
    const subs = new Set<string>();

    items.forEach(item => {
      if (item.category) cats.add(item.category);
      // specific logic for resource vs update types
      const subTitle = Array.isArray(item.subjects) ? item.subjects[0]?.title : item.subjects?.title;
      if (subTitle) subs.add(subTitle);
    });

    return {
      categories: ["All", ...Array.from(cats)],
      subjects: ["All", ...Array.from(subs)]
    };
  }, [items]);

  // 2. FILTERING LOGIC
  const filteredItems = items.filter(item => {
    // Category Match
    const matchCategory = activeCategory === "All" || item.category === activeCategory;
    
    // Subject Match (Handle updates which might not have subjects)
    const itemSubject = Array.isArray(item.subjects) ? item.subjects[0]?.title : item.subjects?.title;
    const matchSubject = activeSubject === "All" || (!itemSubject && activeSubject === "All") || itemSubject === activeSubject;

    // Search Match
    const matchSearch = !search || item.title.toLowerCase().includes(search.toLowerCase());

    return matchCategory && matchSubject && matchSearch;
  });

  // Helper for icons & colors
  const getItemStyles = (type: string) => {
    switch(type) {
      case 'pdf': return { icon: <FileText className="w-5 h-5 text-red-500" />, btn: 'Download PDF' };
      case 'video': return { icon: <PlayCircle className="w-5 h-5 text-indigo-500" />, btn: 'Watch Class' };
      case 'update': return { icon: <Calendar className="w-5 h-5 text-amber-500" />, btn: 'View Notice' };
      default: return { icon: <HelpCircle className="w-5 h-5 text-indigo-600" />, btn: 'View Solution' };
    }
  };

  const { btn: actionLabel } = getItemStyles(initialType);

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-8 py-8 -mt-8 relative z-20">
      
      {/* FILTER BAR */}
      <div className="bg-white rounded-2xl shadow-xl border border-slate-100 p-6 mb-8 animate-in fade-in slide-in-from-bottom-4">
        
        {/* Top Row: Search & Subject Filter */}
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          {/* Search */}
          <div className="relative flex-grow">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input 
              type="text" 
              placeholder={`Search ${items.length} ${initialType === 'question' ? 'questions' : 'items'}...`}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-700 outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
            />
          </div>

          {/* Subject Dropdown (Only shows if subjects exist) */}
          {subjects.length > 1 && (
            <div className="min-w-[220px] relative">
               <BookOpen className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
               <select 
                 value={activeSubject}
                 onChange={(e) => setActiveSubject(e.target.value)}
                 className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-700 outline-none focus:ring-2 focus:ring-indigo-500 appearance-none cursor-pointer"
               >
                 {subjects.map((sub) => (
                   <option key={sub} value={sub}>{sub === 'All' ? 'All Subjects' : sub}</option>
                 ))}
               </select>
            </div>
          )}
        </div>

        {/* Bottom Row: Category Pills (Synchronous) */}
        {categories.length > 1 && (
          <div className="flex flex-wrap gap-2">
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-5 py-2 rounded-full text-xs font-black uppercase tracking-wide transition-all border ${
                  activeCategory === cat 
                  ? 'bg-indigo-600 text-white border-indigo-600 shadow-lg shadow-indigo-200 transform scale-105' 
                  : 'bg-white text-slate-500 border-slate-200 hover:border-indigo-400 hover:text-indigo-600'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* RESULTS LIST */}
      <div className="grid gap-4">
        {filteredItems.length > 0 ? (
          filteredItems.map((item) => (
            <div key={item.id} className="group bg-white rounded-xl p-5 border border-slate-200 hover:border-indigo-400 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col md:flex-row md:items-center gap-5">
              
              {/* Icon */}
              <div className="w-12 h-12 rounded-2xl bg-indigo-50 flex items-center justify-center shrink-0 border border-indigo-100 group-hover:scale-110 transition-transform">
                {getItemStyles(initialType).icon}
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-2 mb-2">
                   
                   {/* 1. Subject Tag (Blue) */}
                   {(item.subjects || item.type !== 'update') && (
                     <span className="text-[10px] font-black text-white bg-indigo-500 px-2.5 py-1 rounded shadow-sm">
                        {Array.isArray(item.subjects) ? item.subjects[0]?.title : (item.subjects?.title || "General")}
                     </span>
                   )}

                   {/* 2. Category Tag (Grey) */}
                   {item.category && (
                     <span className="text-[10px] font-bold text-slate-600 bg-slate-100 px-2.5 py-1 rounded border border-slate-200 uppercase">
                        {item.category}
                     </span>
                   )}

                   {/* 3. Date */}
                   <span className="text-[10px] font-bold text-slate-400 flex items-center gap-1 ml-1">
                      <Clock className="w-3 h-3" /> {new Date(item.created_at).toLocaleDateString()}
                   </span>
                </div>
                
                <h3 className="text-lg font-bold text-slate-800 group-hover:text-indigo-600 transition-colors leading-snug">
                  {initialType === 'question' ? (
                      <Link href={`/question/${item.slug || item.id}`} className="block">
                        {item.title}
                      </Link>
                  ) : (
                      <a href={item.attachment_url || item.content_url} target="_blank" rel="noopener noreferrer" className="block">
                        {item.title}
                      </a>
                  )}
                </h3>
              </div>

              {/* Action Button */}
              <div className="shrink-0">
                 {initialType === 'question' ? (
                    <Link href={`/question/${item.slug || item.id}`} className="flex items-center gap-2 px-5 py-2.5 bg-slate-900 text-white text-xs font-bold rounded-lg hover:bg-indigo-600 transition-colors shadow-lg active:scale-95">
                       {actionLabel} <ChevronRight className="w-3 h-3" />
                    </Link>
                 ) : (
                    <a href={item.attachment_url || item.content_url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 px-5 py-2.5 bg-white text-slate-700 border-2 border-slate-100 text-xs font-bold rounded-lg hover:border-indigo-600 hover:text-indigo-600 transition-all">
                       {actionLabel} {initialType === 'pdf' && <Download className="w-3 h-3"/>}
                    </a>
                 )}
              </div>
            </div>
          ))
        ) : (
          <div className="bg-white rounded-2xl p-16 text-center border-2 border-dashed border-slate-200">
             <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-300">
                <Filter className="w-10 h-10" />
             </div>
             <h3 className="text-xl font-bold text-slate-700">No items found</h3>
             <p className="text-slate-400 mt-2 font-medium">Try adjusting your filters or search term.</p>
             <button onClick={() => {setSearch(""); setActiveCategory("All"); setActiveSubject("All")}} className="mt-6 px-6 py-2 bg-indigo-50 text-indigo-600 rounded-lg text-xs font-bold hover:bg-indigo-100">
                Clear Filters
             </button>
          </div>
        )}
      </div>
    </div>
  );
}