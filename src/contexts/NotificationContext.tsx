"use client";

import React, { createContext, useContext } from 'react';
import type { ReactNode } from 'react';
import { useNotifications } from '../hooks/useNotifications';
import type { APINotification, UnreadCount, User } from '../types';

interface NotificationContextValue {
  unreadCount: UnreadCount;
  notifications: APINotification[];
  isLoading: boolean;
  isConnected: boolean;
  chatConnected: boolean; // 添加聊天连接状态
  connectionError: string | null;
  markAsRead: (id: number) => Promise<void> | void;
  removeNotification: (id: number) => void;
  removeNotificationByObject: (objectId: string, objectType: string) => Promise<void> | void;
  refresh: () => void;
}

const NotificationContext = createContext<NotificationContextValue | null>(null);

export const NotificationProvider: React.FC<{ isAuthenticated: boolean; user?: User | null; children: ReactNode; }> = ({
  isAuthenticated,
  user,
  children,
}) => {
  const {
    unreadCount,
    notifications,
    isLoading,
    isConnected,
    connectionError,
    markAsRead,
    removeNotification,
    removeNotificationByObject,
    refresh,
  } = useNotifications(isAuthenticated, user);

  // chatConnected 应该与 isConnected 相同，因为使用的是同一个 WebSocket 连接
  // 实际上这两个值在全局单例 WebSocket 实现中应该是相同的
  const chatConnected = isConnected;

  return (
    <NotificationContext.Provider value={{
      unreadCount,
      notifications,
      isLoading,
      isConnected,
      chatConnected,
      connectionError,
      markAsRead,
      removeNotification,
      removeNotificationByObject,
      refresh,
    }}>
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotificationContext = () => {
  const ctx = useContext(NotificationContext);
  if (!ctx) {
    throw new Error('useNotificationContext must be used within NotificationProvider');
  }
  return ctx;
};
