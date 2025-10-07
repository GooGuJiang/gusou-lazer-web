import React, { useState, useRef, useEffect } from 'react';

interface LazyAvatarProps {
  src?: string;
  alt: string;
  fallback?: string;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

const LazyAvatar: React.FC<LazyAvatarProps> = ({
  src,
  alt,
  fallback = '/default.jpg',
  className = '',
  size = 'md'
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isInView, setIsInView] = useState(false);
  // hasError 状态未被使用，移除以消除 TS 警告
  const [imageSrc, setImageSrc] = useState<string | undefined>(undefined);
  const containerRef = useRef<HTMLDivElement>(null);

  // 尺寸映射
  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-12 h-12'
  };

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

    // 延迟加载头像，确保排行榜内容先显示
    const timer = setTimeout(() => {
      if (src) {
        const img = new Image();
        img.onload = () => {
          setImageSrc(src);
          setIsLoaded(true);
        };
        img.onerror = () => {
          setImageSrc(fallback);
          setIsLoaded(true);
        };
        img.src = src;
      } else {
        setImageSrc(fallback);
        setIsLoaded(true);
      }
    }, 100); // 延迟100ms加载头像

    return () => clearTimeout(timer);
  }, [isInView, src, fallback]);

  return (
    <div 
      ref={containerRef}
      className={`${sizeClasses[size]} ${className} relative overflow-hidden rounded-lg border-2 transition-colors duration-200`}
      style={{
        borderColor: 'var(--border-color)',
      }}
    >
      {/* 占位符背景 - 只在图片未加载时显示 */}
      {!isLoaded && (
        <div className="absolute inset-0 animate-pulse" style={{ background: 'var(--card-bg)' }} />
      )}
      
      {/* 实际图片 */}
      {imageSrc && (
        <img
          src={imageSrc}
          alt={alt}
          className={`w-full h-full object-cover transition-opacity duration-300 ${
            isLoaded ? 'opacity-100' : 'opacity-0'
          }`}
          loading="lazy"
        />
      )}
    </div>
  );
};

export default LazyAvatar;