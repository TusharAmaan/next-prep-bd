"use client";
import { useState, useMemo } from "react";
import Link from "next/link";
import { 
  Search, Filter, FileText, PlayCircle, HelpCircle, 
  ChevronRight, BookOpen, Clock, Calendar, Bell 
} from "lucide-react";

export default function ResourceFilterView({ 
  items, 
  initialType, 
  initialCategory,
  segmentTitle // <--- Added this to props
}: { 
  items: any[], 
  initialType: string, 
  initialCategory?: string,
  segmentTitle?: string // <--- Added type definition (optional to be safe)
}) {
  // Initialize state (handles URL params for deep linking)
  const [activeCategory, setActiveCategory] = useState(initialCategory || "All");
  const [activeSubject, setActiveSubject] = useState("All");
  const [search, setSearch] = useState("");

  const isUpdatePage = initialType === 'update';

  // 1. SMART DYNAMIC EXTRACTION
  const { categories, subjects } = useMemo(() => {
    const cats = new Set<string>();
    const subs = new Set<string>();

    items.forEach(item => {
      // Extract Category
      if (item.category) cats.add(item.category);
      
      // Extract Subject (Robust check for array/object/null)
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

  // 2. FILTERING LOGIC (Synchronous)
  const filteredItems = items.filter(item => {
    // Category Match
    const matchCategory = activeCategory === "All" || item.category === activeCategory;
    
    // Subject Match
    let itemSubject = "";
    if (Array.isArray(item.subjects) && item.subjects.length > 0) itemSubject = item.subjects[0].title;
    else if (item.subjects?.title) itemSubject = item.subjects.title;
    
    const matchSubject = activeSubject === "All" || itemSubject === activeSubject;

    // Search Match
    const matchSearch = !search || item.title.toLowerCase().includes(search.toLowerCase());

    return matchCategory && matchSubject && matchSearch;
  });

  // 3. UI HELPERS
  const getItemStyles = (type: string) => {
    switch(type) {
      case 'pdf': return { icon: <FileText className="w-6 h-6 text-red-600" />, label: 'Study Material', linkPrefix: '/material' };
      case 'video': return { icon: <PlayCircle className="w-6 h-6 text-indigo-600" />, label: 'Video Class', linkPrefix: '/material' };
      case 'update': return { icon: <Bell className="w-6 h-6 text-amber-600" />, label: 'Notice', linkPrefix: '/update' };
      default: return { icon: <HelpCircle className="w-6 h-6 text-indigo-600" />, label: 'Question', linkPrefix: '/question' };
    }
  };

  const { icon, linkPrefix } = getItemStyles(initialType);

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-8 py-8 -mt-12 relative z-20">
      
      {/* FILTER BAR */}
      <div className="bg-white rounded-2xl shadow-xl border border-slate-200 p-6 mb-8 animate-in fade-in slide-in-from-bottom-4">
        
        {/* Top Row: Search & Subject */}
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="relative flex-grow">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input 
              type="text" 
              placeholder={`Search ${filteredItems.length} items...`}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-700 outline-none focus:ring-2 focus:ring-indigo-600 focus:bg-white transition-all"
            />
          </div>

          {/* Subject Dropdown (Hidden if no subjects or on Updates page) */}
          {!isUpdatePage && subjects.length > 1 && (
            <div className="min-w-[240px] relative">
               <BookOpen className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
               <select 
                 value={activeSubject}
                 onChange={(e) => setActiveSubject(e.target.value)}
                 className="w-full pl-10 pr-10 py-3.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-700 outline-none focus:ring-2 focus:ring-indigo-600 focus:bg-white appearance-none cursor-pointer transition-all"
               >
                 {subjects.map((sub) => (
                   <option key={sub} value={sub}>{sub === 'All' ? 'All Subjects' : sub}</option>
                 ))}
               </select>
               <div className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">▼</div>
            </div>
          )}
        </div>

        {/* Bottom Row: Categories (Synchronous Pills) */}
        {categories.length > 1 && (
          <div className="flex flex-wrap gap-3">
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all border-2 ${
                  activeCategory === cat 
                  ? 'bg-indigo-600 text-white border-indigo-600 shadow-lg shadow-indigo-200 transform -translate-y-0.5' 
                  : 'bg-white text-slate-500 border-slate-200 hover:border-indigo-600 hover:text-indigo-600'
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
          filteredItems.map((item) => {
            // Construct dynamic link
            const href = `${linkPrefix}/${item.slug || item.id}`;
            
            return (
              <Link 
                key={item.id} 
                href={href}
                className="group bg-white rounded-2xl p-5 border border-slate-200 hover:border-indigo-500 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col md:flex-row md:items-center gap-5"
              >
                {/* Icon Box */}
                <div className="w-14 h-14 rounded-2xl bg-slate-50 flex items-center justify-center shrink-0 border border-slate-100 group-hover:bg-indigo-50 group-hover:border-indigo-100 transition-colors">
                  {icon}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0 space-y-2">
                  
                  {/* Meta Tags */}
                  <div className="flex flex-wrap items-center gap-2">
                     
                     {/* Subject Tag */}
                     {!isUpdatePage && (item.subjects) && (
                       <span className="text-[10px] font-black text-white bg-indigo-600 px-2.5 py-1 rounded-md shadow-sm">
                          {Array.isArray(item.subjects) ? item.subjects[0]?.title : item.subjects?.title}
                       </span>
                     )}

                     {/* Category Tag */}
                     {item.category && (
                       <span className={`text-[10px] font-bold px-2.5 py-1 rounded-md border uppercase ${
                         isUpdatePage 
                         ? 'bg-amber-50 text-amber-700 border-amber-200' 
                         : 'bg-slate-100 text-slate-600 border-slate-200'
                       }`}>
                          {item.category}
                       </span>
                     )}

                     {/* Date */}
                     <span className="text-[10px] font-bold text-slate-400 flex items-center gap-1 ml-1">
                        <Clock className="w-3 h-3" /> {new Date(item.created_at).toLocaleDateString()}
                     </span>
                  </div>
                  
                  {/* Title */}
                  <h3 className="text-lg md:text-xl font-bold text-slate-800 group-hover:text-indigo-700 transition-colors leading-snug">
                    {item.title}
                  </h3>
                </div>

                {/* Action Button */}
                <div className="shrink-0 self-start md:self-center">
                   <div className="flex items-center gap-2 px-5 py-2.5 bg-slate-900 text-white text-xs font-bold rounded-xl group-hover:bg-indigo-600 transition-colors shadow-lg group-active:scale-95">
                      Read Post <ChevronRight className="w-3 h-3"/>
                   </div>
                </div>
              </Link>
            );
          })
        ) : (
          <div className="bg-white rounded-2xl p-16 text-center border-2 border-dashed border-slate-200">
             <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-300">
                <Filter className="w-10 h-10" />
             </div>
             <h3 className="text-xl font-bold text-slate-700">No items match your filter</h3>
             <p className="text-slate-400 mt-2 font-medium">Try selecting "All" or searching for something else.</p>
             <button 
                onClick={() => {setSearch(""); setActiveCategory("All"); setActiveSubject("All")}} 
                className="mt-6 px-8 py-3 bg-indigo-50 text-indigo-700 rounded-xl text-xs font-black uppercase tracking-wide hover:bg-indigo-100 transition-colors"
             >
                Clear All Filters
             </button>
          </div>
        )}
      </div>
    </div>
  );
}