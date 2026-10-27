import type { AppLanguages } from '../../i18n/resources';
import { getSeoCopy } from './copy';
import { getLocalizedPath } from './paths';
import { SITE_URL } from './site';
import type { DynamicSeoData } from './types';

export const createStructuredData = (
  language: AppLanguages,
  pathname: string,
  data: DynamicSeoData = {}
): Record<string, unknown> => {
  const copy = getSeoCopy(language, pathname, data);
  const url = new URL(getLocalizedPath(language, pathname), SITE_URL).toString();

  if (data.user) {
    return {
      '@context': 'https://schema.org',
      '@type': 'ProfilePage',
      name: copy.title,
      description: copy.description,
      url,
      mainEntity: { '@type': 'Person', name: data.user.username, image: data.user.avatar_url },
    };
  }

  return {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: copy.title,
    description: copy.description,
    url,
    isPartOf: {
      '@type': 'WebSite',
      name: 'g0v0!',
      url: SITE_URL.toString(),
      inLanguage: ['en', 'zh-CN'],
    },
  };
};
