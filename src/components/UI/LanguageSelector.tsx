import React, { useState, useRef, useEffect, useCallback, memo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { FiChevronDown, FiGlobe, FiCheck } from 'react-icons/fi';
import type { AppLanguages } from '../../i18n/resources';

// 语言配置接口
interface LanguageConfig {
  code: AppLanguages;
  name: string;
  nativeName: string;
  flag: string;
}

// 支持的语言列表
const SUPPORTED_LANGUAGES: LanguageConfig[] = [
  {
    code: 'en',
    name: 'English',
    nativeName: 'English',
    flag: 'us'
  },
  {
    code: 'zh',
    name: 'Chinese',
    nativeName: '中文',
    flag: 'cn'
  },
  // // 其他支持的语言
  // {
  //   code: 'ja',
  //   name: 'Japanese',
  //   nativeName: '日本語',
  //   flag: 'jp'
  // },
  // {
  //   code: 'ko',
  //   name: 'Korean',
  //   nativeName: '한국어',
  //   flag: 'kr'
  // },
  // {
  //   code: 'es',
  //   name: 'Spanish',
  //   nativeName: 'Español',
  //   flag: 'es'
  // },
  // {
  //   code: 'fr',
  //   name: 'French',
  //   nativeName: 'Français',
  //   flag: 'fr'
  // },
  // {
  //   code: 'de',
  //   name: 'German',
  //   nativeName: 'Deutsch',
  //   flag: 'de'
  // },
  // {
  //   code: 'ru',
  //   name: 'Russian',
  //   nativeName: 'Русский',
  //   flag: 'ru'
  // },
];

interface LanguageSelectorProps {
  variant?: 'desktop' | 'mobile';
  className?: string;
}

const LanguageSelector: React.FC<LanguageSelectorProps> = memo(({ 
  variant = 'desktop',
  className = ''
}) => {
  const { i18n, t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // 获取当前语言配置
  const currentLanguage = SUPPORTED_LANGUAGES.find(
    lang => lang.code === (i18n.resolvedLanguage ?? i18n.language)
  ) || SUPPORTED_LANGUAGES[0];

  // 切换下拉菜单
  const handleToggle = useCallback(() => {
    setIsOpen(prev => !prev);
  }, []);

  // 选择语言
  const handleLanguageSelect = useCallback((languageCode: AppLanguages) => {
    void i18n.changeLanguage(languageCode);
    setIsOpen(false);
  }, [i18n]);


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

  const isMobile = variant === 'mobile';

  return (
    <div 
      className={`relative ${className}`} 
      ref={dropdownRef}
      onKeyDown={handleKeyDown}
    >
      {/* 语言选择按钮 */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={handleToggle}
        className={`
          flex items-center space-x-2 rounded-xl transition-all duration-200 group
          ${isMobile 
            ? 'px-3 py-2 text-xs font-medium' 
            : 'px-3 py-2 text-sm font-medium'
          }
          ${isOpen
            ? 'text-osu-pink bg-osu-pink/10'
            : 'text-gray-600 dark:text-gray-300 hover:text-osu-pink hover:bg-gray-50 dark:hover:bg-gray-800/50'
          }
        `}
        aria-label={t('common.language.label')}
        aria-expanded={isOpen}
        aria-haspopup="listbox"
      >
        {/* 地球图标或国旗 */}
        <div className="flex items-center space-x-1.5">
          {isMobile ? (
            <FiGlobe size={14} />
          ) : (
            <img
              src={`/image/flag/${currentLanguage.flag}.svg`}
              alt={`${currentLanguage.name} flag`}
              className="w-5 h-4 rounded-sm object-cover"
            />
          )}
          
          {/* 语言名称 */}
          <span className="whitespace-nowrap">
            {isMobile ? currentLanguage.code.toUpperCase() : currentLanguage.nativeName}
          </span>
        </div>

        {/* 下拉箭头 */}
        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.2 }}
        >
          <FiChevronDown size={isMobile ? 12 : 14} />
        </motion.div>
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
            className={`
              absolute right-0 mt-2 bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl 
              rounded-2xl shadow-xl border border-gray-200/50 dark:border-gray-700/50 
              py-2 z-50 overflow-hidden
              ${isMobile ? 'w-40' : 'w-48'}
            `}
            style={{
              boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04), 0 0 0 1px rgba(0, 0, 0, 0.05)'
            }}
            role="listbox"
            aria-label={t('common.language.label')}
          >
            {/* 语言选项 */}
            <div className="py-1">
              {SUPPORTED_LANGUAGES.map((language) => {
                const isSelected = language.code === currentLanguage.code;
                
                return (
                  <button
                    key={language.code}
                    onClick={() => handleLanguageSelect(language.code)}
                    className={`
                      w-full flex items-center justify-between px-4 py-3 text-sm font-medium 
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
                      <img
                        src={`/image/flag/${language.flag}.svg`}
                        alt={`${language.name} flag`}
                        className="w-5 h-4 rounded-sm object-cover flex-shrink-0"
                      />
                      <div className="flex flex-col items-start">
                        <span className="font-medium">{language.nativeName}</span>
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          {language.name}
                        </span>
                      </div>
                    </div>
                    
                    {/* 选中指示器 */}
                    {isSelected && (
                      <div className="text-osu-pink">
                        <FiCheck size={16} />
                      </div>
                    )}
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

LanguageSelector.displayName = 'LanguageSelector';

export default LanguageSelector;