import 'server-only';

import type { CountryResponse, TeamRankingsResponse, TopUsersResponse } from '@types/rankings';

import { fetchApi } from './api';

export async function getUserRankings(ruleset: string, sort: string = 'performance') {
  return fetchApi<TopUsersResponse>(`/api/v2/rankings/${ruleset}/${sort}`);
}

export async function getCountryRankings(ruleset: string, sort: string = 'performance') {
  return fetchApi<CountryResponse>(`/api/v2/rankings/${ruleset}/country/${sort}`);
}

export async function getTeamRankings(ruleset: string, sort: string = 'performance') {
  return fetchApi<TeamRankingsResponse>(`/api/v2/rankings/${ruleset}/team/${sort}`);
}
