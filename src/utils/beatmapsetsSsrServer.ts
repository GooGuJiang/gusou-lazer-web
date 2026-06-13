import type { BeatmapsetSearchResponse } from '../types';
import { API_BASE_URL } from './api/client';
import type { BeatmapsetsSsrDocumentPayload } from './beatmapsetsSsr';

const DEFAULT_BEATMAPSETS_SSR_ACCESS_TOKEN =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIzIiwiZXhwIjoxNzgxNDE1NzU5LCJqdGkiOiJlN2M3ODM2MGU2NzY0NmE1OWRhMjFhODUxNzhkYzFkYSIsImF1ZCI6IjUiLCJpc3MiOiJodHRwczovL2xhemVyLWFwaS5nMHYwLnRvcC8ifQ.bpTj2_6Vz4jZBC8XbDKGlx-TH9XTTxsRDjxMdavSYDs';

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

const getSsrAuthorization = (authorization?: string): string => {
  const token = authorization?.trim() || process.env.BEATMAPSETS_SSR_ACCESS_TOKEN?.trim() || DEFAULT_BEATMAPSETS_SSR_ACCESS_TOKEN;
  return token.startsWith('Bearer ') ? token : `Bearer ${token}`;
};

export const fetchBeatmapsetsSsrPayload = async (
  url: string,
  authorization?: string
): Promise<BeatmapsetsSsrDocumentPayload | null> => {
  const requestUrl = new URL(url, 'http://localhost');
  if (!normalizeBeatmapsetsPath(requestUrl.pathname)) return null;

  try {
    const response = await fetch(buildSearchUrl(requestUrl), {
      headers: {
        'Content-Type': 'application/json',
        'x-api-version': '20250913',
        Authorization: getSsrAuthorization(authorization),
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
