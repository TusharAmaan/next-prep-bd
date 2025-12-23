import { MetadataRoute } from 'next';
import { supabase } from '@/lib/supabaseClient';

// ⚠️ CHANGE THIS TO YOUR ACTUAL DOMAIN
const BASE_URL = 'https://nextprepbd.com'; 

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  
  // 1. Fetch BLOGS (Only type='blog')
  const { data: blogs } = await supabase
    .from('resources')
    .select('id, updated_at')
    .eq('type', 'blog');

  // 2. Fetch NEWS
  const { data: news } = await supabase
    .from('news')
    .select('id, created_at');

  // 3. Fetch UPDATES (Notices)
  const { data: updates } = await supabase
    .from('segment_updates')
    .select('id, created_at');

  // 4. Fetch SEGMENTS & GROUPS (For Landing Pages)
  const { data: segments } = await supabase.from('segments').select('slug');
  // Note: Fetching groups requires a bit more logic, keeping it simple for now or fetch if needed
  
  // --- BUILD URLS ---

  // Static Pages (High Priority)
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
    
  ].map((route) => ({
    url: `${BASE_URL}${route}`,
    lastModified: new Date(),
    changeFrequency: 'daily',
    priority: 1.0,
  }));

  // Blog URLs
  const blogRoutes: MetadataRoute.Sitemap = (blogs || []).map((post) => ({
    url: `${BASE_URL}/blog/${post.id}`,
    lastModified: new Date(post.updated_at),
    changeFrequency: 'weekly',
    priority: 0.8,
  }));

  // News URLs (News needs to be fresh!)
  const newsRoutes: MetadataRoute.Sitemap = (news || []).map((item) => ({
    url: `${BASE_URL}/news/${item.id}`,
    lastModified: new Date(item.created_at),
    changeFrequency: 'daily',
    priority: 0.9,
  }));

  // Update URLs
  const updateRoutes: MetadataRoute.Sitemap = (updates || []).map((item) => ({
    url: `${BASE_URL}/updates/${item.id}`,
    lastModified: new Date(item.created_at),
    changeFrequency: 'weekly',
    priority: 0.7,
  }));

  // Segment Landing Pages
  const segmentRoutes: MetadataRoute.Sitemap = (segments || []).map((seg) => ({
    url: `${BASE_URL}/resources/${seg.slug}`,
    lastModified: new Date(),
    changeFrequency: 'weekly',
    priority: 0.9,
  }));

  // COMBINE EVERYTHING
  return [
    ...staticRoutes,
    ...segmentRoutes,
    ...blogRoutes,
    ...newsRoutes,
    ...updateRoutes,
  ];
}