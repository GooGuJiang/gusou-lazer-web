import { useState, useEffect, useCallback } from 'react';
import { notificationsAPI } from '../utils/api';
import { apiCache } from '../utils/apiCache';
import { useWebSocketNotifications } from './useWebSocketNotifications';
import type { UnreadCount, APINotification, User } from '../types';

export const useNotifications = (isAuthenticated: boolean, currentUser?: User | null) => {
  const [unreadCount, setUnreadCount] = useState<UnreadCount>({
    total: 0,
    team_requests: 0,
    private_messages: 0,
    friend_requests: 0,
  });
  const [notifications, setNotifications] = useState<APINotification[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // 处理新通知
  const handleNewNotification = useCallback(
    (notification: APINotification) => {
      console.log('收到新通知:', {
        id: notification.id,
        source_user_id: notification.source_user_id,
        current_user_id: currentUser?.id,
        name: notification.name,
      });

      // 检查是否是自己的消息，如果是则忽略通知
      if (
        notification.source_user_id &&
        currentUser &&
        notification.source_user_id === currentUser.id
      ) {
        console.log(
          `✓ 忽略自己的消息通知:`,
          notification.id,
          '发送者ID:',
          notification.source_user_id,
          '当前用户ID:',
          currentUser.id
        );
        return;
      }

      console.log('✓ 处理他人的消息通知:', notification.id);

      // 预获取用户信息以便在UI中显示正确的用户名
      if (notification.source_user_id && !apiCache.hasCachedUser(notification.source_user_id)) {
        console.log('预获取通知相关用户信息:', notification.source_user_id);
        apiCache.getUser(notification.source_user_id).catch((error) => {
          console.error('预获取用户信息失败:', error);
        });
      }

      setNotifications((prev) => {
        // 改进的去重逻辑：基于 object_id, object_type 和 source_user_id 进行去重
        const isDuplicate = prev.some((n) => {
          // 如果 ID 完全相同
          if (n.id === notification.id) return true;

          // 如果是相同类型的通知，具有相同的对象和发送者
          if (
            n.object_id === notification.object_id &&
            n.object_type === notification.object_type &&
            n.name === notification.name &&
            n.source_user_id === notification.source_user_id
          ) {
            return true;
          }

          return false;
        });

        if (isDuplicate) {
          console.log(
            '检测到重复通知，跳过添加:',
            notification.id,
            notification.object_id,
            notification.name
          );
          return prev;
        }

        console.log(
          '添加新通知:',
          notification.id,
          notification.object_id,
          notification.name,
          '发送者:',
          notification.source_user_id
        );
        return [notification, ...prev];
      });

      // 更新未读数量
      setUnreadCount((prev) => {
        const newCount = { ...prev };

        // 根据通知类型增加相应计数
        switch (notification.name) {
          case 'team_application_store':
          case 'team_application_accept':
          case 'team_application_reject':
            newCount.team_requests++;
            break;
          case 'channel_message':
            newCount.private_messages++;
            break;
          default:
            break;
        }

        newCount.total =
          newCount.team_requests + newCount.private_messages + newCount.friend_requests;
        return newCount;
      });
    },
    [currentUser]
  );

  // 使用WebSocket连接
  const { isConnected, connectionError } = useWebSocketNotifications({
    isAuthenticated,
    currentUser,
    onNewNotification: handleNewNotification,
  });

  // 获取初始通知数据
  const fetchNotifications = useCallback(
    async (force: boolean = false) => {
      if (!isAuthenticated) {
        setUnreadCount({
          total: 0,
          team_requests: 0,
          private_messages: 0,
          friend_requests: 0,
        });
        setNotifications([]);
        return;
      }

      // 如果不是强制刷新且已有数据，跳过
      if (!force && notifications.length > 0) {
        return;
      }

      try {
        setIsLoading(true);

        // 使用分组去重的 API 获取通知
        const response = await notificationsAPI.getGroupedNotifications();

        setNotifications(response.notifications || []);

        // 预获取所有通知相关的用户信息
        const userIdsToFetch = new Set<number>();
        (response.notifications || []).forEach((notification: APINotification) => {
          if (notification.source_user_id && !apiCache.hasCachedUser(notification.source_user_id)) {
            userIdsToFetch.add(notification.source_user_id);
          }
        });

        if (userIdsToFetch.size > 0) {
          console.log(`预获取通知相关用户信息: ${userIdsToFetch.size}个用户`);
          apiCache.getUsers(Array.from(userIdsToFetch)).catch((error) => {
            console.error('批量获取通知用户信息失败:', error);
          });
        }

        // 计算未读数量
        const teamRequestCount = response.notifications.filter(
          (n: APINotification) =>
            [
              'team_application_store',
              'team_application_accept',
              'team_application_reject',
            ].includes(n.name) && !n.is_read
        ).length;

        const privateMessageCount = response.notifications.filter(
          (n: APINotification) => n.name === 'channel_message' && !n.is_read
        ).length;

        const friendRequestCount = 0; // 暂时没有好友请求

        setUnreadCount({
          team_requests: teamRequestCount,
          private_messages: privateMessageCount,
          friend_requests: friendRequestCount,
          total: teamRequestCount + privateMessageCount + friendRequestCount,
        });
      } catch (error) {
        console.error('获取通知失败:', error);
      } finally {
        setIsLoading(false);
      }
    },
    [isAuthenticated]
  );

  // 初始加载
  useEffect(() => {
    if (isAuthenticated) {
      fetchNotifications(true); // 强制刷新初始数据
    }
  }, [isAuthenticated]);

  // 定期刷新（当WebSocket未连接时）
  useEffect(() => {
    if (!isConnected && isAuthenticated) {
      const interval = setInterval(() => fetchNotifications(true), 60000); // 增加到60秒，减少频率
      return () => clearInterval(interval);
    }
  }, [isConnected, isAuthenticated]);

  // 手动刷新
  const refresh = useCallback(() => {
    fetchNotifications(true);
  }, []);

  // 标记通知为已读
  const markAsRead = useCallback(
    async (notificationId: number) => {
      try {
        console.log(`标记通知 ${notificationId} 为已读`);

        // 先找到要标记的通知
        const targetNotification = notifications.find((n) => n.id === notificationId);
        if (!targetNotification) {
          console.log(`通知 ${notificationId} 不存在，跳过处理`);
          return;
        }

        if (targetNotification.is_read) {
          console.log(`通知 ${notificationId} 已经是已读状态，跳过API调用`);
          return;
        }

        // 调用API标记为已读
        await notificationsAPI.markAsRead(notificationId);

        // 更新本地状态
        setNotifications((prev) =>
          prev.map((n) => (n.id === notificationId ? { ...n, is_read: true } : n))
        );

        // 更新未读数量（使用已找到的通知对象）
        setUnreadCount((prev) => {
          console.log(`标记前未读计数:`, prev);
          const newCount = { ...prev };

          switch (targetNotification.name) {
            case 'team_application_store':
            case 'team_application_accept':
            case 'team_application_reject':
              newCount.team_requests = Math.max(0, newCount.team_requests - 1);
              console.log(`减少团队请求计数，当前: ${newCount.team_requests}`);
              break;
            case 'channel_message':
              newCount.private_messages = Math.max(0, newCount.private_messages - 1);
              console.log(`减少私聊消息计数，当前: ${newCount.private_messages}`);
              break;
          }

          newCount.total =
            newCount.team_requests + newCount.private_messages + newCount.friend_requests;
          console.log(`标记后未读计数:`, newCount);
          return newCount;
        });
      } catch (error) {
        console.error('标记通知已读失败:', error);
      }
    },
    [notifications]
  );

  // 减少未读数量（当用户查看通知时）
  const decrementCount = useCallback(
    (type?: keyof Omit<UnreadCount, 'total'>, amount: number = 1) => {
      setUnreadCount((prev) => {
        const newCount = { ...prev };

        if (type && newCount[type] > 0) {
          newCount[type] = Math.max(0, newCount[type] - amount);
        }

        // 重新计算总数
        newCount.total =
          newCount.team_requests + newCount.private_messages + newCount.friend_requests;

        return newCount;
      });
    },
    []
  );

  // 删除通知
  const removeNotification = useCallback((notificationId: number) => {
    setNotifications((prev) => {
      const notification = prev.find((n) => n.id === notificationId);
      if (notification && !notification.is_read) {
        // 如果删除的是未读通知，需要更新未读数量
        setUnreadCount((prevCount) => {
          const newCount = { ...prevCount };

          switch (notification.name) {
            case 'team_application_store':
            case 'team_application_accept':
            case 'team_application_reject':
              newCount.team_requests = Math.max(0, newCount.team_requests - 1);
              break;
            case 'channel_message':
              newCount.private_messages = Math.max(0, newCount.private_messages - 1);
              break;
          }

          newCount.total =
            newCount.team_requests + newCount.private_messages + newCount.friend_requests;
          return newCount;
        });
      }

      return prev.filter((n) => n.id !== notificationId);
    });
  }, []);

  // 根据 object_id 和 object_type 删除相关通知
  const removeNotificationByObject = useCallback(
    async (objectId: string, objectType: string) => {
      console.log(`准备删除通知: objectId=${objectId}, objectType=${objectType}`);

      try {
        // 找到匹配的通知
        const notificationsToRemove = notifications.filter(
          (n) => n.object_id === objectId && n.object_type === objectType
        );

        console.log(
          `找到 ${notificationsToRemove.length} 个匹配的通知需要删除:`,
          notificationsToRemove.map((n) => n.id)
        );

        if (notificationsToRemove.length === 0) {
          console.log('没有找到匹配的通知，跳过删除');
          return;
        }

        // 调用API批量标记为已读 (object_type 后端是字符串)
        // 仅按 object_id 标记已读，避免传递 object_type (后端期望 int 会解析失败)
        await notificationsAPI.markMultipleAsRead([
          {
            object_id: parseInt(objectId),
          },
        ]);

        // 更新本地状态
        setNotifications((prev) => {
          const unreadNotificationsToRemove = notificationsToRemove.filter((n) => !n.is_read);
          console.log(`其中 ${unreadNotificationsToRemove.length} 个是未读通知`);

          if (unreadNotificationsToRemove.length > 0) {
            setUnreadCount((prevCount) => {
              const newCount = { ...prevCount };
              console.log(`删除前未读计数:`, prevCount);

              unreadNotificationsToRemove.forEach((notification) => {
                switch (notification.name) {
                  case 'team_application_store':
                  case 'team_application_accept':
                  case 'team_application_reject':
                    newCount.team_requests = Math.max(0, newCount.team_requests - 1);
                    console.log(`减少团队请求计数，当前: ${newCount.team_requests}`);
                    break;
                  case 'channel_message':
                    newCount.private_messages = Math.max(0, newCount.private_messages - 1);
                    console.log(`减少私聊消息计数，当前: ${newCount.private_messages}`);
                    break;
                }
              });

              newCount.total =
                newCount.team_requests + newCount.private_messages + newCount.friend_requests;
              console.log(`删除后未读计数:`, newCount);
              return newCount;
            });
          }

          // 将匹配的通知标记为已读，而不是删除
          const updatedNotifications = prev.map((n) =>
            n.object_id === objectId && n.object_type === objectType ? { ...n, is_read: true } : n
          );

          console.log(`标记后通知数量: ${updatedNotifications.length}`);
          return updatedNotifications;
        });
      } catch (error) {
        console.error('批量标记通知已读失败:', error);
      }
    },
    [notifications]
  );

  return {
    unreadCount,
    notifications,
    isLoading,
    isConnected,
    connectionError,
    refresh,
    decrementCount,
    markAsRead,
    removeNotification,
    removeNotificationByObject,
  };
};
