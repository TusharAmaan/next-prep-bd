"use client";

import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/lib/supabaseClient";
import Link from "next/link";
import Image from "next/image";
import { debounce } from "lodash";

const ITEMS_PER_PAGE = 15;

type BlogListProps = {
  initialBlogs: any[];
  initialCount: number;
  segments: string[];
};

export default function BlogList({ initialBlogs, initialCount, segments }: BlogListProps) {
  // --- STATE ---
  const [blogs, setBlogs] = useState(initialBlogs);
  const [loading, setLoading] = useState(false);
  const [totalCount, setTotalCount] = useState(initialCount);
  
  // Filter State
  const [search, setSearch] = useState(""); // Immediate state for Input UI
  const [debouncedSearch, setDebouncedSearch] = useState(""); // Delayed state for API
  const [selectedSegment, setSelectedSegment] = useState("All");
  const [page, setPage] = useState(1);

  // --- 1. STABLE FETCH FUNCTION ---
  // Wrapped in useCallback so it doesn't get recreated on every render
  const fetchData = useCallback(async (pageNum: number, searchTerm: string, segment: string) => {
    setLoading(true);
    
    // Start Query
    let query = supabase
      .from("resources")
      .select(`
        id, title, content_body, created_at, content_url, type, seo_description,
        segment_id,
        subjects!inner (
          groups!inner (
            segments!inner ( id, title )
          )
        )
      `, { count: "exact" })
      .eq("type", "blog")
      .order("created_at", { ascending: false });

    // Search
    if (searchTerm) query = query.ilike("title", `%${searchTerm}%`);

    // Segment Filter
    if (segment !== "All") {
      query = query.eq("subjects.groups.segments.title", segment);
    }

    // Pagination
    const from = (pageNum - 1) * ITEMS_PER_PAGE;
    const to = from + ITEMS_PER_PAGE - 1;

    const { data, count } = await query.range(from, to);

    if (data) {
       const formatted = data.map((item: any) => ({
         ...item,
         segmentTitle: item.subjects?.groups?.segments?.title || "General"
       }));
       setBlogs(formatted);
    }
    if (count !== null) setTotalCount(count);
    
    setLoading(false);
  }, []); // Dependencies are empty as Supabase client is stable


  // --- 2. HANDLE SEARCH DEBOUNCE ---
  // This updates 'debouncedSearch' 500ms AFTER you stop typing
  const handleSearchUpdate = useCallback(
    debounce((value: string) => {
      setDebouncedSearch(value);
      setPage(1); // Reset to page 1 when search actually executes
    }, 500),
    []
  );

  const onSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setSearch(val); // Update Input UI instantly
    handleSearchUpdate(val); // Queue the API update
  };


  // --- 3. THE MAIN EFFECT ---
  // Triggers ONLY when: Page changes, Segment changes, or the Debounced Search settles.
  useEffect(() => {
    // Skip initial load fetch (Server already did it)
    if (page === 1 && debouncedSearch === "" && selectedSegment === "All" && blogs === initialBlogs) return;

    // This runs IMMEDIATELY for pagination/segments, but waits for search
    fetchData(page, debouncedSearch, selectedSegment);
    
  }, [page, selectedSegment, debouncedSearch, fetchData]); // Removed 'blogs' dependency to avoid loops


  // --- HANDLERS ---
  const handleSegmentChange = (seg: string) => {
    setSelectedSegment(seg);
    setPage(1);
  };

  const totalPages = Math.ceil(totalCount / ITEMS_PER_PAGE);

  return (
    <div>
      
      {/* --- CONTROLS SECTION --- */}
      <div className="mb-12 space-y-6">
        {/* Search */}
        <div className="max-w-xl mx-auto relative group">
            <input 
                type="text" 
                placeholder={`Search ${selectedSegment === 'All' ? '' : selectedSegment} blogs...`} 
                className="w-full bg-white border border-slate-200 text-slate-900 text-sm rounded-full pl-6 pr-12 py-4 shadow-sm outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                value={search} // Bind to immediate state
                onChange={onSearchChange} // Use the new handler
            />
            <div className="absolute right-3 top-1/2 -translate-y-1/2 bg-slate-100 p-2 rounded-full text-slate-400">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
            </div>
        </div>

        {/* Segment Pills */}
        <div className="flex flex-wrap justify-center gap-2">
            {segments.map((seg) => (
                <button 
                    key={seg}
                    onClick={() => handleSegmentChange(seg)}
                    className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all border ${
                        selectedSegment === seg 
                        ? "bg-slate-900 text-white border-slate-900 shadow-lg" 
                        : "bg-white text-slate-500 border-slate-200 hover:border-slate-400 hover:text-slate-900"
                    }`}
                >
                    {seg}
                </button>
            ))}
        </div>
      </div>

      {/* --- CONTENT GRID --- */}
      <div className="min-h-[600px]">
        {loading ? (
            // SKELETON
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                    <div key={i} className="bg-white rounded-2xl border border-slate-100 p-4 shadow-sm">
                        <div className="h-48 bg-slate-100 rounded-xl mb-4 animate-pulse"></div>
                        <div className="h-4 bg-slate-100 rounded w-1/3 mb-2 animate-pulse"></div>
                        <div className="h-6 bg-slate-100 rounded w-3/4 mb-4 animate-pulse"></div>
                        <div className="h-3 bg-slate-100 rounded w-full mb-2 animate-pulse"></div>
                    </div>
                ))}
            </div>
        ) : blogs.length > 0 ? (
            // CONTENT
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 animate-in fade-in duration-500">
                {blogs.map((blog: any) => {
                    const segmentTitle = blog.segmentTitle || blog.subjects?.groups?.segments?.title || "General";
                    
                    return (
                        <Link key={blog.id} href={`/blog/${blog.id}`} className="group flex flex-col bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 h-full">
                            <div className="h-48 bg-slate-100 relative overflow-hidden">
                                {blog.content_url ? (
                                    <Image src={blog.content_url} alt={blog.title} fill className="object-cover transition-transform duration-500 group-hover:scale-110" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-slate-300 font-bold">No Image</div>
                                )}
                                <div className="absolute top-3 left-3">
                                    <span className="bg-white/90 backdrop-blur-sm text-slate-800 text-[10px] font-bold px-2 py-1 rounded shadow-sm border border-slate-100">
                                        {segmentTitle}
                                    </span>
                                </div>
                            </div>
                            <div className="p-6 flex-1 flex flex-col">
                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide mb-2 block">
                                    {new Date(blog.created_at).toLocaleDateString()}
                                </span>
                                <h3 className="text-lg font-bold text-slate-900 mb-3 leading-snug group-hover:text-blue-600 transition-colors line-clamp-2">
                                    {blog.title}
                                </h3>
                                <p className="text-slate-500 text-xs line-clamp-3 leading-relaxed mb-4 flex-1">
                                    {blog.seo_description || blog.content_body?.replace(/<[^>]+>/g, '').substring(0, 150) + "..."}
                                </p>
                                <span className="text-blue-600 text-xs font-bold mt-auto group-hover:underline">Read Full Post →</span>
                            </div>
                        </Link>
                    );
                })}
            </div>
        ) : (
            // EMPTY STATE
            <div className="text-center py-32 bg-white rounded-3xl border border-dashed border-slate-200">
                <div className="text-4xl mb-4">✍️</div>
                <h3 className="text-xl font-bold text-slate-900">No blogs found</h3>
                <p className="text-slate-500 mt-2">Try adjusting your search filters.</p>
                <button onClick={() => {setSearch(""); setDebouncedSearch(""); setSelectedSegment("All");}} className="mt-4 text-blue-600 font-bold text-sm hover:underline">Clear Filters</button>
            </div>
        )}
      </div>

      {/* --- PAGINATION CONTROLS --- */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-4 mt-16">
            <button 
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1 || loading}
                className="px-4 py-2 rounded-lg border text-sm font-bold flex items-center gap-2 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
                ← Prev
            </button>
            <span className="text-sm font-bold text-slate-600">Page {page} of {totalPages}</span>
            <button 
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages || loading}
                className="px-4 py-2 rounded-lg border text-sm font-bold flex items-center gap-2 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
                Next →
            </button>
        </div>
      )}

    </div>
  );
}