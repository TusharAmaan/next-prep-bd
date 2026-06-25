import { notFound } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import { supabase } from "@/lib/supabaseClient";
import BlogTOC from "@/components/BlogTOC"; 
import BlogContentWrapper from "@/components/public/BlogContentWrapper"; 
import Discussion from "@/components/shared/Discussion";
import TypographyScaler from "@/components/shared/TypographyScaler";
import PostPageShell from "@/components/post/PostPageShell";
import PostHeader from "@/components/post/PostHeader";
import PostRightRail from "@/components/post/PostRightRail";
import Sidebar from "@/components/Sidebar";
import ScrollToTop from "@/components/ScrollToTop";
import { headers } from 'next/headers';
import 'katex/dist/katex.min.css'; 
import { Metadata } from 'next';
import { Noto_Serif_Bengali } from "next/font/google";
import { getBreadcrumbSchema, getQAPageSchema } from "@/lib/seo-utils";

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
    .eq("status", "approved")
    .single();

  if (!post) return { title: 'Question Not Found' };

  return {
    title: post.seo_title || post.title, 
    description: post.seo_description || `Detail solution and explanation for ${post.title}. Level up your preparation with NextPrepBD verified resources.`,
    keywords: post.tags,
    alternates: {
      canonical: `/question/${id}`,
    },
    openGraph: {
      title: post.seo_title || post.title,
      description: post.seo_description,
      images: post.content_url ? [post.content_url] : [],
      type: 'article',
      url: `https://nextprepbd.com/question/${id}`,
    },
  };
}

