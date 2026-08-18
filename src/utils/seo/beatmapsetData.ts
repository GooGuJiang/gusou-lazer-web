import type { Beatmapset } from '../../types';
import { API_BASE_URL } from '../api/baseUrl';

const getBeatmapEndpoint = (pathname: string): string | null => {
  const beatmapsetMatch = /^\/beatmapsets\/(\d+)$/.exec(pathname);
  if (beatmapsetMatch?.[1]) return `/api/v2/beatmapsets/${beatmapsetMatch[1]}`;

  const beatmapMatch = /^\/beatmaps\/(\d+)$/.exec(pathname);
  return beatmapMatch?.[1] ? `/api/v2/beatmapsets/lookup?beatmap_id=${beatmapMatch[1]}` : null;
};

export const fetchBeatmapsetSeoData = async (pathname: string): Promise<Beatmapset | null> => {
  const endpoint = getBeatmapEndpoint(pathname);
  if (!endpoint) return null;

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      headers: { 'Content-Type': 'application/json', 'x-api-version': '20250913' },
      next: { revalidate: 300 },
    });
    return response.ok ? ((await response.json()) as Beatmapset) : null;
  } catch {
    return null;
  }
};
