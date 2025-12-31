"use client";

import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/lib/supabaseClient";
import { debounce } from "lodash";
import Link from "next/link";

type MaterialListProps = {
  segmentId?: number;
  groupId?: number;
  subjectId?: number;
  initialType: string;
  initialCategory?: string;
};

export default function MaterialList({ segmentId, groupId, subjectId, initialType, initialCategory }: MaterialListProps) {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalCount, setTotalCount] = useState(0);
  
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  
  const [type, setType] = useState(initialType);
  const [category, setCategory] = useState(initialCategory || "all");
  
  const [page, setPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10); 

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      let tableName = "resources";
      // Basic selection for resources
      let selectColumns = `id, title, type, created_at, content_url, category, subjects ( title )`;

      if (type === 'update') {
          tableName = "segment_updates";
          // IMPORTANT: We fetch 'segments (slug)' here so we can build the link!
          selectColumns = `id, title, type, created_at, content_url:attachment_url, segments ( slug )`; 
      }

      let query = supabase
        .from(tableName)
        .select(selectColumns, { count: "exact" })
        .order("created_at", { ascending: false });

      // Hierarchy Filters
      if (segmentId) query = query.eq("segment_id", segmentId);
      
      if (tableName === 'resources') {
          if (subjectId) query = query.eq("subject_id", subjectId);
          else if (groupId) query = query.eq("group_id", groupId);
      }

      // Type & Category Logic
      if (type === 'update') {
          if (category && category !== 'all') {
             query = query.eq('type', category); 
          }
      } else {
          if (type === 'pdf') query = query.in('type', ['pdf', 'video']);
          else if (type !== 'all') query = query.eq('type', type);
          
          if (category && category !== 'all') query = query.eq('category', category);
      }

      if (debouncedSearch) query = query.ilike("title", `%${debouncedSearch}%`);

      const from = (page - 1) * itemsPerPage;
      const to = from + itemsPerPage - 1;
      const { data, count, error } = await query.range(from, to);

      if (error) throw error;
      
      if (data) {
          const formatted = data.map((item: any) => ({
              ...item,
              badgeTitle: ['routine', 'syllabus', 'exam_result'].includes(item.type)
                  ? (item.type.replace('_', ' ').toUpperCase())
                  : subjectId 
                      ? (item.category || "General") 
                      : (Array.isArray(item.subjects) ? item.subjects[0]?.title : "General")
          }));
          setItems(formatted);
      }
      if (count !== null) setTotalCount(count);

    } catch (err) {
      console.error("Fetch error:", err);
    } finally {
      setLoading(false);
    }
  }, [segmentId, groupId, subjectId, type, category, debouncedSearch, page, itemsPerPage]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleSearch = (val: string) => {
    setSearch(val);
    const handler = debounce(() => { setDebouncedSearch(val); setPage(1); }, 500);
    handler();
  };

  const handleItemsPerPageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
      setItemsPerPage(Number(e.target.value));
      setPage(1);
  };

  // ✅ FIXED LINK LOGIC for Updates
  const getLink = (item: any) => {
      if (item.content_url) return item.content_url;
      if (item.type === 'blog') return `/blog/${item.id}`;
      
      // FIX: Use the fetched segment slug to build the correct nested URL
      if (['routine', 'syllabus', 'exam_result'].includes(item.type)) {
          // If for some reason slug is missing (rare), fallback to home
          const slug = item.segments?.slug || 'general'; 
          return `/resources/${slug}/updates/${item.id}`;
      }
      
      return `/question/${item.id}`;
  };

  const totalPages = Math.ceil(totalCount / itemsPerPage);

  // Helper for UI styling
  const getTypeConfig = (itemType: string) => {
     switch(itemType) {
         case 'pdf': return { icon: '📄', color: 'bg-red-50 text-red-600', btn: 'Download' };
         case 'video': return { icon: '▶', color: 'bg-blue-50 text-blue-600', btn: 'Watch Class' };
         case 'question': return { icon: '❓', color: 'bg-yellow-50 text-yellow-600', btn: 'View Solution' };
         case 'routine': return { icon: '📅', color: 'bg-purple-50 text-purple-600', btn: 'View Routine' };
         case 'syllabus': return { icon: '📝', color: 'bg-emerald-50 text-emerald-600', btn: 'View Syllabus' };
         case 'exam_result': return { icon: '🏆', color: 'bg-orange-50 text-orange-600', btn: 'Check Result' };
         default: return { icon: '✍️', color: 'bg-slate-100 text-slate-600', btn: 'Read More' };
     }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      
      {/* =========================================
          1. FILTERS & SEARCH BAR
         ========================================= */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-5">
           
           {/* TYPE TOGGLE (Segmented Control) */}
           {type !== 'update' ? (
                <div className="bg-slate-100 p-1 rounded-xl flex w-full md:w-auto overflow-hidden">
                    <button 
                        onClick={() => { setType('pdf'); setPage(1); }} 
                        className={`flex-1 md:flex-none px-6 py-2.5 text-sm font-bold rounded-lg transition-all duration-200 flex items-center justify-center gap-2 ${type === 'pdf' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}
                    >
                        <span>📚</span> Materials
                    </button>
                    <button 
                        onClick={() => { setType('question'); setPage(1); }} 
                        className={`flex-1 md:flex-none px-6 py-2.5 text-sm font-bold rounded-lg transition-all duration-200 flex items-center justify-center gap-2 ${type === 'question' ? 'bg-white text-yellow-600 shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}
                    >
                        <span>❓</span> Questions
                    </button>
                </div>
           ) : (
                <div className="flex items-center gap-3">
                    <span className="bg-red-50 text-red-600 px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wide border border-red-100">
                        📢 Updates Mode
                    </span>
                    {category !== 'all' && (
                        <div className="flex items-center gap-2 bg-slate-100 px-3 py-1.5 rounded-lg text-xs font-bold text-slate-600">
                            <span>Filter: {category.replace('_', ' ').toUpperCase()}</span>
                            <button onClick={()=>setCategory('all')} className="text-slate-400 hover:text-red-500 transition-colors ml-1">✕</button>
                        </div>
                    )}
                </div>
           )}

           {/* SEARCH INPUT */}
           <div className="relative w-full md:w-80 group">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg className="h-5 w-5 text-slate-400 group-focus-within:text-blue-500 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                </div>
                <input 
                    type="text" 
                    placeholder="Search by title..." 
                    value={search} 
                    onChange={(e) => handleSearch(e.target.value)} 
                    className="block w-full pl-10 pr-3 py-2.5 border border-slate-200 rounded-xl leading-5 bg-slate-50 text-slate-900 placeholder-slate-400 focus:outline-none focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm transition-all shadow-inner" 
                />
           </div>
      </div>

      {/* META BAR (Count & Pagination Size) */}
      <div className="flex justify-between items-center px-2">
           <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">
               Found {totalCount} Result{totalCount !== 1 && 's'}
           </span>
           <div className="flex items-center gap-2">
               <label className="text-xs font-bold text-slate-500 hidden sm:block">Show:</label>
               <div className="relative">
                   <select 
                       value={itemsPerPage} 
                       onChange={handleItemsPerPageChange} 
                       className="appearance-none bg-white border border-slate-200 text-xs font-bold text-slate-700 py-1.5 pl-3 pr-8 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer shadow-sm"
                   >
                       <option value={10}>10</option>
                       <option value={20}>20</option>
                       <option value={50}>50</option>
                   </select>
                   <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-slate-500">
                       <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"/></svg>
                   </div>
               </div>
           </div>
      </div>

      {/* =========================================
          2. LIST ITEMS
         ========================================= */}
      {loading ? (
         <div className="space-y-4">
             {[1, 2, 3, 4].map((i) => (
                 <div key={i} className="h-24 bg-white border border-slate-100 rounded-2xl animate-pulse flex items-center p-5 gap-4">
                     <div className="w-12 h-12 bg-slate-100 rounded-xl"></div>
                     <div className="flex-1 space-y-2">
                         <div className="h-4 bg-slate-100 rounded w-3/4"></div>
                         <div className="h-3 bg-slate-100 rounded w-1/4"></div>
                     </div>
                 </div>
             ))}
         </div>
      ) : items.length > 0 ? (
         <div className="grid grid-cols-1 gap-4">
            {items.map((item) => {
                const config = getTypeConfig(item.type);
                return (
                   <div key={item.id} className="group bg-white p-5 rounded-2xl border border-slate-100 shadow-sm hover:shadow-lg hover:border-blue-200 transition-all duration-300 relative overflow-hidden flex flex-col sm:flex-row sm:items-center gap-5">
                       
                       {/* Icon */}
                       <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-2xl flex-shrink-0 ${config.color} shadow-sm group-hover:scale-110 transition-transform duration-300`}>
                           {config.icon}
                       </div>
                       
                       {/* Content */}
                       <div className="flex-1 min-w-0 space-y-2">
                           <h3 className="font-bold text-slate-800 text-lg leading-snug group-hover:text-blue-600 transition-colors line-clamp-2">
                               {item.content_url ? (
                                   <a href={item.content_url} target="_blank" rel="noopener noreferrer" className="focus:outline-none">{item.title}</a>
                               ) : (
                                   <Link href={getLink(item)} className="focus:outline-none">{item.title}</Link>
                               )}
                           </h3>
                           
                           <div className="flex flex-wrap items-center gap-y-2 gap-x-3 text-xs font-bold text-slate-400 uppercase tracking-wide">
                               <span className="bg-slate-50 px-2 py-1 rounded text-slate-500 border border-slate-100">
                                   {item.badgeTitle}
                                </span>
                               <span className="hidden sm:inline">•</span>
                               <span className="flex items-center gap-1">
                                   <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                                   {new Date(item.created_at).toLocaleDateString()}
                               </span>
                           </div>
                       </div>

                       {/* Action Button */}
                       <div className="mt-2 sm:mt-0 sm:self-center">
                           {item.content_url ? (
                               <a 
                                 href={item.content_url} 
                                 target="_blank" 
                                 rel="noopener noreferrer" 
                                 className="w-full sm:w-auto inline-flex justify-center items-center px-5 py-2.5 bg-slate-900 text-white rounded-xl text-xs font-bold hover:bg-blue-600 transition shadow-lg transform hover:-translate-y-0.5"
                                >
                                   {config.btn}
                                </a>
                           ) : (
                               <Link 
                                 href={getLink(item)} 
                                 className="w-full sm:w-auto inline-flex justify-center items-center px-5 py-2.5 bg-white border-2 border-slate-100 text-slate-600 rounded-xl text-xs font-bold hover:border-slate-900 hover:text-slate-900 transition"
                                >
                                   {config.btn}
                                </Link>
                           )}
                       </div>
                   </div>
                );
            })}
         </div>
      ) : (
         <div className="flex flex-col items-center justify-center py-20 bg-white rounded-3xl border border-dashed border-slate-200">
             <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mb-4">
                <span className="text-4xl grayscale opacity-30">📂</span>
             </div>
             <h3 className="text-xl font-black text-slate-800">No items found</h3>
             <p className="text-slate-500 text-sm mt-1 max-w-xs text-center">
                 We couldn't find any materials matching your filters. Try adjusting your search.
             </p>
             <button onClick={() => {setSearch(''); setType(initialType);}} className="mt-6 text-blue-600 font-bold text-sm hover:underline">
                 Clear all filters
             </button>
         </div>
      )}

      {/* =========================================
          3. PAGINATION
         ========================================= */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-3 pt-8 border-t border-slate-100">
            <button 
                disabled={page === 1} 
                onClick={() => setPage(p => Math.max(1, p - 1))} 
                className="px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm font-bold text-slate-600 hover:bg-slate-50 hover:border-slate-300 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
                ← Prev
            </button>
            
            <div className="px-4 py-2 bg-slate-50 rounded-lg text-sm font-bold text-slate-600 border border-slate-100">
                Page {page} / {totalPages}
            </div>
            
            <button 
                disabled={page === totalPages} 
                onClick={() => setPage(p => Math.min(totalPages, p + 1))} 
                className="px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm font-bold text-slate-600 hover:bg-slate-50 hover:border-slate-300 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
                Next →
            </button>
        </div>
      )}
    </div>
  );
}