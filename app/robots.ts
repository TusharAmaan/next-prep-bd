import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/admin/', '/api/'], // Don't let Google index your admin panel
    },
    sitemap: 'https://www.nextprepbd.com/sitemap.xml', // CHANGE THIS to your domain
  };
}