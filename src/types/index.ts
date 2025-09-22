// Game modes - 主要模式和子模式
export type GameMode = 'osu' | 'taiko' | 'fruits' | 'mania' | 'osurx' | 'osuap' | 'taikorx' | 'fruitsrx';

// 主模式类型
export type MainGameMode = 'osu' | 'taiko' | 'fruits' | 'mania';

// 模式分组配置
export const GAME_MODE_GROUPS: Record<MainGameMode, GameMode[]> = {
  osu: ['osu', 'osurx', 'osuap'],
  taiko: ['taiko', 'taikorx'],
  fruits: ['fruits', 'fruitsrx'],
  mania: ['mania']
};

// 模式显示名称（更新版本）
export const GAME_MODE_NAMES: Record<GameMode, string> = {
  osu: 'Standard',
  osurx: 'Relax',
  osuap: 'Auto Pilot',
  taiko: 'Taiko',
  taikorx: 'Taiko RX',
  fruits: 'Catch',
  fruitsrx: 'Catch RX',
  mania: 'Mania'
};

export const GAME_MODE_COLORS: Record<GameMode, string> = {
  osu: '#ED8EA6',
  osurx: '#ED8EA6',
  osuap: '#ED8EA6',
  taiko: '#7DD5D4',
  taikorx: '#7DD5D4',
  fruits: '#7DD5D4',
  fruitsrx: '#7DD5D4',
  mania: '#ED8EA6',
};

// Team types
export interface Team {
  id: number;
  flag_url: string;
  created_at: string;
  short_name: string;
  name: string;
  cover_url: string;
  leader_id: number;
}

// User types
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

// Auth types
export interface TokenResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
  refresh_token: string;
  scope: string;
}

export interface LoginForm {
  username: string;
  password: string;
}

export interface RegisterForm {
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
}

// Error types
export interface ApiError {
  error: string;
  error_description: string;
  hint: string;
  message: string;
}

export interface RegistrationError {
  form_error: {
    user: {
      username?: string[];
      user_email?: string[];
      password?: string[];
    };
    message?: string;
  };
}

// UI types
export interface NavItem {
  path: string;
  title: string;
  icon?: React.ComponentType<{ size?: number; className?: string }>;
  requireAuth?: boolean;
}

// Theme types
export type Theme = 'light' | 'dark';

// 主模式图标类名
export const MAIN_MODE_ICONS: Record<MainGameMode, string> = {
  osu: 'fa-extra-mode-osu',
  taiko: 'fa-extra-mode-taiko',
  fruits: 'fa-extra-mode-fruits',
  mania: 'fa-extra-mode-mania'
};

// Rankings types
export interface TopUsersResponse {
  ranking: UserRanking[];
  cursor: {
    page: number;
  };
  total: number;
}

export interface UserRanking {
  user: User;
  ranked_score?: number;
  pp?: number;
}

export interface CountryResponse {
  ranking: CountryRanking[];
  cursor: {
    page: number;
  };
  total: number;
}

export interface CountryRanking {
  code: string;
  name: string;
  active_users: number;
  play_count: number;
  ranked_score: number;
  performance: number;
}

export type RankingType = 'performance' | 'score';
export type TabType = 'users' | 'countries' | 'teams';

// Team Rankings types
export interface TeamRankingsResponse {
  ranking: TeamRanking[];
  cursor?: {
    page: number;
  };
  total: number;
}

export interface TeamRanking {
  team_id: number;
  ruleset_id: number;
  play_count: number;
  ranked_score: number;
  performance: number;
}

export interface TeamDetailResponse {
  team: Team;
  members: User[];
}

// Server stats types
export interface ServerStats {
  registered_users: number;
  online_users: number;
  playing_users: number;
  timestamp: string;
}

export interface OnlineHistoryEntry {
  timestamp: string;
  online_count: number;
  playing_count: number;
}

export interface OnlineHistoryResponse {
  history: OnlineHistoryEntry[];
  current_stats: ServerStats;
}

// Chat types
export type ChannelType = 'PUBLIC' | 'PRIVATE' | 'MULTIPLAYER' | 'SPECTATOR' | 'TEMPORARY' | 'PM' | 'GROUP' | 'SYSTEM' | 'ANNOUNCE' | 'TEAM';

