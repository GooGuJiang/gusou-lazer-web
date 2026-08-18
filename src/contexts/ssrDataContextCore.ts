import { createContext } from 'react';
import type { Beatmapset, UserPageSsrPayload } from '../types';
import type { BeatmapsetsSsrSuccessPayload } from '../utils/beatmapsetsSsr';

export interface SsrDataContextValue {
  userPage: UserPageSsrPayload | null;
  beatmapsets: BeatmapsetsSsrSuccessPayload | null;
  beatmapset: Beatmapset | null;
}

export const SsrDataContext = createContext<SsrDataContextValue>({
  userPage: null,
  beatmapsets: null,
  beatmapset: null,
});
