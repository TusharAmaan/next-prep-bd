import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabaseServer";
import { headers } from 'next/headers';
import Discussion from "@/components/shared/Discussion";
import BookmarkButton from "@/components/shared/BookmarkButton";
import { Metadata } from 'next';
import { parseHashtagsToHTML } from '@/utils/hashtagParser';
import TypographyScaler from "@/components/shared/TypographyScaler";
import { Calendar, Clock, Share2, ChevronLeft, Eye } from "lucide-react";
import NewsSidebar from "@/components/news/NewsSidebar";
import ProfessionalAppBanner from "@/components/ProfessionalAppBanner";
import ShareButtons from "@/components/news/ShareButtons";

export const dynamic = "force-dynamic";

function getQueryColumn(param: string) {
  const isNumeric = /^\d+$/.test(param);
  return isNumeric ? 'id' : 'slug';
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const resolvedParams = await params;
  const { id } = resolvedParams;
  const column = getQueryColumn(id);
  
  const supabase = await createClient();
  const { data: newsItems } = await supabase
    .from('news')
    .select('title, seo_title, seo_description, tags, image_url')
    .eq(column, id)
    .limit(1);

  const news = newsItems && newsItems.length > 0 ? newsItems[0] : null;

  if (!news) return { title: 'News Not Found' };

  return {
    title: news.seo_title || news.title,
    description: news.seo_description || `Read the latest news: ${news.title}`,
    keywords: Array.isArray(news.tags) ? news.tags : [],
    openGraph: {
      title: news.seo_title || news.title,
      description: news.seo_description || `Read the latest news: ${news.title}`,
      images: news.image_url ? [news.image_url] : [],
      type: 'article',
    },
  };
}

