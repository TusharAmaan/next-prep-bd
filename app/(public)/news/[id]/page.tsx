import Link from "next/link";
import { notFound } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import { headers } from 'next/headers';
import Discussion from "@/components/shared/Discussion";
import BookmarkButton from "@/components/shared/BookmarkButton";
import { Metadata } from 'next';
import { parseHashtagsToHTML } from '@/utils/hashtagParser';

export const dynamic = "force-dynamic";

// --- HELPER: Detect ID vs Slug ---
function getQueryColumn(param: string) {
  // Checks if the string contains only numbers
  const isNumeric = /^\d+$/.test(param);
  return isNumeric ? 'id' : 'slug';
}

// --- DYNAMIC SEO METADATA ---
export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const column = getQueryColumn(id);
  
  // Fetch SEO data using ID or Slug
  const { data: news } = await supabase
    .from('news')
    .select('title, seo_title, seo_description, tags, image_url')
    .eq(column, id)
    .single();

  if (!news) {
    return { title: 'News Not Found' };
  }

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

// --- MAIN PAGE COMPONENT ---
export default async function SingleNewsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const column = getQueryColumn(id);

  // Fetch News Data (Smart Lookup)
  const { data: post } = await supabase
    .from("news")
    .select("*")
    .eq(column, id)
    .single();

  if (!post) return notFound();

  const headersList = await headers(); 
  const host = headersList.get("host") || "";
  const protocol = host.includes("localhost") ? "http" : "https";
  const absoluteUrl = `${protocol}://${host}/news/${id}`;

  return (
    <div className="min-h-screen bg-white font-sans pb-20 pt-20"> {/* Added pt-20 for fixed header */}
      
      {/* HERO SECTION */}
      <div className="w-full h-[400px] bg-gray-900 relative">
        {post.image_url && (
            <img src={post.image_url} alt={post.title} className="w-full h-full object-cover opacity-60" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 to-transparent"></div>
        <div className="absolute bottom-0 left-0 w-full p-6 md:p-12 max-w-4xl mx-auto">
            <Link href="/news" className="inline-block text-blue-300 font-bold text-sm mb-4 hover:text-white transition">← Back to News</Link>
            <div className="flex items-center justify-between mb-4">
                <div className="flex gap-2">
                    <span className="bg-blue-600 text-white text-xs font-bold px-3 py-1 rounded-full uppercase">{post.category || "General"}</span>
                </div>
                <div className="bg-white/10 backdrop-blur-md rounded-full p-1 border border-white/20">
                   <BookmarkButton 
                      itemType="news" 
                      itemId={post.id} 
                      metadata={{ title: post.title, thumbnail_url: post.image_url }} 
                   />
                </div>
            </div>
            <h1 className="text-3xl md:text-5xl font-extrabold text-white leading-tight mb-4">{post.title}</h1>
            <p className="text-gray-400 font-bold text-sm">Published on {new Date(post.created_at).toLocaleDateString()}</p>
        </div>
      </div>

      {/* CONTENT BODY */}
      <div className="max-w-3xl mx-auto px-6 py-12">
        <div 
          className="prose prose-lg prose-blue max-w-none text-slate-800 dark:text-slate-200"
          dangerouslySetInnerHTML={{ __html: parseHashtagsToHTML(post.content) }}
        />
        
        {/* TAGS SECTION */}
        {post.tags && post.tags.length > 0 && (
            <div className="mt-12 pt-8 border-t border-gray-100">
                <p className="text-xs font-bold text-gray-400 uppercase mb-3">Related Tags:</p>
                <div className="flex flex-wrap gap-2">
                    {post.tags.map((tag: string, index: number) => (
                        <span key={index} className="bg-gray-100 text-gray-600 px-3 py-1 rounded-full text-xs font-bold">#{tag}</span>
                    ))}
                </div>
            </div>
        )}
      </div>

      {/* DISCUSSION COMMENTS SECTION */}
      <div className="max-w-3xl mx-auto px-6">
        <hr className="border-gray-100 dark:border-slate-800 mb-6" />
        <Discussion itemType="news" itemId={post.id} />
      </div>
    </div>
  );
}