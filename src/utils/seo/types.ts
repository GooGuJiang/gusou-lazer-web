import type { Beatmapset, User } from '../../types';

export interface SeoCopy {
  title: string;
  description: string;
}

export interface DynamicSeoData {
  user?: User;
  beatmapset?: Beatmapset;
}
