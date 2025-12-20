import { MetadataRoute } from 'next';
import { supabase } from '@/lib/supabaseClient';

const BASE_URL = 'https://nextprepbd.com';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // 1. FETCH DATA
  const { data: segments } = await supabase.from('segments').select('slug');
  const { data: blogs } = await supabase.from('resources').select('id, updated_at').eq('type', 'blog');
  const { data: news } = await supabase.from('news').select('id, created_at');
  const { data: courses } = await supabase.from('courses').select('id, created_at');

  // 2. STATIC ROUTES
  // Fix: Explicitly tell TypeScript that 'daily'/'monthly' are valid types
  const staticRoutes = [
    '',
    '/about',
    '/contact',
    '/courses',
    '/news',
    '/privacy-policy',
    '/refund-policy',
  ].map((route) => ({
    url: `${BASE_URL}${route}`,
    lastModified: new Date(),
    changeFrequency: (route === '' ? 'daily' : 'monthly') as 'daily' | 'monthly',
    priority: route === '' ? 1 : 0.6,
  }));

  // 3. CATEGORY ROUTES
  const categoryRoutes = (segments || []).map((seg) => ({
    url: `${BASE_URL}/resources/${seg.slug}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as 'weekly', // Explicit cast
    priority: 0.9,
  }));

  // 4. BLOG ROUTES
  const blogRoutes = (blogs || []).map((post) => ({
    url: `${BASE_URL}/blog/${post.id}`,
    lastModified: new Date(post.updated_at || new Date()),
    changeFrequency: 'weekly' as 'weekly', // Explicit cast
    priority: 0.7,
  }));

  // 5. NEWS ROUTES
  const newsRoutes = (news || []).map((item) => ({
    url: `${BASE_URL}/news/${item.id}`,
    lastModified: new Date(item.created_at),
    changeFrequency: 'daily' as 'daily', // Explicit cast
    priority: 0.8,
  }));

  // 6. COURSE ROUTES
  const courseRoutes = (courses || []).map((course) => ({
    url: `${BASE_URL}/courses/${course.id}`,
    lastModified: new Date(course.created_at),
    changeFrequency: 'weekly' as 'weekly', // Explicit cast
    priority: 0.8,
  }));

  // Combine everything
  return [
    ...staticRoutes,
    ...categoryRoutes,
    ...blogRoutes,
    ...newsRoutes,
    ...courseRoutes,
  ];
}