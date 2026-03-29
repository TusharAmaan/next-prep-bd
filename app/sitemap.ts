import { MetadataRoute } from 'next';
import { supabase } from '@/lib/supabaseClient';

const BASE_URL = 'https://nextprepbd.com'; 

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  
  // 1. Fetch Parallel Data for Maximum Efficiency
  const [
    { data: blogs },
    { data: news },
    { data: updates },
    { data: segments },
    { data: curriculumSubjects },
    { data: curriculumContents }
  ] = await Promise.all([
    supabase.from('resources').select('id, updated_at').eq('type', 'blog'),
    supabase.from('news').select('id, created_at'),
    supabase.from('segment_updates').select('id, created_at'),
    supabase.from('segments').select('slug'),
    supabase.from('subjects').select('id'),
    supabase.from('lesson_plan_contents').select('id, lesson_plan_lessons(subject_id), updated_at')
  ]);

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
    '/refund-policy'
  ].map((route) => ({
    url: `${BASE_URL}${route}`,
    lastModified: new Date(),
    changeFrequency: 'daily',
    priority: 1.0,
  }));

  // Blog URLs (Priority: 0.8)
  const blogRoutes: MetadataRoute.Sitemap = (blogs || []).map((post) => ({
    url: `${BASE_URL}/blog/${post.id}`,
    lastModified: new Date(post.updated_at),
    changeFrequency: 'daily',
    priority: 0.8,
  }));

  // News URLs (Priority: 0.9)
  const newsRoutes: MetadataRoute.Sitemap = (news || []).map((item) => ({
    url: `${BASE_URL}/news/${item.id}`,
    lastModified: new Date(item.created_at),
    changeFrequency: 'daily',
    priority: 0.9,
  }));

  // Segment Landing Pages (Priority: 0.9)
  const segmentRoutes: MetadataRoute.Sitemap = (segments || []).map((seg) => ({
    url: `${BASE_URL}/resources/${seg.slug}`,
    lastModified: new Date(),
    changeFrequency: 'daily',
    priority: 0.9,
  }));

  // Curriculum Subject Pages (Priority: 0.9)
  const curriculumSubjectRoutes: MetadataRoute.Sitemap = (curriculumSubjects || []).map((sub) => ({
    url: `${BASE_URL}/curriculum/${sub.id}`,
    lastModified: new Date(),
    changeFrequency: 'weekly',
    priority: 0.9,
  }));

  // Curriculum Content Pages (Detailed Article Logic - Priority: 0.8)
  const curriculumContentRoutes: MetadataRoute.Sitemap = (curriculumContents || [])
    .filter(content => {
      const lesson = Array.isArray(content.lesson_plan_lessons) ? content.lesson_plan_lessons[0] : content.lesson_plan_lessons;
      return lesson && lesson.subject_id;
    })
    .map((content) => {
      const lesson = Array.isArray(content.lesson_plan_lessons) ? content.lesson_plan_lessons[0] : content.lesson_plan_lessons;
      const subjectId = (lesson as any).subject_id;
      return {
        url: `${BASE_URL}/curriculum/${subjectId}/${content.id}`,
        lastModified: content.updated_at ? new Date(content.updated_at) : new Date(),
        changeFrequency: 'monthly',
        priority: 0.8,
      };
    });

  // Update URLs (Priority: 0.7)
  const updateRoutes: MetadataRoute.Sitemap = (updates || []).map((item) => ({
    url: `${BASE_URL}/updates/${item.id}`,
    lastModified: new Date(item.created_at),
    changeFrequency: 'daily',
    priority: 0.7,
  }));

  // COMBINE EVERYTHING
  return [
    ...staticRoutes,
    ...segmentRoutes,
    ...curriculumSubjectRoutes,
    ...curriculumContentRoutes,
    ...blogRoutes,
    ...newsRoutes,
    ...updateRoutes,
  ];
}