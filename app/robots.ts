import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/admin/', '/api/','/dashboard'], // Don't let Google index your admin panel
    },
    sitemap: 'https://www.nextprepbd.com/sitemap.xml',
  };
}