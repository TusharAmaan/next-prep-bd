"use client";

import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/lib/supabaseClient";
import { debounce } from "lodash";
import Link from "next/link";

type MaterialListProps = {
  segmentId: number;
  initialType: string; // 'pdf' (includes video) or 'question'
};

export default function MaterialList({ segmentId, initialType }: MaterialListProps) {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalCount, setTotalCount] = useState(0);
  
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [type, setType] = useState(initialType);
  
  // Pagination & View State
  const [page, setPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10); // Default to 10

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

      // Type Logic
      if (type === 'pdf') {
          query = query.in('type', ['pdf', 'video']);
      } else {
          query = query.eq('type', type);
      }

      if (debouncedSearch) query = query.ilike("title", `%${debouncedSearch}%`);

      // Dynamic Range based on itemsPerPage
      const from = (page - 1) * itemsPerPage;
      const to = from + itemsPerPage - 1;
      const { data, count, error } = await query.range(from, to);

      if (error) throw error;
      
      if (data) {
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
  }, [segmentId, type, debouncedSearch, page, itemsPerPage]);

  useEffect(() => {
    fetchData();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [fetchData]);

  const handleSearch = (val: string) => {
    setSearch(val);
    const handler = debounce(() => { setDebouncedSearch(val); setPage(1); }, 500);
    handler();
  };

  const handleItemsPerPageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
      setItemsPerPage(Number(e.target.value));
      setPage(1); // Reset to page 1
  };

  const totalPages = Math.ceil(totalCount / itemsPerPage);

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      
      {/* --- HEADER: TABS, SEARCH & VIEW SELECTOR --- */}
      <div className="flex flex-col gap-4">
          
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row justify-between items-center gap-4">
            {/* Toggle Buttons */}
            <div className="flex bg-slate-100 p-1 rounded-xl w-full md:w-auto">
                <button 
                    onClick={() => { setType('pdf'); setPage(1); }}
                    className={`flex-1 md:flex-none px-6 py-2.5 text-xs font-extrabold rounded-lg transition-all ${type === 'pdf' ? 'bg-white shadow-sm text-blue-600' : 'text-slate-500 hover:text-slate-700'}`}
                >
                    📚 Study Materials
                </button>
                <button 
                    onClick={() => { setType('question'); setPage(1); }}
                    className={`flex-1 md:flex-none px-6 py-2.5 text-xs font-extrabold rounded-lg transition-all ${type === 'question' ? 'bg-white shadow-sm text-yellow-600' : 'text-slate-500 hover:text-slate-700'}`}
                >
                    ❓ Previous Questions
                </button>
            </div>

            {/* Search Bar */}
            <div className="relative w-full md:w-72">
                <input 
                    type="text" 
                    placeholder={`Search ${type === 'pdf' ? 'materials' : 'questions'}...`}
                    value={search}
                    onChange={(e) => handleSearch(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                />
                <svg className="w-5 h-5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
            </div>
          </div>

          {/* View Selector & Count */}
          <div className="flex justify-between items-center bg-slate-50 px-4 py-2 rounded-xl border border-slate-100">
             <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                Found {totalCount} items
             </span>
             <div className="flex items-center gap-2">
                 <label className="text-xs font-bold text-slate-500 hidden sm:block">Show:</label>
                 <select 
                    value={itemsPerPage}
                    onChange={handleItemsPerPageChange}
                    className="bg-white border border-slate-200 text-xs font-bold text-slate-700 py-1.5 px-3 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
                 >
                     <option value={10}>10</option>
                     <option value={20}>20</option>
                     <option value={50}>50</option>
                     <option value={100}>100</option>
                 </select>
             </div>
          </div>
      </div>

      {/* --- CONTENT LIST --- */}
      {loading ? (
         <div className="space-y-4">
            {[1,2,3,4].map(i => <div key={i} className="h-24 bg-white border border-slate-100 rounded-2xl animate-pulse"></div>)}
         </div>
      ) : items.length > 0 ? (
         <div className="space-y-3">
            {items.map((item) => (
               <div key={item.id} className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-all group flex items-start gap-5">
                   
                   <div className={`w-14 h-14 rounded-xl flex items-center justify-center text-2xl shrink-0 ${item.type === 'question' ? 'bg-yellow-50 text-yellow-600' : 'bg-blue-50 text-blue-600'}`}>
                       {item.type === 'pdf' ? '📄' : item.type === 'video' ? '▶' : '❓'}
                   </div>
                   
                   <div className="flex-1 min-w-0 py-1">
                       <h3 className="font-bold text-slate-800 text-lg mb-1.5 truncate group-hover:text-blue-600 transition-colors">
                           {item.content_url ? (
                               <a href={item.content_url} target="_blank" rel="noopener noreferrer">{item.title}</a>
                           ) : (
                               <Link href={`/${item.type}/${item.id}`}>{item.title}</Link>
                           )}
                       </h3>
                       <div className="flex items-center gap-3 text-xs font-bold text-slate-400 uppercase tracking-wide">
                           <span className="bg-slate-100 px-2 py-1 rounded text-slate-500">{item.subjectTitle}</span>
                           <span>•</span>
                           <span>{new Date(item.created_at).toLocaleDateString()}</span>
                       </div>
                   </div>

                   <div className="hidden sm:block self-center">
                       {item.content_url ? (
                           <a href={item.content_url} target="_blank" rel="noopener noreferrer" className="px-5 py-2.5 bg-slate-900 text-white rounded-xl text-xs font-bold hover:bg-blue-600 transition shadow-lg">
                               {item.type === 'video' ? 'Watch Now' : 'Download'}
                           </a>
                       ) : (
                           <Link href={`/${item.type}/${item.id}`} className="px-5 py-2.5 bg-slate-100 text-slate-600 rounded-xl text-xs font-bold hover:bg-slate-200 transition">
                               View Solution
                           </Link>
                       )}
                   </div>
               </div>
            ))}
         </div>
      ) : (
         <div className="text-center py-32 bg-slate-50 rounded-3xl border border-dashed border-slate-200">
             <div className="text-4xl mb-4 opacity-30">📂</div>
             <h3 className="text-xl font-bold text-slate-900">No items found</h3>
             <p className="text-slate-500 text-sm mt-1">Try changing the filter or search terms.</p>
         </div>
      )}

      {/* --- PAGINATION --- */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-4 pt-8 border-t border-slate-200">
            <button disabled={page===1} onClick={()=>setPage(p=>Math.max(1, p-1))} className="px-5 py-2 border bg-white rounded-xl text-sm font-bold text-slate-600 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed">← Previous</button>
            <span className="text-sm font-bold text-slate-400">Page {page} of {totalPages}</span>
            <button disabled={page===totalPages} onClick={()=>setPage(p=>Math.min(totalPages, p+1))} className="px-5 py-2 border bg-white rounded-xl text-sm font-bold text-slate-600 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed">Next →</button>
        </div>
      )}
    </div>
  );
}