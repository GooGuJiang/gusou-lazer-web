import React from 'react';

// 文本骨架屏 - 精确匹配文本尺寸

interface TextSkeletonProps {
  children: React.ReactNode;
  className?: string;
}

const TextSkeleton: React.FC<TextSkeletonProps> = ({ children, className = '' }) => (
  <div className={`relative ${className}`}>
    <div className="invisible">{children}</div>
    <div className="absolute inset-0 animate-pulse bg-gray-300/70 dark:bg-gray-600/70 rounded"></div>
  </div>
);

export default TextSkeleton;
