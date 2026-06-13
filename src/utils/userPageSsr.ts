import type { GameMode, UserPageSsrPayload } from '../types';
import { API_BASE_URL } from './api/client';

const USER_PAGE_SSR_SCRIPT_ID = '__USER_PAGE_SSR_DATA__';
const USER_PAGE_SSR_MAX_AGE = 60_000;
const USER_PAGE_ACTIVITY_LIMIT = 6;

const GAME_MODES: readonly GameMode[] = [
  'osu',
  'taiko',
  'fruits',
  'mania',
  'osurx',
  'osuap',
  'taikorx',
  'fruitsrx',
];

interface UserPageSsrErrorPayload {
  route: {
    userId: string;
    mode?: GameMode;
  };
  error: {
    message: string;
    status?: number;
  };
}

type UserPageSsrDocumentPayload = UserPageSsrPayload | UserPageSsrErrorPayload;

let serverUserPageSsrPayload: UserPageSsrPayload | null = null;

const escapeJsonForHtml = (value: unknown): string =>
  JSON.stringify(value).replace(/</g, '\\u003c').replace(/>/g, '\\u003e').replace(/&/g, '\\u0026');

const isGameMode = (value: string | null): value is GameMode =>
  value !== null && GAME_MODES.includes(value as GameMode);

const getModeFromSearchParams = (searchParams: URLSearchParams): GameMode | undefined => {
  const mode = searchParams.get('mode');
  return isGameMode(mode) ? mode : undefined;
};

const normalizeUserPagePath = (pathname: string): string | null => {
  const match = /^\/users\/([^/?#]+)\/?$/.exec(pathname);
  return match?.[1] ? decodeURIComponent(match[1]) : null;
};

const getUserPageApiVersionHeaders = () => ({
  'Content-Type': 'application/json',
  'x-api-version': '20250913',
});

const fetchJson = async <T>(url: string): Promise<T> => {
  const response = await fetch(url, {
    headers: getUserPageApiVersionHeaders(),
  });

  if (!response.ok) {
    throw new Error(`HTTP ${response.status}`);
  }

  return (await response.json()) as T;
};

export const setServerUserPageSsrPayload = (payload: UserPageSsrPayload | null): void => {
  serverUserPageSsrPayload = payload;
};

export const getUserPageSsrPayloadFromDocument = (): UserPageSsrPayload | null => {
  if (typeof document === 'undefined') return serverUserPageSsrPayload;

  const script = document.getElementById(USER_PAGE_SSR_SCRIPT_ID);
  if (!script?.textContent) return null;

  try {
    const payload = JSON.parse(script.textContent) as UserPageSsrDocumentPayload;
    if ('user' in payload && 'recentActivities' in payload) {
      return payload;
    }
  } catch (error) {
    console.error('Failed to parse user page SSR payload:', error);
  }

  return null;
};

export const getUserPageSsrMaxAge = (): number => USER_PAGE_SSR_MAX_AGE;

export const getUserPageSsrActivityLimit = (): number => USER_PAGE_ACTIVITY_LIMIT;

export const fetchUserPageSsrPayload = async (
  url: string
): Promise<UserPageSsrDocumentPayload | null> => {
  const requestUrl = new URL(url, 'http://localhost');
  const userId = normalizeUserPagePath(requestUrl.pathname);

  if (!userId) return null;

  const mode = getModeFromSearchParams(requestUrl.searchParams);
  const encodedUserId = encodeURIComponent(userId);
  const userUrl = mode
    ? `${API_BASE_URL}/api/v2/users/${encodedUserId}/${mode}`
    : `${API_BASE_URL}/api/v2/users/${encodedUserId}/`;

  try {
    const user = await fetchJson<UserPageSsrPayload['user']>(userUrl);
    const recentActivitiesUrl = `${API_BASE_URL}/api/v2/users/${user.id}/recent_activity?limit=${USER_PAGE_ACTIVITY_LIMIT}&offset=0`;
    const recentActivitiesResponse = await fetchJson<unknown>(recentActivitiesUrl);
    const recentActivities = Array.isArray(recentActivitiesResponse)
      ? recentActivitiesResponse
      : [];

    return {
      route: {
        userId,
        mode,
      },
      user,
      recentActivities: recentActivities as UserPageSsrPayload['recentActivities'],
      recentActivitiesHasMore: recentActivities.length === USER_PAGE_ACTIVITY_LIMIT,
      fetchedAt: new Date().toISOString(),
    };
  } catch (error) {
    return {
      route: {
        userId,
        mode,
      },
      error: {
        message: error instanceof Error ? error.message : 'Failed to fetch user page SSR payload',
      },
    };
  }
};

export const injectUserPageSsrPayload = (
  html: string,
  payload: UserPageSsrDocumentPayload | null
): string => {
  if (!payload) return html;

  const script = `<script id="${USER_PAGE_SSR_SCRIPT_ID}" type="application/json">${escapeJsonForHtml(payload)}</script>`;
  return html.replace('<div id="root">', `${script}<div id="root">`);
};
