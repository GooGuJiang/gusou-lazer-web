import type { AxiosRequestConfig } from 'axios';

import { API_BASE_URL, api } from './client';

// TOTP 相关类型定义
export interface TOTPStatus {
  enabled: boolean;
  created_at?: string;
}

export interface TOTPCreateStart {
  secret: string;
  uri: string;
}

export type TOTPBackupCodes = string[];

export const userAPI = {
  getMe: async (ruleset?: string) => {
    const url = ruleset ? `/api/v2/me/${ruleset}` : '/api/v2/me/';
    const response = await api.get(url);
    return response.data;
  },

  getUser: async (
    userIdOrName: string | number,
    ruleset?: string,
    config?: AxiosRequestConfig,
  ) => {
    const url = ruleset
      ? `/api/v2/users/${userIdOrName}/${ruleset}`
      : `/api/v2/users/${userIdOrName}`;
    const response = await api.get(url, config);
    return response.data;
  },

  getAvatarUrl: (userId: number, bustCache: boolean = false) => {
    const baseUrl = `${API_BASE_URL}/users/${userId}/avatar`;
    return bustCache ? `${baseUrl}?t=${Date.now()}` : baseUrl;
  },

  uploadAvatar: async (imageFile: File | Blob) => {
    console.log('开始上传头像，文件类型:', imageFile.type, '文件大小:', imageFile.size);

    const formData = new FormData();
    const isJpeg = imageFile.type === 'image/jpeg';
    const fileName = isJpeg ? 'avatar.jpg' : 'avatar.png';
    formData.append('content', imageFile, fileName);

    console.log('FormData内容:');
    for (const [key, value] of formData.entries()) {
      console.log(key, value);
      if (value instanceof Blob) {
        console.log(`  类型: ${value.type}, 大小: ${value.size}`);
      }
    }

    const token = localStorage.getItem('access_token');
    if (!token) {
      throw new Error('未找到访问令牌，请重新登录');
    }

    console.log('准备发送请求到:', `${API_BASE_URL}/api/private/avatar/upload`);

    const response = await fetch(`${API_BASE_URL}/api/private/avatar/upload`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
      body: formData,
    });

    console.log('响应状态:', response.status, response.statusText);

    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      console.error('上传失败响应:', errorData);
      throw new Error(errorData?.detail || errorData?.message || `HTTP ${response.status}`);
    }

    const result = await response.json();
    console.log('上传响应:', result);
    return result;
  },

  rename: async (newUsername: string) => {
    console.log('重命名用户名:', newUsername);

    const token = localStorage.getItem('access_token');
    if (!token) {
      throw new Error('未找到访问令牌');
    }

    const response = await fetch(`${API_BASE_URL}/api/private/rename`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(newUsername),
    });

    if (!response.ok) {
      let errorData;
      try {
        errorData = await response.json();
      } catch {
        errorData = await response.text();
      }
      console.error('重命名失败响应:', errorData);
      throw new Error(errorData?.detail || errorData?.message || `HTTP ${response.status}`);
    }

    const result = await response.json();
    console.log('重命名响应:', result);
    return result;
  },

  uploadCover: async (imageFile: File | Blob) => {
    console.log('开始上传头图，文件类型:', imageFile.type, '文件大小:', imageFile.size);

    const formData = new FormData();
    const isJpeg = imageFile.type === 'image/jpeg';
    const fileName = isJpeg ? 'cover.jpg' : 'cover.png';
    formData.append('content', imageFile, fileName);

    console.log('FormData内容:');
    for (const [key, value] of formData.entries()) {
      console.log(key, value);
      if (value instanceof Blob) {
        console.log(`  类型: ${value.type}, 大小: ${value.size}`);
      }
    }

    const token = localStorage.getItem('access_token');
    if (!token) {
      throw new Error('未找到访问令牌');
    }

    console.log('准备发送请求到:', `${API_BASE_URL}/api/private/cover/upload`);

    const response = await fetch(`${API_BASE_URL}/api/private/cover/upload`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
      body: formData,
    });

    console.log('响应状态:', response.status, response.statusText);

    if (!response.ok) {
      let errorData;
      try {
        errorData = await response.json();
      } catch {
        errorData = await response.text();
      }
      console.error('上传失败响应:', errorData);
      throw new Error(errorData?.detail || errorData?.message || `HTTP ${response.status}`);
    }

    const result = await response.json();
    console.log('上传响应:', result);
    return result;
  },

  getRecentActivity: async (
    userId: number,
    limit: number = 6,
    offset: number = 0
  ) => {
    console.log('获取用户最近活动:', { userId, limit, offset });

    const params = new URLSearchParams();
    params.append('limit', limit.toString());
    params.append('offset', offset.toString());

    const url = `/api/v2/users/${userId}/recent_activity?${params.toString()}`;
    const response = await api.get(url);
    return response.data;
  },

  getUserPage: async (userId: number) => {
    console.log('获取用户页面内容（编辑用）:', { userId });
    const response = await api.get(`/api/private/user/page`);
    return response.data;
  },

  updateUserPage: async (userId: number, content: string) => {
    console.log('更新用户页面内容:', { userId, contentLength: content.length });
    const response = await api.put(`/api/private/user/page`, {
      body: content,
    });
    return response.data;
  },

  validateBBCode: async (content: string) => {
    console.log('验证BBCode内容:', { contentLength: content.length });
    const response = await api.post('/api/private/user/validate-bbcode', {
      content: content,
    });
    return response.data;
  },

  getBestScores: async (
    userId: number,
    mode: string = 'osu',
    limit: number = 6,
    offset: number = 0
  ) => {
    console.log('获取用户最佳成绩:', { userId, mode, limit, offset });

    const params = new URLSearchParams();
    params.append('limit', limit.toString());
    params.append('offset', offset.toString());
    params.append('mode', mode);

    const url = `/api/v2/users/${userId}/scores/best?${params.toString()}`;
    const response = await api.get(url, {
      headers: {
        'x-api-version': '20220705',
      },
    });
    return response.data;
  },

  getRecentScores: async (
    userId: number,
    mode: string = 'osu',
    limit: number = 6,
    offset: number = 0,
    include_fails: boolean = true
  ) => {
    console.log('获取用户最近成绩:', { userId, mode, limit, offset, include_fails });

    const params = new URLSearchParams();
    params.append('limit', limit.toString());
    params.append('offset', offset.toString());
    params.append('mode', mode);
    params.append('include_fails', include_fails.toString());

    const url = `/api/v2/users/${userId}/scores/recent?${params.toString()}`;
    const response = await api.get(url, {
      headers: {
        'x-api-version': '20220705',
      },
    });
    return response.data;
  },

  getPinnedScores: async (
    userId: number,
    mode: string = 'osu'
  ) => {
    console.log('获取用户置顶成绩:', { userId, mode });

    const params = new URLSearchParams();
    params.append('mode', mode);

    const url = `/api/v2/users/${userId}/scores/pinned?${params.toString()}`;
    const response = await api.get(url, {
      headers: {
        'x-api-version': '20220705',
      },
    });
    return response.data;
  },

  // Change password with current password or TOTP code
  changePassword: async (newPassword: string, currentPassword?: string, totpCode?: string) => {
    console.log('修改密码');

    const token = localStorage.getItem('access_token');
    if (!token) {
      throw new Error('未找到访问令牌');
    }

    const formData = new URLSearchParams();
    formData.append('new_password', newPassword);
    
    if (currentPassword) {
      formData.append('current_password', currentPassword);
    }
    
    if (totpCode) {
      formData.append('totp_code', totpCode);
    }

    const response = await fetch(`${API_BASE_URL}/api/private/password/change`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: formData,
    });

    if (!response.ok) {
      let errorData;
      try {
        errorData = await response.json();
      } catch {
        errorData = await response.text();
      }
      console.error('修改密码失败响应:', errorData);
      throw new Error(errorData?.detail || errorData?.message || `HTTP ${response.status}`);
    }

    // 204 No Content 响应没有 body
    if (response.status === 204) {
      console.log('密码修改成功（无内容响应）');
      return;
    }

    const result = await response.json();
    console.log('修改密码响应:', result);
    return result;
  },

  // TOTP 相关接口
  totp: {
    // 检查 TOTP 状态
    getStatus: async (): Promise<TOTPStatus> => {
      console.log('检查 TOTP 状态');
      const response = await api.get('/api/private/totp/status');
      return response.data;
    },

    // 开始 TOTP 创建流程
    createStart: async (): Promise<TOTPCreateStart> => {
      console.log('开始 TOTP 创建流程');
      const response = await api.post('/api/private/totp/create');
      return response.data;
    },

    // 完成 TOTP 创建流程
    createComplete: async (code: string): Promise<TOTPBackupCodes> => {
      console.log('完成 TOTP 创建流程:', { code });
      const response = await api.put('/api/private/totp/create', { code });
      return response.data;
    },

    // 禁用 TOTP 双因素验证
    disable: async (code: string): Promise<void> => {
      console.log('禁用 TOTP 双因素验证:', { code });
      await api.delete('/api/private/totp', { data: { code } });
    },
  },
};
