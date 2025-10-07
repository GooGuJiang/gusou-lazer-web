import { api } from './client';
import type { 
  DeviceSession, 
  RevokeSessionResponse, 
  DeviceSummary,
  SessionsResponse,
  TrustedDevicesResponse
} from '../../types/device';

export const deviceAPI = {
  // ========== 新的 API 端点 ==========
  
  // 获取当前用户的登录会话列表
  getUserSessions: async (): Promise<SessionsResponse> => {
    console.log('获取用户登录会话列表');
    const response = await api.get('/api/private/admin/sessions');
    return response.data;
  },

  // 注销指定的登录会话
  deleteSession: async (sessionId: number): Promise<void> => {
    console.log('注销登录会话:', { sessionId });
    await api.delete(`/api/private/admin/sessions/${sessionId}`);
  },

  // 获取当前用户的受信任设备列表
  getTrustedDevices: async (): Promise<TrustedDevicesResponse> => {
    console.log('获取受信任设备列表');
    const response = await api.get('/api/private/admin/trusted-devices');
    return response.data;
  },

  // 移除受信任设备
  removeTrustedDevice: async (deviceId: number): Promise<void> => {
    console.log('移除受信任设备:', { deviceId });
    await api.delete(`/api/private/admin/trusted-devices/${deviceId}`);
  },

  // ========== 旧的 API 端点（保留以兼容现有代码）==========
  
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
