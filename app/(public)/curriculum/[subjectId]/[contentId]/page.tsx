import { createClient } from "@/lib/supabaseServer";
import CurriculumContentClient from "./CurriculumContentClient";
import PostPageShell from "@/components/post/PostPageShell";
import PostRightRail from "@/components/post/PostRightRail";
import { Metadata } from 'next';
import { getBreadcrumbSchema, getArticleSchema } from "@/lib/seo-utils";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ChevronRight } from "lucide-react";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ subjectId: string, contentId: string }> }): Promise<Metadata> {
  const { contentId, subjectId } = await params;

  const supabase = await createClient();
  const { data: content } = await supabase
    .from('lesson_plan_contents')
    .select(`*, lesson_plan_lessons (*, lesson_plan_units (*))`)
    .eq('id', contentId)
    .single();

  if (!content) return { title: 'Content Not Found' };

  return {
    title: `${content.title} - ${content.lesson_plan_lessons?.title} | NextPrepBD`,
    description: `Study ${content.title} as part of the ${content.lesson_plan_lessons?.lesson_plan_units?.title} module. Access high-quality lesson plans and academic intelligence on NextPrepBD.`,
    alternates: {
      canonical: `/curriculum/${subjectId}/${contentId}`,
    },
    openGraph: {
      title: `${content.title} - NextPrepBD Curriculum`,
      description: `In-depth lesson plan for ${content.title}. Master your syllabus with strategic academic content.`,
      url: `https://nextprepbd.com/curriculum/${subjectId}/${contentId}`,
      type: 'article',
    },
  };
}

export default async function ContentDetailPage({ params }: { params: Promise<{ subjectId: string, contentId: string }> }) {
  const { subjectId, contentId } = await params;

  const supabase = await createClient();

  // 1. Fetch initial content
  const { data: initialContent } = await supabase
    .from('lesson_plan_contents')
    .select(`*, lesson_plan_lessons (*, lesson_plan_units (*))`)
    .eq('id', contentId)
    .single();
  
  if (!initialContent) return notFound();

  // Increment view count (Server-side)
  await supabase.from('lesson_plan_contents').update({ view_count: (initialContent.view_count || 0) + 1 }).eq('id', contentId);

  // 2. Fetch Subject Info
  const { data: subData } = await supabase
    .from('subjects')
    .select('*, groups(title, slug, segments(title, slug))')
    .eq('id', subjectId)
    .single();

  // 3. Fetch hierarchy for the sidebar/navigation
  const { data: hierarchyData } = await supabase
    .from('lesson_plan_units')
    .select(`
      *,
      lesson_plan_lessons (
        *,
        lesson_plan_contents (id, title, order_index, type)
      )
    `)
    .eq('subject_id', subjectId)
    .eq('version', initialContent.version || 'bn')
    .order('order_index');

  // 4. Get User Session (Server Component)
  const { data: { user } } = await supabase.auth.getUser();

  const currentUrl = `https://nextprepbd.com/curriculum/${subjectId}/${contentId}`;
  
  // SEO Schemas
  const breadcrumbItems = [
    { name: "Home", item: "https://nextprepbd.com" },
    { name: "Curriculum", item: "https://nextprepbd.com/curriculum" },
    { name: subData?.title || "Subject", item: `https://nextprepbd.com/curriculum/${subjectId}` },
    { name: initialContent.title, item: currentUrl }
  ];
  const breadcrumbSchema = getBreadcrumbSchema(breadcrumbItems);

  const articleSchema = getArticleSchema({
    title: initialContent.title,
    description: `Strategic lesson plan for ${initialContent.title}. Part of ${initialContent.lesson_plan_lessons?.title}.`,
    url: currentUrl,
    datePublished: initialContent.created_at,
    authorName: "NextPrepBD Academic Team"
  });

  // Right rail data
  const unitTitle = initialContent.lesson_plan_lessons?.lesson_plan_units?.title || "Unit";
  const lessonTitle = initialContent.lesson_plan_lessons?.title || "Lesson";
  const segmentTitle = subData?.groups?.segments?.title || "";
  const groupTitle = subData?.groups?.title || "";

  // Count total contents in the hierarchy
  const totalContents = (hierarchyData || []).reduce((sum: number, unit: any) => {
    return sum + (unit.lesson_plan_lessons || []).reduce((lSum: number, lesson: any) => {
      return lSum + (lesson.lesson_plan_contents || []).length;
    }, 0);
  }, 0);

  const totalLessons = (hierarchyData || []).reduce((sum: number, unit: any) => {
    return sum + (unit.lesson_plan_lessons || []).length;
  }, 0);

  const stats = [
    { value: (hierarchyData || []).length, label: "Units" },
    { value: totalLessons, label: "Lessons" },
    { value: totalContents, label: "Contents" },
    { value: initialContent.view_count || 0, label: "Views" },
  ];

  const quickLinks = [
    { label: `${subData?.title || "Subject"} curriculum`, href: `/curriculum/${subjectId}` },
    { label: "All curricula", href: "/curriculum" },
    ...(subData?.groups?.segments?.slug ? [{ label: `${segmentTitle} resources`, href: `/resources/${subData.groups.segments.slug}` }] : []),
    { label: "Forum", href: "/forum" },
  ];

  const rightRail = (
    <PostRightRail
      stats={stats}
      quickLinks={quickLinks}
      showSocial={true}
    >
      {/* Subject CTA */}
      <div className="bg-gradient-to-br from-indigo-600 to-violet-700 rounded-2xl p-6 text-white relative overflow-hidden shadow-lg">
        <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full blur-2xl -mr-12 -mt-12" />
        <h4 className="text-lg font-bold mb-2 leading-snug">
          {subData?.title || "Subject"} curriculum
        </h4>
        <p className="text-indigo-100 text-xs mb-5 font-medium leading-relaxed">
          {totalLessons} lessons across {(hierarchyData || []).length} units. Track your progress.
        </p>
        <Link
          href={`/curriculum/${subjectId}`}
          className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-white text-indigo-700 rounded-xl text-xs font-bold shadow-md hover:bg-indigo-50 transition-all"
        >
          View full curriculum <ChevronRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    </PostRightRail>
  );

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
      <CurriculumContentClient 
        subjectId={subjectId}
        initialContent={initialContent}
        initialSubject={subData}
        initialHierarchy={hierarchyData || []}
        user={user}
      />
    </>
  );
}
