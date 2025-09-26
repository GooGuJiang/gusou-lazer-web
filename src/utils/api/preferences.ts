import { api } from './client';
import type { GameMode, SetDefaultModeRequest, SetDefaultModeResponse, GetUserPreferencesResponse } from '../../types';

export const preferencesAPI = {
  // 设置默认游戏模式
  setDefaultMode: async (mode: GameMode): Promise<SetDefaultModeResponse> => {
    console.log('设置默认游戏模式:', { mode });
    const response = await api.post('/api/private/user-preferences/default-mode', {
      mode
    });
    return response.data;
  },

  // 获取用户偏好设置
  getUserPreferences: async (): Promise<GetUserPreferencesResponse> => {
    console.log('获取用户偏好设置');
    const response = await api.get('/api/private/user-preferences');
    return response.data;
  },
};