export default async function SingleNewsPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  const { id } = resolvedParams;
  const column = getQueryColumn(id);

  const supabase = await createClient();
  // 1. DATA FETCHING
  const { data: newsItems } = await supabase
    .from("news")
    .select("id, title, slug, content, image_url, category, created_at, seo_title, seo_description, tags")
    .eq(column, id)
    .limit(1);

  const post = newsItems && newsItems.length > 0 ? { ...newsItems[0], id: newsItems[0].id.toString() } : null;

  if (!post) return notFound();

  // Sidebar Data
  const { data: recentPostsRaw } = await supabase
    .from("news")
    .select("id, title, image_url, created_at")
    .order("created_at", { ascending: false })
    .limit(5);
  const recentPosts = (recentPostsRaw || []).map(p => ({ ...p, id: p.id.toString() }));

  const { data: distinctCategories } = await supabase
    .from("news")
    .select("category")
    .not("category", "is", null)
    .limit(100);
  const categoriesList = ["All", ...Array.from(new Set((distinctCategories || []).map((item) => item?.category).filter(Boolean))).sort()];

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

  const hrList = await headers();
  const host = hrList.get("host") || "";
  const protocol = host.includes("localhost") ? "http" : "https";
  const absoluteUrl = `${protocol}://${host}/news/${id}`;

  return (
    <div className="min-h-screen bg-slate-50 font-sans pb-20 pt-28">
      <TypographyScaler />

      <div className="max-w-7xl mx-auto px-6">

        {/* BREADCRUMBS */}
        <nav className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400 mb-8">
          <Link href="/" className="hover:text-indigo-600 transition-colors">Home</Link>
          <span className="w-1 h-1 bg-slate-300 rounded-full"></span>
          <Link href="/news" className="hover:text-indigo-600 transition-colors">Newsroom</Link>
          <span className="w-1 h-1 bg-slate-300 rounded-full"></span>
          <span className="text-slate-600 truncate max-w-[200px]">{post.title}</span>
        </nav>

        <div className="flex flex-col lg:flex-row gap-12">

          {/* LEFT: MAIN ARTICLE CONTENT */}
          <main className="flex-1 min-w-0">

            {/* ARTICLE HEADER */}
            <div className="bg-white rounded-[2.5rem] p-8 md:p-12 mb-10 shadow-sm border border-slate-100 relative overflow-hidden">
              <div className="flex items-center justify-between mb-8">
                <span className="bg-indigo-600 text-white text-[10px] font-black px-4 py-1.5 rounded-full shadow-lg uppercase tracking-widest">
                  {post.category || "General"}
                </span>
                <div className="flex items-center gap-4">
                  <BookmarkButton
                    itemType="news"
                    itemId={post.id.toString()}
                    metadata={{ title: post.title, thumbnail_url: post.image_url }}
                  />
                  <div className="p-2 text-slate-400"><Share2 className="w-5 h-5" /></div>
                </div>
              </div>

              <h1 className="text-3xl md:text-5xl font-black text-slate-900 leading-[1.1] mb-8 tracking-tight">
                {post.title}
              </h1>

              <div className="flex flex-wrap items-center gap-6 text-[10px] font-black text-slate-400 uppercase tracking-widest pb-8 border-b border-slate-50">
                <span className="flex items-center gap-2"><Calendar className="w-4 h-4 text-indigo-500" /> {formatDate(post.created_at)}</span>
                <span className="flex items-center gap-2"><Clock className="w-4 h-4 text-indigo-500" /> {getReadTime(post.content)}</span>
                <span className="flex items-center gap-2"><Eye className="w-4 h-4 text-indigo-500" /> 1.2k Views</span>
              </div>

              {post.image_url && (
                <div className="mt-10 rounded-3xl overflow-hidden shadow-2xl relative aspect-video group">
                  <img src={post.image_url} alt={post.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                  <div className="absolute inset-x-0 bottom-0 p-4 bg-gradient-to-t from-black/20 to-transparent"></div>
                </div>
              )}

              <div className="mt-12">
                <div
                  className="prose prose-xl prose-indigo max-w-none text-slate-700 font-medium leading-[1.8]
                                prose-headings:font-black prose-headings:tracking-tight prose-headings:text-slate-900
                                prose-strong:font-black prose-strong:text-slate-900
                                prose-img:rounded-3xl prose-img:shadow-xl"
                  dangerouslySetInnerHTML={{ __html: parseHashtagsToHTML(post.content) }}
                />
              </div>

              <div className="mt-16 pt-10 border-t border-slate-100 flex flex-col md:flex-row items-center justify-between gap-6">
                <ShareButtons title={post.title} url={absoluteUrl} />
                {post.tags && Array.isArray(post.tags) && post.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2 justify-center md:justify-end">
                    {post.tags.map((tag: string, index: number) => (
                      <span key={index} className="px-3 py-1 bg-slate-50 text-slate-500 text-[10px] font-black rounded-lg border border-slate-100 hover:bg-indigo-50 hover:text-indigo-600 transition-colors cursor-pointer">#{tag}</span>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="bg-white rounded-[2.5rem] p-8 md:p-12 shadow-sm border border-slate-100">
              <h4 className="text-xl font-black text-slate-900 mb-8 pb-4 border-b border-slate-50 flex items-center gap-3">
                <Share2 className="w-6 h-6 text-indigo-600" />
                Community Join In
              </h4>
              <Discussion itemType="news" itemId={post.id.toString()} />
            </div>

          </main>

          <div className="w-full lg:w-80 shrink-0">
            <NewsSidebar
              categories={categoriesList}
              recentPosts={recentPosts}
              activeCategory={post.category}
            />

            <div className="sticky top-24 mt-10">
              <div className="bg-gradient-to-br from-indigo-600 to-violet-700 rounded-[2rem] p-8 text-white relative overflow-hidden shadow-2xl">
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -mr-16 -mt-16"></div>
                <h4 className="text-2xl font-black mb-4 leading-tight">Prepare better for your exams.</h4>
                <p className="text-indigo-100 text-sm mb-6 font-medium leading-relaxed">Access thousands of lecture sheets, sugerstions and question banks.</p>
                <Link href="/resources/ssc" className="inline-flex items-center gap-2 px-6 py-3 bg-white text-indigo-600 rounded-xl text-xs font-black uppercase tracking-widest shadow-lg hover:bg-indigo-50 transition-all">
                  Get Started <ChevronLeft className="w-4 h-4 rotate-180" />
                </Link>
              </div>
            </div>
          </div>

        </div>

        <div className="mt-20">
           <ProfessionalAppBanner />
        </div>
      </div>

    </div>
  );
}