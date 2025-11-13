'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import Navbar from '@/components/Layout/Navbar';
import ScrollToTop from '@/components/ScrollToTop';
import { Toaster } from 'react-hot-toast';
import { useAuth } from '@/hooks/useAuth';
import { NotificationProvider } from '@/contexts/NotificationContext';

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, user } = useAuth();
  const pathname = usePathname();
  
  // 检查是否在主页
  const isHomePage = pathname === '/';
  // 登录/注册/找回密码页面不需要顶部内边距
  const noTopPaddingRoutes = ['/', '/login', '/register', '/password-reset'];
  const shouldApplyTopPadding = pathname ? !noTopPaddingRoutes.includes(pathname) : false;

  return (
    <NotificationProvider isAuthenticated={isAuthenticated} user={user}>
      <ScrollToTop />
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900" style={{ 
        background: 'var(--bg-primary)'
      }}>
        <Navbar />
        <main className={shouldApplyTopPadding ? 'pt-[56px] md:pt-20' : ''} style={{
          background: isHomePage ? 'transparent' : 'var(--bg-primary)'
        }}>
          {children}
        </main>
        <Toaster
          position="top-right"
          containerStyle={{
            top: '80px',
            right: '16px',
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
}
