import React from 'react';

// 文本骨架屏 - 精确匹配文本尺寸

interface TextSkeletonProps {
  children: React.ReactNode;
  className?: string;
}

const TextSkeleton: React.FC<TextSkeletonProps> = ({ children, className = '' }) => (
  <div className={`relative ${className}`}>
    <div className="invisible">{children}</div>
    <div className="absolute inset-0 animate-pulse rounded" style={{ background: 'var(--card-bg-hover)', opacity: 0.7 }}></div>
  </div>
);

export default TextSkeleton;
