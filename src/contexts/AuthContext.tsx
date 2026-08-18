import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { authAPI, userAPI, handleApiError, CLIENT_CONFIG } from '../utils/api';
import { clearServerAuthSession, syncServerAuthSession } from '../utils/authSession';
import type { User, TokenResponse } from '../types';
import toast from 'react-hot-toast';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (username: string, password: string, turnstileToken?: string) => Promise<User | null>;
  register: (
    username: string,
    email: string,
    password: string,
    turnstileToken?: string
  ) => Promise<User | null>;
  logout: () => void;
  updateUserMode: (mode?: string) => Promise<void>;
  refreshUser: () => Promise<void>;
  updateUser: (user: User) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
  initialUser?: User | null;
}

// 缓存键名
const CACHE_KEYS = {
  USER: 'cached_user',
  AUTH_STATUS: 'cached_auth_status',
  CACHE_TIMESTAMP: 'cache_timestamp',
} as const;

// 缓存有效期（毫秒）- 5分钟
const CACHE_DURATION = 5 * 60 * 1000;

// 缓存工具函数
const CacheUtil = {
  // 保存用户数据到缓存
  saveUserCache: (user: User) => {
    try {
      sessionStorage.setItem(CACHE_KEYS.USER, JSON.stringify(user));
      sessionStorage.setItem(CACHE_KEYS.AUTH_STATUS, 'true');
      sessionStorage.setItem(CACHE_KEYS.CACHE_TIMESTAMP, Date.now().toString());
    } catch (error) {
      console.error('Failed to save user cache:', error);
    }
  },

  // 从缓存获取用户数据
  getUserCache: (): { user: User | null; isAuthenticated: boolean; isValid: boolean } => {
    try {
      const timestamp = sessionStorage.getItem(CACHE_KEYS.CACHE_TIMESTAMP);
      const authStatus = sessionStorage.getItem(CACHE_KEYS.AUTH_STATUS);
      const userJson = sessionStorage.getItem(CACHE_KEYS.USER);

      // 检查缓存是否存在
      if (!timestamp || !authStatus || !userJson) {
        return { user: null, isAuthenticated: false, isValid: false };
      }

      // 检查缓存是否过期
      const cacheAge = Date.now() - parseInt(timestamp, 10);
      if (cacheAge > CACHE_DURATION) {
        CacheUtil.clearCache();
        return { user: null, isAuthenticated: false, isValid: false };
      }

      // 返回缓存数据
      const user = JSON.parse(userJson) as User;
      return {
        user,
        isAuthenticated: authStatus === 'true',
        isValid: true,
      };
    } catch (error) {
      console.error('Failed to read user cache:', error);
      CacheUtil.clearCache();
      return { user: null, isAuthenticated: false, isValid: false };
    }
  },

  // 清除缓存
  clearCache: () => {
    try {
      sessionStorage.removeItem(CACHE_KEYS.USER);
      sessionStorage.removeItem(CACHE_KEYS.AUTH_STATUS);
      sessionStorage.removeItem(CACHE_KEYS.CACHE_TIMESTAMP);
    } catch (error) {
      console.error('Failed to clear user cache:', error);
    }
  },
};

