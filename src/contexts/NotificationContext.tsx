import React from 'react';
import { useNotifications } from '../hooks/useNotifications';
import { NotificationContext } from './notificationContextCore';
import type { NotificationProviderProps } from './notificationContextCore';

export const NotificationProvider: React.FC<NotificationProviderProps> = ({
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
    <NotificationContext.Provider
      value={{
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
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};
