import { api } from './client';
import type { DeviceSession, RevokeSessionRequest, RevokeSessionResponse, DeviceSummary } from '../../types/device';

export const deviceAPI = {
  // 获取活跃会话
  getSessions: async (): Promise<DeviceSession[]> => {
    console.log('获取设备会话列表');
    const response = await api.get('/api/private/device/sessions');
    return response.data;
  },

  // 撤销指定会话
  revokeSession: async (sessionId: number): Promise<RevokeSessionResponse> => {
    console.log('撤销设备会话:', { sessionId });
    const response = await api.post('/api/private/device/sessions/revoke', {
      session_id: sessionId
    });
    return response.data;
  },

  // 获取设备会话统计
  getSummary: async (): Promise<DeviceSummary> => {
    console.log('获取设备会话统计');
    const response = await api.get('/api/private/device/summary');
    return response.data;
  },
};
