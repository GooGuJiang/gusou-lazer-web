import React, { createContext, useContext, useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import { useAuth } from '../hooks/useAuth';
import { preferencesAPI } from '../utils/api';

interface ProfileColorContextType {
	profileColor: string;
	setProfileColor: (color: string) => Promise<void>;
	// 设置临时颜色（仅应用于前端，不持久化到服务器）
	setProfileColorLocal: (color: string) => void;
	// 重置为已保存的颜色（从服务器加载或最近一次成功保存的值）
	resetProfileColor: () => void;
	isLoading: boolean;
}

const ProfileColorContext = createContext<ProfileColorContextType | undefined>(undefined);

interface ProfileColorProviderProps {
  children: ReactNode;
}

export const DEFAULT_PROFILE_COLOR = '#ED8EA6'; // 默认的 osu-pink 颜色
const LOCAL_STORAGE_KEY = 'user_profile_color'; // 本地存储的键名

/**
 * ProfileColorProvider - 全局管理个人颜色设置
 * 通过CSS变量动态应用个人颜色到整个应用
 * 
 * 颜色优先级：
 * 1. 服务端返回的颜色（最高优先级）
 * 2. 本地存储的用户设置颜色
 * 3. 默认颜色
 */
export const ProfileColorProvider: React.FC<ProfileColorProviderProps> = ({ children }) => {
  const { isAuthenticated, user } = useAuth();
  const [profileColor, setProfileColorState] = useState<string>(() => {
    // 初始化时从本地存储读取
    try {
      const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
      return stored || DEFAULT_PROFILE_COLOR;
    } catch {
      return DEFAULT_PROFILE_COLOR;
    }
  });
	// 保留从服务器加载或成功保存的颜色，用于重置
	const [savedProfileColor, setSavedProfileColor] = useState<string>(() => {
    // 初始化时从本地存储读取
    try {
      const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
      return stored || DEFAULT_PROFILE_COLOR;
    } catch {
      return DEFAULT_PROFILE_COLOR;
    }
  });
  const [isLoading, setIsLoading] = useState(true);

  // 加载用户的个人颜色设置
  useEffect(() => {
    const loadProfileColor = async () => {
      if (!isAuthenticated) {
        // 未登录时使用本地存储的颜色或默认颜色
        const storedColor = localStorage.getItem(LOCAL_STORAGE_KEY) || DEFAULT_PROFILE_COLOR;
        setProfileColorState(storedColor);
        setSavedProfileColor(storedColor);
        applyColorToDOM(storedColor);
        setIsLoading(false);
        return;
      }

      // 先立即应用本地存储的颜色，避免延迟
      const storedColor = localStorage.getItem(LOCAL_STORAGE_KEY) || DEFAULT_PROFILE_COLOR;
      setProfileColorState(storedColor);
      setSavedProfileColor(storedColor);
      applyColorToDOM(storedColor);
      setIsLoading(false);

      try {
        // 后台从服务器获取用户设置的颜色
        const preferences = await preferencesAPI.getPreferences();
        let serverColor = preferences.profile_colour || DEFAULT_PROFILE_COLOR;
        
        // 确保颜色值以 # 开头
        if (serverColor && !serverColor.startsWith('#')) {
          serverColor = `#${serverColor}`;
        }
        
        // 只有当服务端颜色和本地存储不一样时才更新
        if (serverColor !== storedColor) {
          setProfileColorState(serverColor);
          setSavedProfileColor(serverColor);
          localStorage.setItem(LOCAL_STORAGE_KEY, serverColor);
          applyColorToDOM(serverColor);
        }
      } catch (error) {
        console.error('Failed to load profile color:', error);
        // 失败时已经应用了本地存储的颜色，无需额外处理
      }
    };

    loadProfileColor();
  }, [isAuthenticated, user]);

  // 应用颜色到DOM的CSS变量
  const applyColorToDOM = (color: string) => {
    document.documentElement.style.setProperty('--profile-color', color);
    document.documentElement.style.setProperty('--osu-pink', color);
    
    // 将 HEX 颜色转换为 RGB 用于背景色透明度
    const hexToRgb = (hex: string): string => {
      const cleanHex = hex.replace('#', '');
      const r = parseInt(cleanHex.substring(0, 2), 16);
      const g = parseInt(cleanHex.substring(2, 4), 16);
      const b = parseInt(cleanHex.substring(4, 6), 16);
      return `${r}, ${g}, ${b}`;
    };
    
    // 将 HEX 颜色转换为 Hue 值
    const hexToHue = (hex: string): number => {
      const cleanHex = hex.replace('#', '');
      const r = parseInt(cleanHex.substring(0, 2), 16) / 255;
      const g = parseInt(cleanHex.substring(2, 4), 16) / 255;
      const b = parseInt(cleanHex.substring(4, 6), 16) / 255;
      
      const max = Math.max(r, g, b);
      const min = Math.min(r, g, b);
      const delta = max - min;
      
      let h = 0;
      if (delta !== 0) {
        if (max === r) {
          h = ((g - b) / delta + (g < b ? 6 : 0)) / 6;
        } else if (max === g) {
          h = ((b - r) / delta + 2) / 6;
        } else {
          h = ((r - g) / delta + 4) / 6;
        }
      }
      return Math.round(h * 360);
    };
    
    const rgb = hexToRgb(color);
    const hue = hexToHue(color);
    
    // 设置 hue 值，用于 OKLCH 颜色空间的背景色
    document.documentElement.style.setProperty('--hue', String(hue));
    
    // 更新背景颜色相关的 CSS 变量（浅色和深色模式都会用到）
    document.documentElement.style.setProperty('--bg-accent-light', `rgba(${rgb}, 0.05)`);
    document.documentElement.style.setProperty('--bg-accent-medium', `rgba(${rgb}, 0.1)`);
  };

  // 设置个人颜色并保存到服务器和本地存储
  const setProfileColor = async (color: string) => {
    try {
      // 确保颜色值以 # 开头
      let normalizedColor = color;
      if (normalizedColor && !normalizedColor.startsWith('#')) {
        normalizedColor = `#${normalizedColor}`;
      }
      
      setProfileColorState(normalizedColor);
      applyColorToDOM(normalizedColor);
      
      // 如果已登录，保存到服务器
      if (isAuthenticated) {
        await preferencesAPI.updatePreferences({ profile_colour: normalizedColor });
      }
      
      // 保存到本地存储
      localStorage.setItem(LOCAL_STORAGE_KEY, normalizedColor);
      
      // 成功后更新已保存颜色
      setSavedProfileColor(normalizedColor);
    } catch (error) {
      console.error('Failed to save profile color:', error);
      throw error;
    }
  };

	// 设置临时颜色（不持久化）
	const setProfileColorLocal = (color: string) => {
		// 确保颜色值以 # 开头
		let normalizedColor = color;
		if (normalizedColor && !normalizedColor.startsWith('#')) {
			normalizedColor = `#${normalizedColor}`;
		}
		setProfileColorState(normalizedColor);
		applyColorToDOM(normalizedColor);
	};

	// 重置为已保存的颜色
	const resetProfileColor = () => {
		setProfileColorState(savedProfileColor);
		applyColorToDOM(savedProfileColor);
	};

  const value: ProfileColorContextType = {
    profileColor,
    setProfileColor,
    setProfileColorLocal,
    resetProfileColor,
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

