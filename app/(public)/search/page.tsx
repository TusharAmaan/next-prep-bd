"use client";

import { useState, useEffect, useCallback, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Search, Loader2, BookOpen, Newspaper, GraduationCap, Book, AlertCircle, HelpCircle, ArrowLeft } from "lucide-react";
import Link from "next/link";
import SearchSidebar from "@/components/search/SearchSidebar";
import SearchResultCard, { SearchResult } from "@/components/search/SearchResultCard";

function SearchContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  
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

  // Update URL and Fetch Data
  useEffect(() => {
    const params = new URLSearchParams();
    if (q) params.set("q", q);
    if (type !== "all") params.set("type", type);
    if (page > 1) params.set("page", page.toString());
    
    // Use window.history to update URL without triggering a full page reload or scroll reset
    const newUrl = `${window.location.pathname}?${params.toString()}`;
    window.history.pushState(null, '', newUrl);

    fetchResults(q, type, page);
  }, [q, type, page, fetchResults]);

  const handleTypeChange = (newType: string) => {
    setType(newType);
    setPage(1); // Reset page on type change
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);
    const query = formData.get("q") as string;
    setQ(query);
    setPage(1);
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans pb-20 pt-32">
       <div className="max-w-7xl mx-auto px-6">
          
          {/* Search Header & Search Bar */}
          <div className="mb-16 flex flex-col md:flex-row md:items-end justify-between gap-8">
             <div className="max-w-xl">
                 <h1 className="text-4xl md:text-5xl font-black text-slate-900 mb-4 tracking-tighter leading-tight">
                    Discovery <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-violet-600">Engine</span>
                 </h1>
                 <p className="text-slate-500 font-medium text-lg">
                    {q ? (
                      <>Searching across <span className="text-indigo-600 font-bold">{total}</span> matching records for <span className="text-slate-900 font-black italic">"{q}"</span></>
                    ) : (
                      "Start by searching for courses, news, blogs or question banks."
                    )}
                 </p>
             </div>

             <form onSubmit={handleSearchSubmit} className="relative w-full md:w-96 group">
                <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-indigo-600 transition-colors" />
                <input 
                  name="q"
                  defaultValue={q}
                  className="w-full pl-14 pr-6 py-4 rounded-2xl border border-slate-200 bg-white shadow-xl shadow-slate-200/50 outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all font-bold text-slate-900 text-sm" 
                  placeholder="What are you looking for?"
                />
             </form>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
             
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
                  <div className="flex flex-col items-center justify-center py-32 space-y-4">
                     <div className="relative">
                        <Loader2 className="w-12 h-12 text-indigo-600 animate-spin" />
                        <div className="absolute inset-0 blur-xl bg-indigo-500/20 animate-pulse"></div>
                     </div>
                     <p className="text-slate-400 text-xs font-black uppercase tracking-[0.2em] animate-pulse">Scanning Platform Database...</p>
                  </div>
                ) : results.length > 0 ? (
                  <div className="space-y-10">
                     
                     {/* GROUPED RESULTS (If All is selected) */}
                     {type === 'all' ? (
                       <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in fade-in slide-in-from-bottom-8 duration-700">
                          {results.map((item) => (
                             <SearchResultCard key={`${item.type}-${item.id}`} item={item} />
                          ))}
                       </div>
                     ) : (
                       <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in fade-in slide-in-from-bottom-8 duration-700">
                          {results.map((item) => (
                             <SearchResultCard key={`${item.type}-${item.id}`} item={item} />
                          ))}
                       </div>
                     )}

                     {/* Pagination */}
                     {total > 10 && (
                        <div className="flex justify-center gap-2 pt-10">
                           {Array.from({ length: Math.ceil(total / 10) }, (_, i) => i + 1).map((p) => (
                              <button
                                key={p}
                                onClick={() => setPage(p)}
                                className={`w-12 h-12 rounded-2xl flex items-center justify-center font-black text-sm transition-all ${
                                  p === page
                                    ? "bg-indigo-600 text-white shadow-xl shadow-indigo-100 scale-110"
                                    : "bg-white text-slate-500 border border-slate-100 hover:bg-slate-50 hover:text-indigo-600"
                                }`}
                              >
                                {p}
                              </button>
                           ))}
                        </div>
                     )}
                  </div>
                ) : (
                  <div className="bg-white rounded-[3rem] p-20 text-center border border-slate-100 shadow-sm animate-in zoom-in-95 duration-500">
                     <div className="w-24 h-24 bg-slate-50 text-slate-300 rounded-[2rem] flex items-center justify-center mx-auto mb-8 transform -rotate-12">
                        <Search className="w-10 h-10" />
                     </div>
                     <h3 className="text-3xl font-black text-slate-900 mb-3 tracking-tight">No results matched.</h3>
                     <p className="text-slate-500 font-medium mb-10 max-w-sm mx-auto">We couldn't find anything matching your query. Maybe try a generic keyword like "SSC" or "Admission".</p>
                     
                     <div className="flex flex-wrap justify-center gap-4">
                        <button 
                           onClick={() => { setQ(""); setType("all"); }}
                           className="px-8 py-4 bg-slate-100 text-slate-600 rounded-2xl font-black uppercase tracking-widest hover:bg-slate-200 transition-all text-xs"
                        >
                           Clear Search
                        </button>
                        <Link href="/" className="px-8 py-4 bg-indigo-600 text-white rounded-2xl font-black uppercase tracking-widest shadow-xl shadow-indigo-200 hover:bg-indigo-700 transition-all text-xs flex items-center gap-2">
                           <ArrowLeft className="w-4 h-4"/> Back to Academy
                        </Link>
                     </div>
                  </div>
                )}

                {error && (
                  <div className="p-8 bg-rose-50 text-rose-600 rounded-3xl border border-rose-100 text-center font-bold">
                    An error occurred while connecting to the engine. Please try again.
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
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <Loader2 className="w-10 h-10 animate-spin text-indigo-600" />
      </div>
    }>
      <SearchContent />
    </Suspense>
  );
}