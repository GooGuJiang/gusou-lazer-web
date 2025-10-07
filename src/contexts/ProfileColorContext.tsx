import React, { createContext, useContext, useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import { useAuth } from '../hooks/useAuth';
import { preferencesAPI } from '../utils/api';

interface ProfileColorContextType {
  profileColor: string;
  setProfileColor: (color: string) => Promise<void>;
  isLoading: boolean;
}

const ProfileColorContext = createContext<ProfileColorContextType | undefined>(undefined);

interface ProfileColorProviderProps {
  children: ReactNode;
}

const DEFAULT_COLOR = '#ED8EA6'; // 默认的 osu-pink 颜色

/**
 * ProfileColorProvider - 全局管理个人颜色设置
 * 通过CSS变量动态应用个人颜色到整个应用
 */
export const ProfileColorProvider: React.FC<ProfileColorProviderProps> = ({ children }) => {
  const { isAuthenticated, user } = useAuth();
  const [profileColor, setProfileColorState] = useState<string>(DEFAULT_COLOR);
  const [isLoading, setIsLoading] = useState(true);

  // 加载用户的个人颜色设置
  useEffect(() => {
    const loadProfileColor = async () => {
      if (!isAuthenticated) {
        setProfileColorState(DEFAULT_COLOR);
        setIsLoading(false);
        return;
      }

      try {
        const preferences = await preferencesAPI.getPreferences();
        const color = preferences.profile_colour || DEFAULT_COLOR;
        setProfileColorState(color);
        applyColorToDOM(color);
      } catch (error) {
        console.error('Failed to load profile color:', error);
        setProfileColorState(DEFAULT_COLOR);
        applyColorToDOM(DEFAULT_COLOR);
      } finally {
        setIsLoading(false);
      }
    };

    loadProfileColor();
  }, [isAuthenticated, user]);

  // 应用颜色到DOM的CSS变量
  const applyColorToDOM = (color: string) => {
    document.documentElement.style.setProperty('--profile-color', color);
    document.documentElement.style.setProperty('--osu-pink', color);
  };

  // 设置个人颜色并保存到服务器
  const setProfileColor = async (color: string) => {
    try {
      setProfileColorState(color);
      applyColorToDOM(color);
      
      // 如果已登录，保存到服务器
      if (isAuthenticated) {
        await preferencesAPI.updatePreferences({ profile_colour: color });
      }
    } catch (error) {
      console.error('Failed to save profile color:', error);
      throw error;
    }
  };

  const value: ProfileColorContextType = {
    profileColor,
    setProfileColor,
    isLoading,
  };

  return (
    <ProfileColorContext.Provider value={value}>
      {children}
    </ProfileColorContext.Provider>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useProfileColor = (): ProfileColorContextType => {
  const context = useContext(ProfileColorContext);
  if (context === undefined) {
    throw new Error('useProfileColor must be used within a ProfileColorProvider');
  }
  return context;
};

