import type { GameMode } from './common';

export interface Team {
  id: number;
  flag_url: string;
  created_at: string;
  short_name: string;
  name: string;
  cover_url: string;
  leader_id: number;
}

export interface UserStatistics {
  mode: GameMode;
  user_id?: number;
  count_300?: number;
  count_100?: number;
  count_50?: number;
  count_miss?: number;
  total_score?: number;
  ranked_score?: number;
  pp?: number;
  hit_accuracy?: number;
  play_count?: number;
  play_time?: number;
  total_hits?: number;
  maximum_combo?: number;
  replays_watched?: number;
  replays_watched_by_others?: number;
  is_ranked?: boolean;
  grade_counts?: {
    ssh: number;
    ss: number;
    sh: number;
    s: number;
    a: number;
  };
  level?: {
    current: number;
    progress: number;
  };
  global_rank?: number | null;
  country_rank?: number | null;
}

export interface User {
  id: number;
  username: string;
  email?: string;
  country_code: string;
  join_date: string;
  last_visit: string;
  is_supporter: boolean;
  support_level: number;
  priv?: number;
  avatar_url?: string;
  cover_url?: string;
  cover?: {
    url: string;
  };
  is_active: boolean;
  is_bot: boolean;
  pm_friends_only: boolean;
  profile_colour?: string | null;
  page?: {
    html: string;
    raw: string;
  };
  previous_usernames: string[];
  badges: unknown[];
  is_restricted: boolean;
  beatmap_playcounts_count: number;
  playmode: string;
  g0v0_playmode?: GameMode;
  discord?: string | null;
  has_supported: boolean;
  interests?: string | null;
  location?: string | null;
  max_blocks: number;
  max_friends: number;
  occupation?: string | null;
  playstyle: string[];
  profile_hue?: number | null;
  profile_order: string[];
  title?: string | null;
  title_url?: string | null;
  twitter?: string | null;
  website?: string | null;
  comments_count: number;
  post_count: number;
  is_admin: boolean;
  is_gmt: boolean;
  is_qat: boolean;
  is_bng: boolean;
  is_online: number;
  groups: unknown[];
  country: {
    code: string;
    name: string;
  };
  favourite_beatmapset_count: number;
  graveyard_beatmapset_count: number;
  guest_beatmapset_count: number;
  loved_beatmapset_count: number;
  mapping_follower_count: number;
  nominated_beatmapset_count: number;
  pending_beatmapset_count: number;
  ranked_beatmapset_count: number;
  follow_user_mapping: unknown[];
  follower_count: number;
  friends?: unknown;
  scores_best_count: number;
  scores_first_count: number;
  scores_recent_count: number;
  scores_pinned_count: number;
  account_history: unknown[];
  active_tournament_banners: unknown[];
  kudosu: {
    available: number;
    total: number;
  };
  monthly_playcounts: {
    start_date: string;
    count: number;
  }[];
  replay_watched_counts: unknown[];
  unread_pm_count: number;
  rank_history?: {
    mode: string;
    data: number[];
  };
  rank_highest?: {
    rank: number;
    updated_at: string;
  };
  statistics?: UserStatistics;
  statistics_rulesets?: {
    [key: string]: UserStatistics;
  };
  user_achievements: unknown[];
  team?: Team;
  session_verified: boolean;
  daily_challenge_user_stats?: {
    daily_streak_best: number;
    daily_streak_current: number;
    last_update?: string | null;
    last_weekly_streak?: unknown;
    playcount: number;
    top_10p_placements: number;
    top_50p_placements: number;
    weekly_streak_best: number;
    weekly_streak_current: number;
    user_id: number;
  };
}

export interface FriendRelation {
  target_id: number;
  relation_type: 'friend' | 'block';
  mutual: boolean;
  target?: User;
}

export interface UserSearchResponse {
  users: User[];
  total: number;
}

export interface UserPage {
  html: string;
  raw: string;
}

export interface BBCodeValidationRequest {
  content: string;
}

export interface BBCodeValidationResponse {
  valid: boolean;
  errors: string[];
  preview: {
    html: string;
    raw: string;
  };
}

export interface UserPageUpdateRequest {
  body: string;
}

export interface UserPageUpdateResponse {
  html: string;
}
