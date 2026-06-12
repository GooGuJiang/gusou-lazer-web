import { api } from './client';
import { getApiErrorStatus } from '../typeGuards';
import type { Beatmap, Beatmapset } from '../../types';

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

  parseUrlBeatmapInfo: (url: string): { beatmapsetId?: number; beatmapId?: number; mode?: string } => {
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

  getBeatmapFromUrl: async (url: string): Promise<{ beatmapset: Beatmapset; beatmap?: Beatmap }> => {
    const urlInfo = beatmapAPI.parseUrlBeatmapInfo(url);

    if (urlInfo.beatmapsetId) {
      const beatmapset = await beatmapAPI.getBeatmapset(urlInfo.beatmapsetId);
      const beatmap = urlInfo.beatmapId
        ? beatmapset.beatmaps.find((b: Beatmap) => b.id === urlInfo.beatmapId)
        : beatmapset.beatmaps[0];

      return { beatmapset, beatmap };
    } else if (urlInfo.beatmapId) {
      const beatmap = await beatmapAPI.getBeatmapByBeatmapId(urlInfo.beatmapId);
      const beatmapset = await beatmapAPI.getBeatmapset(beatmap.beatmapset_id);

      return { beatmapset, beatmap };
    }

    throw new Error('Invalid beatmap URL');
  },
};
