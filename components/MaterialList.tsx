"use client";

import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/lib/supabaseClient";
import { debounce } from "lodash";
import Link from "next/link";
import { 
  FileText, 
  PlayCircle, 
  HelpCircle, 
  Zap, 
  Search, 
  ChevronRight, 
  ChevronLeft, 
  Filter,
  Calendar,
  FileBox
} from "lucide-react";

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
          // Smart Label Logic
          const formatted = data.map((item: any) => {
              let badgeText = "General";
              
              if (['routine', 'syllabus', 'exam_result'].includes(item.type)) {
                  badgeText = item.type.replace('_', ' ').toUpperCase();
              } else {
                  if (item.subjects?.title) badgeText = item.subjects.title;
                  else if (item.groups?.title) badgeText = item.groups.title;
                  else if (item.segments?.title) badgeText = item.segments.title;
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

  // 3. MODERN THEME CONFIG
  // Returns Lucide Icons and high-contrast color sets
  const getTheme = (itemType: string) => {
     switch(itemType) {
         case 'pdf': 
            return { Icon: FileText, bg: 'bg-red-50', text: 'text-red-600', border: 'border-red-100', btn: 'bg-red-600', label: 'Download' };
         case 'video': 
            return { Icon: PlayCircle, bg: 'bg-blue-50', text: 'text-blue-600', border: 'border-blue-100', btn: 'bg-blue-600', label: 'Watch Class' };
         case 'question': 
            return { Icon: HelpCircle, bg: 'bg-amber-50', text: 'text-amber-600', border: 'border-amber-100', btn: 'bg-amber-600', label: 'View Solution' };
         case 'routine':
         case 'syllabus':
            return { Icon: Calendar, bg: 'bg-purple-50', text: 'text-purple-600', border: 'border-purple-100', btn: 'bg-purple-600', label: 'View Update' };
         default: 
            return { Icon: Zap, bg: 'bg-slate-50', text: 'text-slate-600', border: 'border-slate-200', btn: 'bg-slate-800', label: 'View' };
     }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      
      {/* 4. MODERN FILTER BAR */}
      <div className="bg-white p-2 md:p-3 rounded-2xl border border-slate-200 shadow-sm sticky top-[70px] z-20 md:static backdrop-blur-xl bg-white/90 supports-[backdrop-filter]:bg-white/60">
           <div className="flex flex-col md:flex-row gap-3 md:items-center justify-between">
                
                {/* Type Switcher */}
                {type !== 'update' ? (
                    <div className="flex bg-slate-100 p-1 rounded-xl w-full md:w-auto overflow-hidden">
                        {[
                            { id: 'pdf', label: 'Materials', icon: FileBox }, 
                            { id: 'question', label: 'Questions', icon: HelpCircle }
                        ].map((t) => (
                            <button 
                                key={t.id}
                                onClick={() => { setType(t.id); setPage(1); }} 
                                className={`
                                    flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-2.5 text-xs md:text-sm font-bold rounded-lg transition-all
                                    ${type === t.id 
                                        ? 'bg-white text-slate-900 shadow-sm scale-[1.02]' 
                                        : 'text-slate-500 hover:text-slate-700 hover:bg-slate-200/50'
                                    }
                                `}
                            >
                                <t.icon className="w-4 h-4" />
                                {t.label}
                            </button>
                        ))}
                    </div>
                ) : (
                    <div className="w-full md:w-auto bg-red-50 text-red-700 px-4 py-2.5 rounded-xl text-xs font-bold border border-red-100 flex items-center gap-2 shadow-sm">
                        <span className="flex items-center gap-1"><Zap className="w-3 h-3 fill-current"/> UPDATES CENTER</span>
                        {category !== 'all' && <span className="bg-white/50 px-2 py-0.5 rounded text-red-800 border border-red-200 ml-1">{category.toUpperCase()}</span>}
                        <button onClick={()=>setCategory('all')} className="ml-auto underline opacity-60 hover:opacity-100 text-[10px] uppercase">Clear Filter</button>
                    </div>
                )}

                {/* Search Input */}
                <div className="relative w-full md:w-72 group">
                    <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 group-focus-within:text-blue-500 transition-colors" />
                    <input 
                        type="text" 
                        placeholder="Search resources..." 
                        value={search} 
                        onChange={(e) => handleSearch(e.target.value)} 
                        className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all placeholder:text-slate-400" 
                    />
                </div>
           </div>
      </div>

      {/* 5. LIST OF CARDS */}
      {loading ? (
         <div className="grid gap-4">
             {[1, 2, 3, 4].map(i => (
                 <div key={i} className="h-24 bg-white rounded-2xl border border-slate-100 animate-pulse shadow-sm"></div>
             ))}
         </div>
      ) : items.length > 0 ? (
         <div className="grid gap-4">
            {items.map((item) => {
                const { Icon, ...theme } = getTheme(item.type);
                return (
                   <div 
                        key={item.id} 
                        className={`
                            group relative bg-white p-4 md:p-5 rounded-2xl border border-slate-200 
                            shadow-[0_2px_8px_rgba(0,0,0,0.04)] hover:shadow-[0_8px_24px_rgba(0,0,0,0.08)] 
                            hover:border-blue-300 transition-all duration-300 transform hover:-translate-y-0.5
                            flex items-start md:items-center gap-4 md:gap-6
                        `}
                   >
                       {/* Modern Icon Container */}
                       <div className={`
                            w-12 h-12 md:w-14 md:h-14 rounded-2xl flex items-center justify-center shrink-0 
                            ${theme.bg} ${theme.text} border ${theme.border} 
                            shadow-sm group-hover:scale-110 transition-transform duration-300
                       `}>
                           <Icon className="w-6 h-6 md:w-7 md:h-7" strokeWidth={2} />
                       </div>
                       
                       {/* Text Content - OPTIMIZED FOR MOBILE WRAPPING */}
                       <div className="flex-1 min-w-0 flex flex-col gap-1.5">
                           
                           {/* Metadata Row */}
                           <div className="flex items-center flex-wrap gap-2">
                               {/* Gradient Badge */}
                               <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide bg-gradient-to-r from-blue-700 to-slate-900 text-white shadow-sm">
                                   {item.badgeTitle}
                               </span>
                               
                               <span className="text-[10px] font-bold text-slate-400 flex items-center gap-1">
                                    <span className="w-1 h-1 rounded-full bg-slate-300"></span>
                                    {new Date(item.created_at).toLocaleDateString()}
                               </span>
                           </div>

                           {/* Title: Removed truncate, added leading-snug for multi-line readability */}
                           <h3 className="text-base md:text-lg font-bold text-slate-800 leading-snug break-words group-hover:text-blue-600 transition-colors pr-2">
                               {item.content_url ? (
                                   <a href={item.content_url} target="_blank" rel="noopener noreferrer" className="focus:outline-none">
                                       <span className="absolute inset-0 sm:hidden"></span> {/* Mobile Full Click */}
                                       {item.title}
                                   </a>
                               ) : (
                                   <Link href={getLink(item)} className="focus:outline-none">
                                       <span className="absolute inset-0 sm:hidden"></span> {/* Mobile Full Click */}
                                       {item.title}
                                   </Link>
                               )}
                           </h3>
                       </div>

                       {/* Action Button (Desktop) */}
                       <div className="hidden sm:block shrink-0">
                           {item.content_url ? (
                               <a href={item.content_url} target="_blank" rel="noopener noreferrer" className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold text-white shadow-md hover:shadow-lg hover:brightness-110 transition-all ${theme.btn}`}>
                                   {theme.label} <ChevronRight className="w-3 h-3" />
                               </a>
                           ) : (
                               <Link href={getLink(item)} className="inline-flex items-center gap-2 px-5 py-2.5 bg-slate-900 text-white rounded-xl text-xs font-bold shadow-md hover:bg-slate-800 hover:shadow-lg transition-all">
                                   Read Now <ChevronRight className="w-3 h-3" />
                               </Link>
                           )}
                       </div>

                       {/* Mobile Arrow Indicator */}
                       <div className="sm:hidden self-center text-slate-300 group-hover:text-blue-500 transition-colors pl-2">
                           <ChevronRight className="w-5 h-5" />
                       </div>
                   </div>
                );
            })}
         </div>
      ) : (
         <div className="flex flex-col items-center justify-center py-20 bg-white rounded-2xl border border-dashed border-slate-200">
             <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4">
                <Search className="w-8 h-8 text-slate-300" />
             </div>
             <p className="text-slate-900 font-bold text-base">No results found</p>
             <p className="text-slate-500 text-sm mt-1">Try adjusting your filters or search terms.</p>
             <button onClick={() => {setSearch(''); setType('pdf'); setCategory('all');}} className="mt-4 text-blue-600 text-xs font-bold hover:underline">Reset Filters</button>
         </div>
      )}

      {/* 6. MODERN PAGINATION */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-2 pt-6">
            <button 
                disabled={page === 1} 
                onClick={() => setPage(p => p - 1)} 
                className="w-10 h-10 flex items-center justify-center bg-white border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50 hover:border-slate-300 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
                <ChevronLeft className="w-5 h-5" />
            </button>
            
            <div className="bg-white border border-slate-200 px-4 h-10 flex items-center justify-center rounded-lg text-xs font-bold text-slate-600 shadow-sm">
                Page {page} <span className="text-slate-400 mx-1">/</span> {totalPages}
            </div>
            
            <button 
                disabled={page === totalPages} 
                onClick={() => setPage(p => p + 1)} 
                className="w-10 h-10 flex items-center justify-center bg-white border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50 hover:border-slate-300 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
                <ChevronRight className="w-5 h-5" />
            </button>
        </div>
      )}
    </div>
  );
}