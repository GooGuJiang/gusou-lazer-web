import type { BeatmapsetSearchResponse } from '../types';
import { API_BASE_URL } from './api/baseUrl';
import type { BeatmapsetsSsrDocumentPayload } from './beatmapsetsSsr';

const normalizeBeatmapsetsPath = (pathname: string): boolean => /^\/beatmapsets\/?$/.test(pathname);

const buildSearchUrl = (requestUrl: URL): string => {
  const searchParams = new URLSearchParams(requestUrl.searchParams);
  if (!searchParams.has('sort')) {
    searchParams.set('sort', searchParams.get('q')?.trim() ? 'relevance_desc' : 'ranked_desc');
  }
  if (!searchParams.has('s')) searchParams.set('s', 'leaderboard');
  if (!searchParams.has('nsfw')) searchParams.set('nsfw', 'false');

  return `${API_BASE_URL}/api/v2/beatmapsets/search?${searchParams.toString()}`;
};

const getSsrAuthorization = (authorization?: string): string | undefined => {
  const token = authorization?.trim() || process.env.BEATMAPSETS_SSR_ACCESS_TOKEN?.trim();
  if (!token) return undefined;
  return token.startsWith('Bearer ') ? token : `Bearer ${token}`;
};

export const fetchBeatmapsetsSsrPayload = async (
  url: string,
  authorization?: string
): Promise<BeatmapsetsSsrDocumentPayload | null> => {
  const requestUrl = new URL(url, 'http://localhost');
  if (!normalizeBeatmapsetsPath(requestUrl.pathname)) return null;

  try {
    const authorizationHeader = getSsrAuthorization(authorization);
    const response = await fetch(buildSearchUrl(requestUrl), {
      headers: {
        'Content-Type': 'application/json',
        'x-api-version': '20250913',
        ...(authorizationHeader ? { Authorization: authorizationHeader } : {}),
      },
    });

    if (!response.ok) {
      return {
        route: {
          search: requestUrl.search,
        },
        error: {
          message: `HTTP ${response.status}`,
          status: response.status,
        },
      };
    }

    return {
      route: {
        search: requestUrl.search,
      },
      response: (await response.json()) as BeatmapsetSearchResponse,
      fetchedAt: new Date().toISOString(),
    };
  } catch (error) {
    return {
      route: {
        search: requestUrl.search,
      },
      error: {
        message: error instanceof Error ? error.message : 'Failed to fetch beatmapsets SSR payload',
      },
    };
  }
};
