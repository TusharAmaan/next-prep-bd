"use client";

import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/lib/supabaseClient";
import Link from "next/link";
import Image from "next/image";
import { debounce } from "lodash";

const ITEMS_PER_PAGE = 9;

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
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [selectedSegment, setSelectedSegment] = useState("All");
  
  // Dynamic Category State
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [availableCategories, setAvailableCategories] = useState<string[]>([]);
  const [loadingCategories, setLoadingCategories] = useState(false);
  
  const [page, setPage] = useState(1);

  // --- 1. FETCH CATEGORIES (DYNAMIC) ---
  // When segment changes, find its ID and get relevant categories
  useEffect(() => {
    const fetchDynamicCategories = async () => {
        if (selectedSegment === "All") {
            setAvailableCategories([]);
            return;
        }

        setLoadingCategories(true);
        try {
            // 1. Get Segment ID from Title
            const { data: segData } = await supabase
                .from('segments')
                .select('id')
                .eq('title', selectedSegment)
                .single();

            if (segData) {
                // 2. Fetch Categories linked to this Segment OR Global ones compatible with blogs
                const { data: catData } = await supabase
                    .from('categories')
                    .select('name')
                    .eq('type', 'blog') // Only blog categories
                    .or(`segment_id.eq.${segData.id},segment_id.is.null`); // Linked to this segment OR Global

                if (catData) {
                    // Extract unique names
                    const names = Array.from(new Set(catData.map(c => c.name)));
                    setAvailableCategories(names);
                }
            }
        } catch (err) {
            console.error("Error fetching categories:", err);
        } finally {
            setLoadingCategories(false);
        }
    };

    fetchDynamicCategories();
  }, [selectedSegment]);

  // --- 2. STABLE FETCH FUNCTION (BLOGS) ---
  const fetchData = useCallback(
    async (pageNum: number, searchTerm: string, segment: string, category: string) => {
      setLoading(true);

      try {
        // Start Query
        // NOTICE: Added 'title' to subjects selection for the Badge logic
        let query = supabase
          .from("resources")
          .select(
            `
          id, title, content_body, created_at, content_url, type, seo_description, category,
          segment_id,
          subjects!left ( 
            title,
            groups!inner (
              segments!inner ( id, title )
            )
          )
        `,
            { count: "exact" }
          )
          .eq("type", "blog")
          .order("created_at", { ascending: false });

        // Search
        if (searchTerm) query = query.ilike("title", `%${searchTerm}%`);

        // Segment Filter
        if (segment !== "All") {
          query = query.eq("subjects.groups.segments.title", segment);
        }

        // Category Filter (Exact Match on the 'category' text column)
        if (category !== "All") {
           query = query.eq("category", category);
        }

        // Pagination Range
        const from = (pageNum - 1) * ITEMS_PER_PAGE;
        const to = from + ITEMS_PER_PAGE - 1;

        const { data, count, error } = await query.range(from, to);

        if (error) throw error;

        if (data) {
          const formatted = data.map((item: any) => ({
            ...item,
            // LOGIC: Subject Title exists? Use it. Else Segment Title. Else "General".
            badgeTitle: item.subjects?.title || item.subjects?.groups?.segments?.title || "General",
            segmentTitle: item.subjects?.groups?.segments?.title // Keep specific segment for filtering/logic if needed
          }));
          setBlogs(formatted);
        }

        if (count !== null) setTotalCount(count);
      } catch (err) {
        console.error("Error fetching blogs:", err);
      } finally {
        setLoading(false);
      }
    },
    []
  );

  // --- 3. HANDLE SEARCH DEBOUNCE ---
  const handleSearchUpdate = useCallback(
    debounce((value: string) => {
      setDebouncedSearch(value);
      setPage(1); // Reset to page 1 on new search
    }, 500),
    []
  );

  const onSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setSearch(val);
    handleSearchUpdate(val);
  };

  // --- 4. THE MAIN EFFECT ---
  useEffect(() => {
    // Skip initial load fetch if data matches server props AND no filters active
    if (
      page === 1 &&
      debouncedSearch === "" &&
      selectedSegment === "All" &&
      selectedCategory === "All" &&
      blogs === initialBlogs
    )
      return;

    fetchData(page, debouncedSearch, selectedSegment, selectedCategory);
    
    // Auto-scroll to top of grid when page changes
    if (page > 1) {
        const gridTop = document.getElementById("blog-grid-top");
        if (gridTop) gridTop.scrollIntoView({ behavior: "smooth" });
    }

  }, [page, selectedSegment, selectedCategory, debouncedSearch, fetchData]); 

  // --- HANDLERS ---
  const handleSegmentChange = (seg: string) => {
    if (selectedSegment === seg) return;
    setSelectedSegment(seg);
    setSelectedCategory("All"); // Reset sub-category when segment changes
    setPage(1);
  };

  const handleCategoryChange = (cat: string) => {
    if (selectedCategory === cat) return;
    setSelectedCategory(cat);
    setPage(1);
  };

  const totalPages = Math.ceil(totalCount / ITEMS_PER_PAGE);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      
      {/* --- PAGE HEADER --- */}
      <div className="mb-10 text-center lg:text-left">
        <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight mb-4">
          Latest <span className="text-blue-600">Updates</span>
        </h1>
        <p className="text-slate-500 max-w-2xl text-lg">
          Resources, exam tips, and news for every student.
        </p>
      </div>

      <div className="flex flex-col lg:flex-row gap-12 relative">
        
        {/* --- LEFT COLUMN: CONTENT (8 Cols) --- */}
        <div className="flex-1 w-full lg:w-2/3 xl:w-3/4">
            
          {/* Mobile Filter */}
          <div className="lg:hidden mb-8 space-y-3">
             <select 
                value={selectedSegment} 
                onChange={(e) => handleSegmentChange(e.target.value)}
                className="w-full p-3 border border-slate-200 rounded-xl font-bold text-slate-700 focus:ring-2 focus:ring-blue-500 outline-none"
             >
                <option value="All">All Segments</option>
                {segments.map(seg => <option key={seg} value={seg}>{seg}</option>)}
             </select>
             {/* Mobile Category Filter (Only if segment selected) */}
             {selectedSegment !== "All" && availableCategories.length > 0 && (
                <select 
                    value={selectedCategory} 
                    onChange={(e) => handleCategoryChange(e.target.value)}
                    className="w-full p-3 border border-slate-200 rounded-xl font-bold text-slate-700 focus:ring-2 focus:ring-blue-500 outline-none animate-in fade-in"
                >
                    <option value="All">All Topics</option>
                    {availableCategories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                </select>
             )}
          </div>

          <div id="blog-grid-top"></div>

          {/* LOADING STATE */}
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="bg-white rounded-2xl border border-slate-100 p-4 shadow-sm h-96 flex flex-col">
                  <div className="h-48 bg-slate-100 rounded-xl mb-4 animate-pulse"></div>
                  <div className="h-4 bg-slate-100 rounded w-1/3 mb-2 animate-pulse"></div>
                  <div className="h-6 bg-slate-100 rounded w-3/4 mb-4 animate-pulse"></div>
                  <div className="h-3 bg-slate-100 rounded w-full mb-2 animate-pulse"></div>
                </div>
              ))}
            </div>
          ) : blogs.length > 0 ? (
            // GRID STATE
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-in fade-in duration-500">
              {blogs.map((blog: any) => {
                const badgeTitle = blog.badgeTitle || "General";
                
                return (
                  <Link
                    key={blog.id}
                    href={`/blog/${blog.id}`}
                    className="group flex flex-col bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 h-full"
                  >
                    {/* --- IMAGE / NO-IMAGE HEADER --- */}
                    <div className="h-48 relative overflow-hidden border-b border-slate-100">
                      {blog.content_url ? (
                        <Image
                          src={blog.content_url}
                          alt={blog.title}
                          fill
                          className="object-cover transition-transform duration-700 group-hover:scale-105"
                        />
                      ) : (
                        // NO IMAGE FALLBACK
                        <div className="w-full h-full flex flex-col items-center justify-center p-6 bg-gradient-to-br from-slate-800 to-slate-900 group-hover:from-blue-900 group-hover:to-slate-900 transition-all">
                           <h3 className="text-white font-bold text-center line-clamp-3 leading-snug drop-shadow-md">
                             {blog.title}
                           </h3>
                        </div>
                      )}
                      
                      {/* Floating Badge (SUBJECT prioritized) */}
                      <div className="absolute top-3 left-3">
                        <span className="bg-white/95 backdrop-blur shadow-sm text-slate-800 text-[10px] font-extrabold px-3 py-1 rounded-full border border-slate-100 tracking-wide uppercase">
                          {badgeTitle}
                        </span>
                      </div>
                    </div>

                    {/* Content Area */}
                    <div className="p-5 flex-1 flex flex-col">
                      <div className="flex items-center gap-2 mb-3">
                        <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
                        <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wide">
                          {new Date(blog.created_at).toLocaleDateString("en-US", { month: 'short', day: 'numeric', year: 'numeric' })}
                        </span>
                      </div>
                      
                      {/* Show Title if Image Exists (otherwise it's in the header) */}
                      {blog.content_url && (
                        <h3 className="text-lg font-bold text-slate-800 mb-2 leading-tight group-hover:text-blue-600 transition-colors line-clamp-2">
                            {blog.title}
                        </h3>
                      )}
                      
                      <p className="text-slate-500 text-sm line-clamp-3 leading-relaxed mb-4 flex-1">
                        {blog.seo_description || blog.content_body?.replace(/<[^>]+>/g, "").substring(0, 120)}
                      </p>

                      <div className="flex items-center text-blue-600 text-xs font-bold mt-auto group-hover:translate-x-1 transition-transform">
                        Read Article 
                        <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8l4 4m0 0l-4 4m4-4H3"></path></svg>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          ) : (
            // EMPTY STATE
            <div className="text-center py-24 bg-slate-50 rounded-3xl border border-dashed border-slate-200">
              <div className="text-5xl mb-4 opacity-50">🔍</div>
              <h3 className="text-xl font-bold text-slate-900">No matching posts found</h3>
              <p className="text-slate-500 mt-2 text-sm max-w-xs mx-auto">
                 We couldn't find any articles matching "<strong>{search}</strong>" in {selectedSegment} {selectedCategory !== 'All' ? `> ${selectedCategory}` : ''}.
              </p>
              <button
                onClick={() => {
                  setSearch("");
                  setDebouncedSearch("");
                  setSelectedSegment("All");
                  setSelectedCategory("All");
                }}
                className="mt-6 px-6 py-2 bg-white border border-slate-200 shadow-sm rounded-full text-slate-700 font-bold text-sm hover:bg-slate-50 transition-colors"
              >
                Reset Filters
              </button>
            </div>
          )}

          {/* --- PAGINATION --- */}
          {totalPages > 1 && (
            <div className="flex justify-center items-center gap-4 mt-12 py-4 border-t border-slate-100">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1 || loading}
                className="px-5 py-2.5 rounded-xl border border-slate-200 bg-white text-sm font-bold text-slate-700 flex items-center gap-2 hover:bg-slate-50 hover:border-slate-300 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"></path></svg>
                Previous
              </button>
              
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-slate-500">Page</span>
                <span className="px-3 py-1 bg-slate-900 text-white rounded-lg text-sm font-bold">
                    {page}
                </span>
                <span className="text-sm font-medium text-slate-500">of {totalPages}</span>
              </div>

              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages || loading}
                className="px-5 py-2.5 rounded-xl border border-slate-200 bg-white text-sm font-bold text-slate-700 flex items-center gap-2 hover:bg-slate-50 hover:border-slate-300 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm"
              >
                Next
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path></svg>
              </button>
            </div>
          )}
        </div>

        {/* --- RIGHT COLUMN: SIDEBAR (4 Cols) --- */}
        <div className="w-full lg:w-1/3 xl:w-1/4 space-y-8">
            
            {/* Search Widget */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
                <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-4">Search</h3>
                <div className="relative">
                    <input 
                        type="text" 
                        placeholder="Search articles..." 
                        className="w-full bg-slate-50 border border-slate-200 text-slate-900 text-sm rounded-lg pl-4 pr-10 py-3 outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                        value={search}
                        onChange={onSearchChange}
                    />
                    <svg className="w-5 h-5 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
                </div>
            </div>

            {/* 1. All Segments Widget */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm hidden lg:block">
                <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-4">All Segments</h3>
                <div className="flex flex-col gap-2">
                    <button 
                        onClick={() => handleSegmentChange("All")}
                        className={`text-left px-4 py-3 rounded-lg text-sm font-medium transition-all flex justify-between items-center group ${
                            selectedSegment === "All" 
                            ? "bg-slate-900 text-white shadow-md" 
                            : "hover:bg-slate-50 text-slate-600"
                        }`}
                    >
                        All Updates
                        {selectedSegment === "All" && <span className="text-white">●</span>}
                    </button>
                    {segments.map((seg) => (
                        <button 
                            key={seg}
                            onClick={() => handleSegmentChange(seg)}
                            className={`text-left px-4 py-3 rounded-lg text-sm font-medium transition-all flex justify-between items-center group ${
                                selectedSegment === seg 
                                ? "bg-slate-900 text-white shadow-md" 
                                : "hover:bg-slate-50 text-slate-600"
                            }`}
                        >
                            {seg}
                            {selectedSegment === seg && <span className="text-white">●</span>}
                        </button>
                    ))}
                </div>
            </div>

            {/* 2. DYNAMIC TOPICS WIDGET (Context-Aware) */}
            {selectedSegment !== "All" && (
                 <div className="bg-white rounded-2xl border border-blue-100 p-6 shadow-sm hidden lg:block animate-in slide-in-from-right-4 fade-in duration-500">
                    <h3 className="text-sm font-bold text-blue-900 uppercase tracking-wider mb-4">
                        {selectedSegment} Topics
                    </h3>
                    
                    {loadingCategories ? (
                        <div className="flex gap-2 animate-pulse">
                            <div className="h-6 w-16 bg-blue-50 rounded-full"></div>
                            <div className="h-6 w-24 bg-blue-50 rounded-full"></div>
                            <div className="h-6 w-12 bg-blue-50 rounded-full"></div>
                        </div>
                    ) : availableCategories.length > 0 ? (
                        <div className="flex flex-wrap gap-2">
                            {/* "All" Button for Sub-Categories */}
                            <button 
                                onClick={() => handleCategoryChange("All")}
                                className={`px-3 py-1 text-xs font-bold rounded-full transition-colors border ${
                                    selectedCategory === "All"
                                    ? "bg-blue-600 text-white border-blue-600 shadow-sm"
                                    : "bg-white text-slate-500 border-slate-200 hover:border-blue-300"
                                }`}
                            >
                                All
                            </button>
                            
                            {/* Map Fetched Categories */}
                            {availableCategories.map(cat => (
                                <button 
                                    key={cat} 
                                    onClick={() => handleCategoryChange(cat)}
                                    className={`px-3 py-1 text-xs font-bold rounded-full transition-colors border ${
                                        selectedCategory === cat
                                        ? "bg-blue-600 text-white border-blue-600 shadow-sm"
                                        : "bg-blue-50 text-blue-700 border-transparent hover:bg-blue-100"
                                    }`}
                                >
                                    {cat}
                                </button>
                            ))}
                        </div>
                    ) : (
                        <p className="text-xs text-slate-400 italic">No specific topics found for this segment.</p>
                    )}
                 </div>
            )}

            {/* Social Connect Widget */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
                <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-4">Socials</h3>
                <div className="space-y-3">
                    {/* Facebook */}
                    <a 
                        href="https://www.facebook.com/profile.php?id=61584943876571" 
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-3 p-3 rounded-xl border border-slate-100 hover:border-blue-200 hover:bg-blue-50/50 transition-all group"
                    >
                        <div className="w-10 h-10 bg-[#1877F2] rounded-full flex items-center justify-center text-white shrink-0">
                            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
                        </div>
                        <div>
                            <p className="text-sm font-bold text-slate-900 group-hover:text-blue-700">Facebook</p>
                        </div>
                    </a>

                    {/* YouTube */}
                    <a 
                        href="https://youtube.com/gmatclub" 
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-3 p-3 rounded-xl border border-slate-100 hover:border-red-200 hover:bg-red-50/50 transition-all group"
                    >
                        <div className="w-10 h-10 bg-[#FF0000] rounded-full flex items-center justify-center text-white shrink-0">
                             <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M19.615 3.184c-3.604-.246-11.631-.245-15.23 0-3.897.266-4.356 2.62-4.385 8.816.029 6.185.484 8.549 4.385 8.816 3.6.245 11.626.246 15.23 0 3.897-.266 4.356-2.62 4.385-8.816-.029-6.185-.484-8.549-4.385-8.816zm-10.615 12.816v-8l8 3.993-8 4.007z"/></svg>
                        </div>
                        <div>
                            <p className="text-sm font-bold text-slate-900 group-hover:text-red-700">YouTube</p>
                        </div>
                    </a>
                </div>
            </div>

        </div>

      </div>
    </div>
  );
}