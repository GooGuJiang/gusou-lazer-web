import React, { useLayoutEffect, useRef, useState, useEffect } from 'react';
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
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

const HeroSection: React.FC = () => {
  const { t, i18n } = useTranslation();

  const sectionRef = useRef<HTMLDivElement | null>(null);
  const scrollerRef = useRef<HTMLDivElement | null>(null);
  const titleRef = useRef<HTMLHeadingElement | null>(null);
  const logoRef = useRef<HTMLDivElement | null>(null);
  const subtitleRef = useRef<HTMLHeadingElement | null>(null);
  const descRef = useRef<HTMLParagraphElement | null>(null);
  const communityRef = useRef<HTMLDivElement | null>(null);
  const joinButtonRef = useRef<HTMLDivElement | null>(null);
  // 将 logo 与 标题 作为一个整体分组，保证移动/缩放始终保持一致
  const brandRef = useRef<HTMLDivElement | null>(null);

  // 用于存储分割后的文本字符
  const [descriptionChars, setDescriptionChars] = useState<Array<{ char: string; isBold: boolean }>>([]);

  // 分割文本为字符的函数
  const splitTextIntoChars = (text: string) => {
    const chars: Array<{ char: string; isBold: boolean }> = [];
    let i = 0;
    let isBold = false;
    
    while (i < text.length) {
      // 检查是否是粗体开始标记
      if (text.substring(i, i + 6) === '<bold>') {
        isBold = true;
        i += 6; // 跳过 <bold> 标记
        continue;
      }
      
      // 检查是否是粗体结束标记
      if (text.substring(i, i + 7) === '</bold>') {
        isBold = false;
        i += 7; // 跳过 </bold> 标记
        continue;
      }
      
      // 添加当前字符
      chars.push({ char: text[i], isBold });
      i++;
    }
    
    return chars;
  };

  // 获取翻译文本并分割
  useEffect(() => {
    const description = t('hero.description');
    const chars = splitTextIntoChars(description);
    console.log('Description:', description);
    console.log('Split chars:', chars.slice(0, 50)); // 显示前50个字符用于调试
    setDescriptionChars(chars);
  }, [t, i18n.language]);

  // 英文副标题的排版优化（更合理的字间距/行高/行宽/断行）
  const isEN = i18n?.language?.toLowerCase().startsWith('en') ?? false;
  const subtitleClasses = isEN
    ? 'text-left text-xl sm:text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-semibold text-gray-700 dark:text-gray-200 leading-snug md:leading-snug tracking-tight max-w-4xl md:max-w-[42ch] xl:max-w-[56ch] break-words mt-3 md:mt-0'
    : 'text-left md:text-right text-xl sm:text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-semibold text-gray-700 dark:text-gray-200 leading-tight max-w-4xl md:max-w-[40ch] mt-3 md:mt-0';

  useLayoutEffect(() => {
    gsap.registerPlugin(ScrollTrigger);

    if (!sectionRef.current || descriptionChars.length === 0) return;

    const ctx = gsap.context(() => {
      // 动态计算需要移动到屏幕（section）中心的水平距离
      const computeCenterX = () => {
        const container = sectionRef.current!; // 以 pinned section 的中心为基准，更符合"屏幕中间"
        const group = brandRef.current!; // logo + 标题 分组容器
        if (!container || !group) return 0;
        const containerRect = container.getBoundingClientRect();
        const groupRect = group.getBoundingClientRect();
        const containerCenter = containerRect.left + containerRect.width / 2;
        const groupCenter = groupRect.left + groupRect.width / 2;
        return containerCenter - groupCenter;
      };

      // 以左侧为缩放锚点，避免放大时位置偏移
      if (brandRef.current) gsap.set(brandRef.current, { transformOrigin: 'left center' });
      // 初始隐藏描述段落，等待副标题淡出后整体出现
      if (descRef.current) {
        gsap.set(descRef.current, { autoAlpha: 0, display: 'none', y: 0 });
      }
      // 初始隐藏加入按钮
      if (joinButtonRef.current) {
        gsap.set(joinButtonRef.current, { autoAlpha: 0, display: 'none', y: 0 });
      }
      // 社区按钮初始显示（与品牌组、副标题并排下方展示），无需隐藏

      // 初始化所有字符为不可见
      descriptionChars.forEach((_, index) => {
        gsap.set(`.char-${index}`, { opacity: 0, y: 20 });
      });

      const tl = gsap.timeline({
        defaults: { ease: 'power2.out' },
        scrollTrigger: {
          trigger: sectionRef.current!,
          start: 'top top',
          end: '+=1400',
          scrub: 1,
          pin: true,
          anticipatePin: 1,
          markers: false,
          invalidateOnRefresh: true,
        },
      });

      tl
        // 中段:将左侧的 logo+标题 平滑移动到屏幕正中,并轻微放大(以分组为单位)
        .to(brandRef.current, { x: computeCenterX, y: -20, scale: 1.08 }, 0)
        // 副标题先淡出(同时微微上移)
        .to(subtitleRef.current, { autoAlpha: 0, y: -10, duration: 0.35 }, 0.05)
        // 社区按钮在副标题淡出完成后再开始淡出并上移
        .to(communityRef.current, { autoAlpha: 0, y: -10, duration: 0.3 }, 0.4) // 0.05 + 0.35 = 0.4秒后开始
        .set(communityRef.current, { display: 'none' })
        .set(descRef.current, { display: 'block' })
        .to(descRef.current, { autoAlpha: 1, y: -10, duration: 0.2 }, 0.7) // 0.4 + 0.3 = 0.7秒后开始
        // 品牌组进一步上移
        .to(brandRef.current, { y: -160, duration: 0.45 }, 0.7)
        // 字符逐个出现动画
        .to(descriptionChars.map((_, index) => `.char-${index}`), {
          opacity: 1,
          y: 0,
          duration: 0.03,
          stagger: 0.02, // 每个字符间隔 0.02 秒出现
          ease: 'power1.out'
        }, '<+0.3') // 在描述容器显示后延迟 0.3 秒开始字符动画
        // 字符动画完成后，社区按钮消失，加入按钮出现
        .to(communityRef.current, { autoAlpha: 0, duration: 0.2 }, '>+0.2')
        .set(joinButtonRef.current, { display: 'block' })
        .to(joinButtonRef.current, { autoAlpha: 1, y: 0, duration: 0.3 }, '<')
        ;
    }, sectionRef);

    return () => ctx.revert();
  }, [descriptionChars]);

  return (
    <div className="relative">
      {/* 背景装饰（全局固定，仅作轻装点缀） */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute inset-0 bg-grid-pattern opacity-5" />
        <div className="absolute top-1/4 left-1/4 w-32 h-32 bg-profile-color/10 rounded-full blur-2xl" />
        <div className="absolute bottom-1/3 right-1/3 w-40 h-40 bg-teal-200/20 dark:bg-teal-800/20 rounded-full blur-2xl" />
        <div className="absolute top-1/2 right-1/4 w-24 h-24 bg-blue-200/15 dark:bg-blue-800/15 rounded-full blur-xl" />
        <div className="absolute bottom-1/4 left-1/3 w-36 h-36 bg-purple-200/15 dark:bg-purple-800/15 rounded-full blur-xl" />
      </div>

      {/* 第一屏：使用 ScrollTrigger pin 固定在视窗中间 */}
      <section ref={sectionRef} className="relative h-screen flex items-center justify-center z-10">
  <div ref={scrollerRef} className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
          <div className="w-full space-y-5 sm:space-y-6 md:space-y-8 lg:space-y-10">
            {/* 顶部行：品牌组（logo+标题） 与 副标题 并排 */}
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3 md:gap-6">
              <div className="flex items-center justify-start" ref={brandRef}>
                <div ref={logoRef} className="w-20 h-20 sm:w-24 sm:h-24 md:w-28 md:h-28 lg:w-32 lg:h-32 xl:w-36 xl:h-36 flex items-center justify-center mr-4 sm:mr-5 md:mr-6 lg:mr-8 p-1 sm:p-2">
                  <img src="/image/logos/logo.svg" alt={t('common.brandAlt')} className="w-full h-full object-contain drop-shadow-lg" />
                </div>
                <h1 ref={titleRef} className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl xl:text-9xl font-bold tracking-tight">
                  <span className="gradient-text">{t('common.brandName')}</span>
                </h1>
              </div>

              <h2 ref={subtitleRef} lang={isEN ? 'en' : undefined} className={subtitleClasses}>
                {t('hero.tagline')}
              </h2>
            </div>

            <p ref={descRef} className="text-left mx-auto text-lg sm:text-xl md:text-2xl text-gray-600 dark:text-gray-400 max-w-3xl md:max-w-4xl leading-relaxed">
              {descriptionChars.map((charObj, index) => (
                <span 
                  key={index} 
                  className={`char-${index} inline-block ${charObj.isBold ? 'font-bold text-profile-color' : ''}`}
                  style={{ opacity: 0 }}
                >
                  {charObj.char === ' ' ? '\u00A0' : charObj.char}
                </span>
              ))}
            </p>
          </div>
        </div>

        {/* 社区按钮 - 绝对定位在屏幕下方 */}
        <div ref={communityRef} className="absolute bottom-64 left-1/2 -translate-x-1/2 w-full px-4">
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

        {/* 加入按钮 - 绝对定位在屏幕下方 */}
        <div ref={joinButtonRef} className="absolute bottom-48 left-1/2 -translate-x-1/2 w-full px-4">
          <div className="w-full max-w-sm sm:max-w-md mx-auto">
            <Link
              to="/how-to-join"
              className="btn-primary text-sm sm:text-base md:text-lg lg:text-xl px-4 sm:px-6 md:px-8 lg:px-10 py-3 sm:py-3.5 lg:py-4 w-full rounded-xl text-center font-medium shadow-lg flex items-center justify-center gap-2 transition-all duration-200 hover:scale-105"
            >
              <FaRocket className="w-4 h-4 sm:w-5 sm:h-5" />
              {t('hero.joinCta')}
            </Link>
          </div>
        </div>

        {/* 向下滚动提示箭头 */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 animate-bounce">
          <FaChevronDown className="w-6 h-6 text-gray-400 dark:text-gray-500 opacity-70" />
          <FaChevronDown className="w-6 h-6 text-gray-400 dark:text-gray-500 opacity-50 -mt-4" />
        </div>
      </section>

      {/* 第二屏：正常文档流（用于解除 pin 后的内容展示） */}
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
