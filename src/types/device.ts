// 设备会话相关类型定义

export interface DeviceSession {
  id: number;
  device_type: string;
  device_fingerprint: string;
  user_agent: string;
  ip_address: string;
  created_at: string;
  last_used_at: string;
  expires_at: string;
  is_current: boolean;
  location?: string;
  client_display_name?: string;
}

export interface RevokeSessionRequest {
  session_id: number;
}

export interface RevokeSessionResponse {
  success: boolean;
  message: string;
  data?: Record<string, any>;
}

export interface DeviceSummary {
  success: boolean;
  message: string;
  data: Record<string, any>;
}
