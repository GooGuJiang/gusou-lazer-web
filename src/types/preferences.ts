import type { GameMode } from './common';

// 用户偏好设置相关类型定义

export interface SetDefaultModeRequest {
  mode: GameMode;
}

export interface SetDefaultModeResponse {
  success: boolean;
  message: string;
  current_mode: GameMode;
}

export interface UserPreferences {
  default_mode: GameMode;
  client_type: string;
  available_modes: GameMode[];
}

// 获取用户偏好设置响应 - 直接返回UserPreferences对象
export interface GetUserPreferencesResponse extends UserPreferences {}
