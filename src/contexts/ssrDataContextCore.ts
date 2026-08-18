import { createContext } from 'react';
import type { UserPageSsrPayload } from '../types';
import type { BeatmapsetsSsrSuccessPayload } from '../utils/beatmapsetsSsr';

export interface SsrDataContextValue {
  userPage: UserPageSsrPayload | null;
  beatmapsets: BeatmapsetsSsrSuccessPayload | null;
}

export const SsrDataContext = createContext<SsrDataContextValue>({
  userPage: null,
  beatmapsets: null,
});
