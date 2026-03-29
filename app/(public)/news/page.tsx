import Link from "next/link";
import { createClient } from "@/lib/supabaseServer";
import ProfessionalAppBanner from "@/components/ProfessionalAppBanner";
import { Search, Calendar, Clock, ChevronRight, Tag, ArrowRight, BookOpen, Share2, Eye, TrendingUp } from "lucide-react";
import BookmarkButton from "@/components/shared/BookmarkButton";
import NewsSidebar from "@/components/news/NewsSidebar";
import Footer from "@/components/Footer";

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
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 font-sans pb-20 transition-colors duration-300">
      
      <section className="relative pt-32 pb-24 bg-slate-900 border-b border-white/5 overflow-hidden">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-indigo-600/20 rounded-full blur-[120px] pointer-events-none -mr-40 -mt-20"></div>
        <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-blue-600/10 rounded-full blur-[80px] pointer-events-none -ml-20 -mb-10"></div>
        
        <div className="max-w-7xl mx-auto px-6 relative z-10 text-center">
            <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 text-[10px] font-black uppercase tracking-[0.2em] mb-6">
                <TrendingUp className="w-3.5 h-3.5" /> Stay Informed
            </span>
            <h1 className="text-4xl md:text-7xl font-black text-white mb-6 uppercase tracking-tight leading-[1.1]">
                Latest <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-violet-400">Insights</span> & Updates
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
              <div className="mb-12">
                <Link href={`/news/${featuredPost.id}`} className="group block bg-white dark:bg-slate-900 rounded-[2.5rem] overflow-hidden shadow-2xl dark:shadow-indigo-900/10 border border-slate-100 dark:border-slate-800 hover:shadow-indigo-200/50 transition-all duration-500">
                   <div className="relative aspect-[21/9] overflow-hidden">
                      {featuredPost.image_url ? (
                        <img src={featuredPost.image_url} alt={featuredPost.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                      ) : (
                        <div className="w-full h-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-300 dark:text-slate-600"><BookOpen className="w-16 h-16"/></div>
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/20 to-transparent"></div>
                      <div className="absolute bottom-0 left-0 p-8 md:p-12 w-full">
                         <span className="bg-indigo-600 text-white text-[10px] font-black px-4 py-1.5 rounded-full shadow-lg uppercase tracking-widest mb-4 inline-block">{featuredPost.category}</span>
                         <h2 className="text-2xl md:text-4xl font-black text-white hover:text-indigo-300 transition-colors uppercase tracking-tight leading-tight mb-4">{featuredPost.title}</h2>
                         <div className="flex items-center gap-6 text-white/70 text-[10px] font-black uppercase tracking-widest">
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
                <article key={post.id} className="bg-white dark:bg-slate-900 rounded-[2.5rem] overflow-hidden border border-slate-100 dark:border-slate-800 shadow-sm hover:shadow-2xl dark:hover:shadow-indigo-900/10 hover:-translate-y-2 transition-all duration-500 flex flex-col group">
                   <Link href={`/news/${post.id}`} className="block relative aspect-video overflow-hidden">
                      {post.image_url ? (
                        <img src={post.image_url} alt={post.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                      ) : (
                        <div className="w-full h-full bg-slate-50 dark:bg-slate-800 flex items-center justify-center text-slate-300 dark:text-slate-600"><Tag className="w-12 h-12"/></div>
                      )}
                      <div className="absolute top-5 left-5">
                        <span className="bg-white/95 dark:bg-slate-900/95 backdrop-blur-sm text-slate-900 dark:text-white text-[10px] font-black px-3 py-1.5 rounded-full shadow-lg uppercase tracking-widest border border-slate-100/10">{post.category}</span>
                      </div>
                   </Link>
                   <div className="p-8 md:p-10 flex-1 flex flex-col">
                      <div className="flex items-center gap-4 text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-5">
                         <span>{formatDate(post.created_at)}</span>
                         <span className="w-1 h-1 bg-indigo-500 rounded-full"></span>
                         <span>{getReadTime(post.content)}</span>
                      </div>
                      <Link href={`/news/${post.id}`}>
                        <h3 className="text-xl font-black text-slate-900 dark:text-white mb-4 line-clamp-2 leading-tight group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors uppercase tracking-tight">{post.title}</h3>
                      </Link>
                      <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed mb-8 line-clamp-3 font-medium">{post.seo_description || "Explore deeper insights and comprehensive updates on this topic in our latest article segment."}</p>
                      
                      <div className="mt-auto pt-6 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                         <Link href={`/news/${post.id}`} className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400 font-black text-[10px] uppercase tracking-[0.2em] hover:text-indigo-700 dark:hover:text-indigo-300 transition-colors">
                            Read More <ArrowRight className="w-3.5 h-3.5" />
                         </Link>
                         <div className="flex items-center gap-3">
                            <BookmarkButton itemType="news" itemId={post.id.toString()} metadata={{ title: post.title }} />
                            <div className="p-2 text-slate-400 hover:text-indigo-500 transition-colors cursor-pointer"><Share2 className="w-4 h-4"/></div>
                         </div>
                      </div>
                   </div>
                </article>
              ))}
            </div>

            <div className="flex justify-center gap-3 mt-16">
               {totalPages > 1 && Array.from({length: totalPages}, (_, i) => i + 1).map(p => (
                 <Link 
                   key={p} 
                   href={`/news?category=${category}&page=${p}&q=${q}`}
                   className={`w-12 h-12 rounded-2xl flex items-center justify-center font-black text-xs transition-all ${
                     p === currentPage 
                     ? "bg-indigo-600 text-white shadow-xl shadow-indigo-600/20 scale-110" 
                     : "bg-white dark:bg-slate-900 text-slate-500 dark:text-slate-500 border border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-indigo-600"
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

        <div className="mt-24">
           <ProfessionalAppBanner />
        </div>
      </main>

      <Footer />
    </div>
  );
}