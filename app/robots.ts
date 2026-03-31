import { MetadataRoute } from 'next';
import { siteConfig } from '@/lib/seo-utils';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      // Don't let Google index your Admin Panel!
      disallow: ['/admin/', '/login', '/dashboard'], 
    },
    sitemap: `${siteConfig.url}/sitemap.xml`,
  };
}