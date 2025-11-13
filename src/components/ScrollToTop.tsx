'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';

/**
 * ScrollToTop 组件
 * 在路由切换时自动滚动到页面顶部
 */
const ScrollToTop = () => {
  const pathname = usePathname();

  useEffect(() => {
    // 滚动到页面顶部
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: 'instant', // 使用 instant 而不是 smooth,确保立即跳转
    });
  }, [pathname]);

  return null;
};

export default ScrollToTop;
