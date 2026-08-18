import type { MetadataRoute } from 'next';
import { SITE_URL } from '../utils/seo';

const robots = (): MetadataRoute.Robots => ({
  rules: {
    userAgent: '*',
    allow: '/',
    disallow: [
      '/en/settings',
      '/zh/settings',
      '/en/messages',
      '/zh/messages',
      '/en/oauth/',
      '/zh/oauth/',
    ],
  },
  sitemap: new URL('/sitemap.xml', SITE_URL).toString(),
  host: SITE_URL.origin,
});

export default robots;
