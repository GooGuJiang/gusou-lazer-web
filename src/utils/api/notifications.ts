import { api } from './client';

export const notificationsAPI = {
  getNotifications: async () => {
    const response = await api.get('/api/v2/notifications');
    return response.data;
  },

  markAsRead: async (notificationId: number) => {
    await api.post('/api/v2/notifications/mark-read', {
      identities: [{ id: notificationId }],
      notifications: [],
    }, {
      headers: { 'Content-Type': 'application/json' },
    });
  },

  markMultipleAsRead: async (identities: Array<{ id?: number; object_id?: number; category?: string; object_type?: string }>) => {
    if (!identities || identities.length === 0) return;
    const safeIdentities = identities.map(i => ({
      ...(i.id !== undefined ? { id: i.id } : {}),
      ...(i.object_id !== undefined ? { object_id: Number(i.object_id) } : {}),
      ...(i.category ? { category: i.category } : {}),
    }));
    await api.post('/api/v2/notifications/mark-read', {
      identities: safeIdentities,
      notifications: [],
    }, {
      headers: { 'Content-Type': 'application/json' },
    });
  },

  getUnreadCount: async () => {
    const response = await api.get('/api/v2/notifications/unread-count');
    return response.data;
  },

  getTeamRequests: async () => {
    const response = await api.get('/api/private/team-requests');
    return response.data;
  },

  getGroupedNotifications: async () => {
    const response = await api.get('/api/v2/notifications');
    const notifications = (response.data.notifications || []) as Array<{ object_type: string; object_id: string | number; created_at: string }>;

    const groupedMap = new Map<string, typeof notifications[0]>();

    notifications.forEach((notification) => {
      const key = `${notification.object_type}-${notification.object_id}`;

      if (!groupedMap.has(key) ||
          new Date(notification.created_at) > new Date(groupedMap.get(key)!.created_at)) {
        groupedMap.set(key, notification);
      }
    });

    const deduplicatedNotifications = Array.from(groupedMap.values())
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

    return {
      ...response.data,
      notifications: deduplicatedNotifications,
    };
  },
};
