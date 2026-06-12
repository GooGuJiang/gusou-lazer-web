import React, { useState, useRef, useEffect, useCallback, memo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { FiSun, FiMoon, FiMonitor } from 'react-icons/fi';
import { useTheme } from '../../hooks/useTheme';
import type { Theme } from '../../types';

// 主题选项配置
interface ThemeOption {
  value: Theme;
  icon: React.ComponentType<{ size?: number; className?: string }>;
}

const THEME_OPTIONS: ThemeOption[] = [
  { value: 'light', icon: FiSun },
  { value: 'dark', icon: FiMoon },
  { value: 'system', icon: FiMonitor },
];

interface ThemeSelectorProps {
  className?: string;
}

const ThemeSelector: React.FC<ThemeSelectorProps> = memo(({ className = '' }) => {
  const { t } = useTranslation();
  const { theme, setTheme } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // 获取当前主题对应的图标
  const currentOption = THEME_OPTIONS.find(opt => opt.value === theme) || THEME_OPTIONS[2];
  const CurrentIcon = currentOption.icon;

  // 切换下拉菜单
  const handleToggle = useCallback(() => {
    setIsOpen(prev => !prev);
  }, []);

  // 选择主题
  const handleThemeSelect = useCallback((newTheme: Theme) => {
    setTheme(newTheme);
    setIsOpen(false);
  }, [setTheme]);

  // 点击外部关闭
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // 键盘导航支持
  const handleKeyDown = useCallback((event: React.KeyboardEvent) => {
    if (event.key === 'Escape') {
      setIsOpen(false);
    }
  }, []);

  return (
    <div
      className={`relative ${className}`}
      ref={dropdownRef}
      onKeyDown={handleKeyDown}
    >
      {/* 主题切换按钮 */}
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={handleToggle}
        className={`
          p-2 md:p-2.5 rounded-xl transition-all duration-200
          ${isOpen
            ? 'text-osu-pink bg-osu-pink/10'
            : 'text-gray-600 dark:text-gray-300 hover:text-osu-pink hover:bg-gray-50 dark:hover:bg-gray-800/50'
          }
        `}
        aria-label={t(`common.theme.${theme}`)}
        aria-expanded={isOpen}
        aria-haspopup="listbox"
      >
        <CurrentIcon size={18} />
      </motion.button>

      {/* 下拉菜单 */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{
              opacity: 0,
              scale: 0.95,
              y: -10
            }}
            animate={{
              opacity: 1,
              scale: 1,
              y: 0
            }}
            exit={{
              opacity: 0,
              scale: 0.95,
              y: -10
            }}
            transition={{
              duration: 0.15,
              ease: [0.16, 1, 0.3, 1]
            }}
            className="
              absolute left-0 mt-2 bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl
              rounded-2xl shadow-xl border border-gray-200/50 dark:border-gray-700/50
              py-2 z-50 overflow-hidden whitespace-nowrap
            "
            style={{
              boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04), 0 0 0 1px rgba(0, 0, 0, 0.05)'
            }}
            role="listbox"
            aria-label={t('common.theme.light')}
          >
            <div className="py-1">
              {THEME_OPTIONS.map((option) => {
                const isSelected = option.value === theme;
                const IconComponent = option.icon;

                return (
                  <button
                    key={option.value}
                    onClick={() => handleThemeSelect(option.value)}
                    className={`
                      w-full flex items-center justify-between px-4 py-2.5 text-sm font-medium
                      transition-all duration-200 group
                      ${isSelected
                        ? 'text-osu-pink bg-osu-pink/10'
                        : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800/50 hover:text-osu-pink'
                      }
                    `}
                    role="option"
                    aria-selected={isSelected}
                  >
                    <div className="flex items-center space-x-3">
                      <IconComponent size={16} />
                      <span>{t(`common.theme.${option.value}`)}</span>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* 装饰性渐变 */}
            <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-osu-pink/5 via-transparent to-osu-blue/5 pointer-events-none" />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
});

ThemeSelector.displayName = 'ThemeSelector';

export default ThemeSelector;