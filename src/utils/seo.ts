import type { Metadata } from 'next';
import type { AppLanguages } from '../i18n/resources';
import type { Beatmapset, User } from '../types';

export const SITE_URL = new URL(process.env.NEXT_PUBLIC_SITE_URL || 'https://lazer.g0v0.top');

interface SeoCopy {
  title: string;
  description: string;
}

interface DynamicSeoData {
  user?: User;
  beatmapset?: Beatmapset;
}

const DEFAULT_SEO: Record<AppLanguages, SeoCopy> = {
  en: {
    title: 'g0v0! — osu! lazer private server',
    description:
      'Play osu! lazer with standard, taiko, catch, mania, RX and AP support, complete pp calculation, rankings, teams and community features.',
  },
  zh: {
    title: '咕哦！— osu! lazer 私服',
    description:
      '面向 osu! lazer 的第三方服务器，支持 standard、taiko、catch、mania、RX/AP、完整 PP 计算、排行榜、战队与社区功能。',
  },
};

const STATIC_SEO: Record<string, Record<AppLanguages, SeoCopy>> = {
  '/rankings': {
    en: {
      title: 'Player and team rankings | g0v0!',
      description:
        'Explore g0v0! player, country and team rankings across supported osu! rulesets.',
    },
    zh: {
      title: '玩家与战队排行榜 | 咕哦！',
      description: '查看咕哦！各游戏模式的玩家、国家和战队排行榜。',
    },
  },
  '/teams': {
    en: {
      title: 'osu! teams | g0v0!',
      description: 'Discover and join player teams in the g0v0! osu! lazer community.',
    },
    zh: {
      title: 'osu! 战队 | 咕哦！',
      description: '发现并加入咕哦！osu! lazer 社区中的玩家战队。',
    },
  },
  '/beatmapsets': {
    en: {
      title: 'Browse osu! beatmaps | g0v0!',
      description: 'Search and discover osu! beatmapsets for every supported game mode.',
    },
    zh: {
      title: '浏览 osu! 谱面 | 咕哦！',
      description: '搜索并发现适用于各个游戏模式的 osu! 谱面。',
    },
  },
  '/how-to-join': {
    en: {
      title: 'How to join g0v0! with osu! lazer',
      description: 'Follow the setup guide to connect osu! lazer to the g0v0! server.',
    },
    zh: {
      title: '如何使用 osu! lazer 加入咕哦！',
      description: '按照配置指南将 osu! lazer 连接到咕哦！服务器。',
    },
  },
  '/privacy-policy': {
    en: {
      title: 'Privacy policy | g0v0!',
      description: 'Read how g0v0! handles account, gameplay and website data.',
    },
    zh: {
      title: '隐私政策 | 咕哦！',
      description: '了解咕哦！如何处理账号、游戏和网站数据。',
    },
  },
  '/login': {
    en: { title: 'Sign in | g0v0!', description: 'Sign in to your g0v0! account.' },
    zh: { title: '登录 | 咕哦！', description: '登录你的咕哦！账号。' },
  },
  '/register': {
    en: { title: 'Create an account | g0v0!', description: 'Create a g0v0! player account.' },
    zh: { title: '创建账号 | 咕哦！', description: '创建咕哦！玩家账号。' },
  },
};

const PRIVATE_PATHS = [
  /^\/login$/,
  /^\/register$/,
  /^\/password-reset$/,
  /^\/settings$/,
  /^\/messages$/,
  /^\/oauth\/authorize$/,
  /^\/teams\/create$/,
  /^\/teams\/[^/]+\/edit$/,
];

const KNOWN_PATHS = [
  /^\/$/,
  /^\/(?:login|register|password-reset|settings|rankings|teams|messages|how-to-join|privacy-policy|beatmapsets)$/,
  /^\/oauth\/authorize$/,
  /^\/users\/[^/]+$/,
  /^\/teams\/[^/]+(?:\/edit)?$/,
  /^\/beatmaps\/\d+$/,
  /^\/beatmapsets\/\d+$/,
  /^\/scores\/\d+$/,
];

export const isKnownApplicationPath = (pathname: string): boolean =>
  KNOWN_PATHS.some((pattern) => pattern.test(pathname));

const getDynamicSeo = (
  language: AppLanguages,
  pathname: string,
  data: DynamicSeoData
): SeoCopy | null => {
  if (/^\/users\/[^/]+$/.test(pathname)) {
    const username = data.user?.username;
    return language === 'zh'
      ? {
          title: `${username ?? '玩家资料'} | 咕哦！`,
          description: `查看 ${username ?? '玩家'} 在咕哦！的 osu! 成绩、排名和近期活动。`,
        }
      : {
          title: `${username ?? 'Player profile'} | g0v0!`,
          description: `View ${username ?? 'this player'}'s osu! scores, rankings and recent activity on g0v0!.`,
        };
  }

  if (/^\/(?:beatmaps|beatmapsets)\/\d+$/.test(pathname)) {
    const beatmapset = data.beatmapset;
    if (beatmapset) {
      const name = `${beatmapset.artist} — ${beatmapset.title}`;
      return language === 'zh'
        ? {
            title: `${name} | 咕哦！谱面`,
            description: `查看由 ${beatmapset.creator} 创建的 osu! 谱面 ${name}。`,
          }
        : {
            title: `${name} | g0v0! beatmap`,
            description: `View the osu! beatmap ${name}, mapped by ${beatmapset.creator}.`,
          };
    }

    return language === 'zh'
      ? { title: 'osu! 谱面 | 咕哦！', description: '查看 osu! 谱面详情与排行榜。' }
      : { title: 'osu! beatmap | g0v0!', description: 'View osu! beatmap details and rankings.' };
  }

  if (/^\/teams\/[^/]+$/.test(pathname)) return STATIC_SEO['/teams'][language];
  if (/^\/scores\/\d+$/.test(pathname)) {
    return language === 'zh'
      ? { title: 'osu! 成绩 | 咕哦！', description: '查看 osu! 成绩详情与回放信息。' }
      : {
          title: 'osu! score | g0v0!',
          description: 'View osu! score details and replay information.',
        };
  }

  return null;
};

const getSeoCopy = (language: AppLanguages, pathname: string, data: DynamicSeoData): SeoCopy =>
  getDynamicSeo(language, pathname, data) ??
  STATIC_SEO[pathname]?.[language] ??
  DEFAULT_SEO[language];

const getLocalizedPath = (language: AppLanguages, pathname: string): string =>
  `/${language}${pathname === '/' ? '' : pathname}`;

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
      mainEntity: {
        '@type': 'Person',
        name: data.user.username,
        image: data.user.avatar_url,
      },
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
