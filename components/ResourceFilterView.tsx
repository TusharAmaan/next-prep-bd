"use client";
import { useState, useMemo } from "react";
import Link from "next/link";
import { 
  Search, Filter, FileText, PlayCircle, HelpCircle, 
  ChevronRight, BookOpen, Clock, Calendar, Bell, Download, ExternalLink, X 
} from "lucide-react";

export default function ResourceFilterView({ 
  items, 
  initialType, 
  initialCategory, 
  segmentTitle,
  segmentSlug // Required for the specific update link format
}: { 
  items: any[], 
  initialType: string, 
  initialCategory?: string,
  segmentTitle?: string,
  segmentSlug: string
}) {
  const [activeCategory, setActiveCategory] = useState(initialCategory || "All");
  const [activeSubject, setActiveSubject] = useState("All");
  const [search, setSearch] = useState("");

  const isUpdatePage = initialType === 'update';

  // 1. SMART DYNAMIC EXTRACTION
  const { categories, subjects } = useMemo(() => {
    const cats = new Set<string>();
    const subs = new Set<string>();

    items.forEach(item => {
      if (item.category) cats.add(item.category);
      
      let subTitle = "";
      if (Array.isArray(item.subjects) && item.subjects.length > 0) {
        subTitle = item.subjects[0].title;
      } else if (item.subjects?.title) {
        subTitle = item.subjects.title;
      }
      
      if (subTitle) subs.add(subTitle);
    });

    return {
      categories: ["All", ...Array.from(cats)],
      subjects: ["All", ...Array.from(subs)]
    };
  }, [items]);

  // 2. FILTERING LOGIC
  const filteredItems = items.filter(item => {
    const matchCategory = activeCategory === "All" || item.category === activeCategory;
    
    let itemSubject = "";
    if (Array.isArray(item.subjects) && item.subjects.length > 0) itemSubject = item.subjects[0].title;
    else if (item.subjects?.title) itemSubject = item.subjects.title;
    
    const matchSubject = activeSubject === "All" || itemSubject === activeSubject;
    const matchSearch = !search || item.title.toLowerCase().includes(search.toLowerCase());

    return matchCategory && matchSubject && matchSearch;
  });

  // 3. UI CONFIGURATION
  const getItemConfig = (type: string, item: any) => {
    switch(type) {
      case 'pdf': 
        return { 
          icon: <FileText className="w-6 h-6 text-red-500" />, 
          bgColor: 'bg-red-50',
          borderColor: 'group-hover:border-red-200',
          label: 'Study Material', 
          href: `/material/${item.slug || item.id}` 
        };
      case 'video': 
        return { 
          icon: <PlayCircle className="w-6 h-6 text-blue-500" />, 
          bgColor: 'bg-blue-50',
          borderColor: 'group-hover:border-blue-200',
          label: 'Video Class', 
          href: `/material/${item.slug || item.id}` 
        };
      case 'update': 
        return { 
          icon: <Bell className="w-6 h-6 text-amber-500" />, 
          bgColor: 'bg-amber-50',
          borderColor: 'group-hover:border-amber-200',
          label: 'Read Notice', 
          // EXACT REQUESTED FORMAT:
          href: `/resources/${segmentSlug}/updates/${item.id}` 
        };
      default: 
        return { 
          icon: <HelpCircle className="w-6 h-6 text-indigo-600" />, 
          bgColor: 'bg-indigo-50',
          borderColor: 'group-hover:border-indigo-300',
          label: 'View Solution', 
          href: `/question/${item.slug || item.id}` 
        };
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-8 py-8 -mt-16 relative z-20">
      
      {/* FILTER CARD (Floating Glassmorphism) */}
      <div className="bg-white/95 backdrop-blur-xl rounded-2xl shadow-xl border border-white/20 p-6 mb-10 animate-in fade-in slide-in-from-bottom-4">
        
        {/* Top Row: Search & Filters */}
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="relative flex-grow">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input 
              type="text" 
              placeholder={`Search in ${segmentTitle}...`}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-700 outline-none focus:ring-2 focus:ring-indigo-600 focus:bg-white transition-all shadow-inner"
            />
          </div>

          {!isUpdatePage && subjects.length > 1 && (
            <div className="min-w-[240px] relative">
               <BookOpen className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
               <select 
                 value={activeSubject}
                 onChange={(e) => setActiveSubject(e.target.value)}
                 className="w-full pl-10 pr-10 py-3.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-700 outline-none focus:ring-2 focus:ring-indigo-600 focus:bg-white appearance-none cursor-pointer transition-all shadow-sm hover:bg-slate-50"
               >
                 {subjects.map((sub) => (
                   <option key={sub} value={sub}>{sub === 'All' ? 'All Subjects' : sub}</option>
                 ))}
               </select>
               <div className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">▼</div>
            </div>
          )}
        </div>

        {/* Categories (Gradient Pills) */}
        {categories.length > 1 && (
          <div className="flex flex-wrap gap-2">
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-5 py-2 rounded-full text-xs font-bold uppercase tracking-wide transition-all border ${
                  activeCategory === cat 
                  ? 'bg-slate-900 text-white border-slate-900 shadow-lg transform -translate-y-0.5' 
                  : 'bg-white text-slate-500 border-slate-200 hover:border-indigo-500 hover:text-indigo-600'
                }`}
              >
                {cat}
              </button>
            ))}
            {(activeCategory !== 'All' || search || activeSubject !== 'All') && (
               <button onClick={() => {setSearch(""); setActiveCategory("All"); setActiveSubject("All")}} className="p-2 rounded-full text-red-500 hover:bg-red-50 transition-colors" title="Reset">
                  <X className="w-4 h-4"/>
               </button>
            )}
          </div>
        )}
      </div>

      {/* RESULTS GRID */}
      <div className="grid gap-4">
        {filteredItems.length > 0 ? (
          filteredItems.map((item) => {
            const { icon, label, href, bgColor, borderColor } = getItemConfig(initialType, item);
            
            return (
              <Link 
                key={item.id} 
                href={href}
                className={`group bg-white rounded-2xl p-5 border border-slate-100 hover:border-indigo-500 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col md:flex-row md:items-center gap-5 relative overflow-hidden`}
              >
                {/* Hover Accent Line */}
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-indigo-600 opacity-0 group-hover:opacity-100 transition-opacity"></div>

                {/* Icon Box */}
                <div className={`w-14 h-14 rounded-xl flex items-center justify-center shrink-0 border border-slate-50 group-hover:scale-105 transition-transform ${bgColor}`}>
                  {icon}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0 space-y-1.5">
                  
                  {/* Meta Row */}
                  <div className="flex flex-wrap items-center gap-2">
                     {!isUpdatePage && (item.subjects) && (
                       <span className="text-[10px] font-black text-white bg-indigo-600 px-2.5 py-0.5 rounded shadow-sm">
                          {Array.isArray(item.subjects) ? item.subjects[0]?.title : item.subjects?.title}
                       </span>
                     )}

                     {/* Category (Hidden on Update page to reduce clutter) */}
                     {item.category && !isUpdatePage && (
                       <span className="text-[10px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded border border-slate-200 uppercase">
                          {item.category}
                       </span>
                     )}

                     <span className="text-[10px] font-bold text-slate-400 flex items-center gap-1">
                        <Clock className="w-3 h-3" /> {new Date(item.created_at).toLocaleDateString()}
                     </span>
                  </div>
                  
                  {/* Title */}
                  <h3 className="text-lg font-bold text-slate-800 group-hover:text-indigo-700 transition-colors leading-snug pr-4">
                    {item.title}
                  </h3>
                </div>

                {/* Action Button */}
                <div className="shrink-0 self-start md:self-center">
                   <div className="flex items-center gap-2 px-5 py-2.5 bg-slate-50 text-slate-700 border border-slate-200 text-xs font-bold rounded-xl group-hover:bg-indigo-600 group-hover:text-white group-hover:border-indigo-600 transition-all shadow-sm">
                      {label} <ChevronRight className="w-3 h-3"/>
                   </div>
                </div>
              </Link>
            );
          })
        ) : (
          <div className="bg-white rounded-2xl p-16 text-center border border-dashed border-slate-200 shadow-sm">
             <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-300">
                <Filter className="w-8 h-8" />
             </div>
             <h3 className="text-lg font-bold text-slate-700">No results found</h3>
             <p className="text-slate-400 mt-1 text-sm font-medium">Try adjusting your filters.</p>
             <button 
                onClick={() => {setSearch(""); setActiveCategory("All"); setActiveSubject("All")}} 
                className="mt-5 px-6 py-2 bg-indigo-50 text-indigo-700 rounded-lg text-xs font-bold uppercase tracking-wide hover:bg-indigo-100 transition-colors"
             >
                Reset Filters
             </button>
          </div>
        )}
      </div>
    </div>
  );
}