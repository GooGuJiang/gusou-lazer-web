import type { Team, TeamStatistics, User } from './user';

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
  hit_accuracy?: number; // 准确率
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
  hit_accuracy?: number; // 准确率（如果 API 返回）
}

export type RankingType = 'performance' | 'score';
export type TabType = 'users' | 'countries' | 'teams';

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
  team: Team;
  member_count: number;
}

export interface TeamDetailResponse {
  id: number;
  flag_url: string;
  name: string;
  short_name: string;
  cover_url: string;
  created_at: string;
  description?: string | null;
  default_ruleset_id: number;
  is_open: boolean;
  empty_slots: number;
  leader: { id: number; [key: string]: unknown };
  members: User[];
  statistics: TeamStatistics;
}