export const AuthProvider: React.FC<AuthProviderProps> = ({ children, initialUser = null }) => {
  const [user, setUser] = useState<User | null>(initialUser);
  const [isLoading, setIsLoading] = useState(!initialUser);
  const [isAuthenticated, setIsAuthenticated] = useState(Boolean(initialUser));
  const { t } = useTranslation();

  // Check if user is authenticated on mount
  useEffect(() => {
    if (initialUser) {
      CacheUtil.saveUserCache(initialUser);
      return;
    }

    const checkAuth = async () => {
      const token = localStorage.getItem('access_token');
      const refreshToken = localStorage.getItem('refresh_token');

      // 如果没有 token，直接返回
      if (!token && !refreshToken) {
        CacheUtil.clearCache();
        setIsLoading(false);
        return;
      }

      // 尝试从缓存读取
      const cachedData = CacheUtil.getUserCache();
      if (cachedData.isValid && cachedData.user) {
        console.log(t('auth.context.cache.usingCachedState'));
        setUser(cachedData.user);
        setIsAuthenticated(cachedData.isAuthenticated);
        if (token) {
          const serverUser = await syncServerAuthSession(token);
          if (serverUser) {
            setUser(serverUser);
            setIsAuthenticated(true);
            CacheUtil.saveUserCache(serverUser);
          }
        }
        setIsLoading(false);
        return;
      }

      // 服务端会话端点负责验证 token，避免 hydration 后由浏览器直连远程 API。
      try {
        if (token) {
          const userData = await syncServerAuthSession(token);
          if (userData) {
            setUser(userData);
            setIsAuthenticated(true);
            CacheUtil.saveUserCache(userData);
          }
          return;
        }

        // 只有 refresh token 时等待下一次受保护请求触发统一刷新队列。
        return;
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, [initialUser]);

  const login = async (
    username: string,
    password: string,
    turnstileToken?: string
  ): Promise<User | null> => {
    try {
      setIsLoading(true);
      const tokenResponse: TokenResponse = await authAPI.login(
        username,
        password,
        CLIENT_CONFIG.web_client_id,
        CLIENT_CONFIG.web_client_secret,
        turnstileToken
      );

      // Store tokens
      localStorage.setItem('access_token', tokenResponse.access_token);
      localStorage.setItem('refresh_token', tokenResponse.refresh_token);
      const sessionUser = await syncServerAuthSession(tokenResponse.access_token);

      // 会话端点已完成服务端验证，失败时才回退到既有浏览器请求。
      const userData = sessionUser ?? (await userAPI.getMe());
      setUser(userData);
      setIsAuthenticated(true);

      // 保存到缓存
      CacheUtil.saveUserCache(userData);

      toast.success(t('auth.context.messages.welcomeBack', { username: userData.username }));
      return userData;
    } catch (error) {
      handleApiError(error);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (
    username: string,
    email: string,
    password: string,
    turnstileToken?: string
  ): Promise<User | null> => {
    try {
      setIsLoading(true);
      await authAPI.register(username, email, password, turnstileToken);

      // After successful registration, automatically log in
      const loginUser = await login(username, password, turnstileToken);
      if (loginUser) {
        toast.success(t('auth.context.messages.registerSuccess'));
      }
      return loginUser;
    } catch (error) {
      const err = error as {
        response?: {
          status?: number;
          data?: {
            form_error?: {
              user?: { username?: string[]; user_email?: string[]; password?: string[] };
              message?: string;
            };
          };
        };
      };
      if (err.response?.status === 422 && err.response?.data?.form_error) {
        const formError = err.response.data.form_error;
        if (formError.user) {
          const {
            username: usernameErrors = [],
            user_email: emailErrors = [],
            password: passwordErrors = [],
          } = formError.user;

          if (usernameErrors.length > 0) {
            toast.error(t('auth.context.errors.username', { message: usernameErrors[0] }));
          } else if (emailErrors.length > 0) {
            toast.error(t('auth.context.errors.email', { message: emailErrors[0] }));
          } else if (passwordErrors.length > 0) {
            toast.error(t('auth.context.errors.password', { message: passwordErrors[0] }));
          }
        } else if (formError.message) {
          toast.error(formError.message);
        }
      } else {
        handleApiError(error);
      }
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    void clearServerAuthSession();
    setUser(null);
    setIsAuthenticated(false);
    // 清除缓存
    CacheUtil.clearCache();
    toast.success(t('auth.context.messages.logoutSuccess'));
  };

  const updateUserMode = useCallback(
    async (mode?: string) => {
      if (!isAuthenticated) return;

      try {
        const userData = await userAPI.getMe(mode);
        setUser(userData);
        // 更新缓存
        CacheUtil.saveUserCache(userData);
      } catch (error) {
        handleApiError(error);
      }
    },
    [isAuthenticated]
  );

  const refreshUser = useCallback(async () => {
    if (!isAuthenticated) return;

    try {
      const userData = await userAPI.getMe();
      setUser(userData);
      // 更新缓存
      CacheUtil.saveUserCache(userData);
    } catch (error) {
      handleApiError(error);
    }
  }, [isAuthenticated]);

  const updateUser = useCallback((updatedUser: User) => {
    setUser(updatedUser);
    // 更新缓存
    CacheUtil.saveUserCache(updatedUser);
  }, []);

  const value: AuthContextType = {
    user,
    isLoading,
    isAuthenticated,
    login,
    register,
    logout,
    updateUserMode,
    refreshUser,
    updateUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  const { t } = useTranslation();
  if (context === undefined) {
    throw new Error(t('auth.context.errors.hookUsage'));
  }
  return context;
};
