import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabaseServer";
import { headers } from 'next/headers';
import Discussion from "@/components/shared/Discussion";
import TypographyScaler from "@/components/shared/TypographyScaler";
import PostPageShell from "@/components/post/PostPageShell";
import PostHeader from "@/components/post/PostHeader";
import PostRightRail from "@/components/post/PostRightRail";
import BlogContent from "@/components/BlogContent";
import ProfessionalAppBanner from "@/components/ProfessionalAppBanner";
import { Metadata } from 'next';
import Link from "next/link";
import ProseStyles from "@/components/post/ProseStyles";
import { ChevronRight } from "lucide-react";

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
    alternates: {
      canonical: `/news/${id}`,
    },
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

  // Fetch the news post
  const { data: newsItems } = await supabase
    .from("news")
    .select("id, title, slug, content, image_url, category, created_at, seo_title, seo_description, tags, views, author_id")
    .eq(column, id)
    .limit(1);

  const rawPost = newsItems && newsItems.length > 0 ? newsItems[0] : null;
  if (!rawPost) return notFound();

  const post = { ...rawPost, id: rawPost.id.toString() };

  // Author name (from profiles if available)
  let authorName = "NextPrepBD";
  if (rawPost.author_id) {
    const { data: authorProfile } = await supabase
      .from("profiles")
      .select("full_name")
      .eq("id", rawPost.author_id)
      .single();
    if (authorProfile?.full_name) authorName = authorProfile.full_name;
  }

  // Recent news for sidebar
  const { data: recentPostsRaw } = await supabase
    .from("news")
    .select("id, title, slug, image_url, created_at, category")
    .neq("id", rawPost.id)
    .order("created_at", { ascending: false })
    .limit(5);

  const relatedNotes = (recentPostsRaw || []).map(p => ({
    title: p.title,
    meta: `${p.category || "General"} · ${new Date(p.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric" })}`,
    href: `/news/${p.slug || p.id}`,
  }));

  // Word count & read time
  const wordCount = rawPost.content ? rawPost.content.replace(/<[^>]+>/g, '').split(/\s+/).length : 0;
  const readTime = Math.max(1, Math.ceil(wordCount / 200));

  // Breadcrumbs
  const breadcrumbs = [
    { label: "Home", href: "/" },
    { label: "News", href: "/news" },
    ...(rawPost.category ? [{ label: rawPost.category }] : []),
    { label: rawPost.title },
  ];

  // Tags
  const tags = [
    { label: "News", variant: "rose" as const },
    ...(rawPost.category && rawPost.category !== "General" ? [{ label: rawPost.category, variant: "blue" as const }] : []),
  ];

  // Right rail stats
  const stats = [
    { value: `${readTime} min`, label: "Read time" },
    { value: (rawPost.views || 0).toLocaleString(), label: "Views" },
    { value: wordCount.toLocaleString(), label: "Words" },
    { value: rawPost.category || "General", label: "Category" },
  ];

  const quickLinks = [
    { label: "All news", href: "/news" },
    { label: "Resources", href: "/resources" },
    { label: "Forum", href: "/forum" },
    { label: "Lesson plans", href: "/curriculum" },
  ];

  const rightRail = (
    <PostRightRail
      stats={stats}
      quickLinks={quickLinks}
      relatedNotes={relatedNotes}
    >
      {/* CTA card */}
      <div className="bg-gradient-to-br from-emerald-600 to-teal-700 rounded-2xl p-6 text-white relative overflow-hidden shadow-lg">
        <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full blur-2xl -mr-12 -mt-12" />
        <h4 className="text-lg font-bold mb-2 leading-snug">Prepare better for your exams</h4>
        <p className="text-emerald-100 text-xs mb-5 font-medium leading-relaxed">
          Access thousands of lecture sheets, suggestions and question banks.
        </p>
        <Link 
          href="/resources/ssc" 
          className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-white text-emerald-700 rounded-xl text-xs font-bold shadow-md hover:bg-emerald-50 transition-all"
        >
          Get started <ChevronRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    </PostRightRail>
  );

  return (
    <div>
      <TypographyScaler />
      <PostPageShell rightRail={rightRail}>
        {/* Post header */}
        <PostHeader
          breadcrumbs={breadcrumbs}
          tags={tags}
          title={rawPost.title}
          authorName={authorName}
          date={rawPost.created_at}
          readTime={readTime}
          viewCount={rawPost.views}
          postId={post.id}
          postType="news"
          coverUrl={rawPost.image_url}
          isLoggedIn={true}
        />

        {/* Content body */}
        <article className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800/80 overflow-hidden transition-colors">
          <div className="p-5 sm:p-8 md:p-10">
            <div className="single-post-body text-slate-800 dark:text-slate-200">
              <BlogContent 
                content={rawPost.content || ""} 
                className="single-post-prose" 
              />
            </div>
          </div>
          <footer className="px-8 py-4 bg-slate-50/50 dark:bg-slate-800/10 border-t border-slate-100 dark:border-slate-800/40 flex justify-between items-center">
            <p className="text-[10px] text-slate-400 dark:text-slate-500">
              © NextPrepBD News
            </p>
            <div className="flex gap-1">
              <div className="w-1 h-1 rounded-full bg-emerald-500/30" />
              <div className="w-1 h-1 rounded-full bg-emerald-500/50" />
              <div className="w-1 h-1 rounded-full bg-emerald-500/70" />
            </div>
          </footer>
        </article>

        {/* Discussion */}
        <div className="mt-10 md:mt-14 bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 p-5 md:p-8 shadow-sm transition-colors">
          <h3 className="text-base md:text-lg font-bold text-slate-800 dark:text-white mb-5 flex items-center gap-2.5">
            <span className="p-2 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 rounded-lg">💬</span>
            Community discussion
          </h3>
          <div className="w-full bg-slate-50 dark:bg-slate-950/40 rounded-xl p-4 md:p-5 min-h-[80px] flex justify-center border border-slate-100 dark:border-slate-800/60">
            <Discussion itemType="news" itemId={post.id.toString()} />
          </div>
        </div>

        {/* App banner */}
        <div className="mt-12">
          <ProfessionalAppBanner />
        </div>
      </PostPageShell>
      <ProseStyles />
    </div>
  );
}