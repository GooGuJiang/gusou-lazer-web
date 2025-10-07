import React, { useState, useRef, useEffect, memo, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FiUser, FiLogOut, FiSettings, FiChevronDown, FiChevronRight, FiCheck } from 'react-icons/fi';
import { useTranslation } from 'react-i18next';
import Avatar from './Avatar';
import type { User } from '../../types';
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
    code: 'zh',
    name: 'Chinese',
    nativeName: '中文',
    flag: 'cn'
  },
  {
    code: 'en',
    name: 'English',
    nativeName: 'English',
    flag: 'us'
  },
];

interface UserDropdownProps {
  user: User;
  onLogout: () => void;
}

const UserDropdown: React.FC<UserDropdownProps> = memo(({ user, onLogout }) => {
  const { t, i18n } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const [languageOpen, setLanguageOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // 获取当前语言配置
  const currentLanguage = SUPPORTED_LANGUAGES.find(
    lang => lang.code === (i18n.resolvedLanguage ?? i18n.language)
  ) || SUPPORTED_LANGUAGES[0];

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setLanguageOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Close dropdown when pressing escape
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      return () => {
        document.removeEventListener('keydown', handleEscape);
      };
    }
  }, [isOpen]);

  const handleToggle = useCallback(() => {
    setIsOpen(prev => !prev);
  }, []);

  const handleLogout = useCallback(() => {
    setIsOpen(false);
    onLogout();
  }, [onLogout]);

  const handleMenuItemClick = useCallback(() => {
    setIsOpen(false);
  }, []);

  const handleLanguageToggle = useCallback(() => {
    setLanguageOpen(prev => !prev);
  }, []);

  const handleLanguageSelect = useCallback((languageCode: AppLanguages) => {
    void i18n.changeLanguage(languageCode);
    setLanguageOpen(false);
    setIsOpen(false);
  }, [i18n]);

  return (
    <div className="relative" ref={dropdownRef}>
      {/* User Avatar/Button */}
      <button
        onClick={handleToggle}
        className={`flex items-center space-x-2 px-3 py-2.5 rounded-xl font-medium transition-all duration-200 ${
          isOpen
            ? 'text-osu-pink bg-osu-pink/10 shadow-sm'
            : 'text-gray-600 dark:text-gray-300 hover:text-osu-pink dark:hover:text-osu-pink hover:bg-gray-50 dark:hover:bg-gray-800/50'
        }`}
        aria-expanded={isOpen}
        aria-haspopup="true"
      >
        {/* Avatar */}
        <Avatar
          userId={user.id}
          username={user.username}
          avatarUrl={user.avatar_url}
          size="sm"
          editable={false}
        />
        
        {/* Username */}
        <span className="hidden sm:inline font-medium max-w-24 truncate">
          {user.username}
        </span>
        
        {/* Dropdown Icon */}
        <motion.div
          animate={{ 
            rotate: isOpen ? 0 : -180
          }}
          transition={{ duration: 0.2 }}
          className="hidden sm:block"
        >
          <FiChevronDown size={14} />
        </motion.div>
      </button>

      {/* Dropdown Menu */}
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
            className="absolute right-0 mt-3 w-52 bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl rounded-2xl shadow-xl border border-gray-200/50 dark:border-gray-700/50 py-2 z-50 overflow-visible"
            style={{
              boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04), 0 0 0 1px rgba(0, 0, 0, 0.05)'
            }}
          >
            {/* Menu Items */}
            <div className="py-2">
              <DropdownItem
                to="/profile"
                icon={FiUser}
                label={t('nav.profile')}
                onClick={handleMenuItemClick}
              />
              
              <DropdownItem
                to="/settings"
                icon={FiSettings}
                label={t('nav.settings')}
                onClick={handleMenuItemClick}
              />

              {/* Language Selector */}
              <div className="relative">
                <button
                  onClick={handleLanguageToggle}
                  className="flex items-center justify-between w-full px-4 py-2.5 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800/50 hover:text-osu-pink dark:hover:text-osu-pink transition-all duration-200"
                >
                  <div className="flex items-center space-x-3">
                    <img
                      src={`/image/flag/${currentLanguage.flag}.svg`}
                      alt={`${currentLanguage.name} flag`}
                      className="w-5 h-4 rounded object-cover flex-shrink-0"
                    />
                    <span className="font-medium">{currentLanguage.nativeName}</span>
                  </div>
                  <motion.div
                    animate={{ rotate: languageOpen ? 90 : 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <FiChevronRight size={14} />
                  </motion.div>
                </button>

                {/* Language Submenu - Floating below */}
                <AnimatePresence>
                  {languageOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: -10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -10, scale: 0.95 }}
                      transition={{ duration: 0.15 }}
                      className="absolute top-full left-0 right-0 mt-2 bg-card rounded-xl border border-gray-200 dark:border-gray-700 py-2 shadow-xl z-[60] overflow-hidden min-w-[200px]"
                      style={{
                        boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)'
                      }}
                    >
                      {SUPPORTED_LANGUAGES.map((language) => {
                        const isSelected = language.code === currentLanguage.code;
                        
                        return (
                          <button
                            key={language.code}
                            onClick={() => handleLanguageSelect(language.code)}
                            className={`
                              w-full flex items-center justify-between px-3 py-2.5 text-sm font-medium 
                              transition-all duration-200
                              ${
                                isSelected
                                  ? 'text-osu-pink bg-osu-pink/10'
                                  : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700/50 hover:text-osu-pink'
                              }
                            `}
                          >
                            <div className="flex items-center space-x-3">
                              <img
                                src={`/image/flag/${language.flag}.svg`}
                                alt={`${language.name} flag`}
                                className="w-5 h-4 rounded object-cover flex-shrink-0"
                              />
                              <span className="font-medium">{language.nativeName}</span>
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
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>

            {/* Logout */}
            <div className="border-t border-gray-200/50 dark:border-gray-700/50 mt-2 pt-2">
              <button
                onClick={handleLogout}
                className="flex items-center w-full px-4 py-2.5 text-sm font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 hover:text-red-700 dark:hover:text-red-300 transition-all duration-200"
              >
                <FiLogOut size={16} className="mr-3" />
                {t('nav.logout')}
              </button>
            </div>

            {/* Decorative gradient */}
            <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-osu-pink/5 via-transparent to-osu-blue/5 pointer-events-none" />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
});

// Dropdown item component for consistency
interface DropdownItemProps {
  to: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  label: string;
  onClick: () => void;
}

const DropdownItem: React.FC<DropdownItemProps> = memo(({ 
  to, 
  icon: Icon, 
  label, 
  onClick
}) => {
  return (
    <Link
      to={to}
      onClick={onClick}
      className="block"
    >
      <div className="flex items-center px-4 py-2.5 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800/50 hover:text-osu-pink dark:hover:text-osu-pink transition-all duration-200">
        <Icon size={16} className="mr-3" />
        {label}
      </div>
    </Link>
  );
});

DropdownItem.displayName = 'DropdownItem';
UserDropdown.displayName = 'UserDropdown';

export default UserDropdown;