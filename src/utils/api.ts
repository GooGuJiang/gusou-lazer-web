import axios, { type AxiosRequestConfig } from 'axios';
import toast from 'react-hot-toast';

// API base URL - adjust this to match your osu! API server
const API_BASE_URL = 'https://lazer-api.g0v0.top';

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: false, // 确保不发送cookies避免CORS问题
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth API functions
export const authAPI = {
  login: async (username: string, password: string, clientId: number, clientSecret: string) => {
    console.log('Login attempt with:', { username, clientId }); // Debug log
    
    const formData = new FormData();
    formData.append('grant_type', 'password');
    formData.append('client_id', clientId.toString());
    formData.append('client_secret', clientSecret);
    formData.append('username', username);
    formData.append('password', password);
    formData.append('scope', '*');

    try {
      const response = await axios.post(`${API_BASE_URL}/oauth/token`, formData, {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      });
      return response.data;
    } catch (error) {
      const err = error as { response?: { data?: unknown }; message?: string };
      console.error('Login error:', err.response?.data || err.message);
      throw err;
    }
  },

  register: async (username: string, email: string, password: string) => {
    console.log('Register attempt with:', { username, email }); // Debug log
    
    // 使用 URLSearchParams 来确保正确的 application/x-www-form-urlencoded 格式
    // 后端期望的字段名格式是 user[fieldname]
    const formData = new URLSearchParams();
    formData.append('user[username]', username);
    formData.append('user[user_email]', email);
    formData.append('user[password]', password);

    try {
      const response = await axios.post(`${API_BASE_URL}/users`, formData, {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      });
      return response.data;
    } catch (error) {
      const err = error as { response?: { data?: unknown }; message?: string };
      console.error('Register error:', err.response?.data || err.message);
      throw err;
    }
  },

  refreshToken: async (refreshToken: string, clientId: number, clientSecret: string) => {
    const formData = new FormData();
    formData.append('grant_type', 'refresh_token');
    formData.append('client_id', clientId.toString());
    formData.append('client_secret', clientSecret);
    formData.append('refresh_token', refreshToken);

    const response = await axios.post(`${API_BASE_URL}/oauth/token`, formData, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    });
    return response.data;
  },
};

