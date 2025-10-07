import React, { useState, useEffect, useRef, useCallback, memo } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FiSun, FiMoon, FiHome, FiTrendingUp, FiMusic, FiBell, FiUsers, FiMenu, FiX, FiSettings, FiServer, FiGlobe, FiCheck, FiLogOut } from 'react-icons/fi';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../hooks/useTheme';
import { useAuth } from '../../hooks/useAuth';
import { useNotificationContext } from '../../contexts/NotificationContext';
import UserDropdown from '../UI/UserDropdown';
import Avatar from '../UI/Avatar';
import LanguageSelector from '../UI/LanguageSelector';
import type { NavItem } from '../../types';

// 将 NavItem 组件提取并使用 memo 优化，防止不必要的重新渲染
const NavItem = memo<{ item: NavItem }>(({ item }) => {
  const [isHovered, setIsHovered] = useState(false);
  const [forceShowText, setForceShowText] = useState(false);
  const prevIsActiveRef = useRef<boolean | undefined>(undefined);
  const location = useLocation();
  const IconComponent = item.icon;
  const isActive = location.pathname === item.path;
  
  // 文字显示逻辑：活跃时强制显示，或者悬停时显示
  const shouldShowText = isActive || forceShowText || isHovered;
  
  // 检测是否是路由切换导致的状态变化
  const isRouteChange = prevIsActiveRef.current !== undefined && 
                       prevIsActiveRef.current !== isActive;
  
  // 更新前一个活跃状态的引用
  useEffect(() => {
    prevIsActiveRef.current = isActive;
    // 如果变为活跃状态，强制显示文本
    if (isActive) {
      setForceShowText(true);
    } else {
      setForceShowText(false);
    }
  }, [isActive]);

  // 使用 useCallback 防止函数重新创建导致重新渲染
  const handleMouseEnter = useCallback(() => {
    setIsHovered(true);
  }, []);

  const handleMouseLeave = useCallback(() => {
    setIsHovered(false);
  }, []);

  return (
    <motion.div
      animate={{ 
        scale: isActive ? 1 : 0.98,
        opacity: isActive ? 1 : 0.75 
      }}
      whileHover={{ 
        scale: 1,
        opacity: 1,
        transition: { duration: 0.2 }
      }}
      transition={{ 
        duration: 0.3,
        ease: "easeOut"
      }}
      onHoverStart={handleMouseEnter}
      onHoverEnd={handleMouseLeave}
      className="relative flex-shrink-0"
    >
      <Link
        to={item.path}
        className={`relative flex items-center rounded-xl font-medium text-sm transition-all duration-200 group ${
          isActive
            ? 'text-white bg-osu-pink shadow-lg shadow-osu-pink/25'
            : 'text-gray-600 dark:text-gray-300 hover:text-osu-pink dark:hover:text-osu-pink hover:bg-gray-50 dark:hover:bg-gray-800/50'
        }`}
        style={{ 
          paddingLeft: '12px',
          paddingRight: shouldShowText ? '16px' : '12px',
          paddingTop: '8px',
          paddingBottom: '8px'
        }}
      >
        {/* 图标 */}
        {IconComponent && (
          <motion.div
            animate={{ 
              rotate: isHovered && !isActive ? 10 : 0 
            }}
            transition={{ type: "spring", stiffness: 300 }}
            className="flex-shrink-0"
          >
            <IconComponent size={16} />
          </motion.div>
        )}
        
        {/* 文字伸缩效果 */}
        <motion.div
          className="overflow-hidden flex items-center"
          animate={{ 
            width: shouldShowText ? 'auto' : 0,
            marginLeft: shouldShowText ? 8 : 0,
          }}
          transition={{ 
            // 路由切换时不播放动画，只有悬停时才播放动画
            duration: isRouteChange ? 0 : 0.3,
            ease: [0.4, 0, 0.2, 1]
          }}
        >
          <motion.span
            className="whitespace-nowrap"
            animate={{ 
              opacity: shouldShowText ? 1 : 0,
              x: shouldShowText ? 0 : -10
            }}
            transition={{ 
              // 路由切换时不播放动画，只有悬停时才播放动画
              duration: isRouteChange ? 0 : 0.25,
              delay: shouldShowText && !isActive && isHovered ? 0.1 : 0
            }}
          >
            {item.title}
          </motion.span>
        </motion.div>

        {/* 活跃状态指示器 */}
        {isActive && (
          <motion.div 
            className="absolute bottom-0 left-2 right-2 h-0.5 bg-white/50 rounded-full"
            layoutId="activeTabIndicator"
            transition={{ type: "spring", stiffness: 500, damping: 30 }}
          />
        )}

        {/* 悬停效果背景 */}
        {!isActive && (
          <motion.div
            className="absolute inset-0 rounded-xl bg-osu-pink/10"
            animate={{ opacity: isHovered ? 1 : 0 }}
            transition={{ duration: 0.2 }}
          />
        )}
      </Link>
    </motion.div>
  );
});

