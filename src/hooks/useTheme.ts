import { useState, useEffect, useCallback } from 'react';
import type { Theme } from '../types';

/**
 * 获取系统主题偏好
 */
const getSystemTheme = (): 'light' | 'dark' => {
  if (typeof window === 'undefined') return 'light';
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
};

/**
 * 根据 Theme 设置值解析实际应用的主题（light 或 dark）
 */
const resolveTheme = (theme: Theme): 'light' | 'dark' => {
  if (theme === 'system') {
    return getSystemTheme();
  }
  return theme;
};

export const useTheme = () => {
  const [theme, setTheme] = useState<Theme>('system');
  const [preferenceLoaded, setPreferenceLoaded] = useState(false);

  // 实际应用到 DOM 的主题
  const [resolvedTheme, setResolvedTheme] = useState<'light' | 'dark'>('light');

  useEffect(() => {
    try {
      const saved = localStorage.getItem('theme');
      if (saved === 'light' || saved === 'dark' || saved === 'system') setTheme(saved);
    } catch {
      setTheme('system');
    } finally {
      setPreferenceLoaded(true);
    }
  }, []);

  // 应用主题到 DOM
  const applyTheme = useCallback((resolved: 'light' | 'dark') => {
    setResolvedTheme(resolved);
    if (typeof document !== 'undefined') {
      document.documentElement.classList.toggle('dark', resolved === 'dark');
    }
  }, []);

  useEffect(() => {
    if (!preferenceLoaded) return;
    const resolved = resolveTheme(theme);
    applyTheme(resolved);

    // 只有在 system 模式下才监听系统主题变化
    if (theme === 'system') {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      const handleSystemThemeChange = (e: MediaQueryListEvent) => {
        applyTheme(e.matches ? 'dark' : 'light');
      };
      mediaQuery.addEventListener('change', handleSystemThemeChange);
      return () => {
        mediaQuery.removeEventListener('change', handleSystemThemeChange);
      };
    }
  }, [theme, applyTheme, preferenceLoaded]);

  // 设置主题并持久化到 localStorage
  const setSpecificTheme = useCallback((newTheme: Theme) => {
    setTheme(newTheme);
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem('theme', newTheme);
    }
  }, []);

  // 循环切换主题：light → dark → system → light
  const cycleTheme = useCallback(() => {
    const order: Theme[] = ['light', 'dark', 'system'];
    const currentIndex = order.indexOf(theme);
    const nextTheme = order[(currentIndex + 1) % order.length];
    setSpecificTheme(nextTheme);
  }, [theme, setSpecificTheme]);

  return {
    theme,
    isDark: resolvedTheme === 'dark',
    cycleTheme,
    setTheme: setSpecificTheme,
  };
};
