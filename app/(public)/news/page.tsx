import Link from "next/link";
import { supabase } from "@/lib/supabaseClient";
import ProfessionalAppBanner from "@/components/ProfessionalAppBanner"; 

export const dynamic = "force-dynamic";

const ITEMS_PER_PAGE = 20;

type Props = {
  searchParams: Promise<{ page?: string; category?: string; q?: string }>;
};

export default async function NewsPage({ searchParams }: Props) {
  const { page = "1", category = "All", q = "" } = await searchParams;
  const currentPage = parseInt(page) || 1;

  // 1. Fetch Categories for the Filter Bar
  const { data: categoriesData } = await supabase.from("categories").select("name").order("name");
  const categories = ["All", ...(categoriesData?.map(c => c.name) || [])];

  // 2. Build Query
  let query = supabase
    .from("news")
    .select("id, title, category, created_at, image_url, content, seo_description", { count: "exact" })
    .order("created_at", { ascending: false });

  // Apply Search
  if (q) query = query.ilike("title", `%${q}%`);
  
  // Apply Category Filter
  if (category !== "All") query = query.eq("category", category);

  // Apply Pagination
  const from = (currentPage - 1) * ITEMS_PER_PAGE;
  const to = from + ITEMS_PER_PAGE - 1;
  
  const { data: news, count } = await query.range(from, to);
  const totalPages = count ? Math.ceil(count / ITEMS_PER_PAGE) : 0;

  // 3. Logic for "Featured News"
  // We only show the big featured card on Page 1 with no search filters active
  const showFeatured = currentPage === 1 && !q && category === "All" && news && news.length > 0;
  
  const featuredNews = showFeatured ? news![0] : null;
  const regularNews = showFeatured ? news!.slice(1) : (news || []);

  return (
    <div className="min-h-screen bg-[#F8FAFC] font-sans pt-32 pb-20">
      
      {/* HEADER */}
      <div className="max-w-7xl mx-auto px-6 mb-12 text-center">
        <span className="text-blue-600 font-extrabold text-xs tracking-widest uppercase mb-3 block">Updates & Announcements</span>
        <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 mb-8 tracking-tight">
            News<span className="text-blue-600">room</span>
        </h1>

        {/* Categories / Filter Bar */}
        <div className="flex flex-wrap justify-center gap-2">
            {categories.map((cat) => (
                <Link 
                    key={cat}
                    href={`/news?category=${cat}&page=1`}
                    className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all border ${
                        category === cat 
                        ? "bg-slate-900 text-white border-slate-900" 
                        : "bg-white text-slate-500 border-slate-200 hover:border-slate-400 hover:text-slate-900"
                    }`}
                >
                    {cat}
                </Link>
            ))}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6">
        
        {/* HERO: FEATURED NEWS (Only on Page 1) */}
        {featuredNews && (
            <div className="mb-16 group relative bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden hover:shadow-xl transition-all duration-500">
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
                            <span>{new Date(featuredNews.created_at).toLocaleDateString()}</span>
                        </div>
                        <h2 className="text-3xl font-extrabold text-slate-900 mb-4 leading-tight group-hover:text-blue-600 transition-colors">
                            {featuredNews.title}
                        </h2>
                        <p className="text-slate-500 mb-8 line-clamp-3 leading-relaxed text-sm">
                            {featuredNews.seo_description || "Read the full story to learn more about this latest update from NextPrepBD."}
                        </p>
                        <Link href={`/news/${featuredNews.id}`} className="inline-flex items-center text-blue-600 font-bold hover:underline">
                            Read Full Story <span className="ml-2">→</span>
                        </Link>
                    </div>
                </div>
            </div>
        )}

        {/* GRID: REGULAR NEWS */}
        {regularNews.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
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
                            <p className="text-slate-500 text-xs line-clamp-3 leading-relaxed mb-4 flex-1">
                                {item.seo_description}
                            </p>
                            <span className="text-blue-600 text-xs font-bold mt-auto group-hover:underline">Read More →</span>
                        </div>
                    </Link>
                ))}
            </div>
        ) : (
            /* EMPTY STATE */
            !featuredNews && (
                <div className="text-center py-32 bg-white rounded-3xl border border-dashed border-slate-200">
                    <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-6 text-4xl">📰</div>
                    <h3 className="text-xl font-bold text-slate-900">No news found</h3>
                    <p className="text-slate-500 mt-2">There are no updates for this category yet.</p>
                    <Link href="/news" className="mt-6 inline-block text-blue-600 font-bold hover:underline">View All News</Link>
                </div>
            )
        )}

        {/* PAGINATION CONTROLS */}
        {totalPages > 1 && (
            <div className="flex justify-center items-center gap-4 mb-16">
                <Link 
                    href={`/news?category=${category}&page=${currentPage - 1}`}
                    className={`px-4 py-2 rounded-lg border text-sm font-bold flex items-center gap-2 ${currentPage <= 1 ? 'opacity-50 pointer-events-none bg-slate-50' : 'bg-white hover:bg-slate-50'}`}
                >
                    ← Prev
                </Link>
                <span className="text-sm font-bold text-slate-600">Page {currentPage} of {totalPages}</span>
                <Link 
                    href={`/news?category=${category}&page=${currentPage + 1}`}
                    className={`px-4 py-2 rounded-lg border text-sm font-bold flex items-center gap-2 ${currentPage >= totalPages ? 'opacity-50 pointer-events-none bg-slate-50' : 'bg-white hover:bg-slate-50'}`}
                >
                    Next →
                </Link>
            </div>
        )}

        {/* APP BANNER */}
        <div className="mt-8">
            <ProfessionalAppBanner />
        </div>

      </div>
    </div>
  );
}