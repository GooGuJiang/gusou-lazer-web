import React, { useLayoutEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
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
  FaGithub,
} from 'react-icons/fa';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

const HeroSection: React.FC = () => {
  const { isAuthenticated } = useAuth();
  const { t, i18n } = useTranslation();

  const sectionRef = useRef<HTMLDivElement | null>(null);
  const scrollerRef = useRef<HTMLDivElement | null>(null);
  const titleRef = useRef<HTMLHeadingElement | null>(null);
  const logoRef = useRef<HTMLDivElement | null>(null);
  const subtitleRef = useRef<HTMLHeadingElement | null>(null);
  const descRef = useRef<HTMLParagraphElement | null>(null);
  const badgesRef = useRef<HTMLDivElement | null>(null);
  const ctasRef = useRef<HTMLDivElement | null>(null);
  // 将 logo 与 标题 作为一个整体分组，保证移动/缩放始终保持一致
  const brandRef = useRef<HTMLDivElement | null>(null);

  // 英文副标题的排版优化（更合理的字间距/行高/行宽/断行）
  const isEN = i18n?.language?.toLowerCase().startsWith('en') ?? false;
  const subtitleClasses = isEN
    ? 'text-left md:text-right text-xl sm:text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-semibold text-gray-700 dark:text-gray-200 leading-snug md:leading-snug tracking-tight max-w-4xl md:max-w-[42ch] xl:max-w-[56ch] break-words mt-3 md:mt-0'
    : 'text-left md:text-right text-xl sm:text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-semibold text-gray-700 dark:text-gray-200 leading-tight max-w-4xl md:max-w-[40ch] mt-3 md:mt-0';

  useLayoutEffect(() => {
    gsap.registerPlugin(ScrollTrigger);

    if (!sectionRef.current) return;

    // 保存原始描述 HTML，用于清理时还原，防止重复包裹
    let originalDescHTML: string | null = null;

    const ctx = gsap.context(() => {
      // 将元素内所有文本节点拆分为按“字形簇(grapheme)”的 span.char，保持标签与空白顺序不变
      const wrapChars = (el: HTMLElement) => {
        const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT);
        const textNodes: Text[] = [];
        let node: Node | null;
        while ((node = walker.nextNode())) {
          if (node.nodeType === Node.TEXT_NODE && (node as Text).data.length) {
            textNodes.push(node as Text);
          }
        }

        const hasSeg = typeof (Intl as any)?.Segmenter === 'function';
        const seg = hasSeg ? new (Intl as any).Segmenter(undefined, { granularity: 'grapheme' }) : null;

        textNodes.forEach((textNode) => {
          const parent = textNode.parentNode as Node | null;
          if (!parent) return;
          const text = textNode.data;
          const frag = document.createDocumentFragment();

          if (seg) {
            for (const s of (seg as any).segment(text)) {
              const unit: string = s.segment as string;
              if (/^\s+$/.test(unit)) {
                frag.appendChild(document.createTextNode(unit));
              } else {
                const span = document.createElement('span');
                span.className = 'char inline-block';
                span.textContent = unit;
                frag.appendChild(span);
              }
            }
          } else {
            for (const ch of Array.from(text)) {
              if (/^\s+$/.test(ch)) {
                frag.appendChild(document.createTextNode(ch));
              } else {
                const span = document.createElement('span');
                span.className = 'char inline-block';
                span.textContent = ch;
                frag.appendChild(span);
              }
            }
          }

          parent.replaceChild(frag, textNode);
        });
      };
      // 动态计算需要移动到屏幕（section）中心的水平距离
      const computeCenterX = () => {
        const container = sectionRef.current!; // 以 pinned section 的中心为基准，更符合“屏幕中间”
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
      // 初始隐藏描述段落，并进行逐字符包裹，准备动画
      if (descRef.current) {
        originalDescHTML = descRef.current.innerHTML;
        wrapChars(descRef.current);
        gsap.set(descRef.current, { autoAlpha: 0, display: 'none', y: 0 });
        gsap.set(descRef.current.querySelectorAll('.char'), { autoAlpha: 0, y: 6 });
      }

      const tl = gsap.timeline({
        defaults: { ease: 'power2.out' },
        scrollTrigger: {
          trigger: sectionRef.current!,
          start: 'top top',
          end: '+=1400',
          scrub: 1,
          pin: true,
          anticipatePin: 1,
          markers: true,
          invalidateOnRefresh: true,
        },
      });

      tl
        // 中段：将左侧的 logo+标题 平滑移动到屏幕正中，并轻微放大（以分组为单位）
        .to(brandRef.current, { x: computeCenterX, y: -20, scale: 1.08 }, 0)
        // 副标题先淡出（同时微微上移），随后描述淡入显示
        .to(subtitleRef.current, { autoAlpha: 0, y: -10, duration: 0.35 }, '<+0.05')
        .set(descRef.current, { display: 'block' })
        .to(descRef.current, { autoAlpha: 1, y: -10, duration: 0.2 }, '<')
        // 逐字符显现（保持顺序，避免重排）
        .to(
          descRef.current ? descRef.current.querySelectorAll('.char') : [],
          { autoAlpha: 1, y: 0, ease: 'power1.out', stagger: { each: 0.025 } },
          '<'
        )
        // 描述出现的同时，让品牌组进一步上移一点，突出层次
        .to(brandRef.current, { y: -160, duration: 0.45 }, '<')
        // 收场：逐步淡出，为下一屏让位
        // .to([badgesRef.current, ctasRef.current], { opacity: 0, y: -30 }, '+=0.2')
        // .to([subtitleRef.current, descRef.current], { opacity: 0, y: -40 }, '-=0.1')
        // .to(brandRef.current, { opacity: 0, y: -50, scale: 0.96 }, '-=0.1');
    }, sectionRef);

    return () => {
      ctx.revert();
      if (descRef.current && originalDescHTML !== null) {
        descRef.current.innerHTML = originalDescHTML;
      }
    };
  }, []);

  return (
    <div className="relative">
      {/* 背景装饰（全局固定，仅作轻装点缀） */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute inset-0 bg-grid-pattern opacity-5" />
        <div className="absolute top-1/4 left-1/4 w-32 h-32 bg-pink-200/20 dark:bg-pink-800/20 rounded-full blur-2xl" />
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

            <p ref={descRef} className="text-center mx-auto text-lg sm:text-xl md:text-2xl text-gray-600 dark:text-gray-400 max-w-3xl md:max-w-4xl leading-relaxed">
              <Trans
                i18nKey="hero.description"
                components={{ bold: <span className="font-bold text-pink-600 dark:text-pink-400" /> }}
              />
            </p>

           
          </div>
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
