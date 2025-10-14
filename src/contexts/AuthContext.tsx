import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { ReactNode } from 'react';
import { authAPI, userAPI, handleApiError, CLIENT_CONFIG } from '../utils/api';
import type { User, TokenResponse } from '../types';
import toast from 'react-hot-toast';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (username: string, password: string, turnstileToken?: string) => Promise<boolean>;
  register: (username: string, email: string, password: string, turnstileToken?: string) => Promise<boolean>;
  logout: () => void;
  updateUserMode: (mode?: string) => Promise<void>;
  refreshUser: () => Promise<void>;
  updateUser: (user: User) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Check if user is authenticated on mount
  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('access_token');
      const refreshToken = localStorage.getItem('refresh_token');
      
      if (!token && !refreshToken) {
        setIsLoading(false);
        return;
      }

      try {
        // 尝试获取用户信息
        const userData = await userAPI.getMe();
        setUser(userData);
        setIsAuthenticated(true);
      } catch (error) {
        // 如果获取用户信息失败，axios 拦截器会自动尝试刷新 token
        // 这里只需要处理刷新失败的情况
        const err = error as { response?: { status?: number } };
        
        // 如果是 401 错误且已经重定向到登录页，说明刷新失败
        // 否则可能是网络错误或其他问题，不应该清除 token
        if (err.response?.status === 401) {
          // 拦截器会处理重定向，这里只清理状态
          setUser(null);
          setIsAuthenticated(false);
        } else {
          // 其他错误，保持登录状态，可能是网络问题
          console.error('Failed to fetch user data:', error);
        }
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []);

  const login = async (username: string, password: string, turnstileToken?: string): Promise<boolean> => {
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

      // Get user data
      const userData = await userAPI.getMe();
      setUser(userData);
      setIsAuthenticated(true);

      toast.success(`欢迎回来，${userData.username}！`);
      return true;
    } catch (error) {
      handleApiError(error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (username: string, email: string, password: string, turnstileToken?: string): Promise<boolean> => {
    try {
      setIsLoading(true);
      await authAPI.register(username, email, password, turnstileToken);
      
      // After successful registration, automatically log in
      const loginSuccess = await login(username, password, turnstileToken);
      if (loginSuccess) {
        toast.success('账户创建成功！');
      }
      return loginSuccess;
    } catch (error) {
      const err = error as {
        response?: { status?: number; data?: { form_error?: { user?: { username?: string[]; user_email?: string[]; password?: string[] }; message?: string } } };
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
            toast.error(`用户名：${usernameErrors[0]}`);
          } else if (emailErrors.length > 0) {
            toast.error(`邮箱：${emailErrors[0]}`);
          } else if (passwordErrors.length > 0) {
            toast.error(`密码：${passwordErrors[0]}`);
          }
        } else if (formError.message) {
          toast.error(formError.message);
        }
      } else {
        handleApiError(error);
      }
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    setUser(null);
    setIsAuthenticated(false);
    toast.success('成功退出登录');
  };

  const updateUserMode = useCallback(async (mode?: string) => {
    if (!isAuthenticated) return;
    
    try {
      const userData = await userAPI.getMe(mode);
      setUser(userData);
    } catch (error) {
      handleApiError(error);
    }
  }, [isAuthenticated]);

  const refreshUser = useCallback(async () => {
    if (!isAuthenticated) return;
    
    try {
      const userData = await userAPI.getMe();
      setUser(userData);
    } catch (error) {
      handleApiError(error);
    }
  }, [isAuthenticated]);

  const updateUser = useCallback((updatedUser: User) => {
    setUser(updatedUser);
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

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
