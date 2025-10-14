import axios from 'axios';
import type { AxiosError, InternalAxiosRequestConfig } from 'axios';
import { getDeviceUUID } from '../deviceUUID';

// 从环境变量读取 API 地址，如果没有设置则使用默认值
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000';

// 全局验证处理器，由 VerificationProvider 设置
let globalVerificationHandler: ((error: any) => boolean) | null = null;

export const setGlobalVerificationHandler = (handler: (error: any) => boolean) => {
  globalVerificationHandler = handler;
};

// 缓存清除工具函数
const clearAuthCache = () => {
  try {
    sessionStorage.removeItem('cached_user');
    sessionStorage.removeItem('cached_auth_status');
    sessionStorage.removeItem('cache_timestamp');
  } catch (error) {
    console.error('Failed to clear auth cache:', error);
  }
};

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    'x-api-version': '20250913',
  },
  withCredentials: false, // 确保不发送cookies避免CORS问题
});

// Token 刷新相关状态
let isRefreshing = false;
let failedQueue: Array<{
  resolve: (value?: unknown) => void;
  reject: (reason?: any) => void;
}> = [];

// 处理等待队列
const processQueue = (error: Error | null = null) => {
  failedQueue.forEach(prom => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve();
    }
  });
  
  failedQueue = [];
};

// 刷新 token 的函数
const refreshToken = async (): Promise<string> => {
  const refreshToken = localStorage.getItem('refresh_token');
  if (!refreshToken) {
    throw new Error('No refresh token available');
  }

  // 导入 CLIENT_CONFIG（延迟导入避免循环依赖）
  const { CLIENT_CONFIG } = await import('./config');
  
  const formData = new FormData();
  formData.append('grant_type', 'refresh_token');
  formData.append('client_id', CLIENT_CONFIG.web_client_id.toString());
  formData.append('client_secret', CLIENT_CONFIG.web_client_secret);
  formData.append('refresh_token', refreshToken);

  const deviceUUID = await getDeviceUUID();

  const response = await axios.post(`${API_BASE_URL}/oauth/token`, formData, {
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'x-api-version': '20250913',
      'X-UUID': deviceUUID,
    },
  });

  const { access_token, refresh_token: new_refresh_token } = response.data;
  
  // 更新 localStorage
  localStorage.setItem('access_token', access_token);
  localStorage.setItem('refresh_token', new_refresh_token);
  
  return access_token;
};

api.interceptors.request.use(
  async (config) => {
    const token = localStorage.getItem('access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    // 添加设备UUID到所有请求（使用异步获取）
    const deviceUUID = await getDeviceUUID();
    config.headers['X-UUID'] = deviceUUID;
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);


api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };
    
    // 首先检查是否是用户验证错误
    if (globalVerificationHandler && globalVerificationHandler(error)) {
      // 如果是验证错误且已处理，不需要进一步处理
      return Promise.reject(error);
    }
    
    // 处理 401 错误（token 过期）
    if (error.response?.status === 401 && !originalRequest._retry) {
      // 如果请求是刷新 token 的请求本身失败了，直接登出
      if (originalRequest.url?.includes('/oauth/token')) {
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        clearAuthCache(); // 清除缓存
        window.location.href = '/login';
        return Promise.reject(error);
      }

      if (isRefreshing) {
        // 如果正在刷新 token，将请求加入队列
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then(() => {
          // Token 刷新成功，重新发送请求
          const token = localStorage.getItem('access_token');
          if (token && originalRequest.headers) {
            originalRequest.headers.Authorization = `Bearer ${token}`;
          }
          return api(originalRequest);
        }).catch(err => {
          return Promise.reject(err);
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const newToken = await refreshToken();
        
        // 更新原始请求的 token
        if (originalRequest.headers) {
          originalRequest.headers.Authorization = `Bearer ${newToken}`;
        }
        
        // 处理队列中的请求
        processQueue();
        
        // 重新发送原始请求
        return api(originalRequest);
      } catch (refreshError) {
        // Token 刷新失败，清除所有 token 并重定向到登录页
        processQueue(new Error('Token refresh failed'));
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        clearAuthCache(); // 清除缓存
        window.location.href = '/login';
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }
    
    return Promise.reject(error);
  }
);
