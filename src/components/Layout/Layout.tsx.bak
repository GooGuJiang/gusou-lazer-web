import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Navbar from './Navbar';
import { Toaster } from 'react-hot-toast';
import { useAuth } from '../../hooks/useAuth';
import { NotificationProvider } from '../../contexts/NotificationContext';

const Layout: React.FC = () => {
  const { isAuthenticated, user } = useAuth();
  const location = useLocation();
  
  // 检查是否在主页
  const isHomePage = location.pathname === '/';
  // 登录/注册/找回密码页面不需要顶部内边距
  const noTopPaddingRoutes = ['/', '/login', '/register', '/password-reset'];
  const shouldApplyTopPadding = !noTopPaddingRoutes.includes(location.pathname);

  return (
    <NotificationProvider isAuthenticated={isAuthenticated} user={user}>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900" style={{ 
        background: 'var(--bg-primary)'
      }}>
        <Navbar />
        <main className={shouldApplyTopPadding ? 'pt-[56px] md:pt-20' : ''} style={{
          background: isHomePage ? 'transparent' : 'var(--bg-primary)'
        }}>
          <Outlet />
        </main>
        <Toaster
        position="top-right"
        containerStyle={{
          top: '80px', // 在顶栏下面显示，顶栏高度约为64px，留一些间距
          right: '16px', // 右侧留一些边距
        }}
        toastOptions={{
          duration: 4000,
          style: {
            background: 'var(--bg-secondary)',
            color: 'var(--text-primary)',
            border: '1px solid var(--border-color)',
            borderRadius: '8px',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
          },
          success: {
            iconTheme: {
              primary: 'var(--osu-pink, #ED8EA6)',
              secondary: 'white',
            },
          },
          error: {
            iconTheme: {
              primary: '#ef4444',
              secondary: 'white',
            },
          },
        }}
      />
      </div>
    </NotificationProvider>
  );
};

export default Layout;
