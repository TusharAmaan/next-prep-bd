"use client";

import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/lib/supabaseClient";
import { debounce } from "lodash";

const ITEMS_PER_PAGE = 10;

type MaterialListProps = {
  segmentId: number;
  initialType: string; // 'pdf', 'video', 'question'
};

export default function MaterialList({ segmentId, initialType }: MaterialListProps) {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalCount, setTotalCount] = useState(0);
  
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [type, setType] = useState(initialType);
  const [page, setPage] = useState(1);

  // --- FETCH DATA ---
  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      let query = supabase
        .from("resources")
        .select(`
          id, title, type, created_at, content_url,
          subjects ( title )
        `, { count: "exact" })
        .eq("segment_id", segmentId)
        .order("created_at", { ascending: false });

      // Type Filter
      if (type === 'pdf') query = query.in('type', ['pdf', 'video']); // Group materials together
      else query = query.eq('type', type);

      // Search
      if (debouncedSearch) query = query.ilike("title", `%${debouncedSearch}%`);

      // Pagination
      const from = (page - 1) * ITEMS_PER_PAGE;
      const to = from + ITEMS_PER_PAGE - 1;
      const { data, count, error } = await query.range(from, to);

      if (error) throw error;
      
      if (data) {
          // Format subjects array to string title safely
          const formatted = data.map((item: any) => ({
              ...item,
              subjectTitle: Array.isArray(item.subjects) ? item.subjects[0]?.title : "General"
          }));
          setItems(formatted);
      }
      if (count !== null) setTotalCount(count);

    } catch (err) {
      console.error("Fetch error:", err);
    } finally {
      setLoading(false);
    }
  }, [segmentId, type, debouncedSearch, page]);

  // --- EFFECTS ---
  useEffect(() => {
    fetchData();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [fetchData]);

  // Search Debounce
  const handleSearch = (val: string) => {
    setSearch(val);
    const handler = debounce(() => { setDebouncedSearch(val); setPage(1); }, 500);
    handler();
  };

  const totalPages = Math.ceil(totalCount / ITEMS_PER_PAGE);

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      
      {/* HEADER CONTROLS */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row justify-between items-center gap-4">
        
        {/* Type Toggle */}
        <div className="flex bg-slate-100 p-1 rounded-lg">
            <button 
                onClick={() => { setType('pdf'); setPage(1); }}
                className={`px-4 py-2 text-xs font-bold rounded-md transition-all ${type === 'pdf' ? 'bg-white shadow text-blue-600' : 'text-slate-500 hover:text-slate-700'}`}
            >
                Study Materials
            </button>
            <button 
                onClick={() => { setType('question'); setPage(1); }}
                className={`px-4 py-2 text-xs font-bold rounded-md transition-all ${type === 'question' ? 'bg-white shadow text-yellow-600' : 'text-slate-500 hover:text-slate-700'}`}
            >
                Past Questions
            </button>
        </div>

        {/* Search */}
        <div className="relative w-full md:w-64">
            <input 
                type="text" 
                placeholder="Search..." 
                value={search}
                onChange={(e) => handleSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
            />
            <svg className="w-4 h-4 text-slate-400 absolute left-3 top-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
        </div>
      </div>

      {/* LIST CONTENT */}
      {loading ? (
         <div className="space-y-4">
            {[1,2,3].map(i => <div key={i} className="h-24 bg-slate-100 rounded-xl animate-pulse"></div>)}
         </div>
      ) : items.length > 0 ? (
         <div className="space-y-3">
            {items.map((item) => (
               <div key={item.id} className="bg-white p-5 rounded-xl border border-slate-100 shadow-sm hover:shadow-md transition-all group flex items-start gap-4">
                   <div className={`w-12 h-12 rounded-lg flex items-center justify-center text-2xl shrink-0 ${item.type === 'question' ? 'bg-yellow-50 text-yellow-600' : 'bg-blue-50 text-blue-600'}`}>
                       {item.type === 'pdf' ? '📄' : item.type === 'video' ? '▶' : '❓'}
                   </div>
                   <div className="flex-1 min-w-0">
                       <h3 className="font-bold text-slate-800 text-base mb-1 truncate group-hover:text-blue-600 transition-colors">
                           {item.content_url ? (
                               <a href={item.content_url} target="_blank" rel="noopener noreferrer">{item.title}</a>
                           ) : (
                               // For questions/blogs without direct link, link to internal page
                               <a href={`/${item.type}/${item.id}`}>{item.title}</a>
                           )}
                       </h3>
                       <div className="flex items-center gap-3 text-xs font-bold text-slate-400">
                           <span className="uppercase bg-slate-50 px-2 py-0.5 rounded border border-slate-100">{item.subjectTitle}</span>
                           <span>•</span>
                           <span>{new Date(item.created_at).toLocaleDateString()}</span>
                       </div>
                   </div>
                   {item.content_url && (
                       <a href={item.content_url} target="_blank" rel="noopener noreferrer" className="px-4 py-2 bg-slate-900 text-white rounded-lg text-xs font-bold hover:bg-blue-600 transition whitespace-nowrap hidden sm:block">
                           {item.type === 'video' ? 'Watch' : 'Download'}
                       </a>
                   )}
               </div>
            ))}
         </div>
      ) : (
         <div className="text-center py-20 bg-slate-50 rounded-xl border border-dashed">
             <p className="text-slate-400 font-bold">No items found.</p>
         </div>
      )}

      {/* PAGINATION */}
      {totalPages > 1 && (
        <div className="flex justify-center gap-4 pt-4">
            <button disabled={page===1} onClick={()=>setPage(p=>p-1)} className="px-4 py-2 border rounded-lg text-sm font-bold disabled:opacity-50">Prev</button>
            <span className="px-4 py-2 bg-slate-900 text-white rounded-lg text-sm font-bold">{page} of {totalPages}</span>
            <button disabled={page===totalPages} onClick={()=>setPage(p=>p+1)} className="px-4 py-2 border rounded-lg text-sm font-bold disabled:opacity-50">Next</button>
        </div>
      )}
    </div>
  );
}