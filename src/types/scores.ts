export interface BestScore {
  classic_total_score: number;
  preserve: boolean;
  processed: boolean;
  ranked: boolean;
  maximum_statistics: {
    great?: number;
    ignore_hit?: number;
    large_tick_hit?: number;
    slider_tail_hit?: number;
    large_bonus?: number;
    small_bonus?: number;
    legacy_combo_increase?: number;
  };
  mods: Array<{
    acronym: string;
  }>;
  statistics: {
    ok?: number;
    miss?: number;
    meh?: number;
    great?: number;
    ignore_hit?: number;
    ignore_miss?: number;
    large_bonus?: number;
    small_bonus?: number;
    large_tick_hit?: number;
    slider_tail_hit?: number;
  };
  total_score_without_mods: number;
  beatmap_id: number;
  best_id: number | null;
  id: number;
  rank: string;
  type: string;
  user_id: number;
  accuracy: number;
  build_id: number | null;
  ended_at: string;
  has_replay: boolean;
  is_perfect_combo: boolean;
  legacy_perfect: boolean;
  legacy_score_id: number | null;
  legacy_total_score: number;
  max_combo: number;
  passed: boolean;
  pp: number;
  ruleset_id: number;
  started_at: string | null;
  total_score: number;
  replay: boolean;
  current_user_attributes: {
    pin: {
      is_pinned: boolean;
      score_id: number;
    };
  };
  beatmap: {
    beatmapset_id: number;
    difficulty_rating: number;
    id: number;
    mode: string;
    status: string;
    total_length: number;
    user_id: number;
    version: string;
    accuracy: number;
    ar: number;
    bpm: number;
    convert: boolean;
    count_circles: number;
    count_sliders: number;
    count_spinners: number;
    cs: number;
    deleted_at: string | null;
    drain: number;
    hit_length: number;
    is_scoreable: boolean;
    last_updated: string;
    mode_int: number;
    passcount: number;
    playcount: number;
    ranked: number;
    url: string;
    checksum: string;
  };
  beatmapset: {
    artist: string;
    artist_unicode: string;
    covers: {
      cover: string;
      'cover@2x': string;
      card: string;
      'card@2x': string;
      list: string;
      'list@2x': string;
      slimcover: string;
      'slimcover@2x': string;
    };
    creator: string;
    favourite_count: number;
    genre_id: number;
    hype: unknown;
    id: number;
    language_id: number;
    nsfw: boolean;
    offset: number;
    play_count: number;
    preview_url: string;
    source: string;
    spotlight: boolean;
    status: string;
    title: string;
    title_unicode: string;
    track_id: number | null;
    user_id: number;
    video: boolean;
  };
  user: {
    avatar_url: string;
    country_code: string;
    default_group: string;
    id: number;
    is_active: boolean;
    is_bot: boolean;
    is_deleted: boolean;
    is_online: boolean;
    is_supporter: boolean;
    last_visit: string;
    pm_friends_only: boolean;
    profile_colour: string | null;
    username: string;
  };
  weight: {
    percentage: number;
    pp: number;
  };
}

// 谱面排行榜类型
export type BeatmapLeaderboardType = 'global' | 'friend' | 'country' | 'team';

// 谱面排行榜分数（与 BestScore 类似但包含用户信息）
export interface BeatmapScore {
  beatmap_id: number;
  best_id: number | null;
  id: number;
  rank: string;
  type: string;
  user_id: number;
  accuracy: number;
  build_id: number | null;
  ended_at: string;
  has_replay: boolean;
  is_perfect_combo: boolean;
  legacy_perfect: boolean;
  max_combo: number;
  passed: boolean;
  pp: number;
  ruleset_id: number;
  started_at: string | null;
  total_score: number;
  maximum_statistics: Record<string, number>;
  mods: Array<{ acronym: string }>;
  statistics: Record<string, number>;
  total_score_without_mods: number;
  classic_total_score: number | null;
  preserve: boolean;
  processed: boolean;
  ranked: boolean;
  user: {
    avatar_url: string;
    country_code: string;
    default_group: string;
    id: number;
    is_active: boolean;
    is_bot: boolean;
    is_deleted: boolean;
    is_online: boolean;
    is_supporter: boolean;
    last_visit: string | null;
    pm_friends_only: boolean;
    profile_colour: string | null;
    username: string;
    cover: {
      url: string;
      custom_url: string | null;
      id: string | null;
    };
    country: {
      code: string;
      name: string;
    };
    team: {
      id: number;
      name: string;
      short_name: string;
      flag_url: string;
    } | null;
  };
}

// 谱面排行榜响应
export interface BeatmapScoresResponse {
  scores: BeatmapScore[];
  user_score: {
    position: number;
    score: BeatmapScore;
  } | null;
  score_count: number;
}
