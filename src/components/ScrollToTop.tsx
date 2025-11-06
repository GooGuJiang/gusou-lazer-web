"use client";

import { useEffect } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';

/**
 * ScrollToTop 组件
 * 在路由切换时自动滚动到页面顶部
 */
const ScrollToTop = () => {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    // 如果有 hash (锚点),不自动滚动到顶部
    // 让浏览器处理锚点导航
    const hash = typeof window !== 'undefined' ? window.location.hash : '';
    if (hash) {
      return;
    }

    // 滚动到页面顶部
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: 'auto',
    });
  }, [pathname, searchParams?.toString()]);

  return null;
};

export default ScrollToTop;
