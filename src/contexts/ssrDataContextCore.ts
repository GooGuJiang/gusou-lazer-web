import { createContext } from 'react';
import type { Beatmapset, UserPageSsrPayload } from '../types';
import type { BeatmapsetsSsrSuccessPayload } from '../utils/beatmapsetsSsr';
import type { PublicPageSsrData } from '../utils/publicPageSsr';

export interface SsrDataContextValue {
  userPage: UserPageSsrPayload | null;
  beatmapsets: BeatmapsetsSsrSuccessPayload | null;
  beatmapset: Beatmapset | null;
  publicPage: PublicPageSsrData | null;
}

export const SsrDataContext = createContext<SsrDataContextValue>({
  userPage: null,
  beatmapsets: null,
  beatmapset: null,
  publicPage: null,
});
