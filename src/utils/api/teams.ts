import { api } from './client';

export const teamsAPI = {
  getTeam: async (teamId: number) => {
    const response = await api.get(`/api/v2/team/${teamId}/`);
    return response.data;
  },

  getTeamByRuleset: async (teamId: number, ruleset: string) => {
    const response = await api.get(`/api/v2/team/${teamId}/${ruleset}`);
    return response.data;
  },

  createTeam: async (teamData: FormData) => {
    const response = await api.post('/api/private/team', teamData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  updateTeam: async (teamId: number, teamData: FormData) => {
    const response = await api.patch(`/api/private/team/${teamId}`, teamData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  deleteTeam: async (teamId: number) => {
    const response = await api.delete(`/api/private/team/${teamId}`);
    return response.data;
  },

  requestJoinTeam: async (teamId: number) => {
    const response = await api.post(`/api/private/team/${teamId}/request`);
    return response.data;
  },

  acceptJoinRequest: async (teamId: number, userId: number) => {
    const response = await api.post(`/api/private/team/${teamId}/${userId}/request`);
    return response.data;
  },

  rejectJoinRequest: async (teamId: number, userId: number) => {
    const response = await api.delete(`/api/private/team/${teamId}/${userId}/request`);
    return response.data;
  },

  removeMember: async (teamId: number, userId: number) => {
    const response = await api.delete(`/api/private/team/${teamId}/${userId}`);
    return response.data;
  },
};