NavItem.displayName = 'NavItem';

// 语言配置接口
interface LanguageConfig {
  code: string;
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

// 语言选择菜单部分
const LanguageMenuSection = memo<{ i18n: any; t: any }>(({ i18n, t }) => {
  const [showLanguages, setShowLanguages] = useState(false);
  
  const currentLanguage = SUPPORTED_LANGUAGES.find(
    lang => lang.code === (i18n.resolvedLanguage ?? i18n.language)
  ) || SUPPORTED_LANGUAGES[0];

  const handleLanguageSelect = (languageCode: string) => {
    void i18n.changeLanguage(languageCode);
    setShowLanguages(false);
  };

  if (!showLanguages) {
    return (
      <button
        onClick={() => setShowLanguages(true)}
        className="w-full flex items-center px-4 py-3 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800/50 hover:text-osu-pink transition-all duration-200"
      >
        <FiGlobe size={16} className="mr-3" />
        <span>{t('common.language.label')}: {currentLanguage.nativeName}</span>
      </button>
    );
  }

  return (
    <div className="px-2 py-1">
      <button
        onClick={() => setShowLanguages(false)}
        className="w-full flex items-center px-2 py-2 text-xs font-medium text-gray-500 dark:text-gray-400 hover:text-osu-pink transition-all duration-200"
      >
        ← {t('common.back')}
      </button>
      <div className="mt-1">
        {SUPPORTED_LANGUAGES.map((lang) => {
          const isActive = lang.code === currentLanguage.code;
          return (
            <button
              key={lang.code}
              onClick={() => handleLanguageSelect(lang.code)}
              className={`w-full flex items-center justify-between px-3 py-2.5 text-sm rounded-lg transition-all duration-200 ${
                isActive
                  ? 'text-osu-pink bg-osu-pink/10'
                  : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800/50'
              }`}
            >
              <div className="flex items-center">
                <img
                  src={`/image/flag/${lang.flag}.svg`}
                  alt={`${lang.name} flag`}
                  className="w-5 h-4 rounded-sm object-cover mr-3"
                />
                <span>{lang.nativeName}</span>
              </div>
              {isActive && <FiCheck size={16} />}
            </button>
          );
        })}
      </div>
    </div>
  );
});

LanguageMenuSection.displayName = 'LanguageMenuSection';

// 手机端菜单下拉组件
const MobileMenuDropdown = memo<{
  items: NavItem[];
  isAuthenticated: boolean;
  unreadCount: any;
  isDark: boolean;
  onThemeToggle: () => void;
  onLogout: () => void;
}>(({ items, isAuthenticated, unreadCount, isDark, onThemeToggle, onLogout }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const location = useLocation();
  const { t, i18n } = useTranslation();

  // 关闭下拉菜单
  const handleClose = useCallback(() => {
    setIsOpen(false);
  }, []);

  // 切换下拉菜单
  const handleToggle = useCallback(() => {
    setIsOpen(prev => !prev);
  }, []);

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

  // 路由变化时关闭菜单
  useEffect(() => {
    setIsOpen(false);
  }, [location.pathname]);

  return (
    <div className="relative" ref={dropdownRef}>
      {/* 菜单按钮 */}
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={handleToggle}
        className={`p-2.5 rounded-xl transition-all duration-200 ${
          isOpen
            ? 'text-osu-pink bg-osu-pink/10'
            : 'text-gray-600 dark:text-gray-300 hover:text-osu-pink hover:bg-gray-50 dark:hover:bg-gray-800/50'
        }`}
        aria-label="Toggle menu"
      >
        <motion.div
          animate={{ rotate: isOpen ? 90 : 0 }}
          transition={{ duration: 0.2 }}
        >
          {isOpen ? <FiX size={18} /> : <FiMenu size={18} />}
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
            className="absolute right-0 mt-6 w-48 backdrop-blur-xl rounded-2xl shadow-xl py-2 z-50 overflow-hidden"
            style={{
              background: 'var(--float-panel-bg)',
              border: '1px solid var(--border-color)',
              boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04), 0 0 0 1px rgba(0, 0, 0, 0.05)'
            }}
          >
            {/* 菜单项 */}
            <div className="py-1">
              {/* 主要导航项 */}
              {items.map((item) => {
                const IconComponent = item.icon;
                const isActive = location.pathname === item.path;
                
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={handleClose}
                    className={`flex items-center px-4 py-3 text-sm font-medium transition-all duration-200 ${
                      isActive
                        ? 'text-osu-pink bg-osu-pink/10'
                        : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800/50 hover:text-osu-pink'
                    }`}
                  >
                    {IconComponent && <IconComponent size={16} className="mr-3" />}
                    <span>{item.title}</span>
                  </Link>
                );
              })}
              
              {/* 设置按钮 - 仅在已登录时显示 */}
              {isAuthenticated && (
                <>
                  <div className="border-t border-gray-200/50 dark:border-gray-700/50 my-1" />
                  <Link
                    to="/settings"
                    onClick={handleClose}
                    className={`flex items-center px-4 py-3 text-sm font-medium transition-all duration-200 ${
                      location.pathname === '/settings'
                        ? 'text-osu-pink bg-osu-pink/10'
                        : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800/50 hover:text-osu-pink'
                    }`}
                  >
                    <FiSettings size={16} className="mr-3" />
                    <span>{t('nav.settings')}</span>
                  </Link>
                </>
              )}

              {/* 功能选项 */}
              <div className="border-t border-gray-200/50 dark:border-gray-700/50 my-1" />
              
              {/* 通知 - 仅已登录时显示 */}
              {isAuthenticated && (
                <Link
                  to="/messages"
                  onClick={handleClose}
                  className="flex items-center justify-between px-4 py-3 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800/50 hover:text-osu-pink transition-all duration-200"
                >
                  <div className="flex items-center">
                    <FiBell size={16} className="mr-3" />
                    <span>{t('nav.messages')}</span>
                  </div>
                  {unreadCount.total > 0 && (
                    <span className="bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-medium">
                      {unreadCount.total > 9 ? '9+' : unreadCount.total}
                    </span>
                  )}
                </Link>
              )}

              {/* 主题切换 */}
              <button
                onClick={() => {
                  onThemeToggle();
                  handleClose();
                }}
                className="w-full flex items-center px-4 py-3 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800/50 hover:text-osu-pink transition-all duration-200"
              >
                {isDark ? <FiSun size={16} className="mr-3" /> : <FiMoon size={16} className="mr-3" />}
                <span>{isDark ? t('common.theme.light') : t('common.theme.dark')}</span>
              </button>

              {/* 语言选择 */}
              <LanguageMenuSection i18n={i18n} t={t} />

              {/* 登出按钮 - 仅已登录时显示 */}
              {isAuthenticated && (
                <>
                  <div className="border-t border-gray-200/50 dark:border-gray-700/50 my-1" />
                  <button
                    onClick={() => {
                      onLogout();
                      handleClose();
                    }}
                    className="w-full flex items-center px-4 py-3 text-sm font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 transition-all duration-200"
                  >
                    <FiLogOut size={16} className="mr-3" />
                    <span>{t('nav.logout')}</span>
                  </button>
                </>
              )}
            </div>

            {/* 装饰性渐变 */}
            <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-osu-pink/5 via-transparent to-osu-blue/5 pointer-events-none" />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
});

