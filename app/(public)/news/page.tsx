import Link from "next/link";
import { supabase } from "@/lib/supabaseClient";
import ProfessionalAppBanner from "@/components/ProfessionalAppBanner";
import { Search, Calendar, Clock, ChevronRight, Tag, ArrowRight } from "lucide-react";

export const dynamic = "force-dynamic";

const ITEMS_PER_PAGE = 12; // Adjusted to 12 for better grid alignment (divisible by 2 and 3)

type Props = {
  searchParams: Promise<{ page?: string; category?: string; q?: string }>;
};

export default async function NewsPage({ searchParams }: Props) {
  // Await searchParams before accessing properties
  const { page = "1", category = "All", q = "" } = await searchParams;
  const currentPage = parseInt(page) || 1;

  // 1. SMART CATEGORY FETCH
  // We fetch distinct categories actually used in the 'news' table to avoid empty filters.
  const { data: distinctCategories } = await supabase
    .from("news")
    .select("category")
    .not("category", "is", null);

  // De-duplicate categories in Javascript
  const uniqueCategories = Array.from(new Set(distinctCategories?.map((item) => item.category))).sort();
  const categories = ["All", ...uniqueCategories];

  // 2. BUILD MAIN QUERY
  let query = supabase
    .from("news")
    .select("id, title, category, created_at, image_url, content, seo_description", { count: "exact" })
    .order("created_at", { ascending: false });

  // Apply Search Filter
  if (q) {
    query = query.ilike("title", `%${q}%`);
  }

  // Apply Category Filter
  if (category !== "All") {
    query = query.eq("category", category);
  }

  // Apply Pagination
  const from = (currentPage - 1) * ITEMS_PER_PAGE;
  const to = from + ITEMS_PER_PAGE - 1;

  const { data: news, count } = await query.range(from, to);
  const totalPages = count ? Math.ceil(count / ITEMS_PER_PAGE) : 0;

  // 3. FEATURED LOGIC
  // Show featured article ONLY on the first page, when no specific search/filter is active
  const isDefaultView = currentPage === 1 && !q && category === "All";
  const featuredNews = isDefaultView && news && news.length > 0 ? news[0] : null;
  
  // If we have a featured item, remove it from the regular grid list
  const regularNews = featuredNews ? news!.slice(1) : (news || []);

  // Helper to calculate read time
  const getReadTime = (text: string) => {
    const wpm = 200;
    const words = text ? text.split(/\s+/).length : 0;
    const time = Math.ceil(words / wpm);
    return `${time} min read`;
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] font-sans pt-28 pb-20">
      
      {/* --- HEADER SECTION --- */}
      <div className="max-w-7xl mx-auto px-6 mb-12">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-8 border-b border-slate-200">
            
            {/* Title */}
            <div className="max-w-2xl">
                <span className="text-blue-600 font-extrabold text-xs tracking-widest uppercase mb-3 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse"></span>
                    Newsroom & Updates
                </span>
                <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 tracking-tight leading-tight">
                    Latest <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">Insights</span>
                </h1>
                <p className="mt-3 text-slate-500 text-lg">
                    Stay informed with our latest announcements, educational tips, and platform updates.
                </p>
            </div>

            {/* Search Bar */}
            <form className="w-full md:w-auto min-w-[300px] relative group">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Search className="h-4 w-4 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
                </div>
                <input
                    type="text"
                    name="q"
                    defaultValue={q}
                    placeholder="Search articles..."
                    className="block w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-xl text-sm placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all shadow-sm"
                />
            </form>
        </div>

        {/* Categories Filter Scrollable Bar */}
        <div className="flex items-center gap-2 overflow-x-auto py-6 no-scrollbar mask-gradient">
            {categories.map((cat) => (
                <Link 
                    key={cat}
                    href={`/news?category=${cat}&page=1`}
                    className={`whitespace-nowrap px-5 py-2 rounded-full text-xs font-bold transition-all border flex items-center gap-2 ${
                        category === cat 
                        ? "bg-slate-900 text-white border-slate-900 shadow-md shadow-slate-900/20" 
                        : "bg-white text-slate-600 border-slate-200 hover:border-blue-300 hover:text-blue-600 hover:shadow-sm"
                    }`}
                >
                    {category === cat && <Tag className="w-3 h-3" />}
                    {cat}
                </Link>
            ))}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6">
        
        {/* --- FEATURED HERO (Only on Page 1) --- */}
        {featuredNews && (
            <div className="mb-16 relative group">
                <Link href={`/news/${featuredNews.id}`} className="block relative rounded-3xl overflow-hidden shadow-xl shadow-slate-200/50 hover:shadow-2xl hover:shadow-blue-900/10 transition-all duration-500 bg-white border border-slate-100">
                    <div className="grid grid-cols-1 lg:grid-cols-12 min-h-[450px]">
                        {/* Image Side */}
                        <div className="lg:col-span-7 relative overflow-hidden h-64 lg:h-auto">
                            {featuredNews.image_url ? (
                                <>
                                    <div className="absolute inset-0 bg-slate-900/10 z-10 group-hover:bg-transparent transition-colors duration-500" />
                                    <img 
                                        src={featuredNews.image_url} 
                                        alt={featuredNews.title} 
                                        className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-700" 
                                    />
                                </>
                            ) : (
                                <div className="w-full h-full bg-slate-100 flex items-center justify-center">
                                    <span className="text-slate-300 font-bold text-2xl">NextPrep News</span>
                                </div>
                            )}
                            <div className="absolute top-5 left-5 z-20">
                                <span className="bg-blue-600 text-white text-[10px] font-extrabold px-3 py-1.5 rounded-full shadow-lg uppercase tracking-wider flex items-center gap-1.5">
                                    <span className="relative flex h-2 w-2">
                                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
                                      <span className="relative inline-flex rounded-full h-2 w-2 bg-white"></span>
                                    </span>
                                    Featured
                                </span>
                            </div>
                        </div>

                        {/* Content Side */}
                        <div className="lg:col-span-5 p-8 lg:p-12 flex flex-col justify-center relative bg-white">
                            <div className="flex items-center gap-4 mb-5 text-xs font-bold text-slate-400 uppercase tracking-wide">
                                <span className="text-blue-600 bg-blue-50 px-2 py-1 rounded-md">{featuredNews.category}</span>
                                <span className="flex items-center gap-1"><Calendar className="w-3 h-3"/> {new Date(featuredNews.created_at).toLocaleDateString()}</span>
                            </div>
                            
                            <h2 className="text-3xl lg:text-4xl font-extrabold text-slate-900 mb-4 leading-tight group-hover:text-blue-600 transition-colors">
                                {featuredNews.title}
                            </h2>
                            
                            <p className="text-slate-500 mb-8 line-clamp-3 leading-relaxed text-sm lg:text-base">
                                {featuredNews.seo_description || "Click to read the full story about this update..."}
                            </p>
                            
                            <div className="flex items-center justify-between mt-auto pt-6 border-t border-slate-100 w-full">
                                <div className="flex items-center gap-2 text-xs font-bold text-slate-500">
                                    <Clock className="w-3 h-3" />
                                    {getReadTime(featuredNews.content)}
                                </div>
                                <span className="flex items-center text-blue-600 font-bold text-sm group-hover:translate-x-1 transition-transform">
                                    Read Story <ArrowRight className="w-4 h-4 ml-2" />
                                </span>
                            </div>
                        </div>
                    </div>
                </Link>
            </div>
        )}

        {/* --- RESULTS INFO --- */}
        {count !== null && (
            <div className="flex items-center justify-between mb-6 text-xs font-bold text-slate-400 uppercase tracking-wider">
                <span>Showing {news?.length || 0} of {count} Articles</span>
                {q && <span>Results for "{q}"</span>}
            </div>
        )}

        {/* --- MAIN GRID --- */}
        {regularNews.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
                {regularNews.map((item) => (
                    <Link key={item.id} href={`/news/${item.id}`} className="group flex flex-col bg-white rounded-2xl border border-slate-100 overflow-hidden shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 h-full">
                        
                        {/* Thumbnail */}
                        <div className="h-52 bg-slate-100 relative overflow-hidden">
                            {item.image_url ? (
                                <img src={item.image_url} alt={item.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center bg-slate-50 text-slate-300">
                                    <Tag className="w-10 h-10 opacity-20" />
                                </div>
                            )}
                            <div className="absolute top-3 left-3">
                                <span className="bg-white/95 backdrop-blur text-slate-900 text-[10px] font-extrabold px-2.5 py-1 rounded-lg shadow-sm">
                                    {item.category}
                                </span>
                            </div>
                        </div>

                        {/* Content */}
                        <div className="p-6 flex-1 flex flex-col">
                            <div className="flex items-center gap-3 mb-3 text-[10px] font-bold text-slate-400 uppercase tracking-wide">
                                <span className="flex items-center gap-1">
                                    <Calendar className="w-3 h-3" />
                                    {new Date(item.created_at).toLocaleDateString()}
                                </span>
                                <span className="w-1 h-1 rounded-full bg-slate-300" />
                                <span className="flex items-center gap-1">
                                    <Clock className="w-3 h-3" />
                                    {getReadTime(item.content)}
                                </span>
                            </div>

                            <h3 className="text-lg font-bold text-slate-900 mb-3 leading-snug group-hover:text-blue-600 transition-colors line-clamp-2">
                                {item.title}
                            </h3>
                            
                            <p className="text-slate-500 text-xs line-clamp-3 leading-relaxed mb-5 flex-1">
                                {item.seo_description}
                            </p>
                            
                            <div className="flex items-center text-blue-600 text-xs font-extrabold mt-auto group-hover:underline decoration-2 underline-offset-4">
                                Read Article
                            </div>
                        </div>
                    </Link>
                ))}
            </div>
        ) : (
            /* --- EMPTY STATE --- */
            !featuredNews && (
                <div className="text-center py-24 bg-white rounded-3xl border border-dashed border-slate-200 max-w-2xl mx-auto">
                    <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-400">
                        <Search className="w-6 h-6" />
                    </div>
                    <h3 className="text-lg font-bold text-slate-900">No articles found</h3>
                    <p className="text-slate-500 text-sm mt-1 mb-6">
                        We couldn't find any news matching your criteria.
                    </p>
                    {category !== "All" || q ? (
                        <Link href="/news" className="inline-flex items-center justify-center px-6 py-2 bg-slate-900 text-white rounded-full text-sm font-bold hover:bg-blue-600 transition-colors">
                            Clear Filters
                        </Link>
                    ) : null}
                </div>
            )
        )}

        {/* --- PAGINATION --- */}
        {totalPages > 1 && (
            <div className="flex justify-center items-center gap-2 mb-20">
                <Link 
                    href={`/news?category=${category}&page=${Math.max(1, currentPage - 1)}&q=${q}`}
                    className={`p-3 rounded-full border flex items-center justify-center transition-all ${
                        currentPage <= 1 
                        ? 'opacity-40 pointer-events-none border-slate-200 bg-slate-50' 
                        : 'border-slate-200 bg-white hover:border-blue-500 hover:text-blue-600 shadow-sm'
                    }`}
                >
                    <ChevronRight className="w-5 h-5 rotate-180" />
                </Link>

                <div className="px-6 py-3 rounded-full bg-white border border-slate-200 text-sm font-bold text-slate-700 shadow-sm">
                    Page <span className="text-blue-600">{currentPage}</span> of {totalPages}
                </div>

                <Link 
                    href={`/news?category=${category}&page=${Math.min(totalPages, currentPage + 1)}&q=${q}`}
                    className={`p-3 rounded-full border flex items-center justify-center transition-all ${
                        currentPage >= totalPages 
                        ? 'opacity-40 pointer-events-none border-slate-200 bg-slate-50' 
                        : 'border-slate-200 bg-white hover:border-blue-500 hover:text-blue-600 shadow-sm'
                    }`}
                >
                    <ChevronRight className="w-5 h-5" />
                </Link>
            </div>
        )}

        {/* --- BANNER --- */}
        <ProfessionalAppBanner />

      </div>
    </div>
  );
}