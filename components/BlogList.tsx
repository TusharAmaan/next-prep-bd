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
    <div className="max-w-7xl mx-auto px-6 py-20 font-sans">
      
      <div className="flex flex-col lg:flex-row gap-16 relative">
        
        {/* --- LEFT COLUMN: CONTENT --- */}
        <div className="flex-1 w-full lg:order-2">
            
          {/* Mobile Filter */}
          <div className="lg:hidden mb-10 space-y-4">
             <div className="relative group">
                <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-indigo-600 transition-colors" />
                <input 
                  type="text" 
                  placeholder="Search articles..." 
                  className="w-full pl-14 pr-6 py-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white outline-none focus:ring-4 focus:ring-indigo-500/10 transition-all font-bold text-sm shadow-xl shadow-slate-200/50 dark:shadow-none"
                  value={search} 
                  onChange={onSearchChange} 
                />
             </div>
             <div className="grid grid-cols-2 gap-4">
                <select 
                    value={selectedSegment} 
                    onChange={(e) => handleSegmentChange(e.target.value)}
                    className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl font-black text-[10px] uppercase tracking-widest text-slate-700 dark:text-slate-300 focus:ring-4 focus:ring-indigo-500/10 outline-none shadow-xl shadow-slate-200/50 dark:shadow-none"
                >
                    <option value="All">All Segments</option>
                    {segments.map(seg => <option key={seg} value={seg}>{seg}</option>)}
                </select>
                {selectedSegment !== "All" && (
                    <select 
                       value={selectedCategory} 
                       onChange={(e) => setSelectedCategory(e.target.value)}
                       className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl font-black text-[10px] uppercase tracking-widest text-slate-700 dark:text-slate-300 focus:ring-4 focus:ring-indigo-500/10 outline-none animate-in fade-in"
                    >
                       <option value="All">All Topics</option>
                       {availableCategories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                    </select>
                )}
             </div>
          </div>

          <div id="blog-grid-top"></div>

          {/* --- CONTROL BAR --- */}
          <div className="flex justify-between items-center mb-10 bg-white dark:bg-slate-900 p-4 rounded-[2rem] border border-slate-100 dark:border-slate-800 shadow-xl dark:shadow-indigo-900/5">
             <div className="flex items-center gap-3 pl-4">
                <span className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse"></span>
                <span className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em]">
                    Archives: {totalCount} Items
                </span>
             </div>
             
             <div className="flex items-center gap-4 pr-2">
                 <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-100 dark:border-slate-700">
                    <Grid className="w-4 h-4 text-indigo-500" />
                    <span className="text-[9px] font-black uppercase text-slate-500">Grid View</span>
                 </div>
                 <select 
                   value={itemsPerPage}
                   onChange={handleItemsPerPageChange}
                   className="bg-transparent text-[10px] font-black uppercase tracking-widest text-slate-700 dark:text-slate-300 py-2 px-4 outline-none cursor-pointer hover:text-indigo-600 transition-colors"
                 >
                     <option value={9}>Display 9</option>
                     <option value={21}>Display 21</option>
                     <option value={45}>Display 45</option>
                 </select>
             </div>
          </div>

          {/* CONTENT GRID */}
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 p-6 h-[450px] flex flex-col">
                  <div className="h-56 bg-slate-50 dark:bg-slate-800 rounded-3xl mb-8 animate-pulse"></div>
                  <div className="h-4 bg-slate-50 dark:bg-slate-800 rounded w-1/3 mb-4 animate-pulse"></div>
                  <div className="h-8 bg-slate-50 dark:bg-slate-800 rounded w-3/4 mb-4 animate-pulse"></div>
                  <div className="h-4 bg-slate-50 dark:bg-slate-800 rounded w-full mt-auto animate-pulse"></div>
                </div>
              ))}
            </div>
          ) : blogs.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8 animate-in fade-in slide-in-from-bottom-8 duration-700">
              {blogs.map((blog: any) => (
                  <Link
                    key={blog.id}
                    href={blog.link || `/blog/${blog.id}`} 
                    className="group flex flex-col bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 overflow-hidden shadow-sm hover:shadow-2xl dark:hover:shadow-indigo-900/10 hover:-translate-y-2 transition-all duration-500 h-full"
                  >
                    <div className="h-56 relative overflow-hidden">
                      {blog.content_url ? (
                        <Image
                          src={blog.content_url}
                          alt={blog.title}
                          fill
                          className="object-cover transition-transform duration-700 group-hover:scale-110"
                        />
                      ) : (
                        <div className="w-full h-full flex flex-col items-center justify-center p-8 bg-slate-950">
                           <BookOpen className="w-12 h-12 text-slate-700 mb-4 group-hover:text-indigo-500 transition-colors" />
                           <h4 className="text-white font-black text-center text-xs uppercase tracking-widest leading-relaxed line-clamp-3">
                             {blog.title}
                           </h4>
                        </div>
                      )}
                      
                      <div className="absolute top-6 left-6">
                        <span className="bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl shadow-2xl text-slate-900 dark:text-white text-[9px] font-black px-4 py-1.5 rounded-xl border border-white/10 tracking-[0.2em] uppercase">
                          {blog.badgeTitle}
                        </span>
                      </div>
                      <div className="absolute top-6 right-6 opacity-0 translate-x-4 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-500">
                        <BookmarkButton 
                          itemType="post" 
                          itemId={blog.id} 
                          metadata={{ title: blog.title, thumbnail_url: blog.content_url }} 
                        />
                      </div>
                    </div>

                    <div className="p-8 flex-1 flex flex-col">
                      <div className="flex items-center gap-3 mb-5">
                        <Clock className="w-3.5 h-3.5 text-indigo-500" />
                        <span className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">
                          {new Date(blog.created_at).toLocaleDateString("en-US", { month: 'short', day: 'numeric', year: 'numeric' })}
                        </span>
                      </div>
                      
                      <h3 className="text-xl font-black text-slate-900 dark:text-white mb-4 leading-tight uppercase tracking-tighter group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors line-clamp-2">
                          {blog.title}
                      </h3>
                      
                      <p className="text-slate-500 dark:text-slate-400 text-sm line-clamp-3 leading-relaxed mb-8 flex-1 font-medium">
                        {blog.seo_description || blog.content_body?.replace(/<[^>]+>/g, "").substring(0, 150)}
                      </p>

                      <div className="pt-6 border-t border-slate-50 dark:border-slate-800/50 flex items-center justify-between text-indigo-600 dark:text-indigo-400 text-[10px] font-black uppercase tracking-widest group-hover:translate-x-2 transition-transform duration-500">
                        Explore Full Content
                        <ArrowRight className="w-4 h-4" />
                      </div>
                    </div>
                  </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-32 bg-white dark:bg-slate-900 rounded-[3rem] border-2 border-dashed border-slate-100 dark:border-slate-800 shadow-sm">
              <Sparkles className="w-20 h-20 text-slate-100 dark:text-slate-800 mx-auto mb-8" />
              <h3 className="text-3xl font-black text-slate-900 dark:text-white mb-4 uppercase tracking-tighter leading-none">Archives Empty</h3>
              <p className="text-slate-500 dark:text-slate-400 font-medium mb-12 max-w-sm mx-auto text-lg leading-relaxed"> No articles match your refined criteria. Try resetting the discovery filters.</p>
              <button
                onClick={() => {setSearch(""); setDebouncedSearch(""); setSelectedSegment("All"); setSelectedCategory("All");}}
                className="px-10 py-5 bg-indigo-600 text-white shadow-2xl shadow-indigo-600/20 rounded-[2rem] font-black uppercase tracking-[0.2em] text-[10px] hover:bg-indigo-500 transition-all"
              >
                Reset Discovery
              </button>
            </div>
          )}

          {/* PAGINATION */}
          {totalPages > 1 && (
            <div className="flex justify-center items-center gap-6 mt-20 py-10 border-t border-slate-100 dark:border-slate-800/50">
              <button 
                onClick={() => setPage((p) => Math.max(1, p - 1))} 
                disabled={page === 1 || loading} 
                className="w-16 h-16 rounded-[2rem] border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-400 hover:text-indigo-600 hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center justify-center transition-all disabled:opacity-20"
              >
                <ArrowRight className="w-6 h-6 rotate-180" />
              </button>
              
              <div className="flex items-center gap-4">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Entry</span>
                <span className="w-12 h-12 bg-indigo-600 text-white rounded-2xl flex items-center justify-center text-xs font-black shadow-xl shadow-indigo-600/30">{page}</span>
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">of {totalPages}</span>
              </div>

              <button 
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))} 
                disabled={page === totalPages || loading} 
                className="w-16 h-16 rounded-[2rem] border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-400 hover:text-indigo-600 hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center justify-center transition-all disabled:opacity-20"
              >
                <ArrowRight className="w-6 h-6" />
              </button>
            </div>
          )}
        </div>

        {/* --- RIGHT COLUMN: SIDEBAR --- */}
        <div className="w-full lg:w-1/3 xl:w-80 lg:order-1 flex flex-col gap-10">
            
            {/* Discovery Core */}
            <div className="sticky top-32 space-y-10">
                {/* Search */}
                <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] p-8 border border-slate-100 dark:border-slate-800 shadow-xl dark:shadow-indigo-900/5 group">
                    <h3 className="text-[10px] font-black text-slate-900 dark:text-white uppercase tracking-[0.2em] mb-6 flex items-center gap-3">
                        <Search className="w-4 h-4 text-indigo-500" /> Discovery
                    </h3>
                    <div className="relative">
                        <input 
                            type="text" 
                            placeholder="Type keywords..." 
                            className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 text-slate-900 dark:text-white text-xs font-black rounded-2xl px-6 py-4 outline-none focus:ring-4 focus:ring-indigo-500/10 transition-all uppercase tracking-widest placeholder:text-slate-300 dark:placeholder:text-slate-600" 
                            value={search} 
                            onChange={onSearchChange} 
                        />
                    </div>
                </div>

                {/* Segments Filter */}
                <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] p-8 border border-slate-100 dark:border-slate-800 shadow-xl dark:shadow-indigo-900/5 hidden lg:block">
                    <h3 className="text-[10px] font-black text-slate-900 dark:text-white uppercase tracking-[0.2em] mb-8 flex items-center gap-3">
                        <Filter className="w-4 h-4 text-indigo-500" /> Academic Segments
                    </h3>
                    <div className="flex flex-col gap-3">
                        <button 
                            onClick={() => handleSegmentChange("All")}
                            className={`text-left px-6 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all duration-300 flex justify-between items-center group ${
                                selectedSegment === "All" 
                                ? "bg-indigo-600 text-white shadow-xl shadow-indigo-600/30 translate-x-1" 
                                : "hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-white"
                            }`}
                        >
                            All Journals
                            <ChevronRight className={`w-3.5 h-3.5 ${selectedSegment === "All" ? "opacity-100" : "opacity-0 group-hover:opacity-100 translate-x-0"}`} />
                        </button>
                        {segments.filter(s => s !== 'All').map((seg) => (
                            <button 
                                key={seg}
                                onClick={() => handleSegmentChange(seg)}
                                className={`text-left px-6 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all duration-300 flex justify-between items-center group ${
                                    selectedSegment === seg 
                                    ? "bg-indigo-600 text-white shadow-xl shadow-indigo-600/30 translate-x-1" 
                                    : "hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-white"
                                }`}
                            >
                                {seg}
                                <ChevronRight className={`w-3.5 h-3.5 ${selectedSegment === seg ? "opacity-100" : "opacity-0 group-hover:opacity-100 translate-x-0"}`} />
                            </button>
                        ))}
                    </div>
                </div>

                {/* Dynamic Topics */}
                {selectedSegment !== "All" && (
                    <div className="bg-slate-900 rounded-[2.5rem] p-8 text-white shadow-2xl hidden lg:block animate-in slide-in-from-left-4 fade-in duration-700 relative overflow-hidden group border border-white/5">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-full blur-3xl -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-1000"></div>
                        <h3 className="text-[10px] font-black uppercase tracking-[0.2em] mb-8 text-indigo-400 flex items-center gap-3">
                            <Sparkles className="w-4 h-4" /> {selectedSegment} Topics
                        </h3>
                        
                        {loadingCategories ? (
                            <div className="flex flex-wrap gap-2 animate-pulse">
                                <div className="h-8 w-20 bg-white/5 rounded-xl"></div>
                                <div className="h-8 w-14 bg-white/5 rounded-xl"></div>
                            </div>
                        ) : availableCategories.length > 0 ? (
                            <div className="flex flex-wrap gap-2 relative z-10">
                                <button 
                                    onClick={() => setSelectedCategory("All")} 
                                    className={`px-4 py-2 text-[9px] font-black uppercase tracking-widest rounded-xl transition-all border ${selectedCategory === "All" ? "bg-white text-slate-900 border-white shadow-xl" : "bg-white/5 text-slate-400 border-white/5 hover:bg-white/10 hover:border-white/20"}`}
                                >
                                    All
                                </button>
                                {availableCategories.map(cat => (
                                    <button 
                                        key={cat} 
                                        onClick={() => setSelectedCategory(cat)} 
                                        className={`px-4 py-2 text-[9px] font-black uppercase tracking-widest rounded-xl transition-all border ${selectedCategory === cat ? "bg-white text-slate-900 border-white shadow-xl" : "bg-white/5 text-slate-400 border-white/5 hover:bg-white/10 hover:border-white/20"}`}
                                    >
                                        {cat}
                                    </button>
                                ))}
                            </div>
                        ) : (
                            <p className="text-[10px] text-slate-500 font-black uppercase italic tracking-widest">General Archive Only</p>
                        )}
                    </div>
                )}
            </div>
        </div>

      </div>
    </div>
  );
}