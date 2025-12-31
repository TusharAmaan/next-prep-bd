import Link from "next/link";
import { supabase } from "@/lib/supabaseClient";
import ProfessionalAppBanner from "@/components/ProfessionalAppBanner";
import { Search, Calendar, Clock, ChevronRight, Tag, ArrowRight, BookOpen } from "lucide-react";

export const dynamic = "force-dynamic";

const ITEMS_PER_PAGE = 12;

type Props = {
  searchParams: Promise<{ page?: string; category?: string; q?: string }>;
};

export default async function NewsPage({ searchParams }: Props) {
  // Await searchParams before accessing properties
  const { page = "1", category = "All", q = "" } = await searchParams;
  const currentPage = parseInt(page) || 1;

  // 1. SMART CATEGORY FETCH
  const { data: distinctCategories } = await supabase
    .from("news")
    .select("category")
    .not("category", "is", null);

  const uniqueCategories = Array.from(new Set(distinctCategories?.map((item) => item.category))).sort();
  const categories = ["All", ...uniqueCategories];

  // 2. BUILD MAIN QUERY
  let query = supabase
    .from("news")
    .select("id, title, category, created_at, image_url, content, seo_description", { count: "exact" })
    .order("created_at", { ascending: false });

  if (q) query = query.ilike("title", `%${q}%`);
  if (category !== "All") query = query.eq("category", category);

  // Pagination
  const from = (currentPage - 1) * ITEMS_PER_PAGE;
  const to = from + ITEMS_PER_PAGE - 1;

  const { data: news, count } = await query.range(from, to);
  const totalPages = count ? Math.ceil(count / ITEMS_PER_PAGE) : 0;

  // 3. FEATURED LOGIC (Page 1 only, no filters)
  const isDefaultView = currentPage === 1 && !q && category === "All";
  const featuredNews = isDefaultView && news && news.length > 0 ? news[0] : null;
  const regularNews = featuredNews ? news!.slice(1) : (news || []);

  const getReadTime = (text: string) => {
    const wpm = 200;
    const words = text ? text.split(/\s+/).length : 0;
    const time = Math.ceil(words / wpm);
    return `${time} min read`;
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans">
      
      {/* --- 1. DARK CONTRASTY HEADER --- */}
      <div className="bg-slate-900 text-white pt-32 pb-24 relative overflow-hidden">
        
        {/* Background Decorative Pattern */}
        <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
             <div className="absolute right-0 top-0 w-96 h-96 bg-blue-500 rounded-full blur-[100px] translate-x-1/2 -translate-y-1/2"></div>
             <div className="absolute left-0 bottom-0 w-64 h-64 bg-indigo-500 rounded-full blur-[80px] -translate-x-1/2 translate-y-1/2"></div>
        </div>

        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8">
            
            {/* Title Section */}
            <div className="max-w-3xl">
              <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-900/50 border border-blue-700 text-blue-300 text-xs font-bold uppercase tracking-wider mb-6">
                <span className="w-2 h-2 rounded-full bg-blue-400 animate-pulse"></span>
                Newsroom & Insights
              </span>
              <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-4 leading-tight">
                Discover the Latest <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-400">Updates & Knowledge</span>
              </h1>
              <p className="text-slate-400 text-lg md:text-xl max-w-2xl leading-relaxed">
                Stay ahead with our latest articles, tutorials, and platform announcements curated just for you.
              </p>
            </div>

            {/* Search Input (Dark Mode Style) */}
            <form className="w-full lg:w-96 relative group">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-slate-500 group-focus-within:text-blue-400 transition-colors" />
              </div>
              <input
                type="text"
                name="q"
                defaultValue={q}
                placeholder="Search articles..."
                className="block w-full pl-11 pr-4 py-4 bg-slate-800 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all shadow-lg"
              />
            </form>
          </div>

          {/* Categories (Dark Mode Pills) */}
          <div className="flex items-center gap-3 overflow-x-auto py-8 mt-6 no-scrollbar mask-gradient-dark">
            {categories.map((cat) => (
              <Link 
                key={cat}
                href={`/news?category=${cat}&page=1`}
                className={`whitespace-nowrap px-5 py-2.5 rounded-full text-sm font-semibold transition-all border flex items-center gap-2 ${
                  category === cat 
                    ? "bg-white text-slate-900 border-white shadow-[0_0_20px_rgba(255,255,255,0.3)]" 
                    : "bg-slate-800/50 text-slate-400 border-slate-700 hover:bg-slate-800 hover:text-white hover:border-slate-500"
                }`}
              >
                {category === cat && <Tag className="w-3.5 h-3.5" />}
                {cat}
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* --- CONTENT CONTAINER (Lifts up to overlap header) --- */}
      <div className="max-w-7xl mx-auto px-6 -mt-12 relative z-20 pb-20">

        {/* --- 2. FEATURED HERO CARD (Optimized Image Ratio) --- */}
        {featuredNews && (
          <div className="mb-16">
            <Link href={`/news/${featuredNews.id}`} className="group block bg-white rounded-3xl overflow-hidden shadow-2xl shadow-slate-900/10 border border-slate-100 hover:shadow-blue-900/20 transition-all duration-500">
              <div className="grid grid-cols-1 lg:grid-cols-2">
                
                {/* IMAGE SIDE - Fixed Aspect Ratio (16:9 on desktop mostly) */}
                <div className="relative w-full h-64 lg:h-auto lg:min-h-[400px] overflow-hidden">
                   {featuredNews.image_url ? (
                     <img 
                       src={featuredNews.image_url} 
                       alt={featuredNews.title} 
                       // aspect-video forces 16:9 ratio, object-cover prevents stretching
                       className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-700" 
                     />
                   ) : (
                     <div className="w-full h-full bg-slate-100 flex items-center justify-center">
                        <BookOpen className="w-16 h-16 text-slate-300" />
                     </div>
                   )}
                   <div className="absolute top-6 left-6">
                      <span className="bg-blue-600/90 backdrop-blur-sm text-white text-xs font-bold px-4 py-1.5 rounded-full shadow-lg uppercase tracking-wider flex items-center gap-2">
                        <span className="w-2 h-2 bg-white rounded-full animate-pulse"/> Featured
                      </span>
                   </div>
                </div>

                {/* CONTENT SIDE */}
                <div className="p-8 lg:p-12 flex flex-col justify-center">
                   <div className="flex items-center gap-4 text-xs font-bold text-slate-500 mb-4 uppercase tracking-wider">
                      <span className="text-blue-600 bg-blue-50 px-3 py-1 rounded-full">{featuredNews.category}</span>
                      <span>{new Date(featuredNews.created_at).toLocaleDateString()}</span>
                   </div>

                   <h2 className="text-3xl lg:text-4xl font-extrabold text-slate-900 mb-6 leading-tight group-hover:text-blue-600 transition-colors">
                     {featuredNews.title}
                   </h2>

                   <p className="text-slate-500 text-lg mb-8 line-clamp-3 leading-relaxed">
                     {featuredNews.seo_description || "Read the full story to learn more about this topic..."}
                   </p>

                   <div className="mt-auto flex items-center justify-between pt-6 border-t border-slate-100">
                      <div className="flex items-center gap-2 text-sm font-semibold text-slate-400">
                         <Clock className="w-4 h-4"/>
                         {getReadTime(featuredNews.content)}
                      </div>
                      <span className="flex items-center text-blue-600 font-bold group-hover:translate-x-2 transition-transform">
                        Read Full Story <ArrowRight className="w-5 h-5 ml-2" />
                      </span>
                   </div>
                </div>
              </div>
            </Link>
          </div>
        )}

        {/* --- RESULTS INFO --- */}
        {count !== null && (
          <div className="flex items-center justify-between mb-8 pb-4 border-b border-slate-200">
            <h3 className="text-2xl font-bold text-slate-900">
              {q ? `Results for "${q}"` : "Latest Articles"}
            </h3>
            <span className="text-sm font-semibold text-slate-500 bg-white px-3 py-1 rounded-full border border-slate-200 shadow-sm">
              {news?.length || 0} of {count}
            </span>
          </div>
        )}

        {/* --- 3. MAIN GRID (Optimized Card Images) --- */}
        {regularNews.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
            {regularNews.map((item) => (
              <Link key={item.id} href={`/news/${item.id}`} className="group flex flex-col bg-white rounded-2xl overflow-hidden shadow-sm border border-slate-200 hover:shadow-xl hover:border-blue-100 hover:-translate-y-1 transition-all duration-300">
                
                {/* THUMBNAIL CONTAINER - Fixed Height */}
                <div className="relative h-52 overflow-hidden bg-slate-100">
                  {item.image_url ? (
                    <img 
                      src={item.image_url} 
                      alt={item.title} 
                      // h-full w-full object-cover ensures it fills the 52 unit height perfectly
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" 
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-slate-300">
                      <Tag className="w-10 h-10" />
                    </div>
                  )}
                  <div className="absolute top-4 left-4">
                     <span className="bg-white/95 backdrop-blur text-slate-900 text-[10px] font-bold px-3 py-1 rounded-full shadow-sm">
                       {item.category}
                     </span>
                  </div>
                </div>

                {/* CARD BODY */}
                <div className="p-6 flex-1 flex flex-col">
                   <div className="flex items-center gap-3 mb-3 text-[11px] font-bold text-slate-400 uppercase">
                      <span>{new Date(item.created_at).toLocaleDateString()}</span>
                      <span className="w-1 h-1 rounded-full bg-slate-300"></span>
                      <span>{getReadTime(item.content)}</span>
                   </div>

                   <h3 className="text-lg font-bold text-slate-900 mb-3 leading-snug group-hover:text-blue-600 transition-colors line-clamp-2">
                     {item.title}
                   </h3>
                   
                   <p className="text-slate-500 text-sm line-clamp-3 leading-relaxed mb-6 flex-1">
                     {item.seo_description}
                   </p>
                   
                   <div className="flex items-center text-blue-600 text-sm font-bold mt-auto group-hover:underline decoration-2 underline-offset-4">
                     Read Article
                   </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          !featuredNews && (
            <div className="text-center py-24 bg-white rounded-3xl border border-dashed border-slate-300">
               <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-400">
                 <Search className="w-8 h-8" />
               </div>
               <h3 className="text-lg font-bold text-slate-900">No articles found</h3>
               <p className="text-slate-500 mt-2 mb-6">Try adjusting your search or filters.</p>
               {category !== "All" || q ? (
                 <Link href="/news" className="px-6 py-2 bg-slate-900 text-white rounded-full font-bold hover:bg-slate-800 transition">Clear Filters</Link>
               ) : null}
            </div>
          )
        )}

        {/* --- PAGINATION --- */}
        {totalPages > 1 && (
          <div className="flex justify-center items-center gap-3">
             {/* Previous Button */}
             <Link 
               href={`/news?category=${category}&page=${Math.max(1, currentPage - 1)}&q=${q}`}
               className={`p-3 rounded-full border transition-all ${
                 currentPage <= 1 
                 ? 'opacity-50 pointer-events-none border-slate-200 bg-slate-50 text-slate-300' 
                 : 'border-slate-300 bg-white hover:border-blue-500 hover:text-blue-600'
               }`}
             >
               <ChevronRight className="w-5 h-5 rotate-180" />
             </Link>

             <span className="px-6 py-2 rounded-full bg-white border border-slate-200 text-sm font-bold text-slate-700">
               Page {currentPage} of {totalPages}
             </span>

             {/* Next Button */}
             <Link 
               href={`/news?category=${category}&page=${Math.min(totalPages, currentPage + 1)}&q=${q}`}
               className={`p-3 rounded-full border transition-all ${
                 currentPage >= totalPages 
                 ? 'opacity-50 pointer-events-none border-slate-200 bg-slate-50 text-slate-300' 
                 : 'border-slate-300 bg-white hover:border-blue-500 hover:text-blue-600'
               }`}
             >
               <ChevronRight className="w-5 h-5" />
             </Link>
          </div>
        )}

        <div className="mt-20">
            <ProfessionalAppBanner />
        </div>

      </div>
    </div>
  );
}