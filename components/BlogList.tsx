"use client";

import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/lib/supabaseClient";
import Link from "next/link";
import Image from "next/image";
import { debounce } from "lodash";
import BookmarkButton from "./shared/BookmarkButton";
import { Search, ChevronRight, Filter, BookOpen, Clock, ArrowRight, Grid, List as ListIcon, Sparkles } from "lucide-react";

type BlogListProps = {
  initialBlogs: any[];
  initialCount: number;
  segments: string[];
};

export default function BlogList({ initialBlogs, initialCount, segments }: BlogListProps) {
  const [blogs, setBlogs] = useState(initialBlogs);
  const [loading, setLoading] = useState(false);
  const [totalCount, setTotalCount] = useState(initialCount);

  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [selectedSegment, setSelectedSegment] = useState("All");
  const [selectedSegmentId, setSelectedSegmentId] = useState<number | null>(null);
  
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [availableCategories, setAvailableCategories] = useState<string[]>([]);
  const [loadingCategories, setLoadingCategories] = useState(false);
  
  const [page, setPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(9); 

  useEffect(() => {
    const handleSegmentSwitch = async () => {
        if (selectedSegment === "All") {
            setSelectedSegmentId(null);
            setAvailableCategories([]);
            setPage(1);
            return;
        }

        setLoadingCategories(true);
        try {
            const { data: segData } = await supabase
                .from('segments')
                .select('id')
                .eq('title', selectedSegment)
                .single();

            if (segData) {
                setSelectedSegmentId(segData.id);
                const { data: catData } = await supabase
                    .from('categories')
                    .select('name')
                    .eq('type', 'blog')
                    .or(`segment_id.eq.${segData.id},segment_id.is.null`);

                if (catData) {
                    const uniqueNames = Array.from(new Set(catData.map(c => c.name)));
                    setAvailableCategories(uniqueNames);
                }
            }
        } catch (err) {
            console.error("Error resolving segment:", err);
        } finally {
            setLoadingCategories(false);
            setPage(1); 
        }
    };
    handleSegmentSwitch();
  }, [selectedSegment]);

  const fetchData = useCallback(
    async (pageNum: number, searchTerm: string, segmentId: number | null, category: string, limit: number) => {
      setLoading(true);

      try {
        let query = supabase
          .from("resources")
          .select(
            `
          id, title, content_body, created_at, content_url, type, seo_description, category, slug,
          segment_id,
          subjects!left ( 
            title,
            groups!inner (
              segments!inner ( id, title, slug ) 
            )
          )
        `,
            { count: "exact" }
          )
          .eq("type", "blog")
          .eq("status", "approved") 
          .order("created_at", { ascending: false });

        if (searchTerm) query = query.ilike("title", `%${searchTerm}%`);
        if (segmentId) query = query.eq("segment_id", segmentId);
        if (category !== "All") query = query.eq("category", category);

        const from = (pageNum - 1) * limit;
        const to = from + limit - 1;

        const { data, count, error } = await query.range(from, to);

        if (error) throw error;

        if (data) {
          const formatted = data.map((item: any) => {
            const identifier = item.slug || item.id;
            let link = `/blog/${identifier}`; 

            if (item.type === 'news') {
                link = `/news/${identifier}`;
            } else if (item.type === 'updates') {
                const seg = item.subjects?.groups?.segments;
                const segmentSlug = seg?.slug || seg?.title?.toLowerCase() || 'general';
                link = `/resources/${segmentSlug}/updates/${identifier}`;
            }

            return {
                ...item,
                link, 
                badgeTitle: item.subjects?.title || item.subjects?.groups?.segments?.title || "Academy",
            };
          });
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

  const handleSearchUpdate = useCallback(
    debounce((value: string) => {
      setDebouncedSearch(value);
      setPage(1);
    }, 500),
    []
  );

  const onSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
    handleSearchUpdate(e.target.value);
  };

  useEffect(() => {
    if (selectedSegment !== "All" && selectedSegmentId === null) return;
    
    fetchData(page, debouncedSearch, selectedSegmentId, selectedCategory, itemsPerPage);
    
    if (page > 1 || debouncedSearch) {
        const gridTop = document.getElementById("blog-grid-top");
        if (gridTop) gridTop.scrollIntoView({ behavior: "smooth" });
    }
  }, [page, selectedSegmentId, selectedSegment, selectedCategory, debouncedSearch, itemsPerPage, fetchData]); 

  const handleSegmentChange = (seg: string) => {
    if (selectedSegment === seg) return;
    setSelectedSegment(seg);
    setSelectedCategory("All");
  };
  
  const handleItemsPerPageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
      setItemsPerPage(Number(e.target.value));
      setPage(1);
  };

  const totalPages = Math.ceil(totalCount / itemsPerPage);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12 font-sans">
      <div className="flex flex-col lg:flex-row gap-12 relative">
        
        {/* --- LEFT COLUMN: CONTENT --- */}
        <div className="flex-1 w-full lg:order-2">
            
          {/* Mobile Filter */}
          <div className="lg:hidden mb-8 space-y-4">
             <div className="relative group">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
                <input 
                  type="text" 
                  placeholder="Search articles..." 
                  className="w-full pl-11 pr-4 py-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-950 dark:text-slate-50 outline-none focus:border-indigo-500 transition-all font-medium text-sm shadow-sm"
                  value={search} 
                  onChange={onSearchChange} 
                />
             </div>
             <div className="grid grid-cols-2 gap-4">
                <select 
                    value={selectedSegment} 
                    onChange={(e) => handleSegmentChange(e.target.value)}
                    className="p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl font-medium text-sm text-slate-700 dark:text-slate-300 focus:border-indigo-500 outline-none shadow-sm"
                >
                    <option value="All">All stages</option>
                    {segments.map(seg => <option key={seg} value={seg}>{seg}</option>)}
                </select>
                {selectedSegment !== "All" && (
                    <select 
                       value={selectedCategory} 
                       onChange={(e) => setSelectedCategory(e.target.value)}
                       className="p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl font-medium text-sm text-slate-700 dark:text-slate-300 focus:border-indigo-500 outline-none animate-in fade-in"
                    >
                       <option value="All">All topics</option>
                       {availableCategories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                    </select>
                )}
             </div>
          </div>

          <div id="blog-grid-top"></div>

          {/* --- CONTROL BAR --- */}
          <div className="flex justify-between items-center mb-8 bg-white dark:bg-slate-900 py-3 px-6 rounded-2xl border border-slate-100 dark:border-slate-800/80 shadow-sm">
             <div className="flex items-center gap-2.5">
                <span className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse"></span>
                <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                    Showing {totalCount} items
                </span>
             </div>
             
             <div className="flex items-center gap-3">
                 <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-slate-50 dark:bg-slate-800 rounded-lg border border-slate-100 dark:border-slate-700/60">
                    <Grid className="w-3.5 h-3.5 text-indigo-500" />
                    <span className="text-xs font-medium text-slate-600 dark:text-slate-400">Grid view</span>
                 </div>
                 <select 
                   value={itemsPerPage}
                   onChange={handleItemsPerPageChange}
                   className="bg-transparent text-xs font-semibold text-slate-700 dark:text-slate-300 py-1 px-2 outline-none cursor-pointer hover:text-indigo-600 transition-colors"
                 >
                     <option value={9}>Show 9</option>
                     <option value={21}>Show 21</option>
                     <option value={45}>Show 45</option>
                 </select>
             </div>
          </div>

          {/* CONTENT GRID */}
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 p-5 h-[400px] flex flex-col">
                  <div className="h-48 bg-slate-100 dark:bg-slate-800 rounded-xl mb-6 animate-pulse"></div>
                  <div className="h-3 bg-slate-100 dark:bg-slate-800 rounded w-1/3 mb-3 animate-pulse"></div>
                  <div className="h-6 bg-slate-100 dark:bg-slate-800 rounded w-3/4 mb-3 animate-pulse"></div>
                  <div className="h-3 bg-slate-100 dark:bg-slate-800 rounded w-full mt-auto animate-pulse"></div>
                </div>
              ))}
            </div>
          ) : blogs.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
              {blogs.map((blog: any) => (
                  <Link
                    key={blog.id}
                    href={blog.link || `/blog/${blog.id}`} 
                    className="group flex flex-col bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800/80 overflow-hidden shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300 h-full"
                  >
                    <div className="h-48 relative overflow-hidden bg-slate-100 dark:bg-slate-950">
                      {blog.content_url ? (
                        <Image
                          src={blog.content_url}
                          alt={blog.title}
                          fill
                          className="object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                      ) : (
                        <div className="w-full h-full flex flex-col items-center justify-center p-6 bg-gradient-to-br from-indigo-50/50 to-cyan-50/50 dark:from-indigo-950/20 dark:to-cyan-950/20 border-b border-slate-100 dark:border-slate-900">
                           <BookOpen className="w-10 h-10 text-indigo-500/70 mb-2 group-hover:text-indigo-500 transition-colors" />
                        </div>
                      )}
                      
                      <div className="absolute top-4 left-4">
                        <span className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-md shadow-sm text-slate-800 dark:text-slate-200 text-[10px] font-bold px-3 py-1 rounded-lg border border-slate-200/50 dark:border-slate-800/50">
                          {blog.badgeTitle}
                        </span>
                      </div>
                      <div className="absolute top-4 right-4 opacity-0 translate-y-1 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300">
                        <BookmarkButton 
                          itemType="post" 
                          itemId={blog.id} 
                          metadata={{ title: blog.title, thumbnail_url: blog.content_url }} 
                        />
                      </div>
                    </div>

                    <div className="p-6 flex-1 flex flex-col">
                      <div className="flex items-center gap-2 mb-3">
                        <Clock className="w-3.5 h-3.5 text-indigo-500" />
                        <span className="text-xs text-slate-400 dark:text-slate-500 font-medium">
                          {new Date(blog.created_at).toLocaleDateString("en-US", { month: 'short', day: 'numeric', year: 'numeric' })}
                        </span>
                      </div>
                      
                      <h3 className="text-base font-bold text-slate-900 dark:text-white mb-2 leading-snug group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors line-clamp-2">
                          {blog.title}
                      </h3>
                      
                      <p className="text-slate-500 dark:text-slate-400 text-xs line-clamp-3 leading-relaxed mb-6 flex-1 font-normal">
                        {blog.seo_description || blog.content_body?.replace(/<[^>]+>/g, "").substring(0, 150)}
                      </p>

                      <div className="pt-4 border-t border-slate-50 dark:border-slate-800/40 flex items-center justify-between text-indigo-600 dark:text-indigo-400 text-xs font-semibold group-hover:translate-x-1 transition-transform duration-300">
                        Read article
                        <ArrowRight className="w-3.5 h-3.5" />
                      </div>
                    </div>
                  </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-20 bg-white dark:bg-slate-900 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800 shadow-sm">
              <Sparkles className="w-12 h-12 text-slate-200 dark:text-slate-700 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">No articles found</h3>
              <p className="text-slate-500 dark:text-slate-400 font-normal mb-6 max-w-sm mx-auto text-sm">No articles match your selection. Try resetting filters.</p>
              <button
                onClick={() => {setSearch(""); setDebouncedSearch(""); setSelectedSegment("All"); setSelectedCategory("All");}}
                className="px-6 py-2.5 bg-indigo-600 text-white rounded-xl font-medium text-xs hover:bg-indigo-500 transition-all shadow-sm shadow-indigo-600/10"
              >
                Reset filters
              </button>
            </div>
          )}

          {/* PAGINATION */}
          {totalPages > 1 && (
            <div className="flex justify-center items-center gap-4 mt-12 py-6 border-t border-slate-100 dark:border-slate-800/40">
              <button 
                onClick={() => setPage((p) => Math.max(1, p - 1))} 
                disabled={page === 1 || loading} 
                className="w-10 h-10 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-400 hover:text-indigo-600 hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center justify-center transition-all disabled:opacity-20"
              >
                <ArrowRight className="w-4 h-4 rotate-180" />
              </button>
              
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-400">Page</span>
                <span className="w-8 h-8 bg-indigo-600 text-white rounded-lg flex items-center justify-center text-xs font-bold">{page}</span>
                <span className="text-xs text-slate-400">of {totalPages}</span>
              </div>

              <button 
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))} 
                disabled={page === totalPages || loading} 
                className="w-10 h-10 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-400 hover:text-indigo-600 hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center justify-center transition-all disabled:opacity-20"
              >
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>

        {/* --- RIGHT COLUMN: SIDEBAR --- */}
        <div className="w-full lg:w-1/3 xl:w-80 lg:order-1 flex flex-col gap-8">
            
            {/* Discovery Core */}
            <div className="sticky top-28 space-y-8">
                {/* Search */}
                <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-100 dark:border-slate-800 shadow-sm">
                    <h3 className="text-xs font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                        <Search className="w-4 h-4 text-indigo-500" /> Search articles
                    </h3>
                    <div className="relative">
                        <input 
                            type="text" 
                            placeholder="Type keywords..." 
                            className="w-full bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white text-xs font-medium rounded-xl px-4 py-3 outline-none focus:border-indigo-500 transition-all placeholder:text-slate-400 dark:placeholder:text-slate-600" 
                            value={search} 
                            onChange={onSearchChange} 
                        />
                    </div>
                </div>

                {/* Segments Filter */}
                <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-100 dark:border-slate-800 shadow-sm hidden lg:block">
                    <h3 className="text-xs font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                        <Filter className="w-4 h-4 text-indigo-500" /> Syllabus stages
                    </h3>
                    <div className="flex flex-col gap-2">
                        <button 
                            onClick={() => handleSegmentChange("All")}
                            className={`text-left px-4 py-2.5 rounded-xl text-xs font-medium transition-all duration-200 flex justify-between items-center group ${
                                selectedSegment === "All" 
                                ? "bg-indigo-600 text-white shadow-sm" 
                                : "hover:bg-slate-50 dark:hover:bg-slate-850 text-slate-600 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-white"
                            }`}
                        >
                            <span>All journals</span>
                            <ChevronRight className={`w-3.5 h-3.5 transition-transform duration-200 ${selectedSegment === "All" ? "translate-x-0" : "opacity-0 group-hover:opacity-100 translate-x-1"}`} />
                        </button>
                        {segments.filter(s => s !== 'All').map((seg) => (
                            <button 
                                key={seg}
                                onClick={() => handleSegmentChange(seg)}
                                className={`text-left px-4 py-2.5 rounded-xl text-xs font-medium transition-all duration-200 flex justify-between items-center group ${
                                    selectedSegment === seg 
                                    ? "bg-indigo-600 text-white shadow-sm" 
                                    : "hover:bg-slate-50 dark:hover:bg-slate-850 text-slate-600 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-white"
                                }`}
                            >
                                <span>{seg}</span>
                                <ChevronRight className={`w-3.5 h-3.5 transition-transform duration-200 ${selectedSegment === seg ? "translate-x-0" : "opacity-0 group-hover:opacity-100 translate-x-1"}`} />
                            </button>
                        ))}
                    </div>
                </div>

                {/* Dynamic Topics */}
                {selectedSegment !== "All" && (
                    <div className="bg-slate-900 rounded-2xl p-6 text-white shadow-md hidden lg:block animate-in slide-in-from-left-4 fade-in duration-300 relative overflow-hidden group border border-slate-800">
                        <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-500/10 rounded-full blur-2xl pointer-events-none"></div>
                        <h3 className="text-xs font-bold mb-4 text-indigo-400 flex items-center gap-2">
                            <Sparkles className="w-4 h-4" /> {selectedSegment} topics
                        </h3>
                        
                        {loadingCategories ? (
                            <div className="flex flex-wrap gap-2 animate-pulse">
                                <div className="h-7 w-16 bg-white/5 rounded-lg"></div>
                                <div className="h-7 w-12 bg-white/5 rounded-lg"></div>
                            </div>
                        ) : availableCategories.length > 0 ? (
                            <div className="flex flex-wrap gap-2 relative z-10">
                                <button 
                                    onClick={() => setSelectedCategory("All")} 
                                    className={`px-3 py-1.5 text-[11px] font-medium rounded-lg transition-all border ${selectedCategory === "All" ? "bg-white text-slate-900 border-white" : "bg-white/5 text-slate-400 border-white/5 hover:bg-white/10 hover:border-white/10"}`}
                                >
                                    All
                                </button>
                                {availableCategories.map(cat => (
                                    <button 
                                        key={cat} 
                                        onClick={() => setSelectedCategory(cat)} 
                                        className={`px-3 py-1.5 text-[11px] font-medium rounded-lg transition-all border ${selectedCategory === cat ? "bg-white text-slate-900 border-white" : "bg-white/5 text-slate-400 border-white/5 hover:bg-white/10 hover:border-white/10"}`}
                                    >
                                        {cat}
                                    </button>
                                ))}
                            </div>
                        ) : (
                            <p className="text-xs text-slate-500 font-medium italic">General archive only</p>
                        )}
                    </div>
                )}
            </div>
        </div>

      </div>
    </div>
  );
}