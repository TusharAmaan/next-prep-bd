'use client';

import { useState, useEffect, useCallback, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Search, Loader2, Sparkles, ChevronRight, ArrowLeft } from "lucide-react";
import Link from "next/link";
import SearchSidebar from "@/components/search/SearchSidebar";
import SearchResultCard, { SearchResult } from "@/components/search/SearchResultCard";

function SearchContent() {
  const searchParams = useSearchParams();
  
  const initialQuery = searchParams.get("q") || "";
  const initialType = searchParams.get("type") || "all";
  const initialPage = parseInt(searchParams.get("page") || "1");

  const [q, setQ] = useState(initialQuery);
  const [type, setType] = useState(initialType);
  const [page, setPage] = useState(initialPage);
  
  const [results, setResults] = useState<SearchResult[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);

  const fetchResults = useCallback(async (query: string, filterType: string, pageNum: number) => {
    if (!query) {
      setResults([]);
      setTotal(0);
      return;
    }

    setLoading(true);
    setError(false);
    try {
      const resp = await fetch(`/api/search/unified?q=${encodeURIComponent(query)}&type=${filterType}&page=${pageNum}`);
      if (!resp.ok) throw new Error("Search failed");
      const data = await resp.json();
      setResults(data.results || []);
      setTotal(data.total || 0);
    } catch (err) {
      console.error(err);
      setError(true);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const params = new URLSearchParams();
    if (q) params.set("q", q);
    if (type !== "all") params.set("type", type);
    if (page > 1) params.set("page", page.toString());
    
    const newUrl = `${window.location.pathname}?${params.toString()}`;
    window.history.pushState(null, '', newUrl);

    fetchResults(q, type, page);
  }, [q, type, page, fetchResults]);

  const handleTypeChange = (newType: string) => {
    setType(newType);
    setPage(1); 
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);
    const query = formData.get("q") as string;
    setQ(query);
    setPage(1);
  };

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950 font-sans transition-colors duration-500">
        <div className="bg-slate-900 border-b border-white/5 pt-32 md:pt-44 pb-20 md:pb-32 px-4 md:px-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-indigo-600/10 rounded-full blur-[120px] pointer-events-none -mr-40 -mt-20"></div>
          <div className="max-w-7xl mx-auto relative z-10">
              <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8 md:gap-12">
                  <div className="max-w-3xl">
                    <div className="flex items-center gap-2 md:gap-3 text-[9px] md:text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-6 md:mb-10 bg-indigo-500/10 border border-indigo-500/20 px-4 md:px-6 py-2 rounded-full w-fit">
                        <Sparkles className="w-3.5 h-3.5 md:w-4 md:h-4" /> Comprehensive Index
                    </div>
                    <h1 className="text-4xl sm:text-5xl md:text-9xl font-black uppercase tracking-tighter leading-[1] md:leading-[0.8] mb-6 md:mb-10 text-white">
                       Unified <br className="hidden md:block"/>
                       <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-violet-400 to-cyan-400">Search</span>
                    </h1>
                    <p className="text-base md:text-xl text-slate-400 font-medium leading-relaxed max-w-xl opacity-80">
                       {q ? (
                         <>Mapping <span className="text-white font-black">{total}</span> intelligence records for query <span className="text-indigo-400 font-black italic">"{q}"</span></>
                       ) : (
                         "Access our entire academic ecosystem including courses, research papers, and curriculum archives."
                       )}
                    </p>
                  </div>

                  <form onSubmit={handleSearchSubmit} className="relative w-full lg:w-[500px] group">
                    <div className="absolute inset-0 bg-indigo-600/20 blur-3xl group-focus-within:bg-indigo-600/40 transition-all rounded-[3rem]"></div>
                    <div className="relative">
                        <Search className="absolute left-5 md:left-7 top-1/2 -translate-y-1/2 w-5 h-5 md:w-7 md:h-7 text-slate-400 group-focus-within:text-indigo-400 transition-all" />
                        <input 
                          name="q"
                          defaultValue={q}
                          className="w-full pl-12 md:pl-16 pr-16 md:pr-20 py-5 md:py-7 rounded-2xl md:rounded-[2.5rem] border border-white/10 bg-white/5 backdrop-blur-3xl outline-none focus:border-indigo-500 focus:bg-white/10 transition-all font-black text-white text-base md:text-lg placeholder:text-slate-500 tracking-tight" 
                          placeholder="Execute search protocol..."
                        />
                        <button type="submit" className="absolute right-2 md:right-4 top-1/2 -translate-y-1/2 bg-indigo-600 hover:bg-indigo-500 text-white w-10 md:w-14 h-10 md:h-14 rounded-xl md:rounded-2xl flex items-center justify-center transition-all shadow-2xl shadow-indigo-600/40 active:scale-95">
                            <ChevronRight className="w-5 h-5 md:w-6 md:h-6" />
                        </button>
                    </div>
                  </form>
              </div>
          </div>
       </div>

       <div className="max-w-7xl mx-auto px-4 md:px-6 py-12 md:py-24">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 md:gap-20">
             
             {/* Sidebar Filters */}
             <div className="lg:col-span-3">
                <SearchSidebar 
                  activeType={type} 
                  onTypeChange={handleTypeChange}
                  totalResults={total}
                />
             </div>

             {/* Results Grid */}
             <div className="lg:col-span-9">
                {loading ? (
                  <div className="flex flex-col items-center justify-center py-48 space-y-10">
                     <div className="relative">
                        <div className="w-24 h-24 border-4 border-indigo-600/10 border-t-indigo-600 rounded-full animate-spin"></div>
                        <div className="absolute inset-0 flex items-center justify-center">
                            <Search className="w-8 h-8 text-indigo-600 animate-pulse" />
                        </div>
                     </div>
                     <div className="flex flex-col items-center gap-3">
                        <p className="text-slate-900 dark:text-white text-[11px] font-black uppercase tracking-[0.4em] animate-pulse">Synchronizing Records</p>
                        <span className="text-slate-400 dark:text-slate-500 text-[9px] font-black uppercase tracking-widest opacity-60">Optimizing intelligence nodes...</span>
                     </div>
                  </div>
                ) : results.length > 0 ? (
                  <div className="space-y-12 md:space-y-20">
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-10 animate-in fade-in slide-in-from-bottom-12 duration-1000">
                        {results.map((item) => (
                           <SearchResultCard key={`${item.type}-${item.id}`} item={item} />
                        ))}
                     </div>

                     {/* Pagination */}
                     {total > 10 && (
                        <div className="flex justify-center items-center gap-6 pt-16 border-t border-slate-100 dark:border-slate-800/50">
                           {Array.from({ length: Math.ceil(total / 10) }, (_, i) => i + 1).map((p) => (
                              <button
                                key={p}
                                onClick={() => {
                                    setPage(p);
                                    window.scrollTo({ top: 0, behavior: 'smooth' });
                                }}
                                className={`w-16 h-16 rounded-2xl flex items-center justify-center font-black text-xs transition-all duration-500 ${
                                  p === page
                                    ? "bg-slate-900 dark:bg-indigo-600 text-white shadow-2xl shadow-indigo-600/30 scale-110"
                                    : "bg-white dark:bg-slate-900 text-slate-400 dark:text-slate-500 border border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-indigo-600 dark:hover:text-indigo-400"
                                }`}
                              >
                                {p.toString().padStart(2, '0')}
                              </button>
                           ))}
                        </div>
                     )}
                  </div>
                ) : (
                  <div className="bg-white dark:bg-slate-900/50 rounded-[2rem] md:rounded-[4rem] p-12 md:p-32 text-center border-2 border-dashed border-slate-100 dark:border-slate-800 shadow-inner group transition-colors">
                     <div className="w-20 md:w-32 h-20 md:h-32 bg-slate-50 dark:bg-slate-800 text-slate-200 dark:text-slate-700 rounded-3xl md:rounded-[2.5rem] flex items-center justify-center mx-auto mb-8 md:mb-12 shadow-inner border border-slate-100 dark:border-slate-700 transition-transform group-hover:rotate-12 duration-700">
                        <Search className="w-10 h-10 md:w-14 md:h-14" />
                     </div>
                     <h3 className="text-3xl md:text-5xl font-black text-slate-900 dark:text-white mb-4 md:mb-6 uppercase tracking-tighter leading-none">Intelligence <br/>Departure</h3>
                     <p className="text-slate-500 dark:text-slate-400 font-medium mb-8 md:mb-12 max-w-sm mx-auto text-base md:text-lg leading-relaxed">The requested protocol yielded no matches in our current archives. Reconfigure keywords.</p>
                     
                     <div className="flex flex-col sm:flex-row justify-center gap-6">
                        <button 
                           onClick={() => { setQ(""); setType("all"); }}
                           className="px-12 py-5 bg-white dark:bg-slate-800 text-slate-900 dark:text-white border border-slate-100 dark:border-slate-700 rounded-2xl font-black uppercase tracking-[0.2em] hover:bg-slate-900 hover:text-white dark:hover:bg-white dark:hover:text-slate-900 transition-all text-[10px] shadow-sm"
                        >
                           Reset Engine
                        </button>
                        <Link href="/" className="px-12 py-5 bg-indigo-600 text-white rounded-2xl font-black uppercase tracking-[0.2em] shadow-3xl shadow-indigo-600/30 hover:bg-indigo-500 hover:-translate-y-1 transition-all text-[10px] flex items-center justify-center gap-4">
                           <ArrowLeft className="w-4 h-4"/> Back to Hub
                        </Link>
                     </div>
                  </div>
                )}

                {error && (
                  <div className="p-16 bg-rose-50 dark:bg-rose-900/10 text-rose-600 dark:text-rose-400 rounded-[3rem] border-2 border-dashed border-rose-100 dark:border-rose-900/30 text-center font-black uppercase tracking-[0.3em] text-[10px] animate-pulse">
                    Database Connection Interrupted. Re-establish protocol connection.
                  </div>
                )}
             </div>
          </div>
       </div>
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-white dark:bg-slate-950 transition-colors">
        <div className="flex flex-col items-center gap-8">
            <Loader2 className="w-16 h-16 animate-spin text-indigo-600" />
            <p className="text-[11px] font-black uppercase tracking-[0.4em] text-slate-400 animate-pulse">Initializing Discovery Engine...</p>
        </div>
      </div>
    }>
      <SearchContent />
    </Suspense>
  );
}