// 设备会话相关类型定义

// 用户代理信息
export interface UserAgentInfo {
  raw_ua: string;
  browser: string;
  version: string;
  os: string;
  platform: string;
  is_mobile: boolean;
  is_tablet: boolean;
  is_pc: boolean;
  is_client: boolean;
}

// 位置信息
export interface LocationInfo {
  country: string;
  city: string;
  country_code: string;
}

// 登录会话
export interface Session {
  id: number;
  user_id: number;
  user_agent: string;
  is_verified: boolean;
  created_at: string;
  verified_at: string | null;
  expires_at: string;
  device_id: number | null;
  user_agent_info: UserAgentInfo;
  location: LocationInfo;
}

// 受信任设备
export interface TrustedDevice {
  id: number;
  user_id: number;
  user_agent: string;
  client_type: 'web' | 'mobile' | 'desktop';
  created_at: string;
  last_used_at: string;
  expires_at: string;
  user_agent_info: UserAgentInfo;
  location: LocationInfo;
}

// 会话列表响应
export interface SessionsResponse {
  total: number;
  current: number;
  sessions: Session[];
}

// 受信任设备列表响应
export interface TrustedDevicesResponse {
  total: number;
  current: number;
  devices: TrustedDevice[];
}

// 旧的设备会话类型（保留以兼容现有代码）
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
