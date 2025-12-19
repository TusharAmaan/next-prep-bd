import { MetadataRoute } from 'next';
import { supabase } from '@/lib/supabaseClient';

const BASE_URL = 'https://www.nextprepbd.com'; // CHANGE THIS to your actual domain

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // 1. Fetch all your dynamic data
  const { data: blogs } = await supabase.from('resources').select('id, updated_at').eq('type', 'blog');
  const { data: news } = await supabase.from('news').select('id, created_at');
  const { data: courses } = await supabase.from('courses').select('id, created_at');
  const { data: segments } = await supabase.from('segments').select('id');

  // 2. Define static routes
  const routes = [
    '',
    '/materials',
    '/news',
    '/courses',
    '/contact',
  ].map((route) => ({
    url: `${BASE_URL}${route}`,
    lastModified: new Date(),
    changeFrequency: 'daily' as const,
    priority: 1,
  }));

  // 3. Generate dynamic blog routes
  const blogRoutes = (blogs || []).map((post) => ({
    url: `${BASE_URL}/blog/${post.id}`,
    lastModified: new Date(post.updated_at || new Date()),
    changeFrequency: 'weekly' as const,
    priority: 0.8,
  }));

  // 4. Generate news routes
  const newsRoutes = (news || []).map((item) => ({
    url: `${BASE_URL}/news/${item.id}`, // Assuming you have a dynamic news page
    lastModified: new Date(item.created_at),
    changeFrequency: 'daily' as const,
    priority: 0.9,
  }));

  // 5. Generate course routes
  const courseRoutes = (courses || []).map((course) => ({
    url: `${BASE_URL}/courses/${course.id}`,
    lastModified: new Date(course.created_at),
    changeFrequency: 'weekly' as const,
    priority: 0.9,
  }));

  // Combine everything
  return [...routes, ...blogRoutes, ...newsRoutes, ...courseRoutes];
}