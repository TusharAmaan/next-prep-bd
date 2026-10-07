import { MetadataRoute } from 'next';
import { siteConfig } from '@/lib/seo-utils';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: ['/', '/curriculum/', '/resources/'],
      disallow: ['/admin/', '/login', '/dashboard', '/student/', '/tutor/', '/api/'], 
    },
    sitemap: [
      `${siteConfig.url}/sitemap.xml`,
      `${siteConfig.url}/forum-sitemap.xml`
    ],
  };
}