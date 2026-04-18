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
import SinglePostContent from "@/components/public/SinglePostContent";

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

        <div className="flex flex-col lg:flex-row gap-12">
          <main className="flex-1 min-w-0">
            <SinglePostContent 
                post={post}
                formattedDate={formatDate(post.created_at)}
                readTime={parseInt(getReadTime(post.content))}
                isLoggedIn={true} // News is usually public but we pass true to ensure actions work
            />

            <div className="bg-white dark:bg-slate-900 rounded-[3rem] p-8 md:p-12 mt-12 shadow-sm border border-slate-100 dark:border-slate-800 transition-colors">
              <h4 className="text-xl font-black text-slate-800 dark:text-white mb-8 pb-4 border-b border-slate-50 dark:border-slate-800/50 flex items-center gap-3 uppercase tracking-tighter">
                <Share2 className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
                Community Discussion
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