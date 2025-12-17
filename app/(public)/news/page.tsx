"use client";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";
import Link from "next/link";

export default function NewsPage() {
  const [news, setNews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Search & Filter State
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [categories, setCategories] = useState<string[]>(["All"]);

  useEffect(() => {
    fetchNews();
  }, []);

  async function fetchNews() {
    setLoading(true);
    const { data } = await supabase
      .from("news")
      .select("*")
      .order("created_at", { ascending: false });

    if (data) {
      setNews(data);
      // Extract unique categories
      const uniqueCats = Array.from(new Set(data.map((item: any) => item.category))).filter(Boolean);
      setCategories(["All", ...uniqueCats]);
    }
    setLoading(false);
  }

  // Filter Logic
  const filteredNews = news.filter((item) => {
    const matchesSearch = item.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === "All" || item.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const featuredNews = filteredNews[0]; // The newest item
  const regularNews = filteredNews.slice(1); // The rest

  return (
    <div className="min-h-screen bg-[#F8FAFC] font-sans pt-24 pb-20">
      
      {/* --- HEADER & SEARCH --- */}
      <div className="max-w-7xl mx-auto px-6 mb-12">
        <div className="text-center mb-10">
            <span className="text-blue-600 font-extrabold text-xs tracking-widest uppercase mb-3 block">Updates & Announcements</span>
            <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 mb-6 tracking-tight">
              News<span className="text-blue-600">room</span>
            </h1>
            
            {/* Search Bar */}
            <div className="max-w-xl mx-auto relative group">
                <input 
                    type="text" 
                    placeholder="Search updates..." 
                    className="w-full bg-white border border-slate-200 text-slate-900 text-sm rounded-full pl-6 pr-12 py-4 shadow-sm outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
                <button className="absolute right-3 top-1/2 -translate-y-1/2 bg-slate-100 p-2 rounded-full text-slate-400 group-focus-within:text-blue-600 group-focus-within:bg-blue-50 transition-colors">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
                </button>
            </div>

            {/* Categories */}
            <div className="flex flex-wrap justify-center gap-2 mt-6">
                {categories.map((cat) => (
                    <button 
                        key={cat}
                        onClick={() => setSelectedCategory(cat)}
                        className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all border ${
                            selectedCategory === cat 
                            ? "bg-slate-900 text-white border-slate-900" 
                            : "bg-white text-slate-500 border-slate-200 hover:border-slate-400"
                        }`}
                    >
                        {cat}
                    </button>
                ))}
            </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6">
        {loading ? (
            <div className="animate-pulse space-y-8">
                <div className="h-96 bg-gray-200 rounded-3xl w-full"></div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <div className="h-64 bg-gray-200 rounded-2xl"></div>
                    <div className="h-64 bg-gray-200 rounded-2xl"></div>
                    <div className="h-64 bg-gray-200 rounded-2xl"></div>
                </div>
            </div>
        ) : filteredNews.length > 0 ? (
            <div className="space-y-12">
                
                {/* --- HERO: FEATURED NEWS --- */}
                {featuredNews && (
                    <div className="group relative bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden hover:shadow-xl transition-all duration-500">
                        <div className="grid grid-cols-1 lg:grid-cols-12 h-full">
                            <div className="lg:col-span-7 relative h-64 lg:h-auto overflow-hidden">
                                {featuredNews.image_url ? (
                                    <img src={featuredNews.image_url} alt={featuredNews.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                                ) : (
                                    <div className="w-full h-full bg-slate-100 flex items-center justify-center text-slate-300 font-bold text-xl">No Image</div>
                                )}
                                <div className="absolute top-4 left-4">
                                    <span className="bg-red-600 text-white text-[10px] font-extrabold px-3 py-1 rounded-full shadow-lg uppercase tracking-wide animate-pulse">Breaking</span>
                                </div>
                            </div>
                            <div className="lg:col-span-5 p-8 lg:p-12 flex flex-col justify-center">
                                <div className="flex items-center gap-3 mb-4 text-xs font-bold text-slate-400 uppercase tracking-wide">
                                    <span className="text-blue-600">{featuredNews.category}</span>
                                    <span>•</span>
                                    <span>{new Date(featuredNews.created_at).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}</span>
                                </div>
                                <h2 className="text-3xl font-extrabold text-slate-900 mb-4 leading-tight group-hover:text-blue-600 transition-colors">
                                    {featuredNews.title}
                                </h2>
                                <div className="text-slate-500 mb-8 line-clamp-3 leading-relaxed text-sm" dangerouslySetInnerHTML={{ __html: featuredNews.content?.substring(0, 200) + "..." }}></div>
                                <Link href={`/news/${featuredNews.id}`} className="inline-flex items-center text-blue-600 font-bold hover:underline">
                                    Read Full Story <span className="ml-2">→</span>
                                </Link>
                            </div>
                        </div>
                    </div>
                )}

                {/* --- GRID: OTHER NEWS --- */}
                {regularNews.length > 0 && (
                    <div>
                        <h3 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
                            More Stories <span className="text-slate-300 text-sm font-normal">({regularNews.length})</span>
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {regularNews.map((item) => (
                                <Link key={item.id} href={`/news/${item.id}`} className="group flex flex-col bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 h-full">
                                    <div className="h-48 bg-slate-100 relative overflow-hidden">
                                        {item.image_url ? (
                                            <img src={item.image_url} alt={item.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-slate-300 font-bold">No Image</div>
                                        )}
                                        <div className="absolute top-3 left-3">
                                            <span className="bg-white/90 backdrop-blur-sm text-slate-800 text-[10px] font-bold px-2 py-1 rounded shadow-sm">{item.category}</span>
                                        </div>
                                    </div>
                                    <div className="p-6 flex-1 flex flex-col">
                                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide mb-2 block">
                                            {new Date(item.created_at).toLocaleDateString()}
                                        </span>
                                        <h3 className="text-lg font-bold text-slate-900 mb-3 leading-snug group-hover:text-blue-600 transition-colors line-clamp-2">
                                            {item.title}
                                        </h3>
                                        <div className="text-slate-500 text-xs line-clamp-3 leading-relaxed mb-4 flex-1" dangerouslySetInnerHTML={{ __html: item.content }}></div>
                                        <span className="text-blue-600 text-xs font-bold mt-auto group-hover:underline">Read More →</span>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    </div>
                )}

            </div>
        ) : (
            /* EMPTY STATE */
            <div className="text-center py-32">
                <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-6 text-4xl">📰</div>
                <h3 className="text-xl font-bold text-slate-900">No updates found</h3>
                <p className="text-slate-500 mt-2">Try adjusting your search or category filter.</p>
                <button 
                    onClick={() => {setSearchTerm(""); setSelectedCategory("All");}}
                    className="mt-6 text-blue-600 font-bold hover:underline"
                >
                    Clear Filters
                </button>
            </div>
        )}
      </div>

    </div>
  );
}