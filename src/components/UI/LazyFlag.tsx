import React, { useState, useRef, useEffect } from 'react';

interface LazyFlagProps {
  src: string;
  alt: string;
  className?: string;
  title?: string;
  [key: string]: any; // 允许传递额外的属性
}

const LazyFlag: React.FC<LazyFlagProps> = ({
  src,
  alt,
  className = '',
  title,
  ...restProps
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isInView, setIsInView] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [imageSrc, setImageSrc] = useState<string | undefined>(undefined);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          observer.disconnect();
        }
      },
      {
        threshold: 0.1,
        rootMargin: '50px'
      }
    );

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!isInView) return;

    // 延迟加载国旗
    const timer = setTimeout(() => {
      const img = new Image();
      img.onload = () => {
        setImageSrc(src);
        setIsLoaded(true);
        setHasError(false);
      };
      img.onerror = () => {
        setHasError(true);
        setIsLoaded(true);
      };
      img.src = src;
    }, 150); // 延迟150ms加载国旗

    return () => clearTimeout(timer);
  }, [isInView, src]);

  return (
    <div 
      ref={containerRef}
      className={`relative overflow-hidden ${className}`}
      {...restProps}
    >
      {/* 占位符背景 - 只在未加载且没有错误时显示 */}
      {!isLoaded && !hasError && (
        <div className="absolute inset-0 bg-gray-100 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded animate-pulse" />
      )}
      
      {/* 国旗图片 */}
      {imageSrc && !hasError && (
        <img
          src={imageSrc}
          alt={alt}
          title={title}
          className={`w-full h-full object-cover transition-opacity duration-300 ${
            isLoaded ? 'opacity-100' : 'opacity-0'
          }`}
          loading="lazy"
        />
      )}
      
      {/* 错误时的占位符 */}
      {hasError && (
        <div className={`bg-gray-200 dark:bg-gray-600 flex items-center justify-center border border-gray-200 dark:border-gray-600 rounded ${className}`}>
          <span className="text-xs text-gray-500 dark:text-gray-400">{alt}</span>
        </div>
      )}
    </div>
  );
};

export default LazyFlag;
