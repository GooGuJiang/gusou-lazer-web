import type { GameMode } from './common';

// 用户偏好设置相关类型定义

export interface SetDefaultModeRequest {
  mode: GameMode;
}

export interface SetDefaultModeResponse {
  success: boolean;
  message: string;
  current_mode: GameMode;
}

// Beatmapset card size options
export type BeatmapsetCardSize = 'normal' | 'large';

// Beatmap download options
export type BeatmapDownload = 'all' | 'no_video' | 'direct';

// Scoring mode options
export type ScoringMode = 'standardised' | 'classic';

// User list filter options
export type UserListFilter = 'all' | 'online' | 'offline';

// User list sort options
export type UserListSort = 'last_visit' | 'username' | 'rank';

// User list view options
export type UserListView = 'card' | 'list' | 'brick';

// Complete user preferences interface matching the API
export interface UserPreferences {
  // Theme and language
  theme?: string;
  language?: string;

  // Audio settings
  audio_autoplay?: boolean;
  audio_muted?: boolean;
  audio_volume?: number;

  // Beatmapset settings
  beatmapset_card_size?: BeatmapsetCardSize;
  beatmap_download?: BeatmapDownload;
  beatmapset_show_nsfw?: boolean;

  // Profile settings
  profile_order?: string[];
  legacy_score_only?: boolean;
  profile_cover_expanded?: boolean;

  // Scoring and user list
  scoring_mode?: ScoringMode;
  user_list_filter?: UserListFilter;
  user_list_sort?: UserListSort;
  user_list_view?: UserListView;

  // Extra custom settings
  extra?: Record<string, any>;

  // Game mode and profile info
  playmode?: GameMode;
  interests?: string;
  location?: string;
  occupation?: string;
  twitter?: string;
  website?: string;
  discord?: string;
  profile_colour?: string;
}

// Legacy preferences structure (for backward compatibility)
export interface LegacyUserPreferences {
  default_mode: GameMode;
  client_type: string;
  available_modes: GameMode[];
}

// 获取用户偏好设置响应 - 直接返回UserPreferences对象
export interface GetUserPreferencesResponse extends UserPreferences {}

// PATCH request body for updating preferences
export interface UpdateUserPreferencesRequest extends Partial<UserPreferences> {}
