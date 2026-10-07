import { MetadataRoute } from 'next';
import { createClient } from '@/lib/supabaseServer';
import { siteConfig } from '@/lib/seo-utils';

export const revalidate = 86400; // Cache sitemap for 24 hours to prevent crawler CPU exhaustion

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const BASE_URL = siteConfig.url;
  const supabase = await createClient();

  try {
    // 1. Fetch Parallel Data for Maximum Efficiency
    const [
      { data: blogs, error: blogsError },
      { data: questions, error: questionsError },
      { data: news, error: newsError },
      { data: updates, error: updatesError },
      { data: segments, error: segmentsError },
      { data: groups, error: groupsError },
      { data: subjects, error: subjectsError },
      { data: curriculumContents, error: contentsError },
      { data: courses, error: coursesError },
      { data: ebooks, error: ebooksError },
      { data: forumThreads, error: forumThreadsError }
    ] = await Promise.all([
      supabase.from('resources').select('id, updated_at').eq('type', 'blog'),
      supabase.from('resources').select('id, slug, updated_at').eq('type', 'question').eq('status', 'approved'),
      supabase.from('news').select('id, created_at'),
      supabase.from('segment_updates').select('id, created_at, segments(slug)'),
      supabase.from('segments').select('slug'),
      supabase.from('groups').select('slug, segments!inner(slug)'),
      supabase.from('subjects').select('slug, groups!inner(slug, segments!inner(slug))'),
      supabase.from('lesson_plan_contents').select(`
        id,
        created_at,
        lesson_plan_lessons!inner (
          id,
          lesson_plan_units!inner (
            subject_id
          )
        )
      `),
      supabase.from('courses').select('id, updated_at'),
      supabase.from('ebooks').select('id, updated_at'),
      supabase.from('forum_threads').select('id, created_at')
    ]);

    // Log internal errors for debugging without crashing the sitemap
    if (blogsError) console.error('Sitemap: Blogs error:', blogsError);
    if (questionsError) console.error('Sitemap: Questions error:', questionsError);
    if (newsError) console.error('Sitemap: News error:', newsError);
    if (updatesError) console.error('Sitemap: Updates error:', updatesError);
    if (segmentsError) console.error('Sitemap: Segments error:', segmentsError);
    if (groupsError) console.error('Sitemap: Groups error:', groupsError);
    if (subjectsError) console.error('Sitemap: Subjects error:', subjectsError);
    if (contentsError) console.error('Sitemap: Contents error:', contentsError);
    if (coursesError) console.error('Sitemap: Courses error:', coursesError);
    if (ebooksError) console.error('Sitemap: Ebooks error:', ebooksError);
    if (forumThreadsError) console.error('Sitemap: Forum threads error:', forumThreadsError);

    // --- BUILD URLS ---

    // Static Pages (Protocol Priority: 1.0)
    const staticRoutes: MetadataRoute.Sitemap = [
      '',
      '/about',
      '/contact',
      '/courses',
      '/ebooks',
      '/news',
      '/search',
      '/blog',
      '/resources',
      '/curriculum',
      '/privacy-policy',
      '/terms',
      '/refund-policy',
      '/forum'
    ].map((route) => ({
      url: `${BASE_URL}${route}`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1.0,
    }));

    // Academic Segment Landing Pages (Priority: 0.95)
    const segmentRoutes: MetadataRoute.Sitemap = (segments || []).map((seg) => ({
      url: `${BASE_URL}/resources/${seg.slug}`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.95,
    }));

    // Segment Updates Archive Hubs (Priority: 0.85)
    const updateHubRoutes: MetadataRoute.Sitemap = (segments || []).map((seg) => ({
      url: `${BASE_URL}/resources/${seg.slug}/updates`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.85,
    }));

    // Academic Group Categories under Segments (Priority: 0.9)
    const groupRoutes: MetadataRoute.Sitemap = (groups || []).map((grp: any) => ({
      url: `${BASE_URL}/resources/${grp.segments.slug}/${grp.slug}`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.9,
    }));

    // Academic Subject Categories under Groups (Priority: 0.9)
    const subjectRoutes: MetadataRoute.Sitemap = (subjects || []).map((sub: any) => ({
      url: `${BASE_URL}/resources/${sub.groups.segments.slug}/${sub.groups.slug}/${sub.slug}`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.9,
    }));

    // Individual Curriculum Lesson Contents (Priority: 0.85)
    const curriculumContentRoutes: MetadataRoute.Sitemap = (curriculumContents || [])
      .map((content: any) => {
        const subjectId = content.lesson_plan_lessons?.lesson_plan_units?.subject_id;
        if (!subjectId) return null;
        return {
          url: `${BASE_URL}/curriculum/${subjectId}/${content.id}`,
          lastModified: content.created_at ? new Date(content.created_at) : new Date(),
          changeFrequency: 'weekly' as const,
          priority: 0.85,
        };
      })
      .filter(Boolean) as MetadataRoute.Sitemap;

    // Academic Notice / Update Detail Pages (Priority: 0.75)
    const updateItemRoutes: MetadataRoute.Sitemap = (updates || []).map((item: any) => {
      const segSlug = item.segments?.slug || 'ssc';
      return {
        url: `${BASE_URL}/resources/${segSlug}/updates/${item.id}`,
        lastModified: item.created_at ? new Date(item.created_at) : new Date(),
        changeFrequency: 'daily' as const,
        priority: 0.75,
      };
    });

    // Question URLs (Priority: 0.8)
    const questionRoutes: MetadataRoute.Sitemap = (questions || []).map((post: any) => ({
      url: `${BASE_URL}/question/${post.slug || post.id}`,
      lastModified: post.updated_at ? new Date(post.updated_at) : new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    }));

    // Blog URLs (Priority: 0.8)
    const blogRoutes: MetadataRoute.Sitemap = (blogs || []).map((post) => ({
      url: `${BASE_URL}/blog/${post.id}`,
      lastModified: post.updated_at ? new Date(post.updated_at) : new Date(),
      changeFrequency: 'daily' as const,
      priority: 0.8,
    }));

    // News URLs (Priority: 0.9)
    const newsRoutes: MetadataRoute.Sitemap = (news || []).map((item) => ({
      url: `${BASE_URL}/news/${item.id}`,
      lastModified: item.created_at ? new Date(item.created_at) : new Date(),
      changeFrequency: 'daily' as const,
      priority: 0.9,
    }));

    // Course URLs (Priority: 0.8)
    const courseRoutes: MetadataRoute.Sitemap = (courses || []).map((course) => ({
      url: `${BASE_URL}/courses/${course.id}`,
      lastModified: course.updated_at ? new Date(course.updated_at) : new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    }));

    // Ebook URLs (Priority: 0.8)
    const ebookRoutes: MetadataRoute.Sitemap = (ebooks || []).map((book) => ({
      url: `${BASE_URL}/ebooks/${book.id}`,
      lastModified: book.updated_at ? new Date(book.updated_at) : new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    }));

    // Forum Thread URLs (Priority: 0.7)
    const forumThreadRoutes: MetadataRoute.Sitemap = (forumThreads || []).map((thread) => ({
      url: `${BASE_URL}/forum/thread/${thread.id}`,
      lastModified: thread.created_at ? new Date(thread.created_at) : new Date(),
      changeFrequency: 'daily' as const,
      priority: 0.7,
    }));

    // COMBINE EVERYTHING
    return [
      ...staticRoutes,
      ...segmentRoutes,
      ...updateHubRoutes,
      ...groupRoutes,
      ...subjectRoutes,
      ...curriculumContentRoutes,
      ...updateItemRoutes,
      ...questionRoutes,
      ...blogRoutes,
      ...newsRoutes,
      ...courseRoutes,
      ...ebookRoutes,
      ...forumThreadRoutes,
    ];
  } catch (error) {
    console.error('CRITICAL Error generating sitemap:', error);
    // Return at least static routes if dynamic fetching fails
    return [
      { url: BASE_URL, lastModified: new Date(), changeFrequency: 'daily', priority: 1.0 },
      { url: `${BASE_URL}/curriculum`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.9 },
      { url: `${BASE_URL}/blog`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.8 },
      { url: `${BASE_URL}/news`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.9 },
      { url: `${BASE_URL}/forum`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.9 },
      { url: `${BASE_URL}/courses`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.9 },
      { url: `${BASE_URL}/ebooks`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.9 },
    ];
  }
}