export default async function SingleQuestionPage({ params }: { params: Promise<{ id: string }> }) {
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

  if (!post || post.type !== 'question') return notFound();

  const { data: linkedQuestions } = await supabase
    .from('resource_questions')
    .select(`
      order_index,
      question:question_bank!question_id (
        id, question_text, question_type, marks, explanation,
        options:question_options(option_text, is_correct),
        sub_questions:question_bank!parent_id(
           id, question_text, question_type, marks, explanation,
           options:question_options(option_text, is_correct)
        )
      )
    `)
    .eq('resource_id', post.id)
    .order('order_index');

  const questions = linkedQuestions?.map(lq => lq.question).filter(q => q !== null) || [];

  // Related questions from same subject
  const { data: relatedQuestions } = await supabase
    .from('resources')
    .select('id, title, slug, created_at')
    .eq('subject_id', post.subject_id)
    .eq('type', 'question')
    .eq('status', 'approved')
    .neq('id', post.id)
    .order('created_at', { ascending: false })
    .limit(4);

  const wordCount = post.content_body ? post.content_body.replace(/<[^>]+>/g, '').split(/\s+/).length : 0;
  const readTime = Math.max(1, Math.ceil(wordCount / 200));

  const currentUrl = `https://nextprepbd.com/question/${id}`;

  // Author info
  const authorName = post.author?.full_name || "NextPrepBD Specialist";

  // Breadcrumb hierarchy
  const segmentTitle = post.subjects?.groups?.segments?.title;
  const segmentSlug = post.subjects?.groups?.segments?.slug;
  const groupTitle = post.subjects?.groups?.title;
  const groupSlug = post.subjects?.groups?.slug;
  const subjectTitle = post.subjects?.title;
  const subjectSlug = post.subjects?.slug;

  const breadcrumbs = [
    { label: "Home", href: "/" },
    { label: "Resources", href: "/resources" },
    ...(segmentTitle && segmentSlug ? [{ label: segmentTitle, href: `/resources/${segmentSlug}` }] : []),
    ...(groupTitle && groupSlug && segmentSlug ? [{ label: groupTitle, href: `/resources/${segmentSlug}/${groupSlug}` }] : []),
    ...(subjectTitle && subjectSlug && groupSlug && segmentSlug ? [{ label: subjectTitle, href: `/resources/${segmentSlug}/${groupSlug}/${subjectSlug}` }] : []),
    { label: post.title },
  ];

  // Tags
  const tags = [
    ...(segmentTitle ? [{ label: segmentTitle, variant: "purple" as const }] : []),
    { label: "Question", variant: "amber" as const },
    ...(post.category ? [{ label: post.category, variant: "blue" as const }] : []),
  ];

  // Total marks from linked questions
  const totalMarks = questions.reduce((sum: number, q: any) => sum + (q?.marks || 0), 0);

  // Right rail config
  const stats = [
    { value: questions.length, label: "Questions" },
    { value: totalMarks || "—", label: "Total marks" },
    { value: `${readTime} min`, label: "Read time" },
    ...(segmentTitle ? [{ value: segmentTitle, label: "Segment" }] : []),
  ];

  const progressItems = totalMarks > 0 ? [
    { label: "Marks coverage", value: totalMarks, max: 100, variant: "green" as const },
  ] : undefined;

  const quickLinks = [
    ...(subjectSlug && groupSlug && segmentSlug ? [{ label: `More ${subjectTitle} questions`, href: `/resources/${segmentSlug}/${groupSlug}/${subjectSlug}` }] : []),
    ...(segmentSlug ? [{ label: `${segmentTitle} resources`, href: `/resources/${segmentSlug}` }] : []),
    { label: "Forum discussions", href: "/forum" },
    { label: "Lesson plans", href: "/curriculum" },
  ];

  const relatedNotes = (relatedQuestions || []).map(p => ({
    title: p.title,
    meta: new Date(p.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
    href: `/question/${p.slug || p.id}`,
  }));

  // SEO schemas
  const breadcrumbItems = breadcrumbs.filter(b => b.href).map(b => ({ name: b.label, item: b.href! }));
  const breadcrumbSchema = getBreadcrumbSchema(breadcrumbItems);
  const qaSchema = getQAPageSchema({
    title: post.title,
    text: post.content_body || post.seo_description || post.title,
    authorName,
    datePublished: post.created_at,
    url: currentUrl
  });

  const rightRail = (
    <PostRightRail
      stats={stats}
      progressItems={progressItems}
      quickLinks={quickLinks}
      relatedNotes={relatedNotes}
    />
  );

  const tocContent = (
    <div>
      <div className="mb-5 flex items-center gap-2.5 text-[10px] font-semibold text-slate-400 uppercase tracking-wider px-3">
        <span className="w-6 h-px bg-slate-200 dark:bg-slate-800" />
        Navigation
      </div>
      <BlogTOC content={post.content_body || ""} />
    </div>
  );

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(qaSchema) }}
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
            postType="question"
            coverUrl={post.cover_url || post.content_url}
            isLoggedIn={isLoggedIn}
          />

          {/* Main content with article/quiz tabs */}
          <BlogContentWrapper 
            post={post}
            questions={questions}
            formattedDate={new Date(post.created_at).toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' })}
            readTime={readTime}
            bengaliFontClass={bengaliFont.className}
            isLoggedIn={isLoggedIn}
          />

          {/* Discussion */}
          <div className="mt-10 md:mt-14 bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 p-5 md:p-8 shadow-sm transition-colors">
            <h3 className="text-base md:text-lg font-bold text-slate-800 dark:text-white mb-5 flex items-center gap-2.5">
              <span className="p-2 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 rounded-lg">💬</span>
              Community solutions
            </h3>
            <div className="w-full bg-slate-50 dark:bg-slate-950/40 rounded-xl p-4 md:p-5 min-h-[80px] flex justify-center border border-slate-100 dark:border-slate-800/60">
              <Discussion itemType="question" itemId={post.id.toString()} />
            </div>
          </div>

          {/* Mobile TOC */}
          <div className="xl:hidden mt-8">
            <BlogTOC content={post.content_body || ""} />
          </div>
        </PostPageShell>
        <ScrollToTop />
      </div>
    </>
  );
}