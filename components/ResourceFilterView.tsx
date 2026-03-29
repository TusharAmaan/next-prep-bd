"use client";
import { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import { 
  Search, Filter, FileText, PlayCircle, HelpCircle, 
  ChevronRight, BookOpen, Clock, Calendar, Bell, Download, ExternalLink, X 
} from "lucide-react";
import BookmarkButton from "@/components/shared/BookmarkButton";
import Pagination from "@/components/shared/Pagination";

export default function ResourceFilterView({ 
  items, 
  initialType, 
  initialCategory, 
  segmentTitle,
  segmentSlug 
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
  
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const isUpdatePage = initialType === 'update';

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

  useEffect(() => {
    setCurrentPage(1);
  }, [activeCategory, activeSubject, search]);

  const filteredItems = useMemo(() => {
    return items.filter(item => {
      const matchCategory = activeCategory === "All" || item.category === activeCategory;
      
      let itemSubject = "";
      if (Array.isArray(item.subjects) && item.subjects.length > 0) itemSubject = item.subjects[0].title;
      else if (item.subjects?.title) itemSubject = item.subjects.title;
      
      const matchSubject = activeSubject === "All" || itemSubject === activeSubject;
      const matchSearch = !search || item.title.toLowerCase().includes(search.toLowerCase());

      return matchCategory && matchSubject && matchSearch;
    });
  }, [items, activeCategory, activeSubject, search]);

  const totalPages = Math.ceil(filteredItems.length / pageSize);
  const paginatedItems = filteredItems.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  const getItemConfig = (type: string, item: any) => {
    switch(type) {
      case 'pdf': 
        return { 
          icon: <FileText className="w-6 h-6 text-red-500" />, 
          bgColor: 'bg-red-50 dark:bg-red-900/20',
          borderColor: 'group-hover:border-red-200 dark:group-hover:border-red-800',
          label: 'Study Material', 
          href: `/material/${item.slug || item.id}` 
        };
      case 'video': 
        return { 
          icon: <PlayCircle className="w-6 h-6 text-blue-500" />, 
          bgColor: 'bg-blue-50 dark:bg-blue-900/20',
          borderColor: 'group-hover:border-blue-200 dark:group-hover:border-blue-800',
          label: 'Video Class', 
          href: `/material/${item.slug || item.id}` 
        };
      case 'update': 
        return { 
          icon: <Bell className="w-6 h-6 text-amber-500" />, 
          bgColor: 'bg-amber-50 dark:bg-amber-900/20',
          borderColor: 'group-hover:border-amber-200 dark:group-hover:border-amber-800',
          label: 'Read Notice', 
          href: `/resources/${segmentSlug}/updates/${item.id}` 
        };
      default: 
        return { 
          icon: <HelpCircle className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />, 
          bgColor: 'bg-indigo-50 dark:bg-indigo-900/20',
          borderColor: 'group-hover:border-indigo-300 dark:group-hover:border-indigo-800',
          label: 'View Solution', 
          href: `/question/${item.slug || item.id}` 
        };
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-8 py-8 -mt-16 relative z-20">
      
      {/* FILTER CARD */}
      <div className="bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl rounded-3xl shadow-2xl border border-slate-200/50 dark:border-white/10 p-6 mb-10 animate-in fade-in slide-in-from-bottom-4 transition-colors">
        
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="relative flex-grow">
            <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input 
              type="text" 
              placeholder={`Search in ${segmentTitle}...`}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-14 pr-6 py-4 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl font-black text-sm text-slate-700 dark:text-white outline-none ring-1 ring-slate-200 dark:ring-slate-700 focus:ring-2 focus:ring-indigo-600 transition-all placeholder:font-medium placeholder:text-slate-400"
            />
          </div>

          {!isUpdatePage && subjects.length > 1 && (
            <div className="min-w-[240px] relative">
               <BookOpen className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
               <select 
                 value={activeSubject}
                 onChange={(e) => setActiveSubject(e.target.value)}
                 className="w-full pl-14 pr-10 py-4 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl font-black text-[10px] uppercase tracking-widest text-slate-700 dark:text-white outline-none ring-1 ring-slate-200 dark:ring-slate-700 focus:ring-2 focus:ring-indigo-600 appearance-none cursor-pointer transition-all"
               >
                 {subjects.map((sub) => (
                   <option key={sub} value={sub}>{sub === 'All' ? 'All Subjects' : sub}</option>
                 ))}
               </select>
               <ChevronRight className="absolute right-6 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none rotate-90" />
            </div>
          )}
        </div>

        {/* Categories */}
        {categories.length > 1 && (
          <div className="flex flex-wrap gap-3">
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all border ${
                  activeCategory === cat 
                  ? 'bg-slate-900 dark:bg-indigo-600 text-white border-slate-900 dark:border-indigo-600 shadow-xl shadow-indigo-600/20' 
                  : 'bg-white dark:bg-slate-800 text-slate-500 dark:text-slate-400 border-slate-200 dark:border-slate-700 hover:border-indigo-500 dark:hover:border-indigo-500 hover:text-indigo-600 dark:hover:text-indigo-400'
                }`}
              >
                {cat}
              </button>
            ))}
            {(activeCategory !== 'All' || search || activeSubject !== 'All') && (
               <button onClick={() => {setSearch(""); setActiveCategory("All"); setActiveSubject("All")}} className="p-3 rounded-xl text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/20 transition-colors" title="Reset">
                  <X className="w-5 h-5 font-black"/>
               </button>
            )}
          </div>
        )}
      </div>

      {/* RESULTS LIST */}
      <div className="grid gap-6">
        {paginatedItems.length > 0 ? (
          paginatedItems.map((item) => {
            const { icon, label, href, bgColor, borderColor } = getItemConfig(initialType, item);
            
            return (
              <Link 
                key={item.id} 
                href={href}
                className={`group bg-white dark:bg-slate-900 rounded-[2rem] p-6 border border-slate-100 dark:border-slate-800 hover:border-indigo-500 dark:hover:border-indigo-500 shadow-sm hover:shadow-2xl dark:hover:shadow-indigo-900/10 transition-all duration-500 flex flex-col md:flex-row md:items-center gap-6 relative overflow-hidden`}
              >
                {/* Icon Box */}
                <div className={`w-16 h-16 rounded-2xl flex items-center justify-center shrink-0 border border-slate-50 dark:border-slate-800 group-hover:scale-110 transition-transform duration-500 ${bgColor}`}>
                  {icon}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0 space-y-2">
                  <div className="flex flex-wrap items-center gap-3">
                     {!isUpdatePage && (item.subjects) && (
                       <span className="text-[9px] font-black text-white bg-indigo-600 px-3 py-1 rounded-lg shadow-lg shadow-indigo-600/20 uppercase tracking-widest">
                          {Array.isArray(item.subjects) ? item.subjects[0]?.title : item.subjects?.title}
                       </span>
                     )}
                     {item.category && !isUpdatePage && (
                       <span className="text-[9px] font-black text-slate-400 dark:text-slate-500 bg-slate-50 dark:bg-slate-800 px-3 py-1 rounded-lg border border-slate-100 dark:border-slate-700 uppercase tracking-widest">
                          {item.category}
                       </span>
                     )}
                     <span className="text-[9px] font-black text-slate-400 dark:text-slate-500 flex items-center gap-2 uppercase tracking-widest">
                        <Clock className="w-3.5 h-3.5 text-indigo-500" /> {new Date(item.created_at).toLocaleDateString()}
                     </span>
                  </div>
                  
                  <div className="flex items-start gap-4">
                    <div className="mt-1">
                        <BookmarkButton 
                            itemType={initialType === 'pdf' ? 'ebook' : (initialType === 'question' ? 'question' : (initialType === 'video' ? 'course' : 'post'))} 
                            itemId={item.id} 
                            metadata={{ title: item.title }} 
                        />
                    </div>
                    <h3 className="text-xl font-black text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors leading-tight uppercase tracking-tight line-clamp-2">
                        {item.title}
                    </h3>
                  </div>
                </div>

                {/* Action */}
                <div className="shrink-0 self-start md:self-center">
                   <div className="flex items-center gap-3 px-6 py-3 bg-slate-50 dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 text-[10px] font-black uppercase tracking-widest rounded-xl group-hover:bg-indigo-600 group-hover:text-white transition-all duration-300">
                      {label} <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform"/>
                   </div>
                </div>
              </Link>
            );
          })
        ) : (
          <div className="bg-white dark:bg-slate-900/50 rounded-[3rem] p-20 text-center border-2 border-dashed border-slate-100 dark:border-slate-800 shadow-inner">
             <div className="w-24 h-24 bg-slate-50 dark:bg-slate-800 rounded-[2rem] flex items-center justify-center mx-auto mb-8 text-slate-300 dark:text-slate-600 border border-slate-100 dark:border-slate-700">
                <Filter className="w-10 h-10" />
             </div>
             <h3 className="text-2xl font-black text-slate-800 dark:text-white uppercase tracking-tight">No results matched</h3>
             <p className="text-slate-500 dark:text-slate-400 mt-4 max-w-md mx-auto font-medium">Try adjusting your filters or search keywords to find what you're looking for.</p>
             <button 
                onClick={() => {setSearch(""); setActiveCategory("All"); setActiveSubject("All")}} 
                className="mt-10 px-10 py-5 bg-slate-900 dark:bg-indigo-600 text-white text-[10px] font-black uppercase tracking-widest rounded-2xl hover:scale-105 active:scale-95 transition-all shadow-xl shadow-indigo-600/20"
             >
                Reset All Filters
             </button>
          </div>
        )}
      </div>

      <Pagination 
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={setCurrentPage}
        pageSize={pageSize}
        onPageSizeChange={setPageSize}
        totalItems={filteredItems.length}
      />
    </div>
  );
}