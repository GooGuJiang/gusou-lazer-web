import React from 'react';
import { useChatContext } from '../../contexts/ChatContext';

export const NotificationList: React.FC = () => {
  const { notifications, markNotificationsAsRead } = useChatContext();

  const formatNotificationTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));

    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours}h ago`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays}d ago`;
    
    return date.toLocaleDateString();
  };

  const getNotificationIcon = (category: string) => {
    switch (category) {
      case 'user_achievement_unlock':
        return '🏆';
      case 'channel_message':
        return '💬';
      case 'beatmap_like':
        return '❤️';
      case 'beatmap_comment':
        return '💭';
      case 'user_follow':
        return '👤';
      case 'beatmap_rank':
        return '🎯';
      default:
        return '📢';
    }
  };

  const getNotificationTitle = (notification: any) => {
    switch (notification.name) {
      case 'user_achievement_unlock':
        return notification.details.title || 'Achievement unlocked';
      case 'channel_message':
        return 'New message';
      case 'beatmap_like':
        return 'Beatmap liked';
      case 'beatmap_comment':
        return 'New comment';
      case 'user_follow':
        return 'New follower';
      case 'beatmap_rank':
        return 'New rank achieved';
      default:
        return notification.name || 'Notification';
    }
  };

  const getNotificationDescription = (notification: any) => {
    const details = notification.details || {};
    
    switch (notification.name) {
      case 'user_achievement_unlock':
        return details.description || 'Achievement unlocked!';
      case 'channel_message':
        return `${details.username || 'Someone'} sent a message`;
      case 'beatmap_like':
        return `${details.username || 'Someone'} liked your beatmap`;
      case 'beatmap_comment':
        return `${details.username || 'Someone'} commented on your beatmap`;
      case 'user_follow':
        return `${details.username || 'Someone'} started following you`;
      case 'beatmap_rank':
        return `You achieved rank #${details.rank || '?'} on "${details.beatmap_title || 'a beatmap'}"`;
      default:
        return details.message || 'You have a new notification';
    }
  };

  const handleMarkAsRead = async (notificationId: number) => {
    try {
      await markNotificationsAsRead([notificationId]);
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
    }
  };

  const handleMarkAllAsRead = async () => {
    // Since the API doesn't include is_read field, we treat all notifications as unread
    const allIds = notifications.map(n => n.id);
    if (allIds.length > 0) {
      try {
        await markNotificationsAsRead(allIds);
      } catch (error) {
        console.error('Failed to mark all notifications as read:', error);
      }
    }
  };

  // All notifications are considered unread since API doesn't provide is_read field
  const unreadCount = notifications.length;

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="p-3 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300">
            Notifications
            {unreadCount > 0 && (
              <span className="ml-2 px-2 py-1 text-xs bg-red-500 text-white rounded-full">
                {unreadCount}
              </span>
            )}
          </h3>
          
          {unreadCount > 0 && (
            <button
              onClick={handleMarkAllAsRead}
              className="text-xs text-blue-500 hover:text-blue-600 font-medium"
            >
              Mark all read
            </button>
          )}
        </div>
      </div>

      {/* Notification List */}
      <div className="flex-1 overflow-y-auto">
        {notifications.length === 0 ? (
          <div className="p-4 text-center text-gray-500 text-sm">
            No notifications
          </div>
        ) : (
          <div className="divide-y divide-gray-200 dark:divide-gray-700">
            {notifications.map((notification) => (
              <div
                key={notification.id}
                className="p-3 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors cursor-pointer bg-blue-50 dark:bg-blue-900/20"
                onClick={() => handleMarkAsRead(notification.id)}
              >
                <div className="flex items-start space-x-3">
                  {/* Icon */}
                  <div className="flex-shrink-0 text-lg">
                    {getNotificationIcon(notification.category)}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                        {getNotificationTitle(notification)}
                      </p>
                      <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0" />
                    </div>
                    
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                      {getNotificationDescription(notification)}
                    </p>
                    
                    <p className="text-xs text-gray-400 mt-1">
                      {formatNotificationTime(notification.created_at)}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
