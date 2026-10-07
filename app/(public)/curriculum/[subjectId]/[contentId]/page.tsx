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
  const [{ data: content }, { data: subData }] = await Promise.all([
    supabase
      .from('lesson_plan_contents')
      .select(`*, lesson_plan_lessons (*, lesson_plan_units (*))`)
      .eq('id', contentId)
      .single(),
    supabase
      .from('subjects')
      .select('*, groups(title, slug, segments(title, slug))')
      .eq('id', subjectId)
      .single()
  ]);

  if (!content) return { title: 'Lesson Not Found | NextPrepBD' };

  const unitTitle = content.lesson_plan_lessons?.lesson_plan_units?.title || '';
  const lessonTitle = content.lesson_plan_lessons?.title || '';
  const subjectTitle = subData?.title || 'Academic Subject';
  const groupTitle = subData?.groups?.title || '';
  const segmentTitle = subData?.groups?.segments?.title || '';

  const metaTitle = `${content.title} | ${subjectTitle} Curriculum - NextPrepBD`;
  const metaDescription = `Study "${content.title}" in ${lessonTitle ? `${lessonTitle}, ` : ''}${unitTitle ? `${unitTitle} - ` : ''}${subjectTitle}${segmentTitle ? ` (${segmentTitle})` : ''}. Comprehensive lessons, syllabus notes, and exam practice on NextPrepBD.`;

  return {
    title: metaTitle,
    description: metaDescription,
    keywords: [
      content.title,
      subjectTitle,
      lessonTitle,
      unitTitle,
      groupTitle,
      segmentTitle,
      'NCTB Curriculum',
      'Bangladesh Academic Syllabus',
      'Class Lessons BD',
      'NextPrepBD'
    ].filter(Boolean),
    alternates: {
      canonical: `https://nextprepbd.com/curriculum/${subjectId}/${contentId}`,
    },
    openGraph: {
      title: `${content.title} - ${subjectTitle} | NextPrepBD Curriculum`,
      description: metaDescription,
      url: `https://nextprepbd.com/curriculum/${subjectId}/${contentId}`,
      siteName: 'NextPrepBD',
      locale: 'en_US',
      type: 'article',
      images: [
        {
          url: 'https://nextprepbd.com/og-image.png',
          width: 1200,
          height: 630,
          alt: `${content.title} - ${subjectTitle} NextPrepBD`
        }
      ]
    },
    twitter: {
      card: 'summary_large_image',
      title: `${content.title} | ${subjectTitle} - NextPrepBD`,
      description: metaDescription,
      images: ['https://nextprepbd.com/og-image.png']
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        'max-video-preview': -1,
        'max-image-preview': 'large',
        'max-snippet': -1,
      }
    }
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

  // Dynamically resolve author profile if author_id is recorded
  if (initialContent.author_id) {
    const { data: authorProfile } = await supabase
      .from('profiles')
      .select('id, full_name, role')
      .eq('id', initialContent.author_id)
      .single();
    if (authorProfile?.full_name) {
      initialContent.author = authorProfile;
      initialContent.author_name = authorProfile.full_name;
    }
  }

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
  const unitTitle = initialContent.lesson_plan_lessons?.lesson_plan_units?.title || "Unit";
  const lessonTitle = initialContent.lesson_plan_lessons?.title || "Lesson";
  const segmentTitle = subData?.groups?.segments?.title || "";
  const groupTitle = subData?.groups?.title || "";

  // Full Hierarchical Breadcrumb Structure for Google
  const breadcrumbItems = [
    { name: "Home", item: "/" },
    { name: "Curriculum", item: "/curriculum" },
    ...(subData?.groups?.segments?.slug ? [{ name: subData.groups.segments.title, item: `/resources/${subData.groups.segments.slug}` }] : []),
    ...(subData?.groups?.slug && subData?.groups?.segments?.slug ? [{ name: subData.groups.title, item: `/resources/${subData.groups.segments.slug}/${subData.groups.slug}` }] : []),
    ...(subData?.slug && subData?.groups?.slug && subData?.groups?.segments?.slug ? [{ name: subData.title, item: `/resources/${subData.groups.segments.slug}/${subData.groups.slug}/${subData.slug}` }] : []),
    ...(unitTitle ? [{ name: unitTitle, item: `/curriculum/${subjectId}/${contentId}` }] : []),
    { name: initialContent.title, item: `/curriculum/${subjectId}/${contentId}` }
  ];
  const breadcrumbSchema = getBreadcrumbSchema(breadcrumbItems);

  // Google LearningResource Educational Schema
  const learningResourceSchema = {
    "@context": "https://schema.org",
    "@type": ["Article", "LearningResource"],
    "headline": initialContent.title,
    "name": initialContent.title,
    "description": `Study ${initialContent.title} as part of ${unitTitle} in ${subData?.title || 'Academic'} curriculum.`,
    "learningResourceType": "LessonPlan",
    "educationalLevel": segmentTitle ? `${segmentTitle} Curriculum` : "NCTB Curriculum",
    "inLanguage": initialContent.version === 'en' ? 'en' : 'bn-BD',
    "isAccessibleForFree": true,
    "url": currentUrl,
    "datePublished": initialContent.created_at,
    "dateModified": initialContent.created_at,
    "teaches": initialContent.title,
    "author": {
      "@type": "Person",
      "name": initialContent.author_name || initialContent.author?.full_name || `${subData?.title || 'Academic'} Curriculum Faculty`
    },
    "publisher": {
      "@type": "Organization",
      "name": "NextPrepBD",
      "url": "https://nextprepbd.com",
      "logo": {
        "@type": "ImageObject",
        "url": "https://nextprepbd.com/icon.png"
      }
    },
    "isPartOf": {
      "@type": "Course",
      "name": `${subData?.title || 'Academic'} Curriculum`,
      "description": `Standardized curriculum course for ${subData?.title || 'Subject'}.`,
      "provider": {
        "@type": "Organization",
        "name": "NextPrepBD",
        "sameAs": "https://nextprepbd.com"
      }
    }
  };

  const articleSchema = getArticleSchema({
    title: initialContent.title,
    description: `Strategic lesson plan for ${initialContent.title}. Part of ${initialContent.lesson_plan_lessons?.title}.`,
    url: currentUrl,
    datePublished: initialContent.created_at,
    authorName: initialContent.author_name || initialContent.author?.full_name || `${subData?.title || 'Academic'} Curriculum Faculty`
  });

  // Right rail data
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
    { label: "Academic Curriculum", href: "/curriculum" },
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
          href="/curriculum"
          className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-white text-indigo-700 rounded-xl text-xs font-bold shadow-md hover:bg-indigo-50 transition-all"
        >
          Explore All Curricula <ChevronRight className="w-3.5 h-3.5" />
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
        dangerouslySetInnerHTML={{ __html: JSON.stringify(learningResourceSchema) }}
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