// User API functions
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

  // 获取用户头像URL
  getAvatarUrl: (userId: number, bustCache: boolean = false) => {
    // 根据osu_lazer_api-main的实现，构建头像URL
    // 如果用户有自定义头像，会返回完整URL；否则返回默认头像
    const baseUrl = `${API_BASE_URL}/users/${userId}/avatar`;
    // 在需要时添加时间戳破坏缓存
    return bustCache ? `${baseUrl}?t=${Date.now()}` : baseUrl;
  },

  // 上传用户头像
  uploadAvatar: async (imageFile: File | Blob) => {
    console.log('开始上传头像，文件类型:', imageFile.type, '文件大小:', imageFile.size);
    
    const formData = new FormData();
    // 根据blob类型确定文件扩展名
    const isJpeg = imageFile.type === 'image/jpeg';
    const fileName = isJpeg ? 'avatar.jpg' : 'avatar.png';
    formData.append('content', imageFile, fileName);
    
    // 验证FormData内容
    console.log('FormData内容:');
    for (const [key, value] of formData.entries()) {
      console.log(key, value);
      if (value instanceof Blob) {
        console.log(`  类型: ${value.type}, 大小: ${value.size}`);
      }
    }

    // 获取token
    const token = localStorage.getItem('access_token');
    if (!token) {
      throw new Error('未找到访问令牌，请重新登录');
    }

    console.log('准备发送请求到:', `${API_BASE_URL}/api/private/avatar/upload`);

    // 直接使用fetch来避免axios的content-type处理问题
    const response = await fetch(`${API_BASE_URL}/api/private/avatar/upload`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        // 不设置Content-Type，让浏览器自动设置
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

  // 修改用户名
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

  // 上传用户头图
  uploadCover: async (imageFile: File | Blob) => {
    console.log('开始上传头图，文件类型:', imageFile.type, '文件大小:', imageFile.size);
    
    const formData = new FormData();
    // 根据blob类型确定文件扩展名
    const isJpeg = imageFile.type === 'image/jpeg';
    const fileName = isJpeg ? 'cover.jpg' : 'cover.png';
    formData.append('content', imageFile, fileName);
    
    // 验证FormData内容
    console.log('FormData内容:');
    for (const [key, value] of formData.entries()) {
      console.log(key, value);
      if (value instanceof Blob) {
        console.log(`  类型: ${value.type}, 大小: ${value.size}`);
      }
    }

    // 获取token
    const token = localStorage.getItem('access_token');
    if (!token) {
      throw new Error('未找到访问令牌');
    }

    console.log('准备发送请求到:', `${API_BASE_URL}/api/private/cover/upload`);

    // 直接使用fetch来避免axios的content-type处理问题
    const response = await fetch(`${API_BASE_URL}/api/private/cover/upload`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        // 不设置Content-Type，让浏览器自动设置
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
};

// Friends API functions - osu! 使用单向关注制
export const friendsAPI = {
  // 获取好友列表
  getFriends: async () => {
    const response = await api.get('/api/v2/friends');
    return response.data;
  },

  // 添加好友（单向关注）
  addFriend: async (targetUserId: number) => {
    const response = await api.post(`/api/v2/friends?target=${targetUserId}`);
    return response.data;
  },

  // 删除好友关系
  removeFriend: async (targetUserId: number) => {
    const response = await api.delete(`/api/v2/friends/${targetUserId}`);
    return response.data;
  },

  // 获取屏蔽列表
  getBlocks: async () => {
    const response = await api.get('/api/v2/blocks');
    return response.data;
  },

  // 屏蔽用户
  blockUser: async (targetUserId: number) => {
    const response = await api.post(`/api/v2/blocks?target=${targetUserId}`);
    return response.data;
  },

  // 取消屏蔽
  unblockUser: async (targetUserId: number) => {
    const response = await api.delete(`/api/v2/blocks/${targetUserId}`);
    return response.data;
  },

  // 检查与指定用户的关系状态
  checkRelationship: async (targetUserId: number) => {
    try {
      // 使用新的专用 API 端点来获取关系状态
      const response = await api.get(`/api/v2/relationship/check/${targetUserId}`);
      return response.data;
    } catch (error) {
      console.error('检查用户关系失败:', error);
      // 如果新 API 不可用，回退到原来的方法
      try {
        const [friends, blocks] = await Promise.all([
          friendsAPI.getFriends(),
          friendsAPI.getBlocks()
        ]);

        const isFriend = friends.some((friend: { target_id: number; mutual?: boolean }) => friend.target_id === targetUserId);
        const isBlocked = blocks.some((block: { target_id: number }) => block.target_id === targetUserId);
        const isMutual = friends.some((friend: { target_id: number; mutual?: boolean }) => friend.target_id === targetUserId && friend.mutual === true);
        
        // 在 osu! 的好友系统中：
        // 1. isFriend = true 且 mutual = true: 双向关注，对方关注了我
        // 2. isFriend = true 且 mutual = false: 单向关注，我关注了对方，对方没关注我
        // 3. isFriend = false: 我没有关注对方，无法直接判断对方是否关注了我
        let followsMe = false;
        
        if (isFriend) {
          // 我们关注了对方，mutual 字段可以告诉我们是否双向
          followsMe = isMutual;
        } else {
          // 我们没有关注对方，暂时无法确定对方是否关注了我们
          // 在实际使用中，这种情况下 UI 应该显示"关注"而不是"回关"
          followsMe = false;
        }
        
        return {
          isFriend,
          isBlocked,
          isMutual,
          followsMe
        };
      } catch (fallbackError) {
        console.error('备用方法也失败:', fallbackError);
        return {
          isFriend: false,
          isBlocked: false,
          isMutual: false,
          followsMe: false
        };
      }
    }
  },

  // 获取用户的关注者列表
  getUserFollowers: async (userId: number) => {
    const response = await api.get(`/api/v2/relationship/followers/${userId}`);
    return response.data;
  }
};

// Error handler utility
export const handleApiError = (error: unknown) => {
  const err = error as {
    response?: { data?: { error_description?: string; message?: string } };
    message?: string;
  };
  if (err.response?.data?.error_description) {
    toast.error(err.response.data.error_description);
  } else if (err.response?.data?.message) {
    toast.error(err.response.data.message);
  } else if (err.message) {
    toast.error(err.message);
  } else {
    toast.error('发生意外错误');
  }
};

// Rankings API functions
export const rankingsAPI = {
  // 获取用户排行榜
  getUserRankings: async (
    ruleset: string, 
    type: 'performance' | 'score', 
    country?: string, 
    page: number = 1
  ) => {
    const params = new URLSearchParams();
    if (country) params.append('country', country);
    params.append('page', page.toString());
    
    const response = await api.get(`/api/v2/rankings/${ruleset}/${type}?${params}`);
    return response.data;
  },

  // 获取地区排行榜
  getCountryRankings: async (ruleset: string, page: number = 1) => {
    const params = new URLSearchParams();
    params.append('page', page.toString());
    
    const response = await api.get(`/api/v2/rankings/${ruleset}/country?${params}`);
    return response.data;
  },
};

// Stats API functions
export const statsAPI = {
  // Get current server stats
  getCurrentStats: async () => {
    const response = await api.get('/api/v2/stats');
    return response.data;
  },

  // Get 24h online history
  getOnlineHistory: async () => {
    const response = await api.get('/api/v2/stats/history');
    return response.data;
  },
};

// Client credentials - in production, these should be environment variables
export const CLIENT_CONFIG = {
  osu_client_id: 6,
  osu_client_secret: '454532f3dba952663c8917ad15204d501ec2f28e41b3bce4b276b5d4a2a25823918f4711bb87a7fe',
  web_client_id: 6,
  web_client_secret: '454532f3dba952663c8917ad15204d501ec2f28e41b3bce4b276b5d4a2a25823918f4711bb87a7fe',
};
