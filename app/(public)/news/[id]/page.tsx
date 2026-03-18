import Link from 'next/link';
import { notFound } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';
import { headers } from 'next/headers';
import FacebookComments from '@/components/FacebookComments';
import { Metadata } from 'next';
import VotingSection from '@/components/news/VotingSection';
import ShareButtons from '@/components/news/ShareButtons';
import TableOfContents from '@/components/news/TableOfContents';
import AuthorProfile from '@/components/news/AuthorProfile';
import RelatedPosts from '@/components/news/RelatedPosts';
import { ChevronLeft, Clock, BookOpen } from 'lucide-react';

export const dynamic = 'force-dynamic';

// --- HELPER: Detect ID vs Slug ---
function getQueryColumn(param: string) {
  const isNumeric = /^\d+$/.test(param);
  return isNumeric ? 'id' : 'slug';
}

// --- DYNAMIC SEO METADATA ---
export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const column = getQueryColumn(id);

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
    description:
      news.seo_description || `Read the latest news: ${news.title}`,
    keywords: news.tags,
    openGraph: {
      title: news.seo_title || news.title,
      description:
        news.seo_description || `Read the latest news: ${news.title}`,
      images: news.image_url ? [news.image_url] : [],
      type: 'article',
    },
  };
}

// --- MAIN PAGE COMPONENT ---
export default async function SingleNewsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const column = getQueryColumn(id);

  const { data: post } = await supabase
    .from('news')
    .select('*')
    .eq(column, id)
    .single();

  if (!post) return notFound();

  const headersList = await headers();
  const host = headersList.get('host') || '';
  const protocol = host.includes('localhost') ? 'http' : 'https';
  const absoluteUrl = `${protocol}://${host}/news/${id}`;

  const getReadTime = (text: string) => {
    const wpm = 200;
    const words = text ? text.split(/\s+/).length : 0;
    const time = Math.ceil(words / wpm);
    return `${time} min read`;
  };

  return (
    <div className="min-h-screen bg-white font-sans pt-20 pb-16">
      {/* BREADCRUMB & BACK BUTTON */}
      <div className="border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <Link
            href="/news"
            className="inline-flex items-center gap-2 text-blue-600 font-semibold hover:text-blue-700 transition"
          >
            <ChevronLeft className="w-4 h-4" />
            Back to News
          </Link>
        </div>
      </div>

      {/* HERO SECTION - LARGE IMAGE WITH NEWSPAPER STYLE */}
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* MAIN CONTENT AREA */}
          <div className="lg:col-span-2">
            {/* HERO IMAGE */}
            <div className="mb-8 rounded-xl overflow-hidden shadow-lg border border-gray-200">
              {post.image_url ? (
                <img
                  src={post.image_url}
                  alt={post.title}
                  className="w-full h-auto object-cover"
                  style={{ aspectRatio: '16 / 9' }}
                />
              ) : (
                <div className="w-full h-96 bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center">
                  <BookOpen className="w-16 h-16 text-gray-400" />
                </div>
              )}
            </div>

            {/* METADATA ROW */}
            <div className="flex flex-wrap items-center gap-4 mb-6 pb-6 border-b border-gray-200">
              <span className="inline-block bg-blue-600 text-white px-4 py-1.5 rounded-full text-sm font-bold uppercase tracking-wider">
                {post.category || 'General'}
              </span>
              <div className="flex items-center gap-6 text-sm font-semibold text-gray-600">
                <span>{new Date(post.created_at).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}</span>
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-gray-400" />
                  <span>{getReadTime(post.content)}</span>
                </div>
              </div>
            </div>

            {/* TITLE */}
            <h1
              className="text-4xl md:text-5xl font-extrabold text-gray-900 leading-tight mb-8"
              style={{ fontFamily: 'var(--font-geist-sans)' }}
            >
              {post.title}
            </h1>

            {/* VOTING SECTION - Above Content */}
            <div className="mb-10">
              <VotingSection
                newsId={post.id}
                userId={undefined}
                initialUpvotes={post.upvotes || 0}
                initialDownvotes={post.downvotes || 0}
              />
            </div>

            {/* ARTICLE CONTENT */}
            <article
              className="blog-content prose prose-lg max-w-none mb-12 text-gray-800 leading-relaxed"
              style={{ fontFamily: 'var(--font-geist-sans)' }}
              dangerouslySetInnerHTML={{ __html: post.content }}
            />

            {/* TAGS SECTION */}
            {post.tags && post.tags.length > 0 && (
              <div className="mb-12 pb-12 border-t border-b border-gray-200 py-8">
                <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-4">
                  Related Tags
                </p>
                <div className="flex flex-wrap gap-2">
                  {post.tags.map((tag: string, index: number) => (
                    <Link
                      key={index}
                      href={`/news?q=${tag}`}
                      className="inline-block bg-gray-100 hover:bg-blue-100 text-gray-700 hover:text-blue-600 px-4 py-2 rounded-full text-sm font-bold transition"
                    >
                      #{tag}
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* AUTHOR PROFILE */}
            <div className="mb-12">
              <AuthorProfile publishDate={post.created_at} />
            </div>

            {/* COMMENTS SECTION */}
            <div className="mb-12 pb-12 border-b border-gray-200">
              <h3 className="text-2xl font-bold text-gray-900 mb-6">Comments</h3>
              <FacebookComments url={absoluteUrl} />
            </div>
          </div>

          {/* RIGHT SIDEBAR - STICKY */}
          <div className="lg:col-span-1">
            <div className="sticky top-24 space-y-6">
              {/* TABLE OF CONTENTS */}
              <TableOfContents contentHtml={post.content} />

              {/* SHARE BUTTONS */}
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <ShareButtons title={post.title} url={absoluteUrl} />
              </div>

              {/* READING TIME & STATS */}
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg border border-blue-200 p-6">
                <h4 className="font-bold text-gray-900 mb-4">Article Stats</h4>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Reading Time:</span>
                    <span className="font-bold text-gray-900">
                      {getReadTime(post.content)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Votes:</span>
                    <span className="font-bold text-gray-900">
                      {(post.upvotes || 0) + (post.downvotes || 0)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Category:</span>
                    <span className="font-bold text-gray-900">
                      {post.category || 'General'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* RELATED POSTS SECTION */}
      <div className="max-w-7xl mx-auto px-6 mt-16">
        <RelatedPosts currentPostId={post.id} category={post.category} />
      </div>
    </div>
  );
}