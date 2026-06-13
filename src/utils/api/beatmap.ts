import { api } from './client';
import { getApiErrorStatus } from '../typeGuards';
import type {
  Beatmap,
  Beatmapset,
  BeatmapsetSearchCursor,
  BeatmapsetSearchQuery,
  BeatmapsetSearchResponse,
} from '../../types';

const appendArrayParams = <T extends string>(
  params: URLSearchParams,
  key: string,
  values?: T[]
) => {
  values?.forEach((value) => params.append(key, value));
};

const appendCursorParams = (params: URLSearchParams, cursor?: BeatmapsetSearchCursor | null) => {
  if (!cursor) return;

  Object.entries(cursor).forEach(([key, value]) => {
    params.set(`cursor[${key}]`, value === null ? '' : String(value));
  });
};

const buildBeatmapsetSearchParams = (query: BeatmapsetSearchQuery): URLSearchParams => {
  const params = new URLSearchParams();

  if (query.q?.trim()) params.set('q', query.q.trim());
  appendArrayParams(params, 'c', query.c);
  if (query.m !== undefined && query.m !== null) params.set('m', query.m.toString());
  if (query.s) params.set('s', query.s);
  if (query.g !== undefined && query.g !== null) params.set('g', query.g.toString());
  if (query.l) params.set('l', query.l);
  params.set('sort', query.sort ?? 'ranked_desc');
  appendArrayParams(params, 'e', query.e);
  appendArrayParams(params, 'r', query.r);
  if (query.played !== undefined && query.played !== null)
    params.set('played', String(query.played));
  params.set('nsfw', String(query.nsfw ?? false));
  appendCursorParams(params, query.cursor);

  return params;
};

export const beatmapAPI = {
  getBeatmapByBeatmapId: async (beatmapId: number): Promise<Beatmapset> => {
    try {
      const response = await api.get(`/api/v2/beatmapsets/lookup?beatmap_id=${beatmapId}`);
      return response.data;
    } catch (error: unknown) {
      if (getApiErrorStatus(error) === 404) {
        throw new Error('Beatmap not found');
      }
      throw error;
    }
  },

  getBeatmapset: async (beatmapsetId: number): Promise<Beatmapset> => {
    try {
      const response = await api.get(`/api/v2/beatmapsets/${beatmapsetId}`);
      return response.data;
    } catch (error: unknown) {
      if (getApiErrorStatus(error) === 404) {
        throw new Error('Beatmapset not found');
      }
      throw error;
    }
  },

  searchBeatmapsets: async (
    query: BeatmapsetSearchQuery = {}
  ): Promise<BeatmapsetSearchResponse> => {
    const params = buildBeatmapsetSearchParams(query);
    const response = await api.get(`/api/v2/beatmapsets/search?${params.toString()}`);
    return response.data;
  },

  setBeatmapsetFavourite: async (
    beatmapsetId: number,
    action: 'favourite' | 'unfavourite'
  ): Promise<void> => {
    const formData = new URLSearchParams();
    formData.set('action', action);

    await api.post(`/api/v2/beatmapsets/${beatmapsetId}/favourites`, formData, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    });
  },

  getBeatmapsetDownloadUrl: async (beatmapsetId: number, noVideo = true): Promise<string> => {
    const response = await api.get<string>(`/api/v2/beatmapsets/${beatmapsetId}/download`, {
      params: {
        noVideo,
        link_only: true,
      },
      responseType: 'text',
    });

    const downloadUrl = response.data.trim();
    if (!downloadUrl) {
      throw new Error('Download link not found');
    }

    return downloadUrl;
  },

  extractBeatmapIdFromUrl: (url: string): number | null => {
    const beatmapMatch = url.match(/\/beatmaps\/(\d+)/);
    if (beatmapMatch) {
      return parseInt(beatmapMatch[1], 10);
    }

    const beatmapsetMatch = url.match(/\/beatmapsets\/\d+#[^/]+\/(\d+)/);
    if (beatmapsetMatch) {
      return parseInt(beatmapsetMatch[1], 10);
    }

    return null;
  },

  extractBeatmapsetIdFromUrl: (url: string): number | null => {
    const match = url.match(/\/beatmapsets\/(\d+)/);
    if (match) {
      return parseInt(match[1], 10);
    }
    return null;
  },

  convertToInternalBeatmapUrl: (url: string): string | null => {
    const beatmapsetMatch = url.match(/\/beatmapsets\/(\d+)(?:#([^/]+)\/(\d+))?/);
    if (beatmapsetMatch) {
      const beatmapsetId = beatmapsetMatch[1];
      const mode = beatmapsetMatch[2] || 'osu';
      const beatmapId = beatmapsetMatch[3];

      if (beatmapId) {
        return `/beatmapsets/${beatmapsetId}#${mode}/${beatmapId}`;
      } else {
        return `/beatmapsets/${beatmapsetId}`;
      }
    }

    const beatmapMatch = url.match(/\/beatmaps\/(\d+)/);
    if (beatmapMatch) {
      return `/beatmaps/${beatmapMatch[1]}`;
    }

    return null;
  },

  parseUrlBeatmapInfo: (
    url: string
  ): { beatmapsetId?: number; beatmapId?: number; mode?: string } => {
    const beatmapsetMatch = url.match(/\/beatmapsets\/(\d+)(?:#([^/]+)\/(\d+))?/);
    const beatmapMatch = url.match(/\/beatmaps\/(\d+)/);

    if (beatmapsetMatch) {
      const [, beatmapsetId, mode, beatmapId] = beatmapsetMatch;
      return {
        beatmapsetId: parseInt(beatmapsetId, 10),
        beatmapId: beatmapId ? parseInt(beatmapId, 10) : undefined,
        mode: mode || undefined,
      };
    } else if (beatmapMatch) {
      const [, beatmapId] = beatmapMatch;
      return {
        beatmapId: parseInt(beatmapId, 10),
      };
    }

    return {};
  },

  getBeatmapFromUrl: async (
    url: string
  ): Promise<{ beatmapset: Beatmapset; beatmap?: Beatmap }> => {
    const urlInfo = beatmapAPI.parseUrlBeatmapInfo(url);

    if (urlInfo.beatmapsetId) {
      const beatmapset = await beatmapAPI.getBeatmapset(urlInfo.beatmapsetId);
      const beatmap = urlInfo.beatmapId
        ? beatmapset.beatmaps.find((b: Beatmap) => b.id === urlInfo.beatmapId)
        : beatmapset.beatmaps[0];

      return { beatmapset, beatmap };
    } else if (urlInfo.beatmapId) {
      const beatmapset = await beatmapAPI.getBeatmapByBeatmapId(urlInfo.beatmapId);
      const beatmap = beatmapset.beatmaps.find((b: Beatmap) => b.id === urlInfo.beatmapId);

      return { beatmapset, beatmap };
    }

    throw new Error('Invalid beatmap URL');
  },
};
