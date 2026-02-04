import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';

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
  FaChevronDown,
  FaQq,
  FaDiscord,
  FaGithub,
} from 'react-icons/fa';

// 果冻动画样式
const jellyKeyframes = `
  @keyframes jelly {
    0%, 100% {
      transform: scale(1.1) translateY(0);
    }
    25% {
      transform: scale(1.15, 1.05) translateY(-5px);
    }
    50% {
      transform: scale(1.05, 1.15) translateY(5px);
    }
    75% {
      transform: scale(1.12, 1.08) translateY(-3px);
    }
  }
`;

const HeroSection: React.FC = () => {
  const { t, i18n } = useTranslation();

  // 用于存储分割后的文本字符
  const [descriptionChars, setDescriptionChars] = useState<Array<{ char: string; isBold: boolean }>>([]);

  // 分割文本为字符的函数
  const splitTextIntoChars = (text: string) => {
    const chars: Array<{ char: string; isBold: boolean }> = [];
    let i = 0;
    let isBold = false;

    while (i < text.length) {
      if (text.substring(i, i + 6) === '<bold>') {
        isBold = true;
        i += 6;
        continue;
      }

      if (text.substring(i, i + 7) === '</bold>') {
        isBold = false;
        i += 7;
        continue;
      }

      chars.push({ char: text[i], isBold });
      i++;
    }

    return chars;
  };

  useEffect(() => {
    const description = t('hero.description');
    const chars = splitTextIntoChars(description);
    setDescriptionChars(chars);
  }, [t, i18n.language]);

  const isEN = i18n?.language?.toLowerCase().startsWith('en') ?? false;

  return (
    <div className="relative">
      {/* 注入果冻动画 keyframes */}
      <style>{jellyKeyframes}</style>

      {/* 背景装饰 */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute inset-0 bg-grid-pattern opacity-5" />
        <div className="absolute top-1/4 left-1/4 w-32 h-32 bg-profile-color/10 rounded-full blur-2xl" />
        <div className="absolute bottom-1/3 right-1/3 w-40 h-40 bg-teal-200/20 dark:bg-teal-800/20 rounded-full blur-2xl" />
        <div className="absolute top-1/2 right-1/4 w-24 h-24 bg-blue-200/15 dark:bg-blue-800/15 rounded-full blur-xl" />
        <div className="absolute bottom-1/4 left-1/3 w-36 h-36 bg-purple-200/15 dark:bg-purple-800/15 rounded-full blur-xl" />
      </div>

      {/* 第一屏：Hero 内容 */}
      <section className="relative min-h-screen flex items-center justify-center z-10">
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
          {/* 左右布局容器 */}
          <div className="flex flex-col lg:flex-row items-center justify-between gap-8 lg:gap-12">
            {/* 左侧：标题、副标题、描述 */}
            <div className="flex-1 flex flex-col items-center lg:items-start text-center lg:text-left space-y-6 sm:space-y-8">
              {/* Logo + 标题 */}
              <div className="flex items-center justify-center lg:justify-start">
                <div className="w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 lg:w-28 lg:h-28 xl:w-32 xl:h-32 flex items-center justify-center mr-3 sm:mr-4 md:mr-5 lg:mr-6 p-1 sm:p-2">
                  <img src="/image/logos/logo.svg" alt={t('common.brandAlt')} className="w-full h-full object-contain drop-shadow-lg" />
                </div>
                <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-bold tracking-tight">
                  <span className="gradient-text">{t('common.brandName')}</span>
                </h1>
              </div>

              {/* 副标题 */}
              <h2
                lang={isEN ? 'en' : undefined}
                className={`text-lg sm:text-xl md:text-2xl lg:text-3xl xl:text-4xl font-semibold text-gray-700 dark:text-gray-200 leading-snug tracking-tight max-w-2xl ${isEN ? 'lg:max-w-[36ch] xl:max-w-[42ch]' : 'lg:max-w-[32ch]'}`}
              >
                {t('hero.tagline')}
              </h2>

              {/* 描述文本 */}
              <p className="text-base sm:text-lg md:text-xl text-gray-600 dark:text-gray-400 max-w-xl lg:max-w-2xl leading-relaxed">
                {descriptionChars.map((charObj, index) => (
                  <span
                    key={index}
                    className={`inline-block ${charObj.isBold ? 'font-bold text-profile-color' : ''}`}
                  >
                    {charObj.char === ' ' ? '\u00A0' : charObj.char}
                  </span>
                ))}
              </p>
            </div>

            {/* 右侧：带泛光效果的图片 */}
            <div className="flex-shrink-0 w-full max-w-[200px] sm:max-w-[240px] md:max-w-[280px] lg:max-w-[320px] xl:max-w-[360px]">
              <div className="relative">
                {/* 泛光层 - 模糊 + 高饱和度 + 果冻动画 */}
                <img
                  src="/g0v0.webp"
                  alt=""
                  aria-hidden="true"
                  className="absolute inset-0 w-full h-full object-contain rounded-2xl blur-[50px] saturate-[2] opacity-80"
                  style={{
                    animation: 'jelly 6s ease-in-out infinite',
                  }}
                />
                {/* 原图层 */}
                <img
                  src="/g0v0.webp"
                  alt="g0v0"
                  className="relative w-full h-auto object-contain rounded-2xl"
                />
              </div>
            </div>
          </div>

          {/* 下方内容区域 */}
          <div className="mt-10 sm:mt-12 md:mt-16 flex flex-col items-center space-y-6 sm:space-y-8">
            {/* 加入按钮 */}
            <div className="w-full max-w-sm sm:max-w-md mx-auto pt-4">
              <Link
                to="/how-to-join"
                className="btn-primary text-sm sm:text-base md:text-lg lg:text-xl px-4 sm:px-6 md:px-8 lg:px-10 py-3 sm:py-3.5 lg:py-4 w-full rounded-xl text-center font-medium shadow-lg flex items-center justify-center gap-2 transition-all duration-200 hover:scale-105"
              >
                <FaRocket className="w-4 h-4 sm:w-5 sm:h-5" />
                {t('hero.joinCta')}
              </Link>
            </div>

            {/* 社区按钮 */}
            <div className="w-full px-4 pt-4">
              <div className="grid grid-cols-3 gap-1.5 sm:gap-2 md:gap-3 w-full max-w-sm sm:max-w-2xl mx-auto">
                <a
                  href="https://qm.qq.com/q/Uw8tOkgJSS"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group w-full flex flex-col sm:flex-row items-center justify-center bg-zinc-700 hover:bg-zinc-600 text-white rounded-lg text-xs transition-all duration-200 hover:scale-105 hover:shadow-lg"
                >
                  <div className="px-2 py-1.5 sm:px-3 sm:py-2 flex flex-col sm:flex-row items-center justify-center whitespace-nowrap w-full sm:w-auto">
                    <FaQq className="mb-1 sm:mb-0 sm:mr-2 text-base sm:text-lg w-4 h-4 sm:w-5 sm:h-5" />
                    <span className="font-medium text-xs sm:text-sm">{t('hero.community.qq')}</span>
                  </div>
                  <div className="hidden sm:flex sm:items-center sm:justify-center px-2 sm:px-3 py-1.5 sm:py-2 bg-sky-600 group-hover:bg-sky-500 dark:bg-sky-700 dark:group-hover:bg-sky-600 text-white rounded-r-lg transition-colors duration-200 whitespace-nowrap w-full">
                    <span className="font-semibold text-xs sm:text-sm text-center">1059561526</span>
                  </div>
                </a>

                <a
                  href="https://discord.gg/AhzJXXWYfF"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group w-full flex flex-col sm:flex-row items-center justify-center bg-zinc-700 hover:bg-zinc-600 text-white rounded-lg text-xs transition-all duration-200 hover:scale-105 hover:shadow-lg"
                >
                  <div className="px-2 py-1.5 sm:px-3 sm:py-2 flex flex-col sm:flex-row items-center justify-center whitespace-nowrap w-full sm:w-auto">
                    <FaDiscord className="mb-1 sm:mb-0 sm:mr-2 text-base sm:text-lg w-4 h-4 sm:w-5 sm:h-5" />
                    <span className="font-medium text-xs sm:text-sm">{t('hero.community.discord')}</span>
                  </div>
                  <div className="hidden sm:flex sm:items-center sm:justify-center px-2 sm:px-3 py-1.5 sm:py-2 bg-indigo-600 group-hover:bg-indigo-500 dark:bg-indigo-700 dark:group-hover:bg-indigo-600 text-white rounded-r-lg transition-colors duration-200 whitespace-nowrap w-full">
                    <span className="font-semibold text-xs sm:text-sm text-center">{t('hero.community.discordTag')}</span>
                  </div>
                </a>

                <a
                  href="https://github.com/GooGuTeam"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group w-full flex flex-col sm:flex-row items-center justify-center bg-zinc-700 hover:bg-zinc-600 text-white rounded-lg text-xs transition-all duration-200 hover:scale-105 hover:shadow-lg"
                >
                  <div className="px-2 py-1.5 sm:px-3 sm:py-2 flex flex-col sm:flex-row items-center justify-center whitespace-nowrap w-full sm:w-auto">
                    <FaGithub className="mb-1 sm:mb-0 sm:mr-2 text-base sm:text-lg w-4 h-4 sm:w-5 sm:h-5" />
                    <span className="font-medium text-xs sm:text-sm">{t('hero.community.github')}</span>
                  </div>
                  <div className="hidden sm:flex sm:items-center sm:justify-center px-2 sm:px-3 py-1.5 sm:py-2 bg-gray-800 group-hover:bg-gray-700 dark:bg-gray-600 dark:group-hover:bg-gray-500 text-white rounded-r-lg transition-colors duration-200 whitespace-nowrap w-full">
                    <span className="font-semibold text-xs sm:text-sm text-center">GooGuTeam</span>
                  </div>
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* 向下滚动提示箭头 */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 animate-bounce">
          <FaChevronDown className="w-6 h-6 text-gray-400 dark:text-gray-500 opacity-70" />
          <FaChevronDown className="w-6 h-6 text-gray-400 dark:text-gray-500 opacity-50 -mt-4" />
        </div>
      </section>

      {/* 第二屏：功能展示 */}
      <section className="relative min-h-screen flex items-center py-12 md:py-20 lg:py-28 z-0">
        <div className="absolute inset-0 bg-white dark:bg-gray-900" />
        <div className="absolute inset-0 bg-gradient-to-b from-gray-50/30 to-gray-100/30 dark:from-gray-800/30 dark:to-gray-700/30" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
          <div className="text-center mb-10 md:mb-14">
            <h3 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-gray-800 dark:text-gray-200 mb-4">
              <span className="gradient-text">{t('hero.featuresTitle')}</span>
            </h3>
            <p className="text-base sm:text-lg md:text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              {t('hero.featuresSubtitle')}
            </p>
          </div>

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
                <div key={feature.id} className="w-full">
                  <InfoCard
                    image={feature.image}
                    imageAlt={t(feature.imageAltKey)}
                    title={t(feature.titleKey)}
                    content={t(feature.contentKey)}
                    icon={icons[index]}
                  />
                </div>
              );
            })}
          </div>
        </div>
      </section>
    </div>
  );
};

export default HeroSection;
