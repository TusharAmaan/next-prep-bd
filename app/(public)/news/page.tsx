import Link from "next/link";
import { createClient } from "@/lib/supabaseServer";
import ProfessionalAppBanner from "@/components/ProfessionalAppBanner";
import { Search, Calendar, Clock, ChevronRight, Tag, ArrowRight, BookOpen, Share2, Eye, TrendingUp } from "lucide-react";
import BookmarkButton from "@/components/shared/BookmarkButton";
import NewsSidebar from "@/components/news/NewsSidebar";

export const dynamic = "force-dynamic";

const ITEMS_PER_PAGE = 10;

type Props = {
  searchParams: Promise<{ page?: string; category?: string; q?: string }>;
};

export default async function NewsPage({ searchParams }: Props) {
  const supabase = await createClient();
  const resolvedSearchParams = await searchParams;
  const { page = "1", category = "All", q = "" } = resolvedSearchParams;
  const currentPage = parseInt(page) || 1;

  // 1. DATA FETCHING
  const { data: distinctCategories } = await supabase
    .from("news")
    .select("category")
    .not("category", "is", null);

  const uniqueCategories = Array.from(new Set((distinctCategories || []).map((item) => item.category).filter(Boolean))).sort();
  const categoriesList = ["All", ...uniqueCategories as string[]];

  const { data: recentPostsRaw } = await supabase
    .from("news")
    .select("id, title, image_url, created_at")
    .order("created_at", { ascending: false })
    .limit(5);
  const recentPosts = (recentPostsRaw || []).map(p => ({ ...p, id: p.id.toString() }));

  let newsQuery = supabase
    .from("news")
    .select("id, title, category, created_at, image_url, content, seo_description", { count: "exact" })
    .order("created_at", { ascending: false });

  if (q) newsQuery = newsQuery.ilike("title", `%${q}%`);
  if (category !== "All") newsQuery = newsQuery.eq("category", category);

  const from = (currentPage - 1) * ITEMS_PER_PAGE;
  const { data: newsItems, count } = await newsQuery.range(from, from + ITEMS_PER_PAGE - 1);
  const news = (newsItems || []).map(item => ({ ...item, id: item.id.toString() }));
  
  const totalPages = count ? Math.ceil(count / ITEMS_PER_PAGE) : 0;

  const featuredPost = currentPage === 1 && !q && category === "All" && news?.length ? news[0] : null;
  const displayPosts = featuredPost ? news!.slice(1) : (news || []);

  const getReadTime = (text: string | null) => {
    if (!text) return "1 min read";
    const wpm = 200;
    const words = text.split(/\s+/).length;
    return `${Math.ceil(words / wpm)} min read`;
  };

  const formatDate = (dateStr: string) => {
    if (!dateStr) return "";
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return "";
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    return `${months[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()}`;
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans pb-20">
      
      <section className="relative pt-32 pb-24 bg-slate-900 border-b border-white/5 overflow-hidden">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-indigo-600/20 rounded-full blur-[120px] pointer-events-none -mr-40 -mt-20"></div>
        <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-blue-600/10 rounded-full blur-[80px] pointer-events-none -ml-20 -mb-10"></div>
        
        <div className="max-w-7xl mx-auto px-6 relative z-10 text-center">
            <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 text-xs font-black uppercase tracking-[0.2em] mb-6">
                <TrendingUp className="w-3.5 h-3.5" /> Stay Informed
            </span>
            <h1 className="text-4xl md:text-7xl font-black text-white mb-6 tracking-tight leading-[1.1]">
                Latest <span className="text-indigo-500">Insights</span> & Updates
            </h1>
            <p className="text-slate-400 text-lg md:text-xl max-w-2xl mx-auto leading-relaxed font-medium">
                Expert analysis, educational updates, and technical deep-dives to help you navigate your academic journey.
            </p>
        </div>
      </section>

      <main className="max-w-7xl mx-auto px-6 -mt-10 relative z-20">
        <div className="flex flex-col lg:flex-row gap-12">
          
          <div className="flex-1 min-w-0">
            
            {featuredPost && (
              <div className="mb-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <Link href={`/news/${featuredPost.id}`} className="group block bg-white rounded-[2.5rem] overflow-hidden shadow-2xl shadow-indigo-100/50 border border-slate-100 hover:shadow-indigo-200/50 transition-all duration-500">
                   <div className="relative aspect-[21/9] overflow-hidden">
                      {featuredPost.image_url ? (
                        <img src={featuredPost.image_url} alt={featuredPost.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                      ) : (
                        <div className="w-full h-full bg-slate-100 flex items-center justify-center text-slate-300"><BookOpen className="w-16 h-16"/></div>
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent"></div>
                      <div className="absolute bottom-0 left-0 p-8 md:p-12 w-full">
                         <span className="bg-indigo-600 text-white text-[10px] font-black px-4 py-1.5 rounded-full shadow-lg uppercase tracking-widest mb-4 inline-block">{featuredPost.category}</span>
                         <h2 className="text-2xl md:text-4xl font-black text-white hover:text-indigo-300 transition-colors leading-tight mb-4">{featuredPost.title}</h2>
                         <div className="flex items-center gap-6 text-white/70 text-xs font-bold uppercase tracking-wider">
                            <span className="flex items-center gap-2"><Calendar className="w-3.5 h-3.5 text-indigo-400"/> {formatDate(featuredPost.created_at)}</span>
                            <span className="flex items-center gap-2"><Clock className="w-3.5 h-3.5 text-indigo-400"/> {getReadTime(featuredPost.content)}</span>
                         </div>
                      </div>
                      <div className="absolute top-8 right-8">
                         <BookmarkButton itemType="news" itemId={featuredPost.id.toString()} metadata={{ title: featuredPost.title }} />
                      </div>
                   </div>
                </Link>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {displayPosts.map((post) => (
                <article key={post.id} className="bg-white rounded-[2rem] overflow-hidden border border-slate-100 shadow-sm hover:shadow-xl hover:-translate-y-1.5 transition-all duration-300 flex flex-col group">
                   <Link href={`/news/${post.id}`} className="block relative aspect-video overflow-hidden">
                      {post.image_url ? (
                        <img src={post.image_url} alt={post.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                      ) : (
                        <div className="w-full h-full bg-slate-50 flex items-center justify-center text-slate-300"><Tag className="w-12 h-12"/></div>
                      )}
                      <div className="absolute top-4 left-4">
                        <span className="bg-white/95 backdrop-blur-sm text-slate-900 text-[10px] font-black px-3 py-1 rounded-full shadow-lg uppercase tracking-widest">{post.category}</span>
                      </div>
                   </Link>
                   <div className="p-8 flex-1 flex flex-col">
                      <div className="flex items-center gap-4 text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">
                         <span>{formatDate(post.created_at)}</span>
                         <span className="w-1 h-1 bg-indigo-500 rounded-full"></span>
                         <span>{getReadTime(post.content)}</span>
                      </div>
                      <Link href={`/news/${post.id}`}>
                        <h3 className="text-xl font-bold text-slate-900 mb-4 line-clamp-2 leading-snug group-hover:text-indigo-600 transition-colors">{post.title}</h3>
                      </Link>
                      <p className="text-slate-500 text-sm leading-relaxed mb-6 line-clamp-3 font-medium">{post.seo_description || "Explore deeper insights and comprehensive updates on this topic in our latest article segment."}</p>
                      
                      <div className="mt-auto pt-6 border-t border-slate-50 flex items-center justify-between">
                         <Link href={`/news/${post.id}`} className="flex items-center gap-2 text-indigo-600 font-black text-xs uppercase tracking-widest hover:text-indigo-700">
                            Read More <ArrowRight className="w-3.5 h-3.5" />
                         </Link>
                         <div className="flex items-center gap-3">
                            <BookmarkButton itemType="news" itemId={post.id.toString()} metadata={{ title: post.title }} />
                            <div className="p-2 text-slate-400"><Share2 className="w-4 h-4"/></div>
                         </div>
                      </div>
                   </div>
                </article>
              ))}
            </div>

            <div className="flex justify-center gap-3 mt-12">
               {totalPages > 1 && Array.from({length: totalPages}, (_, i) => i + 1).map(p => (
                 <Link 
                   key={p} 
                   href={`/news?category=${category}&page=${p}&q=${q}`}
                   className={`w-12 h-12 rounded-2xl flex items-center justify-center font-black text-sm transition-all ${
                     p === currentPage 
                     ? "bg-indigo-600 text-white shadow-lg shadow-indigo-100 scale-110" 
                     : "bg-white text-slate-500 border border-slate-100 hover:bg-slate-50 hover:text-indigo-600"
                   }`}
                 >
                   {p}
                 </Link>
               ))}
            </div>
          </div>

          <div className="w-full lg:w-80 shrink-0">
             <NewsSidebar 
               categories={categoriesList} 
               recentPosts={recentPosts}
               activeCategory={category}
             />
          </div>
        </div>

        <div className="mt-20">
           <ProfessionalAppBanner />
        </div>
      </main>
    </div>
  );
}