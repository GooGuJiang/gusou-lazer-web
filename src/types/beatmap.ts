export interface BeatmapCovers {
  cover: string;
  card: string;
  list: string;
  slimcover: string;
  'cover@2x': string;
  'card@2x': string;
  'list@2x': string;
  'slimcover@2x': string;
}

export interface Beatmap {
  url: string;
  mode: string;
  beatmapset_id: number;
  difficulty_rating: number;
  total_length: number;
  user_id: number;
  version: string;
  checksum: string;
  current_user_playcount: number;
  max_combo: number;
  ar: number;
  cs: number;
  drain: number;
  accuracy: number;
  bpm: number;
  count_circles: number;
  count_sliders: number;
  count_spinners: number;
  deleted_at: string | null;
  hit_length: number;
  last_updated: string;
  id: number;
  beatmapset: Beatmapset | null;
  convert: boolean;
  is_scoreable: boolean;
  status: string;
  mode_int: number;
  ranked: number;
  playcount: number;
  passcount: number;
  failtimes: {
    exit: number[];
    fail: number[];
  };
  top_tag_ids: number[];
  current_user_tag_ids: number[];
}

export interface Beatmapset {
  artist: string;
  artist_unicode: string;
  covers: BeatmapCovers;
  creator: string;
  nsfw: boolean;
  play_count: number;
  preview_url: string;
  source: string;
  spotlight: boolean;
  title: string;
  title_unicode: string;
  user_id: number;
  video: boolean;
  current_nominations: unknown;
  description: string | null;
  pack_tags: string[];
  track_id: number | null;
  bpm: number;
  can_be_hyped: boolean;
  discussion_locked: boolean;
  last_updated: string;
  ranked_date: string | null;
  storyboard: boolean;
  submitted_date: string;
  tags: string;
  id: number;
  beatmaps: Beatmap[];
  discussion_enabled: boolean;
  status: string;
  ranked: number;
  legacy_thread_url: string;
  is_scoreable: boolean;
  hype: {
    current: number;
    required: number;
  };
  availability: {
    more_information: string | null;
    download_disabled: boolean;
  };
  genre: {
    name: string;
    id: number;
  };
  genre_id: number;
  language: {
    name: string;
    id: number;
  };
  language_id: number;
  nominations: {
    current: number;
    required: number;
  };
  has_favourited: boolean;
  favourite_count: number;
  recent_favourites: unknown[];
}

export type BeatmapsetSearchGeneral =
  | 'recommended'
  | 'converts'
  | 'follows'
  | 'spotlights'
  | 'featured_artists';

export type BeatmapsetSearchCategory =
  | 'any'
  | 'leaderboard'
  | 'ranked'
  | 'qualified'
  | 'loved'
  | 'favourites'
  | 'pending'
  | 'wip'
  | 'graveyard'
  | 'mine';

export type BeatmapsetSearchLanguage =
  | 'any'
  | 'unspecified'
  | 'english'
  | 'japanese'
  | 'chinese'
  | 'instrumental'
  | 'korean'
  | 'french'
  | 'german'
  | 'swedish'
  | 'spanish'
  | 'italian'
  | 'russian'
  | 'polish'
  | 'other';

export type BeatmapsetSearchSort =
  | 'title_asc'
  | 'artist_asc'
  | 'difficulty_asc'
  | 'updated_asc'
  | 'ranked_asc'
  | 'rating_asc'
  | 'plays_asc'
  | 'favourites_asc'
  | 'relevance_asc'
  | 'nominations_asc'
  | 'title_desc'
  | 'artist_desc'
  | 'difficulty_desc'
  | 'updated_desc'
  | 'ranked_desc'
  | 'rating_desc'
  | 'plays_desc'
  | 'favourites_desc'
  | 'relevance_desc'
  | 'nominations_desc';

export type BeatmapsetSearchExtra = 'video' | 'storyboard';

export type BeatmapsetSearchRank = 'XH' | 'X' | 'SH' | 'S' | 'A' | 'B' | 'C' | 'D';

export interface BeatmapsetSearchQuery {
  q?: string;
  c?: BeatmapsetSearchGeneral[];
  m?: number | null;
  s?: BeatmapsetSearchCategory;
  g?: number | null;
  l?: BeatmapsetSearchLanguage;
  sort?: BeatmapsetSearchSort;
  e?: BeatmapsetSearchExtra[];
  r?: BeatmapsetSearchRank[];
  played?: boolean | null;
  nsfw?: boolean;
  cursor_string?: string | null;
}

export interface BeatmapsetSearchBeatmap {
  beatmapset_id: number;
  difficulty_rating: number;
  id: number;
  mode: string;
  total_length: number;
  user_id: number;
  version: string;
  url: string;
  checksum: string;
  max_combo: number | null;
  ar: number;
  cs: number;
  drain: number;
  accuracy: number;
  bpm: number;
  count_circles: number;
  count_sliders: number;
  count_spinners: number;
  deleted_at: string | null;
  hit_length: number;
  last_updated: string;
  status: string;
  convert: boolean;
  is_scoreable: boolean;
  mode_int: number;
  ranked: number;
  playcount: number;
  passcount: number;
}

export interface BeatmapsetSearchResult {
  id: number;
  artist: string;
  artist_unicode: string;
  covers: BeatmapCovers;
  creator: string;
  nsfw: boolean;
  preview_url: string;
  source: string;
  spotlight: boolean;
  title: string;
  title_unicode: string;
  track_id: number | null;
  user_id: number;
  video: boolean;
  pack_tags: string[];
  discussion_enabled: boolean;
  status: string;
  ranked: number;
  favourite_count: number;
  genre_id: number;
  language_id: number;
  play_count: number;
  beatmaps: BeatmapsetSearchBeatmap[];
  has_favourited?: boolean;
}

export interface BeatmapsetSearchResponse {
  beatmapsets: BeatmapsetSearchResult[];
  total: number;
  cursor: Record<string, number | string | null> | null;
  cursor_string: string | null;
}
