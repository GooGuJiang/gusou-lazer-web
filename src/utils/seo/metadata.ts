import type { Metadata } from 'next';
import type { AppLanguages } from '../../i18n/resources';
import { getSeoCopy } from './copy';
import { getLocalizedPath, PRIVATE_PATHS } from './paths';
import type { DynamicSeoData } from './types';

export const createPageMetadata = (
  language: AppLanguages,
  pathname: string,
  data: DynamicSeoData = {}
): Metadata => {
  const copy = getSeoCopy(language, pathname, data);
  const canonical = getLocalizedPath(language, pathname);
  const shouldIndex = !PRIVATE_PATHS.some((pattern) => pattern.test(pathname));
  const image = data.user?.avatar_url || data.beatmapset?.covers?.cover || '/g0v0.webp';

  return {
    title: copy.title,
    description: copy.description,
    keywords:
      language === 'zh'
        ? ['osu!', 'osu! lazer', '私服', '谱面', '排行榜', '节奏游戏']
        : ['osu!', 'osu! lazer', 'private server', 'beatmaps', 'rankings', 'rhythm game'],
    alternates: {
      canonical,
      languages: {
        en: getLocalizedPath('en', pathname),
        'zh-CN': getLocalizedPath('zh', pathname),
        'x-default': getLocalizedPath('en', pathname),
      },
    },
    robots: {
      index: shouldIndex,
      follow: shouldIndex,
      googleBot: {
        index: shouldIndex,
        follow: shouldIndex,
        'max-image-preview': 'large',
        'max-snippet': -1,
        'max-video-preview': -1,
      },
    },
    openGraph: {
      type: 'website',
      siteName: 'g0v0!',
      title: copy.title,
      description: copy.description,
      url: canonical,
      locale: language === 'zh' ? 'zh_CN' : 'en_US',
      alternateLocale: language === 'zh' ? ['en_US'] : ['zh_CN'],
      images: [{ url: image, alt: copy.title }],
    },
    twitter: {
      card: 'summary_large_image',
      title: copy.title,
      description: copy.description,
      images: [image],
    },
  };
};
