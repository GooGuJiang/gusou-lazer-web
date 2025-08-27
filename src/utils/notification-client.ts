import type { NotificationResp, NotificationItem, UpdateResponse, KeepAliveResponse } from '../types/chat';
import { api } from './api';

export interface INotificationsClient {
  connect(): Promise<void>;
  disconnect(): void;
  isConnected(): boolean;
  on(event: 'notification', handler: (notification: NotificationItem) => void): void;
  on(event: 'connected', handler: () => void): void;
  on(event: 'disconnected', handler: () => void): void;
  off(event: string): void;
}

export class NotificationClient implements INotificationsClient {
  private eventHandlers: Map<string, Function> = new Map();
  private isClientConnected = false;
  private pollInterval: NodeJS.Timeout | null = null;
  private lastNotificationId: number | null = null;
  private notificationEndpoint: string | null = null;

  constructor() {
    // In a real implementation, this would connect to the notification WebSocket
    // For now, we'll simulate with polling
  }

  async connect(): Promise<void> {
    try {
      // Fetch initial notifications to get WebSocket endpoint
      await this.fetchNotifications();
      
      this.isClientConnected = true;
      this.emit('connected');
      
      // Don't start polling - we'll use WebSocket for real-time notifications
      // this.startPolling();
      
    } catch (error) {
      console.error('Failed to connect notification client:', error);
      throw error;
    }
  }

  disconnect(): void {
    this.isClientConnected = false;
    this.stopPolling();
    this.emit('disconnected');
  }

  isConnected(): boolean {
    return this.isClientConnected;
  }

  on(event: string, handler: Function): void {
    this.eventHandlers.set(event, handler);
  }

  off(event: string): void {
    this.eventHandlers.delete(event);
  }

  getNotificationEndpoint(): string | null {
    return this.notificationEndpoint;
  }

  private emit(event: string, ...args: any[]): void {
    const handler = this.eventHandlers.get(event);
    if (handler) {
      try {
        handler(...args);
      } catch (error) {
        console.error(`Error in notification event handler for ${event}:`, error);
      }
    }
  }

  private startPolling(): void {
    this.pollInterval = setInterval(async () => {
      try {
        await this.fetchNotifications();
      } catch (error) {
        console.error('Error polling notifications:', error);
      }
    }, 30000); // Poll every 30 seconds
  }

  private stopPolling(): void {
    if (this.pollInterval) {
      clearInterval(this.pollInterval);
      this.pollInterval = null;
    }
  }

  private async fetchNotifications(): Promise<void> {
    try {
      const params = new URLSearchParams();
      if (this.lastNotificationId) {
        params.append('max_id', this.lastNotificationId.toString());
      }

      const response = await api.request<NotificationResp>({
        url: `/api/v2/notifications?${params}`
      });

      // Process new notifications
      response.data.notifications.forEach((notification: NotificationItem) => {
        if (!this.lastNotificationId || notification.id > this.lastNotificationId) {
          this.emit('notification', notification);
        }
      });

      // Update last notification ID
      if (response.data.notifications.length > 0) {
        this.lastNotificationId = Math.max(...response.data.notifications.map((n: NotificationItem) => n.id));
      }

      // Store notification endpoint for WebSocket connection
      if (response.data.notification_endpoint) {
        this.notificationEndpoint = response.data.notification_endpoint;
      }

    } catch (error) {
      console.error('Failed to fetch notifications:', error);
    }
  }

  // Mark notifications as read
  async markNotificationsAsRead(notificationIds: number[]): Promise<void> {
    try {
      await api.request({
        url: '/api/v2/notifications/mark-read',
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        data: { notification_ids: notificationIds }
      });
    } catch (error) {
      console.error('Failed to mark notifications as read:', error);
      throw error;
    }
  }
}

export class ChatUpdateClient {
  private lastMessageId: number | null = null;
  private lastSilenceId: number | null = null;

  // Get incremental updates
  async getUpdates(options: {
    channel?: string;
    since?: number;
    historySince?: number;
    includes?: string[];
  } = {}): Promise<UpdateResponse> {
    try {
      const params = new URLSearchParams();
      
      if (options.since) {
        params.append('since', options.since.toString());
      } else if (this.lastMessageId) {
        params.append('since', this.lastMessageId.toString());
      }
      
      if (options.historySince) {
        params.append('history_since', options.historySince.toString());
      } else if (this.lastSilenceId) {
        params.append('history_since', this.lastSilenceId.toString());
      }
      
      // Default includes
      const includes = options.includes || ['presence', 'silences'];
      includes.forEach(include => {
        params.append('includes[]', include);
      });

      if (options.channel) {
        params.append('channel', options.channel);
      }

      const response = await api.request<UpdateResponse>({
        url: `/api/v2/chat/updates?${params}`
      });

      // Update tracking IDs
      if (response.data.messages && response.data.messages.length > 0) {
        this.lastMessageId = Math.max(...response.data.messages.map((m: any) => m.message_id));
      }

      return response.data;
    } catch (error) {
      console.error('Failed to get chat updates:', error);
      throw error;
    }
  }

  // Send keep-alive and get silence updates
  async keepAlive(options: {
    since?: number;
    historySince?: number;
  } = {}): Promise<KeepAliveResponse> {
    try {
      const params = new URLSearchParams();
      
      if (options.since) {
        params.append('since', options.since.toString());
      } else if (this.lastMessageId) {
        params.append('since', this.lastMessageId.toString());
      }
      
      if (options.historySince) {
        params.append('history_since', options.historySince.toString());
      } else if (this.lastSilenceId) {
        params.append('history_since', this.lastSilenceId.toString());
      }

      const response = await api.request<KeepAliveResponse>({
        url: `/api/v2/chat/ack?${params}`,
        method: 'POST'
      });

      return response.data;
    } catch (error) {
      console.error('Failed to send keep-alive:', error);
      throw error;
    }
  }

  // Reset tracking IDs (useful for logout/reset)
  reset(): void {
    this.lastMessageId = null;
    this.lastSilenceId = null;
  }
}
