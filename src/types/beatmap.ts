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
