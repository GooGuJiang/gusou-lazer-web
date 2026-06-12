import { api } from './client';
import { getApiErrorStatus } from '../typeGuards';

export const chatAPI = {
  getChannels: async () => {
    const response = await api.get('/api/v2/chat/channels');
    return response.data;
  },

  getChannelMessages: async (channelId: string | number, limit: number = 50, since: number = 0, until?: number) => {
    const params = new URLSearchParams();
    params.append('limit', limit.toString());
    params.append('since', since.toString());
    if (until !== undefined) {
      params.append('until', until.toString());
    }

    const response = await api.get(`/api/v2/chat/channels/${channelId}/messages?${params}`);
    return response.data;
  },

  sendMessage: async (channelId: string | number, message: string, isAction: boolean = false, uuid?: string) => {
    const formData = new URLSearchParams();
    formData.append('message', message);
    formData.append('is_action', isAction.toString());
    if (uuid) {
      formData.append('uuid', uuid);
    }

    const response = await api.post(`/api/v2/chat/channels/${channelId}/messages`, formData, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    });
    return response.data;
  },

  markAsRead: async (channelId: string | number, messageId: number) => {
    const response = await api.put(`/api/v2/chat/channels/${channelId}/mark-as-read/${messageId}`, {}, {
      headers: {
        'Content-Type': 'application/json',
      },
    });
    return response.data;
  },

  createPrivateMessage: async (targetId: number, message: string, isAction: boolean = false, uuid?: string) => {
    const formData = new URLSearchParams();
    formData.append('target_id', targetId.toString());
    formData.append('message', message);
    formData.append('is_action', isAction.toString());
    if (uuid) {
      formData.append('uuid', uuid);
    }

    const response = await api.post('/api/v2/chat/new', formData, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    });
    return response.data;
  },

  joinChannel: async (channelId: string | number) => {
    const response = await api.post(`/api/v2/chat/channels/${channelId}/join`);
    return response.data;
  },

  leaveChannel: async (channelId: string | number) => {
    const response = await api.post(`/api/v2/chat/channels/${channelId}/leave`);
    return response.data;
  },

  getPrivateChannel: async (targetUserId: number) => {
    try {
      const response = await api.get(`/api/v2/chat/private/${targetUserId}`);
      return response.data;
    } catch (error: unknown) {
      if (getApiErrorStatus(error) === 404) {
        return null;
      }
      throw error;
    }
  },

  keepAlive: async (historySince?: number, since?: number) => {
    const params = new URLSearchParams();
    if (historySince !== undefined) {
      params.append('history_since', historySince.toString());
    }
    if (since !== undefined) {
      params.append('since', since.toString());
    }

    const response = await api.post(`/api/v2/chat/ack?${params}`);
    return response.data;
  },
};
