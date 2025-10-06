import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { useTranslation, Trans } from 'react-i18next';
import { useAuth } from '../../hooks/useAuth';

import InfoCard from '../InfoCard';
import { features } from '../../data/features';
import { 
  FaDesktop,
  FaRocket, 
  FaHeart, 
  FaCog, 
  FaBug, 
  FaCodeBranch, 
  FaPaperPlane, 
  FaChartBar,
  FaQq, 
  FaDiscord, 
  FaGithub
} from 'react-icons/fa';

const HeroSection: React.FC = () => {
  const { isAuthenticated } = useAuth();
  const { t } = useTranslation();

  return (
    <div className="relative">
      {/* Fixed background with parallax effect */}
      <div className="fixed inset-0 bg-grid-pattern opacity-3 z-0"></div>
      <div className="fixed top-1/4 left-1/4 w-32 h-32 bg-pink-200/20 dark:bg-pink-800/20 rounded-full blur-2xl z-0"></div>
      <div className="fixed bottom-1/3 right-1/3 w-40 h-40 bg-teal-200/20 dark:bg-teal-800/20 rounded-full blur-2xl z-0"></div>
      <div className="fixed top-1/2 right-1/4 w-24 h-24 bg-blue-200/15 dark:bg-blue-800/15 rounded-full blur-xl z-0"></div>
      <div className="fixed bottom-1/4 left-1/3 w-36 h-36 bg-purple-200/15 dark:bg-purple-800/15 rounded-full blur-xl z-0"></div>
      <div className="hidden lg:block fixed top-10 right-10 w-2 h-2 bg-pink-400/30 rounded-full z-0"></div>
      <div className="hidden lg:block fixed bottom-20 left-20 w-1 h-1 bg-teal-400/40 rounded-full z-0"></div>
      <div className="hidden lg:block fixed top-1/3 left-10 w-1.5 h-1.5 bg-blue-400/35 rounded-full z-0"></div>

      {/* 第一页：主要内容占满整个屏幕 */}
      <section className="relative overflow-hidden h-screen flex items-center z-10">
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full z-10">
          {/* Main Content */}
          <div className="w-full text-center space-y-4 mt-[-100px] sm:space-y-6 md:space-y-8 lg:space-y-12 lg:mt-[-100px]">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }} className="px-2 sm:px-4">
            {/* Logo and brand */}
            <div className="flex items-center justify-center mb-6 sm:mb-8 md:mb-10">
              <div className="w-16 h-16 sm:w-18 sm:h-18 md:w-20 md:h-20 lg:w-24 lg:h-24 flex items-center justify-center mr-3 sm:mr-4 md:mr-5 p-1 sm:p-2">
                <img src="/image/logos/logo.svg" alt={t('common.brandAlt')} className="w-full h-full object-contain drop-shadow-lg" />
              </div>
              <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl 2xl:text-9xl font-bold tracking-tight">
                <span className="gradient-text">{t('common.brandName')}</span>
              </h1>
            </div>

            <h2 className="text-lg sm:text-xl md:text-2xl lg:text-3xl xl:text-4xl 2xl:text-5xl font-semibold text-gray-700 dark:text-gray-200 mb-4 sm:mb-5 md:mb-6 leading-tight max-w-4xl mx-auto">
              {t('hero.tagline')}
            </h2>

            <p className="text-base sm:text-lg md:text-xl lg:text-2xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto leading-relaxed px-2">
              <Trans
                i18nKey="hero.description"
                components={{
                  bold: <span className="font-bold text-pink-600 dark:text-pink-400" />,
                }}
              />
            </p>

            {/* Server Status */}
            <div className="mt-4 sm:mt-6 md:mt-8">
              <div className="text-pink-700 dark:text-pink-300 text-sm sm:text-base md:text-lg font-bold">
                <div className="mb-4 sm:mb-6 flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-3 md:gap-4">
                  <span className="inline-flex items-center gap-2 whitespace-nowrap">
                    <span className="w-3 h-3 sm:w-3.5 sm:h-3.5 rounded-full bg-green-500 dark:bg-green-400 animate-pulse" />
                    {t('hero.statusOperational')}
                  </span>

                  {/* 可选分隔线：不要就删掉这一行 */}
                  <span className="hidden sm:block h-4 w-px bg-pink-300/60 dark:bg-pink-200/40" />

                  <span className="text-sm sm:text-base whitespace-nowrap">
                    {t('hero.statusCommunity')}
                  </span>
                </div>
              </div>


              
             {/* Community Badges */}
              <div className="w-full">
                <div className="grid grid-cols-3 gap-1.5 sm:gap-2 md:gap-3 w-full max-w-sm sm:max-w-2xl mx-auto">
                  <a
                    href="https://qm.qq.com/q/Uw8tOkgJSS"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group w-full flex flex-col sm:flex-row items-center bg-zinc-700 hover:bg-zinc-600 text-white rounded-lg text-xs transition-all duration-200 hover:scale-105 hover:shadow-lg"
                  >
                    <div className="px-2 py-1.5 sm:px-3 sm:py-2 flex flex-col sm:flex-row items-center justify-center whitespace-nowrap w-full sm:w-auto">
                      <FaQq className="mb-1 sm:mb-0 sm:mr-2 text-base sm:text-lg w-4 h-4 sm:w-5 sm:h-5" />
                      <span className="font-medium text-xs sm:text-sm">{t('hero.community.qq')}</span>
                    </div>
                    <div className="hidden sm:block px-2 sm:px-3 py-1.5 sm:py-2 bg-sky-600 group-hover:bg-sky-500 dark:bg-sky-700 dark:group-hover:bg-sky-600 text-white rounded-r-lg transition-colors duration-200 whitespace-nowrap w-full">
                      <span className="font-semibold text-xs sm:text-sm">1059561526</span>
                    </div>
                  </a>

                  <a
                    href="https://discord.gg/AhzJXXWYfF"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group w-full flex flex-col sm:flex-row items-center bg-zinc-700 hover:bg-zinc-600 text-white rounded-lg text-xs transition-all duration-200 hover:scale-105 hover:shadow-lg"
                  >
                    <div className="px-2 py-1.5 sm:px-3 sm:py-2 flex flex-col sm:flex-row items-center justify-center whitespace-nowrap w-full sm:w-auto">
                      <FaDiscord className="mb-1 sm:mb-0 sm:mr-2 text-base sm:text-lg w-4 h-4 sm:w-5 sm:h-5" />
                      <span className="font-medium text-xs sm:text-sm">{t('hero.community.discord')}</span>
                    </div>
                    <div className="hidden sm:block px-2 sm:px-3 py-1.5 sm:py-2 bg-indigo-600 group-hover:bg-indigo-500 dark:bg-indigo-700 dark:group-hover:bg-indigo-600 text-white rounded-r-lg transition-colors duration-200 whitespace-nowrap w-full">
                      <span className="font-semibold text-xs sm:text-sm">{t('hero.community.discordTag')}</span>
                    </div>
                  </a>

                  <a
                    href="https://github.com/GooGuTeam"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group w-full flex flex-col sm:flex-row items-center bg-zinc-700 hover:bg-zinc-600 text-white rounded-lg text-xs transition-all duration-200 hover:scale-105 hover:shadow-lg"
                  >
                    <div className="px-2 py-1.5 sm:px-3 sm:py-2 flex flex-col sm:flex-row items-center justify-center whitespace-nowrap w-full sm:w-auto">
                      <FaGithub className="mb-1 sm:mb-0 sm:mr-2 text-base sm:text-lg w-4 h-4 sm:w-5 sm:h-5" />
                      <span className="font-medium text-xs sm:text-sm">{t('hero.community.github')}</span>
                    </div>
                    <div className="hidden sm:block px-2 sm:px-3 py-1.5 sm:py-2 bg-gray-800 group-hover:bg-gray-700 dark:bg-gray-600 dark:group-hover:bg-gray-500 text-white rounded-r-lg transition-colors duration-200 whitespace-nowrap w-full">
                      <span className="font-semibold text-xs sm:text-sm">GooGuTeam</span>
                    </div>
                  </a>
                </div>
              </div>
              </div>

          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="space-y-3 sm:space-y-4 px-2 sm:px-4 max-w-md sm:max-w-lg md:max-w-2xl mx-auto"
          >
            {/* 如何加入按钮 - 始终显示 */}
            <div className="w-full">
              <Link
                to="/how-to-join"
                className="btn-primary text-sm sm:text-base md:text-lg lg:text-xl px-4 sm:px-6 md:px-8 lg:px-10 py-3 sm:py-3.5 lg:py-4 w-full rounded-xl text-center font-medium shadow-lg flex items-center justify-center gap-2"
              >
                <FaRocket className="w-4 h-4 sm:w-5 sm:h-5" />
                {t('hero.joinCta')}
              </Link>
            </div>
            
            {/* 登录状态相关按钮 */}
            <div className="grid grid-cols-2 gap-3 sm:gap-4 md:gap-5">
              {isAuthenticated ? (
                <>
                  <Link
                    to="/profile"
                    className="btn-primary text-sm sm:text-base md:text-lg lg:text-xl px-4 sm:px-6 md:px-8 lg:px-10 py-3 sm:py-3.5 lg:py-4 w-full rounded-xl shadow-lg text-center font-medium"
                  >
                    {t('hero.viewProfile')}
                  </Link>
                  <Link
                    to="/rankings"
                    className="btn-secondary text-sm sm:text-base md:text-lg lg:text-xl px-4 sm:px-6 md:px-8 lg:px-10 py-3 sm:py-3.5 lg:py-4 w-full rounded-xl text-center font-medium"
                  >
                    {t('hero.viewRankings')}
                  </Link>
                </>
              ) : (
                <>
                  <Link
                    to="/register"
                    className="btn-primary text-sm sm:text-base md:text-lg lg:text-xl px-4 sm:px-6 md:px-8 lg:px-10 py-3 sm:py-3.5 lg:py-4 w-full rounded-xl shadow-lg text-center font-medium"
                  >
                    {t('hero.register')}
                  </Link>
                  <Link
                    to="/login"
                    className="btn-secondary text-sm sm:text-base md:text-lg lg:text-xl px-4 sm:px-6 md:px-8 lg:px-10 py-3 sm:py-3.5 lg:py-4 w-full rounded-xl text-center font-medium"
                  >
                    {t('hero.login')}
                  </Link>
                </>
              )}
            </div>
          </motion.div>
          </div>
        </div>
      </section>

      {/* 第二页：Swiper轮播图 */}
      <section className="relative min-h-screen flex items-center py-8 sm:py-12 md:py-20 lg:py-32 z-10">
        {/* 不透明背景遮挡第一页的固定背景 */}
        <div className="absolute inset-0 bg-white dark:bg-gray-900 z-0"></div>
        {/* 渐变装饰层 */}
        <div className="absolute inset-0 bg-gradient-to-b from-gray-50/30 to-gray-100/30 dark:from-gray-800/30 dark:to-gray-700/30 z-0"></div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full z-10">
          {/* Feature Cards Grid Container */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="mt-8 sm:mt-12 md:mt-16 relative w-full"
          >
            <div className="text-center mb-8 sm:mb-12 md:mb-16">
              <h3 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-gray-800 dark:text-gray-200 mb-4">
                <span className="gradient-text">{t('hero.featuresTitle')}</span>
              </h3>
              <p className="text-base sm:text-lg md:text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
                {t('hero.featuresSubtitle')}
              </p>
            </div>

            {/* Features Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 sm:gap-8 max-w-7xl mx-auto">
              {features.map((feature, index) => {
                const icons = [
                  <FaDesktop key="desktop" className="h-6 w-6" />,
                  <FaRocket key="rocket" className="h-6 w-6" />,
                  <FaHeart key="heart" className="h-6 w-6" />,
                  <FaCog key="cog" className="h-6 w-6" />,
                  <FaBug key="bug" className="h-6 w-6" />,
                  <FaCodeBranch key="code" className="h-6 w-6" />,
                  <FaPaperPlane key="plane" className="h-6 w-6" />,
                  <FaChartBar key="chart" className="h-6 w-6" />
                ];
                
                return (
                  <motion.div
                    key={feature.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.1 * index }}
                    className="w-full"
                  >
                    <InfoCard
                      image={feature.image}
                      imageAlt={t(feature.imageAltKey)}
                      title={t(feature.titleKey)}
                      content={t(feature.contentKey)}
                      icon={icons[index]}
                    />
                  </motion.div>
                );
              })}
            </div>
          </motion.div>

          {/* {isAuthenticated && user && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.6 }}
              className="px-4 max-w-lg mx-auto"
            >
              <div className="p-3 sm:p-4 lg:p-6 bg-white/70 dark:bg-gray-800/70 border border-pink-200/50 dark:border-pink-700/50 rounded-2xl inline-block backdrop-blur-sm shadow-lg">
                <p className="text-sm sm:text-base lg:text-lg text-gray-700 dark:text-gray-300 flex flex-col sm:flex-row items-center justify-center">
                  欢迎回来，<span className="font-semibold text-pink-600 dark:text-pink-400 sm:ml-1">{user.username}</span>！
                </p>
              </div>
            </motion.div>
          )} */}
        </div>
      </section>
    </div>
  );
};

export default HeroSection;
