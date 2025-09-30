import axios from 'axios';

export const API_BASE_URL = 'https://lazer-api.g0v0.top';
//export const API_BASE_URL = 'http://127.0.0.1:8000';

// 全局验证处理器，由 VerificationProvider 设置
let globalVerificationHandler: ((error: any) => boolean) | null = null;

export const setGlobalVerificationHandler = (handler: (error: any) => boolean) => {
  globalVerificationHandler = handler;
};

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    'x-api-version': '20250913',
  },
  withCredentials: false, // 确保不发送cookies避免CORS问题
});

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


api.interceptors.response.use(
  (response) => response,
  (error) => {
    // 首先检查是否是用户验证错误
    if (globalVerificationHandler && globalVerificationHandler(error)) {
      // 如果是验证错误且已处理，不需要进一步处理
      return Promise.reject(error);
    }
    
    // 处理其他401错误（如token过期）
    if (error.response?.status === 401) {
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);
