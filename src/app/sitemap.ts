import type { MetadataRoute } from 'next';
import { SUPPORTED_LANGUAGES } from '../i18n/config';
import { SITE_URL } from '../utils/seo';

const PUBLIC_PATHS = [
  { path: '', changeFrequency: 'weekly', priority: 1 },
  { path: '/rankings', changeFrequency: 'daily', priority: 0.9 },
  { path: '/beatmapsets', changeFrequency: 'daily', priority: 0.9 },
  { path: '/teams', changeFrequency: 'daily', priority: 0.8 },
  { path: '/how-to-join', changeFrequency: 'monthly', priority: 0.7 },
] as const;

const sitemap = (): MetadataRoute.Sitemap =>
  SUPPORTED_LANGUAGES.flatMap((language) =>
    PUBLIC_PATHS.map(({ path, changeFrequency, priority }) => ({
      url: new URL(`/${language}${path}`, SITE_URL).toString(),
      lastModified: new Date(),
      changeFrequency,
      priority,
      alternates: {
        languages: {
          en: new URL(`/en${path}`, SITE_URL).toString(),
          'zh-CN': new URL(`/zh${path}`, SITE_URL).toString(),
        },
      },
    }))
  );

export default sitemap;