export interface ChatChannel {
  channel_id: number;
  name: string;
  description: string;
  icon?: string;
  type: ChannelType;
  moderated: boolean;
  uuid?: string;
  current_user_attributes?: ChatUserAttributes;
  last_read_id?: number;
  last_message_id?: number;
  recent_messages: ChatMessage[];
  users: number[];
  message_length_limit: number;
  // 可选的用户信息，用于私聊频道
  user_info?: {
    id: number;
    username: string;
    avatar_url: string;
    cover_url: string;
  };
}

export interface ChatUserAttributes {
  can_message: boolean;
  can_message_error?: string;
  last_read_id: number;
}

export interface ChatMessage {
  message_id: number;
  channel_id: number;
  content: string;
  timestamp: string;
  sender_id: number;
  sender?: User;
  is_action: boolean;
  uuid?: string;
}

export interface ChatMessageRequest {
  message: string;
  is_action?: boolean;
  uuid?: string;
}

export interface PrivateMessageRequest {
  target_id: number;
  message: string;
  is_action?: boolean;
  uuid?: string;
}

export interface NewPrivateMessageResponse {
  channel: ChatChannel;
  message: ChatMessage;
  new_channel_id: number;
}

// Notification types based on osu! server structure
export interface APINotification {
  id: number;
  name: string;
  created_at: string;
  object_type: string;
  object_id: string;
  source_user_id?: number;
  is_read: boolean;
  details: Record<string, unknown>;
}

export interface NotificationsResponse {
  has_more: boolean;
  notifications: APINotification[];
  unread_count: number;
  notification_endpoint: string;
}

export interface UnreadCount {
  total: number;
  team_requests: number;
  private_messages: number;
  friend_requests: number;
}

// WebSocket message types
export interface SocketMessage {
  event: string;
  data?: Record<string, unknown>;
  error?: string;
}

export interface ChatEvent extends SocketMessage {
  event: 'chat.message.new' | 'chat.start' | 'chat.end';
  data?: {
    messages?: ChatMessage[];
    users?: User[];
  };
}

export interface NotificationEvent extends SocketMessage {
  event: 'new_private_notification';
  data?: {
    name: string;
    object_type: string;
    object_id: number;
    source_user_id: number;
    details: Record<string, unknown>;
  };
}

// 好友关系类型
export interface FriendRelation {
  target_id: number;
  relation_type: 'friend' | 'block';
  mutual: boolean;
  target?: User;
}

// 私聊频道创建响应
export interface PrivateMessageResponse {
  channel: ChatChannel;
  message: ChatMessage;
}

// 用户搜索响应
export interface UserSearchResponse {
  users: User[];
  total: number;
}

// 用户最近活动类型
export interface UserActivity {
  id: number;
  createdAt: string;
  type: 'rank' | 'rank_lost' | 'achievement' | 'beatmapset_upload' | 'beatmapset_approve' | 'beatmapset_delete' | 'beatmapset_revive' | 'beatmapset_update' | 'username_change' | 'user_support_again' | 'user_support_first' | 'user_support_gift' | 'userpageUpdate';
  scorerank?: string;
  rank?: number;
  mode?: string;
  beatmap?: {
    title: string;
    url: string;
  };
  beatmapset?: {
    title: string;
    url: string;
  };
  user: {
    username: string;
    url: string;
  };
  achievement?: {
    name: string;
    slug: string;
    achievement_id?: number;
    achieved_at?: string;
    icon_url?: string;
    id?: number;
    grouping?: string;
    ordering?: number;
    description?: string;
    mode?: string | null;
    instructions?: string | null;
  };
}

// 用户最近活动响应
export interface UserRecentActivityResponse {
  activities: UserActivity[];
  has_more: boolean;
  total: number;
}

// 用户页面内容
export interface UserPage {
  html: string;
  raw: string;
}

// BBCode验证请求
export interface BBCodeValidationRequest {
  content: string;
}

// BBCode验证响应
export interface BBCodeValidationResponse {
  valid: boolean;
  errors: string[];
  preview: {
    html: string;
    raw: string;
  };
}

// 用户页面更新请求
export interface UserPageUpdateRequest {
  body: string;
}

// 用户页面更新响应
export interface UserPageUpdateResponse {
  html: string;
}

// Best Scores types
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
    hype: any;
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

// Beatmap types
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
  current_nominations: any;
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
  recent_favourites: any[];
}