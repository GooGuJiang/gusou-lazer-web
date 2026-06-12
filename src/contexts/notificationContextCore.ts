import React from 'react';
import type { APINotification, UnreadCount, User } from '../types';

export interface NotificationContextValue {
  unreadCount: UnreadCount;
  notifications: APINotification[];
  isLoading: boolean;
  isConnected: boolean;
  chatConnected: boolean;
  connectionError: string | null;
  markAsRead: (id: number) => Promise<void> | void;
  removeNotification: (id: number) => void;
  removeNotificationByObject: (objectId: string, objectType: string) => Promise<void> | void;
  refresh: () => void;
}

export const NotificationContext = React.createContext<NotificationContextValue | null>(null);

export interface NotificationProviderProps {
  isAuthenticated: boolean;
  user?: User | null;
  children: React.ReactNode;
}
