import { notFound } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import { supabase } from "@/lib/supabaseClient";
import BlogTOC from "@/components/BlogTOC";
import BlogContent from "@/components/BlogContent";
import Discussion from "@/components/shared/Discussion";
import TypographyScaler from "@/components/shared/TypographyScaler";
import PostPageShell from "@/components/post/PostPageShell";
import PostHeader from "@/components/post/PostHeader";
import PostRightRail from "@/components/post/PostRightRail";
import { headers } from 'next/headers';
import { Metadata } from 'next';
import { Noto_Serif_Bengali } from "next/font/google";
import { getBreadcrumbSchema, getArticleSchema } from "@/lib/seo-utils";
import Link from "next/link";
import { ChevronRight } from "lucide-react";

export const dynamic = "force-dynamic";

const bengaliFont = Noto_Serif_Bengali({
  subsets: ["bengali"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

function getQueryColumn(param: string) {
  const isNumeric = /^\d+$/.test(param);
  return isNumeric ? 'id' : 'slug';
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const column = getQueryColumn(id);

  const { data: post } = await supabase
    .from('resources')
    .select('title, seo_title, seo_description, content_url, tags')
    .eq(column, id)
    .single();

  if (!post) return { title: 'Update Not Found' };

  return {
    title: post.seo_title || post.title,
    description: post.seo_description || `Latest update: ${post.title}`,
    keywords: post.tags,
    alternates: {
      canonical: `/update/${id}`,
    },
    openGraph: {
      title: post.seo_title || post.title,
      description: post.seo_description || `Segment update: ${post.title}`,
      images: post.content_url ? [post.content_url] : [],
      type: 'article',
    },
  };
}

export default async function SingleUpdatePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const column = getQueryColumn(id);

  const supabaseServer = await createClient();
  const { data: { user } } = await supabaseServer.auth.getUser();
  const isLoggedIn = !!user;

  const { data: post } = await supabase
    .from("resources")
    .select("*, subjects(title, slug, groups(title, slug, segments(title, slug))), author:profiles!resources_profile_id_fkey(full_name, institution)")
    .eq(column, id)
    .single();

  if (!post) return notFound();

  // Related updates from same segment
  const { data: relatedUpdates } = await supabase
    .from('resources')
    .select('id, title, slug, created_at, type, category')
    .eq('segment_id', post.segment_id)
    .eq('status', 'approved')
    .neq('id', post.id)
    .order('created_at', { ascending: false })
    .limit(5);

  const wordCount = post.content_body ? post.content_body.replace(/<[^>]+>/g, '').split(/\s+/).length : 0;
  const readTime = Math.max(1, Math.ceil(wordCount / 200));

  const headersList = await headers();
  const host = headersList.get("host") || "";
  const protocol = host.includes("localhost") ? "http" : "https";
  const currentUrl = `${protocol}://${host}/update/${id}`;

  // Author info
  const authorName = post.author?.full_name || "NextPrepBD";

  // Breadcrumb hierarchy
  const segmentTitle = post.subjects?.groups?.segments?.title || "Updates";
  const segmentSlug = post.subjects?.groups?.segments?.slug;

  const breadcrumbs = [
    { label: "Home", href: "/" },
    { label: "Resources", href: "/resources" },
    ...(segmentSlug ? [{ label: segmentTitle, href: `/resources/${segmentSlug}` }] : []),
    { label: post.title },
  ];

  // Tags
  const tags = [
    { label: "Update", variant: "amber" as const },
    ...(segmentTitle !== "Updates" ? [{ label: segmentTitle, variant: "purple" as const }] : []),
    ...(post.category ? [{ label: post.category, variant: "blue" as const }] : []),
  ];

  // Right rail
  const stats = [
    { value: `${readTime} min`, label: "Read time" },
    { value: wordCount.toLocaleString(), label: "Words" },
    ...(segmentTitle !== "Updates" ? [{ value: segmentTitle, label: "Segment" }] : []),
  ];

  const quickLinks = [
    ...(segmentSlug ? [{ label: `All ${segmentTitle} resources`, href: `/resources/${segmentSlug}` }] : []),
    { label: "Latest news", href: "/news" },
    { label: "Lesson plans", href: "/curriculum" },
    { label: "Forum", href: "/forum" },
  ];

  const relatedNotes = (relatedUpdates || []).map(p => ({
    title: p.title,
    meta: `${p.type} · ${new Date(p.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric" })}`,
    href: p.type === 'blog' ? `/blog/${p.slug || p.id}` : `/update/${p.slug || p.id}`,
  }));

  // SEO schemas
  const breadcrumbSchema = getBreadcrumbSchema(
    breadcrumbs.filter(b => b.href).map(b => ({ name: b.label, item: b.href! }))
  );
  const articleSchema = getArticleSchema({
    title: post.title,
    description: post.seo_description || post.title.substring(0, 160),
    image: post.content_url || "https://nextprepbd.com/og-image.png",
    authorName,
    datePublished: post.created_at,
    dateModified: post.updated_at || post.created_at,
    url: currentUrl,
  });

  const rightRail = (
    <PostRightRail
      stats={stats}
      quickLinks={quickLinks}
      relatedNotes={relatedNotes}
    >
      {/* Segment CTA */}
      {segmentSlug && (
        <div className="bg-gradient-to-br from-amber-500 to-orange-600 rounded-2xl p-6 text-white relative overflow-hidden shadow-lg">
          <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full blur-2xl -mr-12 -mt-12" />
          <h4 className="text-lg font-bold mb-2 leading-snug">Explore {segmentTitle}</h4>
          <p className="text-amber-100 text-xs mb-5 font-medium leading-relaxed">
            Find study materials, question banks and more for {segmentTitle}.
          </p>
          <Link
            href={`/resources/${segmentSlug}`}
            className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-white text-amber-700 rounded-xl text-xs font-bold shadow-md hover:bg-amber-50 transition-all"
          >
            Browse resources <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      )}
    </PostRightRail>
  );

  const tocContent = post.content_body ? (
    <div>
      <div className="mb-5 flex items-center gap-2.5 text-[10px] font-semibold text-slate-400 uppercase tracking-wider px-3">
        <span className="w-6 h-px bg-slate-200 dark:bg-slate-800" />
        Navigation
      </div>
      <BlogTOC content={post.content_body} />
    </div>
  ) : undefined;

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }}
      />
      <div className={bengaliFont.className}>
        <TypographyScaler />
        <PostPageShell rightRail={rightRail} tocContent={tocContent}>
          {/* Post header */}
          <PostHeader
            breadcrumbs={breadcrumbs}
            tags={tags}
            title={post.title}
            authorName={authorName}
            date={post.created_at}
            readTime={readTime}
            postId={post.id}
            postType="update"
            coverUrl={post.cover_url || post.content_url}
            isLoggedIn={isLoggedIn}
          />

          {/* Content body */}
          <article className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800/80 overflow-hidden transition-colors">
            <div className="p-5 sm:p-8 md:p-10">
              <div className="single-post-body text-slate-800 dark:text-slate-200">
                <BlogContent
                  content={post.content_body || ""}
                  className="single-post-prose"
                />
              </div>
            </div>
            <footer className="px-8 py-4 bg-slate-50/50 dark:bg-slate-800/10 border-t border-slate-100 dark:border-slate-800/40 flex justify-between items-center">
              <p className="text-[10px] text-slate-400 dark:text-slate-500">
                © NextPrepBD Updates
              </p>
              <div className="flex gap-1">
                <div className="w-1 h-1 rounded-full bg-amber-500/30" />
                <div className="w-1 h-1 rounded-full bg-amber-500/50" />
                <div className="w-1 h-1 rounded-full bg-amber-500/70" />
              </div>
            </footer>
          </article>

          {/* Discussion */}
          <div className="mt-10 md:mt-14 bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 p-5 md:p-8 shadow-sm transition-colors">
            <h3 className="text-base md:text-lg font-bold text-slate-800 dark:text-white mb-5 flex items-center gap-2.5">
              <span className="p-2 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 rounded-lg">💬</span>
              Discussion
            </h3>
            <div className="w-full bg-slate-50 dark:bg-slate-950/40 rounded-xl p-4 md:p-5 min-h-[80px] flex justify-center border border-slate-100 dark:border-slate-800/60">
              <Discussion itemType="blog" itemId={post.id.toString()} />
            </div>
          </div>

          {/* Mobile TOC */}
          {post.content_body && (
            <div className="xl:hidden mt-8">
              <BlogTOC content={post.content_body} />
            </div>
          )}
        </PostPageShell>
      </div>

      <style jsx global>{`
        .single-post-prose {
          font-size: clamp(1.0625rem, 0.5vw + 1rem, 1.25rem) !important;
          line-height: 1.8 !important;
        }
        .single-post-prose h2, .single-post-prose h3, .single-post-prose h4 {
          margin-top: 2rem !important;
          margin-bottom: 1rem !important;
          letter-spacing: -0.02em !important;
          line-height: 1.3 !important;
        }
        .single-post-prose p { margin-bottom: 1.5rem !important; }
        .single-post-prose h2 { font-size: clamp(1.5rem, 3vw, 2rem) !important; font-weight: 800 !important; }
        .single-post-prose h3 { font-size: clamp(1.25rem, 2vw, 1.75rem) !important; font-weight: 700 !important; }
        .single-post-prose img {
          border-radius: 1rem !important;
          margin: 2rem auto !important;
          box-shadow: 0 20px 40px -12px rgba(0, 0, 0, 0.08) !important;
        }
        .dark .single-post-prose h2, .dark .single-post-prose h3, .dark .single-post-prose h4, .dark .single-post-prose strong { color: #ffffff !important; }
        .dark .single-post-prose p, .dark .single-post-prose li, .dark .single-post-prose span:not(.katex):not(.katex *) { color: #cbd5e1 !important; }
      `}</style>
    </>
  );
}
