import { createClient } from "@/lib/supabaseServer";
import CurriculumContentClient from "./CurriculumContentClient";
import { Metadata } from 'next';
import { getBreadcrumbSchema, getArticleSchema } from "@/lib/seo-utils";
import { notFound } from "next/navigation";

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
    .select('*, groups(segments(title))')
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
