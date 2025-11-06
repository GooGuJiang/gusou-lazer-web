import 'server-only';

import { cookies } from 'next/headers';

import type {
  Beatmapset,
  GameMode,
  RankingType,
  TeamDetailResponse,
  TeamRankingsResponse,
  TopUsersResponse,
  User,
} from '@/types';

const API_BASE_URL =
  process.env.API_BASE_URL || process.env.NEXT_PUBLIC_API_BASE_URL || 'http://127.0.0.1:8000';

const API_VERSION = '20250913';

class ApiError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

const buildHeaders = (additional?: HeadersInit): HeadersInit => {
  const cookieStore = cookies();
  const accessToken = cookieStore.get('access_token')?.value;
  const deviceUuid = cookieStore.get('device_uuid')?.value;

  const headers = new Headers({
    'x-api-version': API_VERSION,
    ...(additional || {}),
  });

  if (accessToken) {
    headers.set('Authorization', `Bearer ${accessToken}`);
  }

  if (deviceUuid) {
    headers.set('X-UUID', deviceUuid);
  }

  return headers;
};

const handleResponse = async <T>(response: Response): Promise<T> => {
  if (response.ok) {
    return response.json() as Promise<T>;
  }

  let message = `API request failed with status ${response.status}`;
  try {
    const data = await response.json();
    if (typeof data?.detail === 'string') {
      message = data.detail;
    } else if (typeof data?.message === 'string') {
      message = data.message;
    }
  } catch {
    // Ignore JSON parsing errors
  }

  throw new ApiError(message, response.status);
};

const fetchFromApi = async <T>(endpoint: string, init?: RequestInit): Promise<T> => {
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...init,
    headers: buildHeaders(init?.headers),
    cache: 'no-store',
  });

  return handleResponse<T>(response);
};

export const fetchCurrentUser = async (mode?: GameMode): Promise<User | null> => {
  try {
    const suffix = mode ? `/${mode}` : '/';
    return await fetchFromApi<User>(`/api/v2/me${suffix}`);
  } catch (error) {
    if (error instanceof ApiError && error.status === 401) {
      return null;
    }
    throw error;
  }
};

export const fetchUserProfile = async (
  userIdOrName: string | number,
  mode?: GameMode,
  options?: RequestInit,
): Promise<User> => {
  const suffix = mode ? `/${mode}` : '';
  return fetchFromApi<User>(`/api/v2/users/${userIdOrName}${suffix}`, options);
};

export const fetchTeamDetail = async (teamId: number | string): Promise<TeamDetailResponse> => {
  return fetchFromApi<TeamDetailResponse>(`/api/private/team/${teamId}`);
};

export const fetchTeamRankings = async (
  mode: GameMode,
  type: RankingType,
  page: number = 1,
): Promise<TeamRankingsResponse> => {
  const params = new URLSearchParams({ page: page.toString() });
  return fetchFromApi<TeamRankingsResponse>(`/api/v2/rankings/${mode}/team/${type}?${params}`);
};

export const fetchUserRankings = async (
  mode: GameMode,
  type: RankingType,
  page: number = 1,
  country?: string,
): Promise<TopUsersResponse> => {
  const params = new URLSearchParams({ page: page.toString() });
  if (country) params.append('country', country);
  return fetchFromApi<TopUsersResponse>(`/api/v2/rankings/${mode}/${type}?${params}`);
};

export const fetchBeatmapset = async (beatmapsetId: number | string): Promise<Beatmapset> => {
  return fetchFromApi<Beatmapset>(`/api/v2/beatmapsets/${beatmapsetId}`);
};

export const fetchBeatmapById = async (beatmapId: number | string): Promise<Beatmapset> => {
  return fetchFromApi<Beatmapset>(`/api/v2/beatmapsets/lookup?beatmap_id=${beatmapId}`);
};

export type { ApiError };
