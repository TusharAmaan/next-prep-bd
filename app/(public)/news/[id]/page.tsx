import Link from "next/link";
import { notFound } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import { headers } from 'next/headers';
import Discussion from "@/components/shared/Discussion";
import BookmarkButton from "@/components/shared/BookmarkButton";
import { Metadata } from 'next';
import { parseHashtagsToHTML } from '@/utils/hashtagParser';
import TypographyScaler from "@/components/shared/TypographyScaler";
import { Calendar, Clock, Share2, Facebook, Twitter, Linkedin, Link as LinkIcon, ChevronLeft, Tag, Eye } from "lucide-react";
import NewsSidebar from "@/components/news/NewsSidebar";

export const dynamic = "force-dynamic";

function getQueryColumn(param: string) {
  const isNumeric = /^\d+$/.test(param);
  return isNumeric ? 'id' : 'slug';
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const column = getQueryColumn(id);
  
  const { data: news } = await supabase
    .from('news')
    .select('title, seo_title, seo_description, tags, image_url')
    .eq(column, id)
    .single();

  if (!news) return { title: 'News Not Found' };

  return {
    title: news.seo_title || news.title,
    description: news.seo_description || `Read the latest news: ${news.title}`,
    keywords: news.tags,
    openGraph: {
      title: news.seo_title || news.title,
      description: news.seo_description || `Read the latest news: ${news.title}`,
      images: news.image_url ? [news.image_url] : [],
      type: 'article',
    },
  };
}

export default async function SingleNewsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const column = getQueryColumn(id);

  // 1. DATA FETCHING
  const { data: post } = await supabase
    .from("news")
    .select("*")
    .eq(column, id)
    .single();

  if (!post) return notFound();

  // Sidebar Data
  const { data: recentPosts } = await supabase
    .from("news")
    .select("id, title, image_url, created_at")
    .order("created_at", { ascending: false })
    .limit(5);

  const { data: distinctCategories } = await supabase
    .from("news")
    .select("category")
    .not("category", "is", null);
  const categoriesList = ["All", ...Array.from(new Set(distinctCategories?.map((item) => item.category))).sort()];

  const getReadTime = (text: string) => {
    const wpm = 200;
    const words = text ? text.split(/\s+/).length : 0;
    return `${Math.ceil(words / wpm)} min read`;
  };

  const headersList = await headers(); 
  const host = headersList.get("host") || "";
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
                    {/* Category Tag */}
                    <div className="flex items-center justify-between mb-8">
                        <span className="bg-indigo-600 text-white text-[10px] font-black px-4 py-1.5 rounded-full shadow-lg uppercase tracking-widest">
                            {post.category || "General"}
                        </span>
                        <div className="flex items-center gap-4">
                            <BookmarkButton 
                                itemType="news" 
                                itemId={post.id} 
                                metadata={{ title: post.title, thumbnail_url: post.image_url }} 
                            />
                            <button className="p-2 text-slate-400 hover:text-indigo-600 transition-colors"><Share2 className="w-5 h-5"/></button>
                        </div>
                    </div>

                    <h1 className="text-3xl md:text-5xl font-black text-slate-900 leading-[1.1] mb-8 tracking-tight">
                        {post.title}
                    </h1>

                    <div className="flex flex-wrap items-center gap-6 text-[10px] font-black text-slate-400 uppercase tracking-widest pb-8 border-b border-slate-50">
                        <span className="flex items-center gap-2"><Calendar className="w-4 h-4 text-indigo-500"/> {new Date(post.created_at).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}</span>
                        <span className="flex items-center gap-2"><Clock className="w-4 h-4 text-indigo-500"/> {getReadTime(post.content)}</span>
                        <span className="flex items-center gap-2"><Eye className="w-4 h-4 text-indigo-500"/> 1.2k Views</span>
                    </div>

                    {/* HERO IMAGE */}
                    {post.image_url && (
                        <div className="mt-10 rounded-3xl overflow-hidden shadow-2xl relative aspect-video group">
                            <img src={post.image_url} alt={post.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                            <div className="absolute inset-x-0 bottom-0 p-4 bg-gradient-to-t from-black/20 to-transparent"></div>
                        </div>
                    )}

                    {/* ARTICLE BODY */}
                    <div className="mt-12">
                        <div 
                            className="prose prose-xl prose-indigo max-w-none text-slate-700 font-medium leading-[1.8]
                                prose-headings:font-black prose-headings:tracking-tight prose-headings:text-slate-900
                                prose-strong:font-black prose-strong:text-slate-900
                                prose-img:rounded-3xl prose-img:shadow-xl"
                            dangerouslySetInnerHTML={{ __html: parseHashtagsToHTML(post.content) }}
                        />
                    </div>

                    {/* SHARE SECTION */}
                    <div className="mt-16 pt-10 border-t border-slate-100 flex flex-col md:flex-row items-center justify-between gap-6">
                        <div className="flex items-center gap-4">
                            <span className="text-xs font-black uppercase tracking-widest text-slate-400">Share This:</span>
                            {[
                                { icon: Facebook, color: "bg-blue-600" },
                                { icon: Twitter, color: "bg-sky-500" },
                                { icon: Linkedin, color: "bg-indigo-700" },
                                { icon: LinkIcon, color: "bg-slate-800" }
                            ].map((social, i) => (
                                <button key={i} className={`w-10 h-10 rounded-xl ${social.color} text-white flex items-center justify-center hover:scale-110 transition-transform shadow-lg`}>
                                    <social.icon className="w-4 h-4" />
                                </button>
                            ))}
                        </div>
                        {post.tags && post.tags.length > 0 && (
                            <div className="flex flex-wrap gap-2 justify-center md:justify-end">
                                {post.tags.map((tag: string, index: number) => (
                                    <span key={index} className="px-3 py-1 bg-slate-50 text-slate-500 text-[10px] font-black rounded-lg border border-slate-100 hover:bg-indigo-50 hover:text-indigo-600 transition-colors cursor-pointer">#{tag}</span>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* DISCUSSION */}
                <div className="bg-white rounded-[2.5rem] p-8 md:p-12 shadow-sm border border-slate-100">
                    <h4 className="text-xl font-black text-slate-900 mb-8 pb-4 border-b border-slate-50 flex items-center gap-3">
                        <Share2 className="w-6 h-6 text-indigo-600" />
                        Community Join In
                    </h4>
                    <Discussion itemType="news" itemId={post.id.toString()} />
                </div>

            </main>

            {/* RIGHT GALLERY SIDEBAR */}
            <div className="w-full lg:w-80 shrink-0">
                <NewsSidebar 
                    categories={categoriesList}
                    recentPosts={recentPosts || []}
                    activeCategory={post.category}
                />
                
                {/* Stick Promo Card */}
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
      </div>

    </div>
  );
}