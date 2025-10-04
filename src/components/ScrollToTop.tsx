import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * ScrollToTop 组件
 * 在路由切换时自动滚动到页面顶部
 */
const ScrollToTop = () => {
  const { pathname, hash } = useLocation();

  useEffect(() => {
    // 如果有 hash (锚点),不自动滚动到顶部
    // 让浏览器处理锚点导航
    if (hash) {
      return;
    }

    // 滚动到页面顶部
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: 'instant', // 使用 instant 而不是 smooth,确保立即跳转
    });
  }, [pathname, hash]);

  return null;
};

export default ScrollToTop;
