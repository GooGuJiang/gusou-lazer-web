import { api } from './client';

export const rankingsAPI = {
  getUserRankings: async (
    ruleset: string,
    type: 'performance' | 'score',
    country?: string,
    page: number = 1
  ) => {
    const params = new URLSearchParams();
    if (country) params.append('country', country);
    params.append('page', page.toString());

    const response = await api.get(`/api/v2/rankings/${ruleset}/${type}?${params}`);
    return response.data;
  },

  getCountryRankings: async (ruleset: string, page: number = 1) => {
    const params = new URLSearchParams();
    params.append('page', page.toString());

    const response = await api.get(`/api/v2/rankings/${ruleset}/country?${params}`);
    return response.data;
  },

  getTeamRankings: async (ruleset: string, sort: 'performance' | 'score', page: number = 1) => {
    const params = new URLSearchParams();
    params.append('page', page.toString());

    const response = await api.get(`/api/v2/rankings/${ruleset}/team/${sort}?${params}`);
    return response.data;
  },
};
