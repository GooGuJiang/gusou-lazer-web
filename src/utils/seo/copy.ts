import type { AppLanguages } from '../../i18n/resources';
import type { DynamicSeoData, SeoCopy } from './types';

const DEFAULT_SEO: Record<AppLanguages, SeoCopy> = {
  en: {
    title: 'g0v0! — A free and open rhythm game server',
    description:
      'g0v0! is a free and open rhythm game server with support for both stable and lazer clients and RX/AP pp calculation, designed to offer a freer rhythm experience.',
  },
  zh: {
    title: '咕哦！— 自由开放的节奏游戏服务器',
    description:
      'g0v0! 是一个自由开放的节奏游戏服务器，支持 stable 和 lazer 双客户端及 RX/AP pp 计算，旨在提供更自由的节奏体验。',
  },
};

const STATIC_SEO: Record<string, Record<AppLanguages, SeoCopy>> = {
  '/rankings': {
    en: {
      title: 'Player and team rankings | g0v0!',
      description: 'Explore g0v0! player, country and team rankings across supported game modes.',
    },
    zh: {
      title: '玩家与战队排行榜 | 咕哦！',
      description: '查看咕哦！各游戏模式的玩家、国家和战队排行榜。',
    },
  },
  '/teams': {
    en: {
      title: 'Teams | g0v0!',
      description: 'Discover and join player teams in the g0v0! community.',
    },
    zh: {
      title: '战队 | 咕哦！',
      description: '发现并加入咕哦！社区中的玩家战队。',
    },
  },
  '/beatmapsets': {
    en: {
      title: 'Browse beatmaps | g0v0!',
      description: 'Search and discover beatmapsets for every supported game mode.',
    },
    zh: {
      title: '浏览谱面 | 咕哦！',
      description: '搜索并发现适用于各个游戏模式的谱面。',
    },
  },
  '/how-to-join': {
    en: {
      title: 'How to join g0v0!',
      description: 'Follow the setup guide to connect your client to the g0v0! server.',
    },
    zh: {
      title: '如何加入咕哦！',
      description: '按照配置指南将客户端连接到咕哦！服务器。',
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
  '/client-verifications/create': {
    en: {
      title: 'Client login verification | g0v0!',
      description: 'Allow the stable client to log in and count this device as trusted.',
    },
    zh: {
      title: '客户端登录验证 | 咕哦！',
      description: '允许 stable 客户端登录，并将该设备计入可信设备。',
    },
  },
};

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
          description: `查看 ${username ?? '玩家'} 在咕哦！的成绩、排名和近期活动。`,
        }
      : {
          title: `${username ?? 'Player profile'} | g0v0!`,
          description: `View ${username ?? 'this player'}'s scores, rankings and recent activity on g0v0!.`,
        };
  }

  if (/^\/(?:beatmaps|beatmapsets)\/\d+$/.test(pathname)) {
    const beatmapset = data.beatmapset;
    if (beatmapset) {
      const name = `${beatmapset.artist} — ${beatmapset.title}`;
      return language === 'zh'
        ? {
            title: `${name} | 咕哦！谱面`,
            description: `查看由 ${beatmapset.creator} 创建的谱面 ${name}。`,
          }
        : {
            title: `${name} | g0v0! beatmap`,
            description: `View the beatmap ${name}, mapped by ${beatmapset.creator}.`,
          };
    }

    return language === 'zh'
      ? { title: '谱面 | 咕哦！', description: '查看谱面详情与排行榜。' }
      : { title: 'Beatmap | g0v0!', description: 'View beatmap details and rankings.' };
  }

  if (/^\/teams\/[^/]+$/.test(pathname)) return STATIC_SEO['/teams'][language];
  if (/^\/scores\/\d+$/.test(pathname)) {
    return language === 'zh'
      ? { title: '成绩 | 咕哦！', description: '查看成绩详情与回放信息。' }
      : {
          title: 'Score | g0v0!',
          description: 'View score details and replay information.',
        };
  }

  return null;
};

export const getSeoCopy = (
  language: AppLanguages,
  pathname: string,
  data: DynamicSeoData
): SeoCopy =>
  getDynamicSeo(language, pathname, data) ??
  STATIC_SEO[pathname]?.[language] ??
  DEFAULT_SEO[language];
