import React from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';
import { Toaster } from 'react-hot-toast';
import { useAuth } from '../../contexts/AuthContext';
import { ChatContainer } from '../Chat';

const Layout: React.FC = () => {
  const { user, isAuthenticated } = useAuth();

  // Fallback WebSocket URL - actual URL will be fetched from notifications API
  const fallbackWebsocketUrl = import.meta.env.VITE_WS_URL || 'wss://lazer-api.g0v0.top/notification-server';
  const token = localStorage.getItem('access_token');

  return (
    <div className="min-h-screen bg-bg-primary">
      <Navbar />
      <main className="pt-16 pb-16 md:pb-0">
        <Outlet />
      </main>
      
      {/* Chat System - only show when user is authenticated */}
      {isAuthenticated && user && token && (
        <ChatContainer
          userId={user.id}
          websocketUrl={fallbackWebsocketUrl}
          token={token}
        />
      )}
      
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
              primary: '#ED8EA6',
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
  );
};

export default Layout;
