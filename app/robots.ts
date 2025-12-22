import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      // Don't let Google index your Admin Panel!
      disallow: ['/admin/', '/login', '/dashboard'], 
    },
    sitemap: 'https://nextprepbd.com/sitemap.xml', // Change to your real domain
  };
}