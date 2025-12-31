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

  // --- FETCH DATA ---
  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      let tableName = "resources";
      
      // 1. IMPROVED QUERY: Fetch Group and Segment titles for better labeling
      let selectColumns = `
        id, title, type, created_at, content_url, category, 
        subjects ( title ),
        groups ( title ),
        segments ( title )
      `;

      if (type === 'update') {
          tableName = "segment_updates";
          selectColumns = `id, title, type, created_at, content_url:attachment_url, segments ( slug )`; 
      }

      let query = supabase
        .from(tableName)
        .select(selectColumns, { count: "exact" })
        .order("created_at", { ascending: false });

      // Filters
      if (segmentId) query = query.eq("segment_id", segmentId);
      
      if (tableName === 'resources') {
          if (subjectId) query = query.eq("subject_id", subjectId);
          else if (groupId) query = query.eq("group_id", groupId);
      }

      // Type Logic
      if (type === 'update') {
          if (category && category !== 'all') query = query.eq('type', category); 
      } else {
          if (type === 'pdf') query = query.in('type', ['pdf', 'video']);
          else if (type !== 'all') query = query.eq('type', type);
          if (category && category !== 'all') query = query.eq('category', category);
      }

      if (debouncedSearch) query = query.ilike("title", `%${debouncedSearch}%`);

      // Pagination
      const from = (page - 1) * itemsPerPage;
      const { data, count, error } = await query.range(from, from + itemsPerPage - 1);

      if (error) throw error;
      
      if (data) {
          // 2. SMART LABEL LOGIC: Subject > Group > Segment > Category
          const formatted = data.map((item: any) => {
              let badgeText = "General";
              
              if (['routine', 'syllabus', 'exam_result'].includes(item.type)) {
                  badgeText = item.type.replace('_', ' ').toUpperCase();
              } else {
                  // Try Subject Name
                  if (item.subjects?.title) badgeText = item.subjects.title;
                  // If no subject, Try Group Name (e.g., "Science")
                  else if (item.groups?.title) badgeText = item.groups.title;
                  // If no group, Try Segment Name (e.g., "HSC")
                  else if (item.segments?.title) badgeText = item.segments.title;
                  // Fallback to manual category
                  else if (item.category) badgeText = item.category;
              }

              return { ...item, badgeTitle: badgeText };
          });
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

  // --- HANDLERS ---
  const handleSearch = (val: string) => {
    setSearch(val);
    const handler = debounce(() => { setDebouncedSearch(val); setPage(1); }, 500);
    handler();
  };

  // Link Helper
  const getLink = (item: any) => {
      if (item.content_url) return item.content_url;
      if (item.type === 'blog') return `/blog/${item.id}`;
      if (['routine', 'syllabus', 'exam_result'].includes(item.type)) {
          const slug = item.segments?.slug || 'general'; 
          return `/resources/${slug}/updates/${item.id}`;
      }
      return `/question/${item.id}`;
  };

  const totalPages = Math.ceil(totalCount / itemsPerPage);

  // 3. COLOR THEME CONFIG (High Contrast)
  const getTheme = (itemType: string) => {
     switch(itemType) {
         case 'pdf': return { icon: '📄', bg: 'bg-rose-50', text: 'text-rose-700', border: 'border-rose-100', btn: 'bg-rose-600', label: 'Download' };
         case 'video': return { icon: '▶', bg: 'bg-indigo-50', text: 'text-indigo-700', border: 'border-indigo-100', btn: 'bg-indigo-600', label: 'Watch' };
         case 'question': return { icon: '❓', bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-100', btn: 'bg-amber-600', label: 'Solution' };
         default: return { icon: '⚡', bg: 'bg-slate-50', text: 'text-slate-700', border: 'border-slate-100', btn: 'bg-slate-800', label: 'View' };
     }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      
      {/* 4. COMPACT FILTERS & SEARCH */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row gap-4 justify-between items-center sticky top-[60px] z-10 md:static">
           
           {/* Tab Switcher */}
           {type !== 'update' ? (
                <div className="flex bg-slate-100 p-1 rounded-lg w-full md:w-auto">
                    {['pdf', 'question'].map((t) => (
                        <button 
                            key={t}
                            onClick={() => { setType(t); setPage(1); }} 
                            className={`
                                flex-1 md:flex-none px-5 py-2 text-xs font-bold rounded-md transition-all uppercase tracking-wide
                                ${type === t ? 'bg-white text-slate-900 shadow-sm ring-1 ring-black/5' : 'text-slate-500 hover:text-slate-700'}
                            `}
                        >
                            {t === 'pdf' ? '📚 Materials' : '❓ Questions'}
                        </button>
                    ))}
                </div>
           ) : (
                <div className="w-full md:w-auto bg-red-50 text-red-700 px-4 py-2 rounded-lg text-xs font-bold border border-red-100 flex items-center gap-2">
                    <span>📢 UPDATES</span>
                    {category !== 'all' && <span>• {category.toUpperCase()}</span>}
                    <button onClick={()=>setCategory('all')} className="ml-auto underline opacity-60 hover:opacity-100">Clear</button>
                </div>
           )}

           {/* Search Input */}
           <div className="relative w-full md:w-64">
                <input 
                    type="text" 
                    placeholder="Search title..." 
                    value={search} 
                    onChange={(e) => handleSearch(e.target.value)} 
                    className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm font-medium focus:bg-white focus:ring-2 focus:ring-slate-900 outline-none transition-all" 
                />
                <svg className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
           </div>
      </div>

      {/* 5. LIST OF CARDS */}
      {loading ? (
         <div className="grid gap-3">
             {[1, 2, 3].map(i => <div key={i} className="h-20 bg-white rounded-lg border border-slate-100 animate-pulse"></div>)}
         </div>
      ) : items.length > 0 ? (
         <div className="grid gap-3">
            {items.map((item) => {
                const theme = getTheme(item.type);
                return (
                   <div key={item.id} className="group bg-white p-4 rounded-xl border border-slate-200 shadow-sm hover:border-slate-300 hover:shadow-md transition-all duration-200 flex items-center gap-4">
                       
                       {/* Icon (High Contrast) */}
                       <div className={`w-12 h-12 rounded-lg flex items-center justify-center text-xl shrink-0 ${theme.bg} ${theme.text} border ${theme.border}`}>
                           {theme.icon}
                       </div>
                       
                       {/* Text Content (Adjusted Sizes) */}
                       <div className="flex-1 min-w-0">
                           {/* Badge */}
                           <div className="flex items-center gap-2 mb-1">
                               <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200 truncate max-w-[150px]">
                                   {item.badgeTitle}
                               </span>
                               <span className="text-[10px] font-semibold text-slate-400">
                                   {new Date(item.created_at).toLocaleDateString()}
                               </span>
                           </div>

                           {/* Title (Text-base for better readability on all devices) */}
                           <h3 className="text-sm md:text-base font-bold text-slate-900 leading-tight group-hover:text-blue-700 transition-colors line-clamp-1">
                               {item.content_url ? (
                                   <a href={item.content_url} target="_blank" rel="noopener noreferrer">{item.title}</a>
                               ) : (
                                   <Link href={getLink(item)}>{item.title}</Link>
                               )}
                           </h3>
                       </div>

                       {/* Action Button (Desktop Only) */}
                       <div className="hidden sm:block">
                           {item.content_url ? (
                               <a href={item.content_url} target="_blank" rel="noopener noreferrer" className={`px-4 py-1.5 rounded-lg text-xs font-bold text-white shadow-sm hover:opacity-90 transition-opacity ${theme.btn}`}>
                                   {theme.label}
                               </a>
                           ) : (
                               <Link href={getLink(item)} className="px-4 py-1.5 bg-slate-100 text-slate-700 rounded-lg text-xs font-bold hover:bg-slate-200 transition-colors">
                                   Read
                               </Link>
                           )}
                       </div>

                       {/* Mobile Arrow (Replaces Button) */}
                       <div className="sm:hidden text-slate-300">
                           <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                       </div>
                   </div>
                );
            })}
         </div>
      ) : (
         <div className="text-center py-16 bg-white rounded-xl border border-dashed border-slate-300">
             <div className="text-3xl mb-2 opacity-30">📂</div>
             <p className="text-slate-900 font-bold text-sm">No materials found.</p>
         </div>
      )}

      {/* 6. PAGINATION */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-3 pt-4 border-t border-slate-100">
            <button disabled={page === 1} onClick={() => setPage(p => p - 1)} className="px-3 py-1.5 bg-white border border-slate-200 rounded-md text-xs font-bold text-slate-600 disabled:opacity-50">Prev</button>
            <span className="text-xs font-bold text-slate-400">Page {page} of {totalPages}</span>
            <button disabled={page === totalPages} onClick={() => setPage(p => p + 1)} className="px-3 py-1.5 bg-white border border-slate-200 rounded-md text-xs font-bold text-slate-600 disabled:opacity-50">Next</button>
        </div>
      )}
    </div>
  );
}