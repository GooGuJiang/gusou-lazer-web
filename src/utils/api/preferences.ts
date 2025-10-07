import { api } from './client';
import type { 
  GameMode, 
  SetDefaultModeResponse, 
  GetUserPreferencesResponse,
  UpdateUserPreferencesRequest 
} from '../../types';

export const preferencesAPI = {
  // 设置默认游戏模式 (Legacy)
  setDefaultMode: async (mode: GameMode): Promise<SetDefaultModeResponse> => {
    console.log('设置默认游戏模式:', { mode });
    const response = await api.post('/api/private/user-preferences/default-mode', {
      mode
    });
    return response.data;
  },

  // 获取用户偏好设置 (Legacy)
  getUserPreferences: async (): Promise<GetUserPreferencesResponse> => {
    console.log('获取用户偏好设置');
    const response = await api.get('/api/private/user-preferences');
    return response.data;
  },

  // GET /api/private/user/preferences - 获取用户偏好设置
  getPreferences: async (): Promise<GetUserPreferencesResponse> => {
    console.log('获取用户偏好设置 (新API)');
    const response = await api.get('/api/private/user/preferences');
    return response.data;
  },

  // PATCH /api/private/user/preferences - 修改用户偏好设置
  updatePreferences: async (preferences: UpdateUserPreferencesRequest): Promise<void> => {
    console.log('更新用户偏好设置:', preferences);
    await api.patch('/api/private/user/preferences', preferences);
    // API returns 204 No Content on success
  },
};
