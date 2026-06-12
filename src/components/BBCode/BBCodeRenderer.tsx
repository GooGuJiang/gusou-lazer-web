import React, { useEffect, useRef } from 'react';
import '../../styles/bbcode.css';

interface BBCodeRendererProps {
  html: string;
  className?: string;
}

type SpoilerButtonElement = Element & {
  __spoilerClickHandler?: EventListener;
};

/**
 * BBCode HTML 渲染组件
 * 安全地渲染BBCode解析器生成的HTML，并添加交互功能
 */
const BBCodeRenderer: React.FC<BBCodeRendererProps> = ({ html, className = '' }) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const container = containerRef.current;

    // 初始化折叠框功能
    const initializeSpoilerBoxes = () => {
      const spoilerLinks = container.querySelectorAll('.js-spoilerbox__link');
      const cleanupFunctions: (() => void)[] = [];

      spoilerLinks.forEach((button) => {
        // 先移除可能存在的旧事件监听器
        const existingHandler = (button as SpoilerButtonElement).__spoilerClickHandler;
        if (existingHandler) {
          button.removeEventListener('click', existingHandler);
        }

        const handleClick = (e: Event) => {
          e.preventDefault();
          e.stopPropagation();

          const spoilerBox = button.closest('.js-spoilerbox');
          const body = spoilerBox?.querySelector('.js-spoilerbox__body');

          if (body) {
            const isVisible = body.classList.contains('is-visible');
            body.classList.toggle('is-visible', !isVisible);
            button.setAttribute('aria-expanded', String(!isVisible));

            // 触发自定义事件
            spoilerBox?.dispatchEvent(
              new CustomEvent('spoilerToggle', {
                detail: { expanded: !isVisible },
              })
            );
          }
        };

        // 存储事件处理器引用以便清理
        (button as SpoilerButtonElement).__spoilerClickHandler = handleClick;
        button.addEventListener('click', handleClick);

        // 设置初始状态 - button元素默认就有正确的属性
        button.setAttribute('aria-expanded', 'false');

        // 添加清理函数
        cleanupFunctions.push(() => {
          button.removeEventListener('click', handleClick);
          delete (button as SpoilerButtonElement).__spoilerClickHandler;
        });
      });

      // 返回总的清理函数
      return () => {
        cleanupFunctions.forEach((cleanup) => cleanup());
      };
    };

    // 初始化剧透条功能
    const initializeSpoilers = () => {
      const spoilers = container.querySelectorAll('.spoiler');
      const cleanupFunctions: (() => void)[] = [];

      spoilers.forEach((spoiler) => {
        const handleReveal = () => {
          spoiler.classList.add('revealed');
        };

        const handleKeydown = (e: Event) => {
          const keyEvent = e as KeyboardEvent;
          if (keyEvent.key === 'Enter' || keyEvent.key === ' ') {
            e.preventDefault();
            handleReveal();
          }
        };

        // 点击显示
        spoiler.addEventListener('click', handleReveal);

        // 鼠标悬停显示
        spoiler.addEventListener('mouseenter', handleReveal);

        // 支持键盘操作
        spoiler.setAttribute('tabindex', '0');
        spoiler.setAttribute('role', 'button');
        spoiler.setAttribute('aria-label', '点击显示隐藏内容');

        spoiler.addEventListener('keydown', handleKeydown);

        // 添加清理函数
        cleanupFunctions.push(() => {
          spoiler.removeEventListener('click', handleReveal);
          spoiler.removeEventListener('mouseenter', handleReveal);
          spoiler.removeEventListener('keydown', handleKeydown);
        });
      });

      // 返回总的清理函数
      return () => {
        cleanupFunctions.forEach((cleanup) => cleanup());
      };
    };

    // 初始化图片映射功能
    const initializeImageMaps = () => {
      const imageMaps = container.querySelectorAll('.imagemap');
      const cleanupFunctions: (() => void)[] = [];

      imageMaps.forEach((imageMap) => {
        const links = imageMap.querySelectorAll('.imagemap__link');

        links.forEach((link) => {
          const handleMouseEnter = () => {
            link.classList.add('hover');
          };

          const handleMouseLeave = () => {
            link.classList.remove('hover');
          };

          const handleClick = (e: Event) => {
            e.preventDefault();
          };

          // 添加悬停效果
          link.addEventListener('mouseenter', handleMouseEnter);
          link.addEventListener('mouseleave', handleMouseLeave);

          // 如果是信息区域（没有href），添加提示
          if (!link.getAttribute('href') || link.getAttribute('href') === '#') {
            link.addEventListener('click', handleClick);
          }

          // 添加清理函数
          cleanupFunctions.push(() => {
            link.removeEventListener('mouseenter', handleMouseEnter);
            link.removeEventListener('mouseleave', handleMouseLeave);
            if (!link.getAttribute('href') || link.getAttribute('href') === '#') {
              link.removeEventListener('click', handleClick);
            }
          });
        });
      });

      // 返回总的清理函数
      return () => {
        cleanupFunctions.forEach((cleanup) => cleanup());
      };
    };

    // 初始化所有交互功能并收集清理函数
    const cleanupSpoilerBoxes = initializeSpoilerBoxes();
    const cleanupSpoilers = initializeSpoilers();
    const cleanupImageMaps = initializeImageMaps();

    // 返回总的清理函数
    return () => {
      cleanupSpoilerBoxes?.();
      cleanupSpoilers?.();
      cleanupImageMaps?.();
    };

    // 处理外部链接
    const externalLinks = container.querySelectorAll('a[href^="http"]');
    externalLinks.forEach((link) => {
      link.setAttribute('target', '_blank');
      link.setAttribute('rel', 'noopener noreferrer');
    });

    // 图片懒加载
    const images = container.querySelectorAll('img[loading="lazy"]');
    if ('IntersectionObserver' in window) {
      const imageObserver = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const img = entry.target as HTMLImageElement;
            if (img.dataset.src) {
              img.src = img.dataset.src;
              img.removeAttribute('data-src');
              imageObserver.unobserve(img);
            }
          }
        });
      });

      images.forEach((img) => imageObserver.observe(img));

      return () => {
        imageObserver.disconnect();
      };
    }
  }, [html]);

  return (
    <div
      ref={containerRef}
      className={`bbcode-renderer ${className}`}
      dangerouslySetInnerHTML={{ __html: html }}
      aria-live="polite"
    />
  );
};

export default BBCodeRenderer;
