import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { ReactNode } from 'react';
import { authAPI, userAPI, handleApiError, CLIENT_CONFIG } from '../utils/api';
import type { User, TokenResponse } from '../types';
import toast from 'react-hot-toast';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (username: string, password: string) => Promise<boolean>;
  register: (username: string, email: string, password: string) => Promise<boolean>;
  logout: () => void;
  updateUserMode: (mode?: string) => Promise<void>;
  refreshUser: () => Promise<void>;
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
      if (token) {
        try {
          const userData = await userAPI.getMe();
          setUser(userData);
          setIsAuthenticated(true);
        } catch {
          // Token might be expired, try to refresh
          const refreshToken = localStorage.getItem('refresh_token');
          if (refreshToken) {
            try {
              await refreshAccessToken();
            } catch {
              logout();
            }
          } else {
            logout();
          }
        }
      }
      setIsLoading(false);
    };

    checkAuth();
  }, []);

  const login = async (username: string, password: string): Promise<boolean> => {
    try {
      setIsLoading(true);
      const tokenResponse: TokenResponse = await authAPI.login(
        username,
        password,
        CLIENT_CONFIG.web_client_id,
        CLIENT_CONFIG.web_client_secret
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

  const register = async (username: string, email: string, password: string): Promise<boolean> => {
    try {
      setIsLoading(true);
      await authAPI.register(username, email, password);
      
      // After successful registration, automatically log in
      const loginSuccess = await login(username, password);
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

  const refreshAccessToken = async () => {
    const refreshToken = localStorage.getItem('refresh_token');
    if (!refreshToken) throw new Error('没有可用的刷新令牌');

    const tokenResponse: TokenResponse = await authAPI.refreshToken(
      refreshToken,
      CLIENT_CONFIG.web_client_id,
      CLIENT_CONFIG.web_client_secret
    );

    localStorage.setItem('access_token', tokenResponse.access_token);
    localStorage.setItem('refresh_token', tokenResponse.refresh_token);

    // Get updated user data
    const userData = await userAPI.getMe();
    setUser(userData);
    setIsAuthenticated(true);
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

  const value: AuthContextType = {
    user,
    isLoading,
    isAuthenticated,
    login,
    register,
    logout,
    updateUserMode,
    refreshUser,
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
