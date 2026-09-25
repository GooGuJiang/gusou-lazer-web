import type {
  Beatmapset,
  BeatmapScoresResponse,
  CountryResponse,
  ScoreDetail,
  TeamDetailResponse,
  TeamRankingsResponse,
  TopUsersResponse,
  User,
} from '../types';
import { API_BASE_URL } from './api/baseUrl';

export interface PublicPageSsrData {
  pathname: string;
  userRankings?: TopUsersResponse;
  countryRankings?: CountryResponse;
  teamRankings?: TeamRankingsResponse;
  teamDetail?: TeamDetailResponse;
  score?: ScoreDetail;
  scoreUser?: User;
  beatmapScores?: { beatmapId: number; mode: string; response: BeatmapScoresResponse };
}

const fetchPublicJson = async <T>(path: string): Promise<T | undefined> => {
  try {
    const response = await fetch(`${API_BASE_URL}${path}`, {
      next: { revalidate: 60 },
      headers: { 'x-api-version': '20250913' },
    });
    return response.ok ? ((await response.json()) as T) : undefined;
  } catch {
    return undefined;
  }
};

export const fetchPublicPageSsrData = async (
  pathname: string
): Promise<PublicPageSsrData | null> => {
  if (pathname === '/rankings') {
    const [userRankings, countryRankings] = await Promise.all([
      fetchPublicJson<TopUsersResponse>('/api/v2/rankings/osu/performance?page=1'),
      fetchPublicJson<CountryResponse>('/api/v2/rankings/osu/country?page=1'),
    ]);
    return { pathname, userRankings, countryRankings };
  }

  if (pathname === '/teams') {
    const teamRankings = await fetchPublicJson<TeamRankingsResponse>(
      '/api/v2/rankings/osu/team/performance?page=1'
    );
    return { pathname, teamRankings };
  }

  const teamMatch = /^\/teams\/(\d+)$/.exec(pathname);
  if (teamMatch) {
    const teamDetail = await fetchPublicJson<TeamDetailResponse>(`/api/v2/team/${teamMatch[1]}/`);
    return { pathname, teamDetail };
  }

  const scoreMatch = /^\/scores\/(\d+)$/.exec(pathname);
  if (scoreMatch) {
    const score = await fetchPublicJson<ScoreDetail>(`/api/v2/scores/${scoreMatch[1]}`);
    const scoreUser = score
      ? await fetchPublicJson<User>(`/api/v2/users/${score.user_id}/${score.beatmap.mode}`)
      : undefined;
    return { pathname, score, scoreUser };
  }

  return null;
};

export const fetchBeatmapScoresSsrData = async (
  pathname: string,
  beatmapset: Beatmapset | null
): Promise<PublicPageSsrData | null> => {
  if (!beatmapset) return null;

  const beatmapMatch = /^\/beatmaps\/(\d+)$/.exec(pathname);
  const beatmap =
    beatmapset.beatmaps.find((item) => item.id === Number(beatmapMatch?.[1])) ??
    beatmapset.beatmaps[0];
  if (!beatmap) return null;

  const mode = beatmap.mode || 'osu';
  const query = new URLSearchParams({ mode, type: 'global', limit: '50' });
  const response = await fetchPublicJson<BeatmapScoresResponse>(
    `/api/v2/beatmaps/${beatmap.id}/scores?${query}`
  );
  return response ? { pathname, beatmapScores: { beatmapId: beatmap.id, mode, response } } : null;
};