MobileMenuDropdown.displayName = 'MobileMenuDropdown';

const Navbar: React.FC = () => {
  const { isDark, toggleTheme } = useTheme();
  const { user, isAuthenticated, logout } = useAuth();
  const { t } = useTranslation();
  // 通过全局通知上下文获取统一的 unreadCount
  let unreadCount = { total: 0, team_requests: 0, private_messages: 0, friend_requests: 0 } as any;
  let isConnected = false;
  let chatConnected = false;
  try {
    const ctx = useNotificationContext();
    unreadCount = ctx.unreadCount;
    isConnected = ctx.isConnected;
    chatConnected = ctx.chatConnected;
  } catch (e) {
    // 如果 Provider 尚未包裹，不影响其它功能
  }
  
  // 综合连接状态：通知和聊天都需要连接
  const isFullyConnected = isConnected && chatConnected;
  //const location = useLocation();


  const navItems: NavItem[] = React.useMemo(() => [
    // 核心功能
    { path: '/', title: t('nav.home'), icon: FiHome },
    { path: '/rankings', title: t('nav.rankings'), icon: FiTrendingUp, requireAuth: true },
    { path: '/beatmaps', title: t('nav.beatmaps'), icon: FiMusic, requireAuth: true },
    { path: '/teams', title: t('nav.teams'), icon: FiUsers, requireAuth: true },
    { path: '/how-to-join', title: t('nav.join'), icon: FiServer },
  ], [t]);

  const filteredNavItems = React.useMemo(() => 
    navItems.filter(item => 
      !item.requireAuth || (item.requireAuth && isAuthenticated)
    ), [navItems, isAuthenticated]
  );

  // 使用 useCallback 优化回调函数
  const handleThemeToggle = useCallback(() => {
    toggleTheme();
  }, [toggleTheme]);

  const handleLogout = useCallback(() => {
    logout();
  }, [logout]);

  return (
    <>
      {/* Desktop Navigation - Top */}
      <nav className="hidden md:block fixed top-0 left-0 right-0 z-50 px-4 lg:px-6 pt-0">
        <div className="max-w-7xl mx-auto backdrop-blur-xl shadow-lg rounded-b-2xl" style={{
          background: 'var(--navbar-bg)',
          border: '1px solid var(--border-color)',
        }}>
          <div className="px-4 md:px-6 lg:px-8">
            {/* 使用 grid 布局来确保导航项真正居中 */}
            <div className="grid grid-cols-[1fr_auto_1fr] items-center h-16 gap-2 md:gap-3 lg:gap-4">
            {/* Logo - Left */}
            <div className="flex items-center justify-start">
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="flex items-center space-x-2 lg:space-x-3 group"
              >
                <Link to="/" className="flex items-center space-x-2 lg:space-x-3 transition-transform duration-200">
                  <div className="relative">
                    <img
                      src="/image/logos/logo.svg"
                      alt={t('common.brandAlt')}
                      className="w-8 h-8 lg:w-9 lg:h-9 object-contain"
                    />
                    <motion.div 
                      className="absolute inset-0 bg-osu-pink rounded-lg"
                      initial={{ opacity: 0 }}
                      whileHover={{ opacity: 0.2 }}
                      transition={{ duration: 0.2 }}
                    />
                  </div>
                  <span className="text-lg lg:text-xl font-bold text-osu-pink">
                    {t('common.brandName')}
                  </span>
                </Link>
              </motion.div>
            </div>

            {/* Navigation Links - Center (使用 auto 宽度真正居中) */}
            <div className="flex items-center justify-center">
              <div className="flex items-center gap-x-0.5 lg:gap-x-1">
                {filteredNavItems.map((item) => (
                  <NavItem key={item.path} item={item} />
                ))}
              </div>
            </div>

            {/* Right side actions */}
            <div className="flex items-center justify-end space-x-1.5 md:space-x-2 lg:space-x-3">
              {/* Language Selector - only show when not authenticated */}
              {!isAuthenticated && (
                <LanguageSelector variant="desktop" />
              )}

              {/* Notification (if authenticated) */}
              {isAuthenticated && (
                <Link to="/messages">
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    className={`
                      relative p-2 md:p-2.5 rounded-xl transition-all duration-200 group
                      ${isFullyConnected 
                        ? 'text-gray-600 dark:text-gray-300 hover:text-osu-pink hover:bg-gray-50 dark:hover:bg-gray-800/50' 
                        : 'text-gray-400 dark:text-gray-500'
                      }
                    `}
                    /* title={isFullyConnected ? '实时通知已连接' : '实时通知未连接'} */
                  >
                    <FiBell size={18} />
                    {unreadCount.total > 0 && (
                      <motion.div 
                        className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-medium"
                        animate={{ scale: [1, 1.1, 1] }}
                        transition={{ duration: 2, repeat: Infinity }}
                      >
                        {unreadCount.total > 99 ? '99+' : unreadCount.total}
                      </motion.div>
                    )}
                    {/* WebSocket连接状态指示器 */}
                    {/* <div className={`
                      absolute bottom-0 right-0 w-2 h-2 rounded-full
                      ${isFullyConnected ? 'bg-green-500' : 'bg-red-500'}
                    `} /> */}
                  </motion.button>
                </Link>
              )}

              {/* Theme toggle */}
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={handleThemeToggle}
                className="p-2 md:p-2.5 rounded-xl text-gray-600 dark:text-gray-300 hover:text-osu-pink hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-all duration-200"
                aria-label="Toggle theme"
              >
                <motion.div
                  animate={{ rotate: isDark ? 180 : 0 }}
                  transition={{ duration: 0.5 }}
                >
                  {isDark ? <FiSun size={18} /> : <FiMoon size={18} />}
                </motion.div>
              </motion.button>

              {/* User actions */}
              {isAuthenticated && user ? (
                <UserDropdown user={user} onLogout={handleLogout} />
              ) : (
                <div className="flex items-center space-x-1.5 md:space-x-2 lg:space-x-3">
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                  <Link
                    to="/login"
                    className="px-3 md:px-4 lg:px-5 py-2 md:py-2.5 text-xs md:text-sm font-medium text-osu-blue hover:text-osu-blue/80 border border-osu-blue/30 hover:border-osu-blue/50 rounded-xl hover:bg-osu-blue/5 transition-all duration-200"
                  >
                    {t('nav.login')}
                  </Link>
                </motion.div>
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Link
                    to="/register"
                    className="px-3 md:px-4 lg:px-5 py-2 md:py-2.5 text-xs md:text-sm font-medium text-white bg-osu-pink hover:bg-osu-pink/90 rounded-xl shadow-lg shadow-osu-pink/25 hover:shadow-osu-pink/35 transition-all duration-200"
                  >
                    {t('nav.register')}
                  </Link>
                </motion.div>
                </div>
              )}
            </div>
          </div>
          </div>
        </div>
      </nav>

      {/* Mobile Header - Top */}
      <nav className="md:hidden fixed top-0 left-0 right-0 z-50 backdrop-blur-xl border-b shadow-sm" style={{
        background: 'var(--navbar-bg)',
        borderColor: 'var(--border-color)',
      }}>
        <div className="flex items-center justify-between px-4 py-3">
          {/* Logo */}
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Link to="/" className="flex items-center space-x-3 group">
              <div className="relative">
                <img
                  src="/image/logos/logo.svg"
                  alt={t('common.brandAlt')}
                  className="w-8 h-8 object-contain"
                />
                <motion.div 
                  className="absolute inset-0 bg-osu-pink rounded-lg"
                  initial={{ opacity: 0 }}
                  whileHover={{ opacity: 0.2 }}
                  transition={{ duration: 0.2 }}
                />
              </div>
              <span className="text-lg font-bold text-osu-pink">
                {t('common.brandName')}
              </span>
            </Link>
          </motion.div>

          {/* Mobile actions */}
          <div className="flex items-center space-x-2">
            {/* User actions */}
            {isAuthenticated && user ? (
              <div className="flex items-center space-x-2">
                {/* User Avatar */}
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Link to="/profile" className="flex items-center p-1.5 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-all duration-200">
                    <Avatar
                      userId={user.id}
                      username={user.username}
                      avatarUrl={user.avatar_url}
                      size="sm"
                    />
                  </Link>
                </motion.div>
              </div>
            ) : (
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Link
                  to="/login"
                  className="px-4 py-2 text-sm font-medium text-osu-pink hover:text-osu-pink/80 bg-osu-pink/10 hover:bg-osu-pink/15 rounded-xl transition-all duration-200"
                >
                  {t('nav.login')}
                </Link>
              </motion.div>
            )}

            {/* Mobile menu dropdown */}
            <MobileMenuDropdown 
              items={filteredNavItems}
              isAuthenticated={isAuthenticated}
              unreadCount={unreadCount}
              isDark={isDark}
              onThemeToggle={handleThemeToggle}
              onLogout={handleLogout}
            />
          </div>
        </div>
      </nav>

    </>
  );
};

export default Navbar;