import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FiMessageCircle, 
  FiBell, 
  FiChevronLeft,
  FiX,
  FiCheck,
  FiUserPlus,
  FiPlus,
  FiRefreshCw
} from 'react-icons/fi';
import { useAuth } from '../hooks/useAuth';
// 使用全局通知上下文，避免与 Navbar 各自实例不同步
import { useNotificationContext } from '../contexts/NotificationContext';
import { useWebSocketNotifications } from '../hooks/useWebSocketNotifications';
import { chatAPI, teamsAPI, userAPI } from '../utils/api';
import { apiCache } from '../utils/apiCache';
import { useTranslation } from 'react-i18next';

import MessageBubble from '../components/Chat/MessageBubble';
import ChannelItem from '../components/Chat/ChannelItem';
import MessageInput from '../components/Chat/MessageInput';
import PrivateMessageModal from '../components/Chat/PrivateMessageModal';
import type { 
  ChatChannel, 
  ChatMessage, 
  APINotification
} from '../types';
import toast from 'react-hot-toast';

// UTC时间转换为本地时间
const convertUTCToLocal = (utcTimeString: string): string => {
  try {
    const utcDate = new Date(utcTimeString);
    return utcDate.toISOString(); // 这会自动转换为本地时区显示
  } catch (error) {
    console.error('时间转换错误:', error);
    return utcTimeString;
  }
};

type ActiveTab = 'channels' | 'notifications';
type ChannelFilter = 'all' | 'private' | 'team' | 'public';

const MessagesPage: React.FC = () => {
  const { t } = useTranslation();
  const { user, isAuthenticated } = useAuth();
  const [activeTab, setActiveTab] = useState<ActiveTab>('channels');
  const [channels, _setChannels] = useState<ChatChannel[]>([]);
  const [selectedChannel, setSelectedChannel] = useState<ChatChannel | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  // 保存最新消息数组避免 WebSocket 回调闭包使用过期的 messages
  const messagesRef = useRef<ChatMessage[]>([]);
  const [channelFilter, setChannelFilter] = useState<ChannelFilter>('all');
  const [isLoading, setIsLoading] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const [showSidebar, setShowSidebar] = useState(true);
  const [showNewPMModal, setShowNewPMModal] = useState(false);
  
  // 优化的频道消息加载函数，使用缓存API
  const loadChannelMessages = useCallback(async (channelId: number): Promise<ChatMessage[] | null> => {
    try {
      console.log(`开始加载频道 ${channelId} 的消息`);
      
      const channelMessages = await apiCache.getChannelMessages(channelId);
      
      if (channelMessages && channelMessages.length > 0) {
        // 转换时间戳
        const messagesWithLocalTime = channelMessages.map((msg: ChatMessage) => ({
          ...msg,
          timestamp: convertUTCToLocal(msg.timestamp)
        }));
        
        console.log(`频道 ${channelId} 消息加载完成: ${messagesWithLocalTime.length} 条`);
        return messagesWithLocalTime;
      }
      
      return [];
    } catch (error) {
      console.error(`加载频道 ${channelId} 消息失败:`, error);
      return null;
    }
  }, []);
  
  // 其他必要的refs
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const selectedChannelRef = useRef<ChatChannel | null>(null);
  const channelsRef = useRef<ChatChannel[]>([]);
  const initialLoadRef = useRef<boolean>(true); // 首次加载标记
  const userScrolledUpRef = useRef<boolean>(false); // 用户是否向上滚动离开底部
  const scrollContainerRef = useRef<HTMLDivElement | null>(null);

  // 同时更新状态和 ref 的 setChannels 函数
  const setChannels = useCallback((value: ChatChannel[] | ((prev: ChatChannel[]) => ChatChannel[])) => {
    _setChannels(prev => {
      const newChannels = typeof value === 'function' ? value(prev) : value;
      channelsRef.current = newChannels;
      return newChannels;
    });
  }, []);

  // 更新频道已读状态
  const updateChannelReadStatus = useCallback((channelId: number, messageId: number) => {
    setChannels(prev => prev.map(channel => {
      if (channel.channel_id === channelId) {
        // 更新已读ID，确保它不小于当前消息ID
        const newLastReadId = Math.max(channel.last_read_id || 0, messageId);
        console.log(`更新频道 ${channel.name} 已读ID: ${channel.last_read_id} -> ${newLastReadId}`);
        return {
          ...channel,
          last_read_id: newLastReadId
        };
      }
      return channel;
    }));
  }, []);

  // 使用通知系统
  const {
    notifications,
    unreadCount,
    markAsRead,
    refresh,
    removeNotificationByObject,
  } = useNotificationContext();

  // 使用WebSocket处理实时消息
  // chatConnected 当前未在 UI 中使用，改名为 _chatConnected 以消除未使用警告
  const { isConnected: _chatConnected } = useWebSocketNotifications({
    isAuthenticated,
    currentUser: user,
    onNewMessage: (message) => {
      console.log('WebSocket收到消息（处理前）:', {
        messageId: message.message_id,
        channelId: message.channel_id,
        senderId: message.sender_id,
        userId: user?.id,
        content: message.content.substring(0, 50),
        selectedChannelId: selectedChannelRef.current?.channel_id,
        selectedChannelName: selectedChannelRef.current?.name
      });
      
      // 过滤自己的消息，不显示推送
      if (message.sender_id === user?.id) {
        console.log('收到自己的消息，跳过处理:', message.message_id, 'sender_id:', message.sender_id, 'user.id:', user?.id);
        return;
      }
      
      console.log('WebSocket收到消息（处理后）:', {
        messageId: message.message_id,
        channelId: message.channel_id,
        senderId: message.sender_id,
        content: message.content.substring(0, 50),
        selectedChannelId: selectedChannelRef.current?.channel_id,
        selectedChannelName: selectedChannelRef.current?.name
      });
  
      // messageWithLocalTime变量在此处不再使用，因为我们直接传递原始message给addMessageToList
      
      // 检查是否应该添加到当前频道（使用ref确保获取最新状态）
      const currentSelectedChannel = selectedChannelRef.current;
      const shouldAddToCurrentChannel = currentSelectedChannel && message.channel_id === currentSelectedChannel.channel_id;
      
      if (shouldAddToCurrentChannel) {
        console.log('添加消息到当前频道，当前列表长度:', messagesRef.current.length);
        addMessageToList(message, 'websocket');
      } else if (currentSelectedChannel) {
        console.log('消息不属于当前频道，当前频道:', currentSelectedChannel.channel_id, '消息频道:', message.channel_id);
      } else {
        console.log('没有选中的频道，尝试找到对应频道并自动选择');
        console.log('当前频道列表长度:', channelsRef.current.length);
        console.log('目标频道ID:', message.channel_id);
        console.log('频道列表:', channelsRef.current.map(ch => ({id: ch.channel_id, name: ch.name})));
        
        // 如果没有选中频道，尝试找到对应的频道并自动选择
        const targetChannel = channelsRef.current.find(ch => ch.channel_id === message.channel_id);
        if (targetChannel) {
          console.log('找到对应频道，自动选择:', targetChannel.name);
          
          // 调用selectChannel来加载历史消息和设置频道
          // 在加载完成后再添加新消息
          selectChannelAndAddMessage(targetChannel, message);
        } else {
          console.log('未找到对应频道，频道ID:', message.channel_id);
          
          // 如果没找到频道，可能是频道列表还没加载完，尝试重新加载频道列表
          if (channelsRef.current.length === 0) {
            console.log('频道列表为空，尝试重新加载频道');
            chatAPI.getChannels().then(channelsData => {
              console.log('重新加载频道完成，频道数量:', channelsData?.length || 0);
              if (channelsData) {
                setChannels(channelsData);
                const retryChannel = channelsData.find((ch: ChatChannel) => ch.channel_id === message.channel_id);
                if (retryChannel) {
                  console.log('重新加载后找到频道，自动选择:', retryChannel.name);
                  // 调用selectChannelAndAddMessage来处理频道选择和消息添加
                  selectChannelAndAddMessage(retryChannel, message);
                }
              }
            }).catch(error => {
              console.error('重新加载频道失败:', error);
            });
          }
        }
      }
    },
  });

  // 检测屏幕尺寸
  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      setShowSidebar(!mobile);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // （滚动相关 useEffect 已移动到 throttledMarkAsRead 定义之后，避免提前引用）

  // 加载频道数据
  useEffect(() => {
    if (!isAuthenticated) return;

    const loadChannels = async () => {
      try {
        setIsLoading(true);
        console.log('开始加载频道列表');
        const channelsData = await apiCache.getChannels();
        console.log('原始频道数据:', channelsData);
        
        // 检查私聊频道
        const pmChannels = (channelsData || []).filter((ch: ChatChannel) => ch.type === 'PM');
        console.log('私聊频道数量:', pmChannels.length);
        if (pmChannels.length > 0) {
          console.log('私聊频道详情:', pmChannels.map((ch: ChatChannel) => ({ 
            id: ch.channel_id, 
            name: ch.name, 
            type: ch.type,
            users: ch.users 
          })));
        }
        
        // 为私聊频道获取用户信息
        const channelsWithUserInfo = await Promise.all(
          (channelsData || []).map(async (channel: ChatChannel) => {
            if (channel.type === 'PM' && channel.users.length > 0) {
              try {
                // 获取私聊对象的用户ID
                const targetUserId = channel.users.find(id => id !== user?.id);
                if (targetUserId) {
                  console.log('为私聊频道获取用户信息:', targetUserId);
                  
                  const userInfo = await apiCache.getUser(targetUserId);
                  
                  if (userInfo) {
                    return {
                      ...channel,
                      name: `私聊: ${userInfo.username}`,
                      user_info: {
                        id: userInfo.id,
                        username: userInfo.username,
                        avatar_url: userInfo.avatar_url || userAPI.getAvatarUrl(userInfo.id),
                        cover_url: userInfo.cover_url || userInfo.cover?.url || ''
                      }
                    };
                  }
                }
              } catch (error) {
                console.error('获取用户信息失败:', error);
              }
            }
            return channel;
          })
        );
        
        // 过滤并排序频道：倒序排列，频道在前，最下面是第一个
        const sortedChannels = channelsWithUserInfo.sort((a: ChatChannel, b: ChatChannel) => {
          // 优先级：公共频道 > 私聊 > 团队 > 私有
          const typeOrder: Record<string, number> = { 'PUBLIC': 0, 'PM': 1, 'TEAM': 2, 'PRIVATE': 3 };
          const aOrder = typeOrder[a.type] || 4;
          const bOrder = typeOrder[b.type] || 4;
          
          if (aOrder !== bOrder) {
            // 倒序排列：较大的 order 值在前
            return bOrder - aOrder;
          }
          
          // 同类型内按名称倒序排列
          return b.name.localeCompare(a.name);
        });
        
        console.log('排序后的频道列表:', sortedChannels.map((ch: ChatChannel) => ({ id: ch.channel_id, name: ch.name, type: ch.type })));
        setChannels(sortedChannels);
        
        // 清理重复的私聊频道
        setTimeout(() => {
          cleanupDuplicatePrivateChannels();
        }, 100);
        
        // 如果没有选中频道且有可用频道，优先选择 osu! 频道
        if (!selectedChannel && sortedChannels.length > 0) {
          // 查找 osu! 频道
          const osuChannel = sortedChannels.find(ch => 
            ch.name.toLowerCase().includes('osu') || 
            ch.name.toLowerCase().includes('#osu') ||
            ch.name === 'osu!'
          );
          
          const channelToSelect = osuChannel || sortedChannels[0];
          console.log('自动选择频道:', channelToSelect.name, '类型:', channelToSelect.type);
          selectChannel(channelToSelect);
        }
      } catch (error) {
        console.error('加载频道失败:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadChannels();
  }, [isAuthenticated]);

  // 同步selectedChannel状态到ref
  useEffect(() => {
    selectedChannelRef.current = selectedChannel;
    console.log('同步选中频道到ref:', selectedChannel?.name || 'null');
  }, [selectedChannel]);

  // 同步 messages 到 ref
  useEffect(() => {
    messagesRef.current = messages;
  }, [messages]);

  // 监听通知变化，处理私聊通知
  useEffect(() => {
    if (notifications.length > 0) {
      console.log('检测到新通知，数量:', notifications.length);
      
      // 使用 object_id 进行分组去重
      const processedObjectIds = new Set<string>();
      
      // 处理所有私聊通知，按 object_id 去重
      notifications.forEach(notification => {
        if (notification.name === 'channel_message' && 
            notification.details?.type === 'pm') {
          
          const objectKey = `${notification.object_type}-${notification.object_id}`;
          
          if (!processedObjectIds.has(objectKey)) {
            console.log('处理私聊通知:', notification.id, objectKey, notification.details.title);
            processedObjectIds.add(objectKey);
            handlePrivateMessageNotification(notification);
            
            // 自动标记已存在的私聊消息为已读
            autoMarkPrivateMessagesAsRead(notification);
          } else {
            console.log('跳过重复的通知对象:', objectKey);
          }
        }
      });
    }
  }, [notifications, channels, user?.id]);

  // 清理定时器
  useEffect(() => {
    return () => {
      // 组件卸载时清理所有回退定时器
      const fallbackTimers = (window as any).messageFallbackTimers;
      if (fallbackTimers) {
        fallbackTimers.forEach((timer: NodeJS.Timeout) => clearTimeout(timer));
        fallbackTimers.clear();
      }
    };
  }, []);

  // 过滤频道
  const filteredChannels = channels.filter(channel => {
    switch (channelFilter) {
      case 'private':
        return channel.type === 'PM';
      case 'team':
        return channel.type === 'TEAM';
      case 'public':
        return channel.type === 'PUBLIC';
      default:
        return true;
    }
  });

  const filterOptions = React.useMemo(
    () => [
      { key: 'all' as const, label: t('messages.sidebar.filters.all') },
      { key: 'private' as const, label: t('messages.sidebar.filters.private') },
      { key: 'team' as const, label: t('messages.sidebar.filters.team') },
      { key: 'public' as const, label: t('messages.sidebar.filters.public') },
    ],
    [t]
  );

  // 选择频道，加载消息，并添加新消息
  const selectChannelAndAddMessage = async (channel: ChatChannel, newMessage: ChatMessage) => {
    console.log('选择频道并添加消息:', channel.name, '频道ID:', channel.channel_id);
  // 重置首次加载标记，用于滚动判断
  initialLoadRef.current = true;
    setSelectedChannel(channel);
    selectedChannelRef.current = channel;
  // 记录本次请求，用于竞态检测
  const requestToken = Symbol('channel-load');
  (selectChannelAndAddMessage as any).currentToken = requestToken;
    
    if (isMobile) {
      setShowSidebar(false);
    }

    try {
      console.log('开始加载频道历史消息');
      const channelMessages = await loadChannelMessages(channel.channel_id);
      
      if (channelMessages && channelMessages.length > 0) {
        // 如果在请求完成前频道被再次切换，放弃本次结果
        if ((selectChannelAndAddMessage as any).currentToken !== requestToken) {
          console.log('放弃过期的频道历史消息结果 (addMessage path)');
          return;
        }
        
        // 检查新消息是否已经在历史消息中
        const messageExists = channelMessages.find((m: ChatMessage) => m.message_id === newMessage.message_id);
        
        // 使用函数式更新，避免覆盖在加载过程中到达的消息
        setMessages(prev => {
          console.log('合并历史消息与 in-flight 消息(仅当前频道)');
          // 只保留当前频道在加载期间通过 WS 到达的消息
          const inflight = prev.filter(m => m.channel_id === channel.channel_id);
          const mergedMap = new Map<number, ChatMessage>();
          [...channelMessages, ...inflight].forEach(m => mergedMap.set(m.message_id, m));
          if (!messageExists) {
            mergedMap.set(newMessage.message_id, {
              ...newMessage,
              timestamp: convertUTCToLocal(newMessage.timestamp)
            });
          }
          const all = Array.from(mergedMap.values()).sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
          console.log('最终消息列表数量:', all.length);
          return all;
        });
        
        // 标记最后一条消息为已读
        const lastMessage = channelMessages[channelMessages.length - 1];
        console.log('标记最后一条消息为已读:', lastMessage.message_id);
        throttledMarkAsRead(channel.channel_id, lastMessage.message_id);
        console.log('消息已读标记完成');

        // 私聊频道：打开后立即标记相关通知为已读（即使 last_read 已是最新也要确保通知消失）
        if (channel.type === 'PM') {
          try {
            const relatedPmNotifications = notifications.filter(n => n.name === 'channel_message' && n.object_id === channel.channel_id.toString());
            if (relatedPmNotifications.some(n => !n.is_read)) {
              console.log('私聊频道打开，自动标记通知为已读 (addMessage path):', relatedPmNotifications.map(n => n.id));
              await removeNotificationByObject(channel.channel_id.toString(), 'channel');
            }
          } catch (e) {
            console.error('标记私聊通知已读失败(selectChannelAndAddMessage):', e);
          }
        }
      } else {
        console.log('频道没有历史消息，只显示新消息');
        setMessages(prev => {
          const inflight = prev.filter(m => m.channel_id === channel.channel_id);
          const exists = inflight.some(m => m.message_id === newMessage.message_id);
            return exists ? inflight : [...inflight, {
              ...newMessage,
              timestamp: convertUTCToLocal(newMessage.timestamp)
            }];
        });
        
        // 无历史消息也要处理通知
        if (channel.type === 'PM') {
          try {
            const relatedPmNotifications = notifications.filter(n => n.name === 'channel_message' && n.object_id === channel.channel_id.toString());
            if (relatedPmNotifications.some(n => !n.is_read)) {
              console.log('私聊频道(空历史)打开，自动标记通知为已读 (addMessage path)');
              await removeNotificationByObject(channel.channel_id.toString(), 'channel');
            }
          } catch (e) {
            console.error('标记私聊通知已读失败(空历史 addMessage):', e);
          }
        }
      }
    } catch (error) {
      console.error('加载频道消息失败:', error);
      toast.error(t('messages.toasts.loadMessagesFailed'));
      // 即使加载失败，也要显示新消息
      setMessages(prev => {
        let allMessages = [...prev];
        
        const newMessageWithLocalTime = {
          ...newMessage,
          timestamp: convertUTCToLocal(newMessage.timestamp)
        };
        
        // 检查新消息是否已存在
        const messageExists = allMessages.find(msg => msg.message_id === newMessage.message_id);
        if (!messageExists) {
          allMessages.push(newMessageWithLocalTime);
        }
        
        // 按时间戳排序
        allMessages.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
        
        return allMessages;
      });
      
      if (channel.type === 'PM') {
        try {
          const relatedPmNotifications = notifications.filter(n => n.name === 'channel_message' && n.object_id === channel.channel_id.toString());
          if (relatedPmNotifications.some(n => !n.is_read)) {
            console.log('私聊频道(加载失败)打开，自动标记通知为已读');
            await removeNotificationByObject(channel.channel_id.toString(), 'channel');
          }
        } catch (e) {
          console.error('标记私聊通知已读失败(加载失败 addMessage):', e);
        }
      }
    }
  };

  // 选择频道并加载消息
  const selectChannel = async (channel: ChatChannel) => {
    console.log('选择频道:', channel.name, '类型:', channel.type, '频道ID:', channel.channel_id);
  // 重置首次加载标记
  initialLoadRef.current = true;
    setSelectedChannel(channel);
    selectedChannelRef.current = channel;
  // 记录请求 token 用于竞态
  const requestToken = Symbol('channel-load');
  (selectChannel as any).currentToken = requestToken;
    
    if (isMobile) {
      setShowSidebar(false);
    }

    // 如果是私聊频道，尝试获取用户信息并更新频道显示
    if (channel.type === 'PM' && channel.users.length > 0) {
      try {
        // 获取私聊对象的用户信息
        const targetUserId = channel.users.find(id => id !== user?.id);
        if (targetUserId && !channel.user_info) {
          console.log('获取私聊用户信息:', targetUserId);
          
          const userInfo = await apiCache.getUser(targetUserId);
          
          if (userInfo) {
            console.log('私聊用户信息:', userInfo);
            
            // 更新频道信息
            setChannels(prev => prev.map(ch => {
              if (ch.channel_id === channel.channel_id) {
                return {
                  ...ch,
                  name: `私聊: ${userInfo.username}`,
                  user_info: {
                    id: userInfo.id,
                    username: userInfo.username,
                    avatar_url: userInfo.avatar_url || userAPI.getAvatarUrl(userInfo.id),
                    cover_url: userInfo.cover_url || userInfo.cover?.url || ''
                  }
                };
              }
              return ch;
            }));
          }
        }
      } catch (error) {
        console.error('获取私聊用户信息失败:', error);
      }
    }

    try {
      console.log('开始加载频道消息，频道ID:', channel.channel_id);
      const channelMessages = await loadChannelMessages(channel.channel_id);
      
      if (channelMessages && channelMessages.length > 0) {
        if ((selectChannel as any).currentToken !== requestToken) {
          console.log('放弃过期的频道消息结果');
          return;
        }
        
        console.log('设置消息列表，消息数量:', channelMessages.length);
        
        // 使用函数式更新，保留可能在加载过程中到达的新消息
        setMessages(prev => {
          console.log('合并历史消息与 in-flight 消息(仅当前频道)');
          const inflight = prev.filter(m => m.channel_id === channel.channel_id);
          const mergedMap = new Map<number, ChatMessage>();
          [...channelMessages, ...inflight].forEach(m => mergedMap.set(m.message_id, m));
          const all = Array.from(mergedMap.values()).sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
          console.log('最终消息列表数量:', all.length);
          return all;
        });
        
        // 标记最后一条消息为已读
        const lastMessage = channelMessages[channelMessages.length - 1];
        console.log('标记最后一条消息为已读:', lastMessage.message_id);
        throttledMarkAsRead(channel.channel_id, lastMessage.message_id);
        console.log('消息已读标记完成');

        if (channel.type === 'PM') {
          try {
            const relatedPmNotifications = notifications.filter(n => n.name === 'channel_message' && n.object_id === channel.channel_id.toString());
            if (relatedPmNotifications.some(n => !n.is_read)) {
              console.log('私聊频道打开，自动标记通知为已读 (selectChannel path):', relatedPmNotifications.map(n => n.id));
              await removeNotificationByObject(channel.channel_id.toString(), 'channel');
            }
          } catch (e) {
            console.error('标记私聊通知已读失败(selectChannel):', e);
          }
        }
    } else {
        console.log('频道没有历史消息');
        // 即使没有历史消息，也要保留可能在加载过程中到达的消息
        setMessages(prev => {
      const inflight = prev.filter(m => m.channel_id === channel.channel_id);
      return inflight.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
        });
        
        if (channel.type === 'PM') {
          try {
            const relatedPmNotifications = notifications.filter(n => n.name === 'channel_message' && n.object_id === channel.channel_id.toString());
            if (relatedPmNotifications.some(n => !n.is_read)) {
              console.log('空私聊频道打开，自动标记通知为已读 (selectChannel path)');
              await removeNotificationByObject(channel.channel_id.toString(), 'channel');
            }
          } catch (e) {
            console.error('标记私聊通知已读失败(空频道 selectChannel):', e);
          }
        }
      }
    } catch (error) {
      console.error('加载频道消息失败:', error);
      toast.error(t('messages.toasts.loadMessagesFailed'));
      
      // 即使加载失败，也要保留可能已经到达的消息
      setMessages(prev => {
        console.log('频道加载失败，保留现有消息数量:', prev.length);
        return prev;
      });
      
      if (channel.type === 'PM') {
        try {
          const relatedPmNotifications = notifications.filter(n => n.name === 'channel_message' && n.object_id === channel.channel_id.toString());
          if (relatedPmNotifications.some(n => !n.is_read)) {
            console.log('私聊频道(加载失败)打开，自动标记通知为已读 (selectChannel)');
            await removeNotificationByObject(channel.channel_id.toString(), 'channel');
          }
        } catch (e) {
          console.error('标记私聊通知已读失败(加载失败 selectChannel):', e);
        }
      }
    }
  };

  // 统一的消息添加函数
  const addMessageToList = useCallback((message: ChatMessage, source: 'api' | 'websocket') => {
    console.log(`添加消息(${source}): ID=${message.message_id}, 频道ID=${message.channel_id}, 发送者=${message.sender_id}, 内容="${message.content.substring(0, 30)}"`);
    
    // 检查消息是否属于当前选中的频道
    const currentChannel = selectedChannelRef.current;
    if (!currentChannel || message.channel_id !== currentChannel.channel_id) {
      console.log(`消息不属于当前频道，跳过添加。当前频道: ${currentChannel?.channel_id || 'null'}, 消息频道: ${message.channel_id}`);
      return;
    }
    
    const messageWithLocalTime = {
      ...message,
      timestamp: convertUTCToLocal(message.timestamp)
    };
    
    setMessages(prev => {
      // 检查消息是否已存在
      const existsById = prev.find(m => m.message_id === message.message_id);
      if (existsById) {
        console.log(`消息已存在，跳过: ${message.message_id}`);
        return prev;
      }
      
      console.log(`成功添加消息: ${message.message_id}, 当前消息列表长度: ${prev.length} -> ${prev.length + 1}`);
      
      // 确保消息按时间戳排序插入
      const newMessages = [...prev, messageWithLocalTime];
      newMessages.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
      
  messagesRef.current = newMessages;
      return newMessages;
    });

    // 如果是当前频道的新消息，使用防抖函数标记为已读
    console.log(`准备标记消息为已读: ${message.message_id}, 频道: ${currentChannel.name}`);
    // 使用 setTimeout 来避免循环依赖
    setTimeout(() => {
      throttledMarkAsRead(message.channel_id, message.message_id);
    }, 0);
  }, []);

  // 发送消息
  const sendMessage = async (messageText: string) => {
    if (!selectedChannel || !messageText.trim()) return;

    try {
      const message = await chatAPI.sendMessage(
        selectedChannel.channel_id,
        messageText.trim()
      );
      
      console.log('消息发送成功，立即显示:', message.message_id);
      
      // 立即显示消息，不等待WebSocket确认
      addMessageToList(message, 'api');
      
    } catch (error) {
      console.error('发送消息失败:', error);
      toast.error(t('messages.toasts.sendMessageFailed'));
    }
  };

  // 优化的防抖标记已读函数，减少重复请求
  const throttledMarkAsRead = useCallback(
    (() => {
      let timeoutId: NodeJS.Timeout | null = null;
      const pendingRequests = new Set<string>();
      const lastReadCache = new Map<number, number>(); // 缓存每个频道的最后已读消息ID
      const batchQueue = new Map<number, number>(); // 批量处理队列：channelId -> messageId
      
      const processBatch = async () => {
        if (batchQueue.size === 0) return;
        
        const currentBatch = new Map(batchQueue);
        batchQueue.clear();
        
        // 并行处理多个频道的markAsRead请求
        const promises = Array.from(currentBatch.entries()).map(async ([channelId, messageId]) => {
          const requestKey = `${channelId}-${messageId}`;
          
          // 检查是否已经标记了更高的消息ID
          const cachedLastRead = lastReadCache.get(channelId) || 0;
          if (messageId <= cachedLastRead) {
            console.log(`消息${messageId}已被更高ID${cachedLastRead}标记，跳过`);
            return;
          }
          
          if (pendingRequests.has(requestKey)) {
            console.log(`请求已在进行中，跳过: ${requestKey}`);
            return;
          }
          
          try {
            pendingRequests.add(requestKey);
            console.log(`批量标记已读: 频道${channelId}, 消息${messageId}`);
            
            await chatAPI.markAsRead(channelId, messageId);
            
            // 更新缓存
            lastReadCache.set(channelId, Math.max(cachedLastRead, messageId));
            
            console.log(`标记已读成功: 频道${channelId}, 消息${messageId}`);
            
            // 更新频道列表中的已读状态
            updateChannelReadStatus(channelId, messageId);
            
            // 删除相关通知（批量操作）
            try {
              await removeNotificationByObject(channelId.toString(), 'channel');
            } catch (error) {
              console.error(`删除通知失败: 频道${channelId}`, error);
            }
            
          } catch (error) {
            console.error(`标记已读失败: 频道${channelId}, 消息${messageId}`, error);
          } finally {
            pendingRequests.delete(requestKey);
          }
        });
        
        await Promise.allSettled(promises);
      };
      
      return async (channelId: number, messageId: number) => {
        // 检查是否已经有更高的消息ID在队列中
        const queuedMessageId = batchQueue.get(channelId);
        if (queuedMessageId && messageId <= queuedMessageId) {
          console.log(`消息${messageId}低于队列中的${queuedMessageId}，跳过`);
          return;
        }
        
        // 检查缓存，避免重复标记
        const cachedLastRead = lastReadCache.get(channelId) || 0;
        if (messageId <= cachedLastRead) {
          console.log(`消息${messageId}已被标记为已读(缓存${cachedLastRead})，跳过`);
          return;
        }
        
        // 添加到批量队列
        batchQueue.set(channelId, Math.max(queuedMessageId || 0, messageId));
        
        // 清除之前的定时器
        if (timeoutId) {
          clearTimeout(timeoutId);
        }
        
        // 设置新的定时器，延长防抖时间以减少请求频率
        timeoutId = setTimeout(processBatch, 1500); // 增加到1.5秒防抖
      };
    })(),
    [updateChannelReadStatus, removeNotificationByObject]
  );

  // 监听滚动，判断用户是否离开底部（移动到 throttledMarkAsRead 之后）
  useEffect(() => {
    const container = scrollContainerRef.current || document.querySelector('#chat-message-scroll-container');
    if (!container) return;
    const el = container as HTMLElement;
    const onScroll = () => {
      const distanceToBottom = el.scrollHeight - el.scrollTop - el.clientHeight;
      userScrolledUpRef.current = distanceToBottom > 120; // 超过120px认为离开底部
    };
    el.addEventListener('scroll', onScroll);
    return () => el.removeEventListener('scroll', onScroll);
  }, []);

  // 条件自动滚动：仅当 (非首次加载 && 用户仍在底部附近) 或 (新消息来自自己) 才滚动
  useEffect(() => {
    if (messages.length === 0) return;
    const lastMessage = messages[messages.length - 1];
    const currentChannel = selectedChannelRef.current;
    if (!currentChannel) return;

    const container = scrollContainerRef.current || document.querySelector('#chat-message-scroll-container');
    let nearBottom = true;
    if (container) {
      const el = container as HTMLElement;
      const distanceToBottom = el.scrollHeight - el.scrollTop - el.clientHeight;
      nearBottom = distanceToBottom < 150; // 150px 以内视为接近底部
    }

    const isOwnMessage = lastMessage.sender_id === user?.id;
    const isInitial = initialLoadRef.current;

    // 首次加载：滚动到底部，然后重置标记
    if (isInitial) {
      initialLoadRef.current = false;
      // 首次加载时也滚动到底部，使用 setTimeout 确保 DOM 已更新
      setTimeout(() => {
        const containerEl = scrollContainerRef.current || document.querySelector('#chat-message-scroll-container');
        if (containerEl) {
          (containerEl as HTMLElement).scrollTop = (containerEl as HTMLElement).scrollHeight;
        } else {
          // 备用：直接使用默认行为的 scrollIntoView（无 smooth）
          messagesEndRef.current?.scrollIntoView();
        }
      }, 50); // 50ms 延迟确保 DOM 完全更新
      return;
    }

    if (!userScrolledUpRef.current || nearBottom || isOwnMessage) {
      // 立即跳到底部（去除平滑动画）
      const containerEl = scrollContainerRef.current || document.querySelector('#chat-message-scroll-container');
      if (containerEl) {
        (containerEl as HTMLElement).scrollTop = (containerEl as HTMLElement).scrollHeight;
      } else {
        // 备用：直接使用默认行为的 scrollIntoView（无 smooth）
        messagesEndRef.current?.scrollIntoView();
      }
    }

    // 标记已读逻辑（与之前一致）
    if (lastMessage.message_id > (currentChannel.last_read_id || 0)) {
      throttledMarkAsRead(currentChannel.channel_id, lastMessage.message_id);
    }
  }, [messages, throttledMarkAsRead, user?.id]);

  // 消息可见性检测 - 当用户真正"看到"消息时自动标记已读
  useEffect(() => {
    if (!selectedChannel || messages.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && selectedChannel) {
            const messageElement = entry.target as HTMLElement;
            const messageId = parseInt(messageElement.dataset.messageId || '0');
            const channelId = selectedChannel.channel_id;
            
            // 确保消息ID有效且大于当前已读ID
            if (messageId > 0 && messageId > (selectedChannel.last_read_id || 0)) {
              console.log(`消息 ${messageId} 在频道 ${channelId} 中进入可视区域，准备标记为已读`);
              
              // 延迟一点时间确保用户真的看到了消息
              const timeoutId = setTimeout(() => {
                // 再次检查是否仍然是当前选中的频道
                if (selectedChannel && selectedChannel.channel_id === channelId) {
                  console.log(`延迟后标记消息 ${messageId} 为已读`);
                  throttledMarkAsRead(channelId, messageId);
                }
              }, 1000); // 1秒后标记为已读
              
              // 存储 timeout ID 以便在需要时清除
              messageElement.dataset.readTimeout = timeoutId.toString();
            }
          } else {
            // 消息离开可视区域时，清除等待中的标记已读操作
            const messageElement = entry.target as HTMLElement;
            const timeoutId = messageElement.dataset.readTimeout;
            if (timeoutId) {
              clearTimeout(parseInt(timeoutId));
              delete messageElement.dataset.readTimeout;
            }
          }
        });
      },
      {
        root: null, // 使用视窗作为根
        rootMargin: '0px',
        threshold: 0.6 // 当消息60%可见时触发，确保用户真的看到了
      }
    );

    // 观察当前频道的所有消息元素
    const messageElements = document.querySelectorAll(`[data-message-id]`);
    messageElements.forEach((element) => {
      observer.observe(element);
    });

    return () => {
      // 清除所有观察和等待中的timeout
      messageElements.forEach((element) => {
        const timeoutId = (element as HTMLElement).dataset.readTimeout;
        if (timeoutId) {
          clearTimeout(parseInt(timeoutId));
        }
      });
      observer.disconnect();
    };
  }, [messages, selectedChannel, throttledMarkAsRead]);

  // 处理通知标记已读并跳转到聊天
  const handleNotificationMarkAsRead = useCallback(async (notification: typeof notifications[0]) => {
    try {
      console.log('处理通知标记已读:', notification.id, notification.name);
      
      // 先调用API标记通知为已读（确保服务器状态更新）
      await markAsRead(notification.id);
      
      // 如果是频道消息通知，跳转到对应聊天
      if (notification.name === 'channel_message') {
        const channelId = parseInt(notification.object_id);
        
        // 查找对应的频道
        const targetChannel = channels.find(channel => channel.channel_id === channelId);
        
        if (targetChannel) {
          console.log(`跳转到频道: ${targetChannel.name} (${channelId})`);
          setSelectedChannel(targetChannel);
          if (isMobile) {
            setShowSidebar(false); // 在移动端关闭侧边栏
          }
          
          // 可选：延迟删除通知，确保用户看到跳转效果
          setTimeout(() => {
            removeNotificationByObject(notification.object_id, notification.object_type);
          }, 500);
        } else {
          console.log(`未找到频道ID为 ${channelId} 的频道`);
        }
      }
    } catch (error) {
      console.error('处理通知标记已读失败:', error);
    }
  }, [markAsRead, channels, removeNotificationByObject, setSelectedChannel, setShowSidebar, isMobile, notifications]);

  // 监控未读计数变化
  useEffect(() => {
    console.log('未读计数更新:', unreadCount);
  }, [unreadCount]);

  // 优化的批量获取通知相关的用户信息
  useEffect(() => {
    if (!notifications.length) return;

    const userIdsToFetch = new Set<number>();
    
    notifications.forEach(notification => {
      if (notification.source_user_id) {
        userIdsToFetch.add(notification.source_user_id);
      }
    });

    // 批量获取用户信息
    if (userIdsToFetch.size > 0) {
      apiCache.getUsers(Array.from(userIdsToFetch))
        .then(() => {
          console.log(`批量获取用户信息完成: ${userIdsToFetch.size}个用户`);
          // 强制重新渲染以显示正确的用户名
          setActiveTab(prev => prev); // 触发重新渲染
        })
        .catch(error => {
          console.error('批量获取用户信息失败:', error);
        });
    }
  }, [notifications]);

  // 清理重复的私聊频道
  const cleanupDuplicatePrivateChannels = () => {
    setChannels(prev => {
      const uniqueChannels: ChatChannel[] = [];
      const seenUserPairs = new Set<string>();
      
      prev.forEach(channel => {
        if (channel.type === 'PM') {
          // 对于私聊频道，检查用户组合是否重复
          const currentUserId = user?.id || 0;
          const otherUsers = channel.users.filter(id => id !== currentUserId);
          
          if (otherUsers.length > 0) {
            // 创建用户组合的唯一标识
            const userPairKey = otherUsers.sort().join(',');
            const fullPairKey = `${currentUserId}-${userPairKey}`;
            
            if (!seenUserPairs.has(fullPairKey)) {
              seenUserPairs.add(fullPairKey);
              uniqueChannels.push(channel);
            } else {
              console.log('移除重复的私聊频道:', channel.name);
            }
          } else {
            // 如果没有其他用户，保留频道
            uniqueChannels.push(channel);
          }
        } else {
          // 非私聊频道直接保留
          uniqueChannels.push(channel);
        }
      });
      
      console.log('清理后的频道数量:', uniqueChannels.length, '原始数量:', prev.length);
      return uniqueChannels;
    });
  };

  // 处理私聊通知，创建对应的私聊频道
  const handlePrivateMessageNotification = async (notification: APINotification) => {
    if (notification.name === 'channel_message' && notification.details?.type === 'pm') {
      try {
        console.log('检测到私聊消息通知，尝试创建私聊频道:', notification);
        
        // 从通知中获取用户信息
        const sourceUserId = notification.source_user_id;
        
        if (!sourceUserId) {
          console.log('通知中缺少源用户ID，跳过处理');
          return;
        }
        
        // 检查是否已经存在对应的私聊频道（通过用户ID去重）
        const existingChannel = channels.find(ch => {
          if (ch.type !== 'PM') return false;
          
          // 检查频道是否包含当前用户和目标用户
          const hasCurrentUser = ch.users.includes(user?.id || 0);
          const hasTargetUser = ch.users.includes(sourceUserId);
          
          return hasCurrentUser && hasTargetUser;
        });
        
        if (existingChannel) {
          console.log('私聊频道已存在，跳过创建:', existingChannel.name);
          return;
        }
        
        console.log('未找到现有私聊频道，获取用户信息并创建新的私聊频道');
        
        // 获取用户详细信息
        let userName = notification.details.title as string || '未知用户';
        let userAvatarUrl = '';
        let userCoverUrl = '';
        
        try {
          // 检查缓存
          const userInfo = await apiCache.getUser(sourceUserId);
          
          if (userInfo) {
            console.log('获取到用户信息:', userInfo);
            userName = userInfo.username || userName;
            userAvatarUrl = userInfo.avatar_url || userAPI.getAvatarUrl(sourceUserId);
            userCoverUrl = userInfo.cover_url || userInfo.cover?.url || '';
          }
        } catch (error) {
          console.error('获取用户信息失败，使用默认值:', error);
          userAvatarUrl = userAPI.getAvatarUrl(sourceUserId);
        }
        
        // 创建新的私聊频道对象
        const newPrivateChannel: ChatChannel = {
          channel_id: parseInt(notification.object_id.toString()), // 转换为数字
          name: `私聊: ${userName}`,
          description: `与 ${userName} 的私聊`,
          type: 'PM',
          moderated: false,
          users: [user?.id || 0, sourceUserId],
          current_user_attributes: {
            can_message: true,
            can_message_error: undefined,
            last_read_id: 0
          },
          last_read_id: 0,
          last_message_id: 0,
          recent_messages: [],
          message_length_limit: 1000,
          // 添加用户信息到频道对象中以便显示
          user_info: {
            id: sourceUserId,
            username: userName,
            avatar_url: userAvatarUrl,
            cover_url: userCoverUrl
          }
        };
        
        console.log('创建新的私聊频道对象:', newPrivateChannel);
        
        // 添加到频道列表，确保不重复
        setChannels(prev => {
          // 再次检查是否已经存在相同的私聊频道（防止竞态条件）
          const isDuplicate = prev.some(ch => {
            if (ch.type !== 'PM') return false;
            
            // 检查是否包含相同的用户组合
            const hasCurrentUser = ch.users.includes(user?.id || 0);
            const hasTargetUser = ch.users.includes(sourceUserId);
            
            return hasCurrentUser && hasTargetUser;
          });
          
          if (isDuplicate) {
            console.log('检测到重复的私聊频道，跳过添加');
            return prev;
          }
          
          console.log('添加新的私聊频道到列表');
          const newChannels = [...prev, newPrivateChannel];
          
          // 重新排序：倒序排列，频道在前，最下面是第一个
          return newChannels.sort((a: ChatChannel, b: ChatChannel) => {
            // 优先级：公共频道 > 私聊 > 团队 > 私有
            const typeOrder: Record<string, number> = { 'PUBLIC': 0, 'PM': 1, 'TEAM': 2, 'PRIVATE': 3 };
            const aOrder = typeOrder[a.type] || 4;
            const bOrder = typeOrder[b.type] || 4;
            
            if (aOrder !== bOrder) {
              // 倒序排列：较大的 order 值在前
              return bOrder - aOrder;
            }
            
            // 同类型内按名称倒序排列
            return b.name.localeCompare(a.name);
          });
        });
        
        //console.log('私聊频道已添加到列表');
        //toast.success(`发现新的私聊: ${userName}`);
        
        // 从通知中提取消息内容并创建聊天消息对象
        const messageContent = notification.details?.title as string;
        if (messageContent) {
          console.log('从通知中提取消息内容，准备添加到聊天列表:', messageContent);
          
          // 创建一个临时的消息对象（基于通知信息）
          const chatMessage: ChatMessage = {
            message_id: Date.now() + Math.random(), // 生成临时的唯一消息ID
            channel_id: parseInt(notification.object_id.toString()),
            content: messageContent,
            timestamp: notification.created_at,
            sender_id: sourceUserId,
            is_action: false,
            // sender 是可选的，暂不提供完整的 User 对象
          };
          
          console.log('创建的临时聊天消息对象:', chatMessage);
          
          // 如果当前没有选中频道，或者选中的频道就是这个私聊频道，则添加消息
          const currentChannel = selectedChannelRef.current;
          if (!currentChannel || currentChannel.channel_id === newPrivateChannel.channel_id) {
            console.log('将从通知提取的消息添加到当前聊天列表');
            addMessageToList(chatMessage, 'websocket');
          } else {
            console.log('当前选中的不是对应私聊频道，消息暂不显示');
          }
        }
        
      } catch (error) {
        console.error('处理私聊通知失败:', error);
      }
    }
  };

  // 自动标记私聊消息为已读
  const autoMarkPrivateMessagesAsRead = async (notification: APINotification) => {
    if (notification.name !== 'channel_message' || notification.details?.type !== 'pm') {
      return;
    }

    // 计算文本相似度的简单函数
    const calculateTextSimilarity = (text1: string, text2: string): number => {
      if (text1 === text2) return 1.0;
      if (text1.length === 0 || text2.length === 0) return 0.0;

      // 使用最长公共子序列算法
      const longerText = text1.length > text2.length ? text1 : text2;
      const shorterText = text1.length > text2.length ? text2 : text1;
      
      let matches = 0;
      const shorterLength = shorterText.length;
      
      // 简单的滑动窗口匹配
      for (let i = 0; i <= longerText.length - shorterLength; i++) {
        const window = longerText.substring(i, i + shorterLength);
        if (window === shorterText) {
          matches = shorterLength;
          break;
        }
        
        // 计算字符匹配数
        let charMatches = 0;
        for (let j = 0; j < shorterLength; j++) {
          if (window[j] === shorterText[j]) {
            charMatches++;
          }
        }
        matches = Math.max(matches, charMatches);
      }
      
      return matches / shorterLength;
    };

    // 消息去重函数
    const deduplicateMessages = (messages: ChatMessage[]): ChatMessage[] => {
      const uniqueMessages: ChatMessage[] = [];
      const seenContents = new Set<string>();
      
      messages.forEach(message => {
        const normalizedContent = message.content
          .trim()
          .replace(/\s+/g, ' ')
          .toLowerCase();
        
        // 检查是否已经有相似的内容
        let isDuplicate = false;
        for (const seenContent of seenContents) {
          const similarity = calculateTextSimilarity(normalizedContent, seenContent);
          if (similarity > 0.9) { // 90%以上相似度认为是重复
            isDuplicate = true;
            //console.log('发现重复消息:', {
            // messageId: message.message_id,
             // content: message.content.substring(0, 30),
             // similarity: similarity.toFixed(2)
            //});
            break;
          }
        }
        
        if (!isDuplicate) {
          uniqueMessages.push(message);
          seenContents.add(normalizedContent);
        }
      });
      
      console.log(`消息去重: 原始 ${messages.length} 条，去重后 ${uniqueMessages.length} 条`);
      return uniqueMessages;
    };

    try {
      const channelId = parseInt(notification.object_id.toString());
      const notificationTitle = notification.details?.title as string;
      
      console.log('开始自动标记私聊消息为已读:', {
        channelId,
        notificationTitle,
        notificationId: notification.id
      });

      // 查找对应的私聊频道
      const targetChannel = channels.find(ch => ch.channel_id === channelId && ch.type === 'PM');
      
      if (!targetChannel) {
        console.log('未找到对应的私聊频道，跳过自动标记');
        return;
      }

      // 获取频道的所有消息
      const channelMessages = await chatAPI.getChannelMessages(channelId);
      
      if (!channelMessages || channelMessages.length === 0) {
        console.log('频道没有消息，跳过自动标记');
        return;
      }

      console.log(`频道 ${channelId} 共有 ${channelMessages.length} 条消息`);

      // 检查是否是当前选中的频道，如果是，用户已经"看到"了消息
      const isCurrentlyViewingChannel = selectedChannel?.channel_id === channelId;
      
      // 清理和标准化文本的函数
      const normalizeText = (text: string) => {
        return text
          .trim()                          // 移除前后空白
          .replace(/\s+/g, ' ')           // 多个空格合并为一个
          .replace(/[^\w\s\u4e00-\u9fff]/g, '') // 移除特殊字符，保留中文、字母、数字
          .toLowerCase();                  // 转换为小写
      };

      // 查找包含通知标题内容的消息
      const matchingMessages = channelMessages.filter((message: ChatMessage) => {
        if (!notificationTitle || !message.content) {
          return false;
        }

        // 标准化文本进行比较
        const normalizedTitle = normalizeText(notificationTitle);
        const normalizedContent = normalizeText(message.content);
        
        // 多种匹配策略
        const exactMatch = normalizedContent === normalizedTitle;
        const contentIncludesTitle = normalizedContent.includes(normalizedTitle);
        const titleIncludesContent = normalizedTitle.includes(normalizedContent);
        
        // 相似度匹配（简单版本）
        const similarity = calculateTextSimilarity(normalizedTitle, normalizedContent);
        const similarityMatch = similarity > 0.8; // 80%以上相似度
        
        const isMatch = exactMatch || contentIncludesTitle || titleIncludesContent || similarityMatch;
        
        if (isMatch) {
          console.log('找到匹配的消息:', {
            messageId: message.message_id,
            content: message.content.substring(0, 50),
            notificationTitle,
            matchType: exactMatch ? 'exact' : 
                      contentIncludesTitle ? 'content_includes_title' :
                      titleIncludesContent ? 'title_includes_content' : 
                      'similarity',
            similarity: similarity.toFixed(2)
          });
        }
        
        return isMatch;
      });

      // 对匹配的消息进行去重（基于内容相似性）
      const uniqueMessages = deduplicateMessages(matchingMessages);

      let shouldMarkAsRead = false;
      let maxMessageIdToMark = 0;

      if (uniqueMessages.length > 0) {
        // 如果找到匹配的消息，标记到最新的匹配消息
        maxMessageIdToMark = Math.max(...uniqueMessages.map((m: ChatMessage) => m.message_id));
        shouldMarkAsRead = true;
        console.log(`找到 ${uniqueMessages.length} 条唯一匹配消息（原始 ${matchingMessages.length} 条），将标记到消息ID: ${maxMessageIdToMark}`);
      } else if (isCurrentlyViewingChannel) {
        // 如果用户正在查看该频道，标记所有消息为已读
        maxMessageIdToMark = Math.max(...channelMessages.map((m: ChatMessage) => m.message_id));
        shouldMarkAsRead = true;
        console.log(`用户正在查看频道 ${channelId}，标记所有消息为已读，最大消息ID: ${maxMessageIdToMark}`);
      }

      if (shouldMarkAsRead && maxMessageIdToMark > 0) {
        // 检查是否需要更新已读状态
        const currentLastReadId = targetChannel.last_read_id || 0;
        
        if (maxMessageIdToMark > currentLastReadId) {
          console.log(`准备标记频道 ${channelId} 消息 ${maxMessageIdToMark} 为已读 (当前已读: ${currentLastReadId})`);
          
          // 调用API标记为已读
          await chatAPI.markAsRead(channelId, maxMessageIdToMark);
          console.log(`成功标记频道 ${channelId} 消息 ${maxMessageIdToMark} 为已读`);
          
          // 更新本地频道状态
          updateChannelReadStatus(channelId, maxMessageIdToMark);
          
          // 删除相关通知
          try {
            console.log(`删除已处理的通知: ${notification.id}`);
            await removeNotificationByObject(notification.object_id, notification.object_type);
          } catch (error) {
            console.error(`删除通知失败: ${notification.id}`, error);
          }
        } else {
          console.log(`消息 ${maxMessageIdToMark} 已经被标记为已读 (当前已读: ${currentLastReadId})`);
        }
      } else {
        console.log('没有找到需要标记的消息或用户未查看该频道');
      }
      
    } catch (error) {
      console.error('自动标记私聊消息已读失败:', error);
    }
  };

  // 批量处理私聊通知标记已读
  const batchMarkPrivateNotificationsAsRead = async () => {
    console.log('开始批量处理私聊通知...');
    let privateNotifications = notifications.filter(notification => 
      notification.name === 'channel_message' && 
      notification.details?.type === 'pm'
    );

    console.log(`找到 ${privateNotifications.length} 个私聊通知需要处理`);

    if (privateNotifications.length === 0) {
      toast(t('messages.toasts.noPrivateNotifications'));
      return;
    }

    // 对通知进行去重处理（基于频道ID和内容相似性）
    const deduplicatedNotifications = deduplicateNotifications(privateNotifications);
    console.log(`通知去重: 原始 ${privateNotifications.length} 个，去重后 ${deduplicatedNotifications.length} 个`);

    let processedCount = 0;
    let errorCount = 0;

    for (const notification of deduplicatedNotifications) {
      try {
        console.log(`处理私聊通知 ${notification.id}: ${notification.details?.title}`);
        await autoMarkPrivateMessagesAsRead(notification);
        processedCount++;
        
        // 添加小延迟避免API请求过快
        await new Promise(resolve => setTimeout(resolve, 200));
      } catch (error) {
        console.error(`处理通知 ${notification.id} 失败:`, error);
        errorCount++;
      }
    }

    // 显示处理结果
    const resultMessage = t('messages.toasts.processResult', {
      success: processedCount,
      fail: errorCount,
    });
    console.log(resultMessage);
    
    if (errorCount > 0) {
      toast.error(resultMessage);
    } else {
      toast.success(resultMessage);
    }

    // 刷新通知列表
    setTimeout(() => {
      refresh();
    }, 1000);
  };

  // 通知去重函数
  const deduplicateNotifications = (notifications: APINotification[]): APINotification[] => {
    const uniqueNotifications: APINotification[] = [];
    const seenCombinations = new Set<string>();
    
    notifications.forEach(notification => {
      // 创建基于频道ID和标题的唯一标识
      const channelId = notification.object_id;
      const title = (notification.details?.title as string) || '';
      const normalizedTitle = title.trim().replace(/\s+/g, ' ').toLowerCase();
      
      // 组合键：频道ID + 标准化标题
      const combinationKey = `${channelId}-${normalizedTitle}`;
      
      if (!seenCombinations.has(combinationKey)) {
        seenCombinations.add(combinationKey);
        uniqueNotifications.push(notification);
        console.log('保留通知:', {
          id: notification.id,
          channelId,
          title: title.substring(0, 30),
          combinationKey
        });
      } else {
        console.log('跳过重复通知:', {
          id: notification.id,
          channelId,
          title: title.substring(0, 30),
          combinationKey
        });
      }
    });
    
    return uniqueNotifications;
  };

  // 获取通知标题
  const getNotificationTitle = useCallback((notification: APINotification): string => {
    const fallback = (key: string) => t(`messages.notificationsPanel.fallbacks.${key}`);
    const resolveTitle = (value: unknown, fallbackKey: string) =>
      typeof value === 'string' && value.trim().length > 0 ? value : fallback(fallbackKey);

    let userName = t('messages.sidebar.unknownUser');
    if (notification.source_user_id) {
      const cachedUser = apiCache.getCachedUser(notification.source_user_id);
      if (cachedUser) {
        userName = cachedUser.username || t('messages.sidebar.unknownUser');
      }
    }

    switch (notification.name) {
      case 'team_application_store':
        return t('messages.notificationsPanel.titles.teamApplication');
      case 'team_application_accept':
        return t('messages.notificationsPanel.titles.teamApplicationAccept');
      case 'team_application_reject':
        return t('messages.notificationsPanel.titles.teamApplicationReject');
      case 'channel_message':
        if (notification.details?.type === 'pm') {
          return t('messages.notificationsPanel.titles.privateMessage', { userName });
        }
        if (notification.details?.type === 'team') {
          return t('messages.notificationsPanel.titles.teamMessage', {
            title: resolveTitle(notification.details?.title, 'teamChannel'),
          });
        }
        return t('messages.notificationsPanel.titles.privateMessage', { userName });
      case 'channel_team':
        return t('messages.notificationsPanel.titles.teamMessage', {
          title: resolveTitle(notification.details?.title, 'teamChannel'),
        });
      case 'channel_public':
        return t('messages.notificationsPanel.titles.publicMessage', {
          title: resolveTitle(notification.details?.title, 'publicChannel'),
        });
      case 'channel_private':
        return t('messages.notificationsPanel.titles.privateChannelMessage', {
          title: resolveTitle(notification.details?.title, 'privateChannel'),
        });
      case 'channel_multiplayer':
        return t('messages.notificationsPanel.titles.multiplayerMessage', {
          title: resolveTitle(notification.details?.title, 'multiplayer'),
        });
      case 'channel_spectator':
        return t('messages.notificationsPanel.titles.spectatorMessage', {
          title: resolveTitle(notification.details?.title, 'spectator'),
        });
      case 'channel_temporary':
        return t('messages.notificationsPanel.titles.temporaryChannelMessage', {
          title: resolveTitle(notification.details?.title, 'temporary'),
        });
      case 'channel_group':
        return t('messages.notificationsPanel.titles.groupMessage', {
          title: resolveTitle(notification.details?.title, 'group'),
        });
      case 'channel_system':
        return t('messages.notificationsPanel.titles.systemMessage', {
          title: resolveTitle(notification.details?.title, 'system'),
        });
      case 'channel_announce':
        return t('messages.notificationsPanel.titles.announcementMessage', {
          title: resolveTitle(notification.details?.title, 'announcement'),
        });
      default:
        return notification.name;
    }
  }, [t]);

  // 获取通知内容
  const getNotificationContent = useCallback((notification: APINotification): string => {
    const fallback = (key: string) => t(`messages.notificationsPanel.fallbacks.${key}`);
    const resolveTitle = (value: unknown, fallbackKey: string) =>
      typeof value === 'string' && value.trim().length > 0 ? value : fallback(fallbackKey);

    let userName = t('messages.sidebar.unknownUser');
    if (notification.source_user_id) {
      const cachedUser = apiCache.getCachedUser(notification.source_user_id);
      if (cachedUser) {
        userName = cachedUser.username || t('messages.sidebar.unknownUser');
      }
    }

    switch (notification.name) {
      case 'team_application_store':
        return t('messages.notificationsPanel.contents.teamApplication', { userName });
      case 'team_application_accept':
        return t('messages.notificationsPanel.contents.teamApplicationAccept', {
          teamName: resolveTitle(notification.details?.title, 'teamChannel'),
        });
      case 'team_application_reject':
        return t('messages.notificationsPanel.contents.teamApplicationReject');
      case 'channel_message':
        if (notification.details?.type === 'pm') {
          const messageContent = notification.details.title as string;
          const messageUrl = notification.details.url as string;
          const placeholders = [
            t('messages.notificationsPanel.contents.privateMessageSourceRaw'),
            userName,
            t('messages.notificationsPanel.contents.privateMessageSourceLabel'),
          ];

          if (typeof messageContent === 'string' && messageContent.trim() && !placeholders.includes(messageContent)) {
            if (messageContent.length >= 36) {
              return t('messages.notificationsPanel.contents.privateMessageTruncated', {
                userName,
                message: messageContent,
              });
            }
            return t('messages.notificationsPanel.contents.privateMessage', {
              userName,
              message: messageContent,
            });
          }

          if (typeof messageUrl === 'string' && messageUrl.trim().length > 0) {
            return t('messages.notificationsPanel.contents.privateMessageWithId', {
              userName,
              id: notification.object_id,
            });
          }

          return t('messages.notificationsPanel.contents.privateMessageFallback', { userName });
        }

        if (notification.details?.type === 'team') {
          return t('messages.notificationsPanel.contents.teamChannel', {
            title: resolveTitle(notification.details?.title, 'teamMessage'),
          });
        }

        return t('messages.notificationsPanel.contents.genericFrom', {
          source: resolveTitle(notification.details?.title, 'unknownSource'),
        });
      case 'channel_team':
        return t('messages.notificationsPanel.contents.teamChannel', {
          title: resolveTitle(notification.details?.title, 'teamMessage'),
        });
      case 'channel_public':
        return t('messages.notificationsPanel.contents.publicChannel', {
          title: resolveTitle(notification.details?.title, 'publicMessage'),
        });
      case 'channel_private':
        return t('messages.notificationsPanel.contents.privateChannel', {
          title: resolveTitle(notification.details?.title, 'privateMessage'),
        });
      case 'channel_multiplayer':
        return t('messages.notificationsPanel.contents.multiplayerChannel', {
          title: resolveTitle(notification.details?.title, 'multiplayerMessage'),
        });
      case 'channel_spectator':
        return t('messages.notificationsPanel.contents.spectatorChannel', {
          title: resolveTitle(notification.details?.title, 'spectatorMessage'),
        });
      case 'channel_temporary':
        return t('messages.notificationsPanel.contents.temporaryChannel', {
          title: resolveTitle(notification.details?.title, 'temporaryMessage'),
        });
      case 'channel_group':
        return t('messages.notificationsPanel.contents.groupChannel', {
          title: resolveTitle(notification.details?.title, 'groupMessage'),
        });
      case 'channel_system':
        return t('messages.notificationsPanel.contents.systemChannel', {
          title: resolveTitle(notification.details?.title, 'systemMessage'),
        });
      case 'channel_announce':
        return t('messages.notificationsPanel.contents.announcementChannel', {
          title: resolveTitle(notification.details?.title, 'announcementMessage'),
        });
      default:
        return JSON.stringify(notification.details);
    }
  }, [t]);

  // 辅助函数：检查用户信息是否在apiCache中
  const hasUserInfoInCache = useCallback((userId: number): boolean => {
    return apiCache.hasCachedUser(userId);
  }, []);

  // 辅助函数：从apiCache获取用户信息
  const getUserInfoFromCache = useCallback((userId: number): { username: string } | null => {
    return apiCache.getCachedUser(userId);
  }, []);

  // 处理团队请求
  const handleTeamRequest = async (notification: APINotification, action: 'accept' | 'reject') => {
    try {
      const teamId = parseInt(notification.object_id);
      const userId = notification.source_user_id;
      
      if (!userId) {
        toast.error(t('messages.toasts.teamRequestMissingUser'));
        return;
      }

      if (action === 'accept') {
        await teamsAPI.acceptJoinRequest(teamId, userId);
        toast.success(t('messages.toasts.teamRequestAcceptSuccess'));
      } else {
        await teamsAPI.rejectJoinRequest(teamId, userId);
        toast.success(t('messages.toasts.teamRequestRejectSuccess'));
      }

      // 标记通知为已读
      await markAsRead(notification.id);
    } catch (error) {
      console.error('处理团队请求失败:', error);
      toast.error(
        t('messages.toasts.teamRequestActionFailed', {
          action: action === 'accept' ? t('messages.actions.accept') : t('messages.actions.reject'),
        })
      );
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            {t('messages.loginRequired.title')}
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            {t('messages.loginRequired.description')}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-[calc(100vh-8rem)] md:h-[calc(100vh-4rem)] max-h-[calc(100vh-8rem)] md:max-h-[calc(100vh-4rem)] overflow-hidden bg-gray-50 dark:bg-gray-900">
      {/* 侧边栏 */}
      <AnimatePresence>
        {showSidebar && (
          <motion.div
            initial={{ x: isMobile ? -320 : 0, opacity: isMobile ? 0 : 1 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: isMobile ? -320 : 0, opacity: isMobile ? 0 : 1 }}
            transition={{ duration: 0.3 }}
            className={`
              ${isMobile ? 'fixed inset-y-0 left-0 z-50' : 'relative'}
              w-80 bg-card border-r border-card
              flex flex-col ${isMobile ? 'h-screen max-h-screen' : 'h-[calc(100vh-4rem)] max-h-[calc(100vh-4rem)]'}
            `}
          >
            {/* 侧边栏头部 */}
            <div className="p-4 border-b border-card">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <h1 className="text-xl font-bold text-gray-900 dark:text-white">
                    {t('messages.sidebar.title')}
                  </h1>
                  {/* WebSocket连接状态 */}
                  {/* <div className="flex items-center space-x-1">
                    <div className={`w-2 h-2 rounded-full ${chatConnected ? 'bg-green-500' : 'bg-red-500'}`} />
                  </div> */}
                </div>
                {isMobile && (
                  <button
                    onClick={() => setShowSidebar(false)}
                    aria-label={t('common.close')}
                    className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                  >
                    <FiX size={20} />
                  </button>
                )}
              </div>

              {/* 标签页切换 */}
              <div className="flex space-x-1 bg-gray-100 dark:bg-gray-700 p-1 rounded-lg">
                <button
                  onClick={() => setActiveTab('channels')}
                  className={`
                    flex-1 flex items-center justify-center space-x-2 py-2 px-3 rounded-md text-sm font-medium
                    transition-all duration-200
                    ${activeTab === 'channels'
                      ? 'bg-white dark:bg-gray-600 text-osu-pink shadow-sm'
                      : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'
                    }
                  `}
                >
                  <FiMessageCircle size={16} />
                  <span>{t('messages.sidebar.tabs.channels')}</span>
                </button>
                <button
                  onClick={() => setActiveTab('notifications')}
                  className={`
                    flex-1 flex items-center justify-center space-x-2 py-2 px-3 rounded-md text-sm font-medium
                    transition-all duration-200 relative
                    ${activeTab === 'notifications'
                      ? 'bg-white dark:bg-gray-600 text-osu-pink shadow-sm'
                      : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'
                    }
                  `}
                >
                  <FiBell size={16} />
                  <span>{t('messages.sidebar.tabs.notifications')}</span>
                  {unreadCount.total > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                      {unreadCount.total > 99 ? '99+' : unreadCount.total}
                    </span>
                  )}
                </button>
              </div>
            </div>

            {/* 内容区域 */}
            <div className="flex-1 overflow-hidden">
              {activeTab === 'channels' ? (
                <div className="h-full flex flex-col">
                  {/* 频道过滤器和新建按钮 */}
                  <div className="p-4 border-b border-card space-y-3">
                    <div className="grid grid-cols-2 gap-1 text-xs">
                      {filterOptions.map(filter => (
                        <button
                          key={filter.key}
                          onClick={() => setChannelFilter(filter.key)}
                          className={`
                            py-1.5 px-2 rounded text-center font-medium transition-all duration-200
                            ${channelFilter === filter.key
                              ? 'bg-osu-pink text-white'
                              : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                            }
                          `}
                        >
                          {filter.label}
                        </button>
                      ))}
                    </div>
                    
                    {/* 刷新频道列表按钮 */}
                    <button
                      onClick={async () => {
                        console.log('手动刷新频道列表');
                        try {
                          const channels = await chatAPI.getChannels();
                          console.log('手动刷新后的频道列表:', channels);
                          const pmChannels = channels.filter((ch: ChatChannel) => ch.type === 'PM');
                          console.log('手动刷新后的私聊频道数量:', pmChannels.length);
                          if (pmChannels.length > 0) {
                            console.log('私聊频道详情:', pmChannels.map((ch: ChatChannel) => ({ 
                              id: ch.channel_id, 
                              name: ch.name, 
                              type: ch.type,
                              users: ch.users 
                            })));
                          }
                          
                          // 重新排序频道：倒序排列，频道在前，最下面是第一个
                          const sortedChannels = channels.sort((a: ChatChannel, b: ChatChannel) => {
                            // 优先级：公共频道 > 私聊 > 团队 > 私有
                            const typeOrder: Record<string, number> = { 'PUBLIC': 0, 'PM': 1, 'TEAM': 2, 'PRIVATE': 3 };
                            const aOrder = typeOrder[a.type] || 4;
                            const bOrder = typeOrder[b.type] || 4;
                            
                            if (aOrder !== bOrder) {
                              // 倒序排列：较大的 order 值在前
                              return bOrder - aOrder;
                            }
                            
                            // 同类型内按名称倒序排列
                            return b.name.localeCompare(a.name);
                          });
                          
                          setChannels(sortedChannels);
                          
                          // 清理重复的私聊频道
                          setTimeout(() => {
                            cleanupDuplicatePrivateChannels();
                          }, 100);
                          
                          toast.success(
                            t('messages.toasts.refreshChannelsSuccess', {
                              total: channels.length,
                              privateCount: pmChannels.length,
                            })
                          );
                        } catch (error) {
                          console.error('手动刷新失败:', error);
                          toast.error(t('messages.toasts.refreshFailed'));
                        }
                      }}
                      className="w-full flex items-center justify-center space-x-2 py-2 px-3 bg-green-500/10 text-green-500 hover:bg-green-500/20 rounded-lg transition-colors text-sm font-medium"
                      title={t('messages.sidebar.tooltips.refreshChannels')}
                      aria-label={t('messages.sidebar.tooltips.refreshChannels')}
                    >
                      <FiRefreshCw size={16} />
                      <span>{t('messages.sidebar.actions.refreshChannels')}</span>
                    </button>

                    {/* 新建私聊按钮 */}
                    <button
                      onClick={() => setShowNewPMModal(true)}
                      className="w-full flex items-center justify-center space-x-2 py-2 px-3 bg-osu-pink/10 text-osu-pink hover:bg-osu-pink/20 rounded-lg transition-colors text-sm font-medium"
                    >
                      <FiPlus size={16} />
                      <span>{t('messages.sidebar.actions.newPrivateChat')}</span>
                    </button>
                  </div>

                  {/* 频道列表 */}
                  <div className="flex-1 overflow-y-auto">
                    {isLoading ? (
                      <div className="p-4 text-center text-gray-500 dark:text-gray-400">
                        {t('messages.sidebar.states.loading')}
                      </div>
                    ) : filteredChannels.length === 0 ? (
                      <div className="p-4 text-center text-gray-500 dark:text-gray-400">
                        {t('messages.sidebar.states.noChannels')}
                      </div>
                    ) : (
                      <div className="space-y-1 p-2">
                        {filteredChannels.map(channel => (
                          <ChannelItem
                            key={channel.channel_id}
                            channel={channel}
                            isSelected={selectedChannel?.channel_id === channel.channel_id}
                            onClick={() => selectChannel(channel)}
                          />
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                /* 通知列表 */
                <div className="flex flex-col h-full">
                  {/* 通知操作按钮 */}
                  <div className="p-2 border-b border-card space-y-2">
                    <button
                      onClick={() => {
                        console.log('手动刷新通知列表');
                        refresh(); // 调用通知刷新函数
                      }}
                      className="w-full flex items-center justify-center space-x-2 py-2 px-3 bg-blue-500/10 text-blue-500 hover:bg-blue-500/20 rounded-lg transition-colors text-sm font-medium"
                      title={t('messages.sidebar.tooltips.refreshNotifications')}
                      aria-label={t('messages.sidebar.tooltips.refreshNotifications')}
                    >
                      <FiRefreshCw size={16} />
                      <span>{t('messages.sidebar.actions.refreshNotifications')}</span>
                    </button>
                    
                    {/* 批量标记私聊已读按钮 */}
                    <button
                      onClick={batchMarkPrivateNotificationsAsRead}
                      className="w-full flex items-center justify-center space-x-2 py-2 px-3 bg-purple-500/10 text-purple-500 hover:bg-purple-500/20 rounded-lg transition-colors text-sm font-medium"
                      title={t('messages.sidebar.tooltips.markPrivateRead')}
                      aria-label={t('messages.sidebar.tooltips.markPrivateRead')}
                    >
                      <FiCheck size={16} />
                      <span>{t('messages.sidebar.actions.markPrivateRead')}</span>
                    </button>
                  </div>
                  
                  <div className="flex-1 overflow-y-auto min-h-0">
                    {notifications.length === 0 ? (
                      <div className="p-4 text-center text-gray-500 dark:text-gray-400">
                        {t('messages.sidebar.states.noNotifications')}
                      </div>
                    ) : (
                      <div className="space-y-1 p-2">
                        {notifications.map((notification, index) => (
                          <div
                            key={`notification-${notification.object_type}-${notification.object_id}-${notification.source_user_id || 'no-user'}-${index}`}
                            className="p-3 rounded-lg border border-card bg-card"
                          >
                            <div className="flex items-start space-x-3">
                              <div className="flex-shrink-0">
                                {/* 显示用户头像或默认图标 */}
                                {notification.source_user_id && hasUserInfoInCache(notification.source_user_id) ? (
                                  <img
                                    src={userAPI.getAvatarUrl(notification.source_user_id)}
                                    alt={t('messages.sidebar.avatarAlt')}
                                    className="w-10 h-10 rounded-lg object-cover"
                                    onError={(e) => {
                                      // 如果头像加载失败，显示默认图标
                                      e.currentTarget.style.display = 'none';
                                      e.currentTarget.nextElementSibling?.classList.remove('hidden');
                                    }}
                                  />
                                ) : null}
                                
                                {/* 默认图标 - 在没有用户信息或头像加载失败时显示 */}
                                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                                  notification.source_user_id && hasUserInfoInCache(notification.source_user_id) ? 'hidden' : ''
                                } ${
                                  notification.name.includes('team_application') 
                                    ? 'bg-orange-500/20' 
                                    : notification.name.includes('channel') 
                                    ? 'bg-blue-500/20' 
                                    : 'bg-gray-500/20'
                                }`}>
                                  {notification.name.includes('team_application') && (
                                    <FiUserPlus className="text-orange-500" size={20} />
                                  )}
                                  {notification.name.includes('channel') && (
                                    <FiMessageCircle className="text-blue-500" size={20} />
                                  )}
                                  {!notification.name.includes('team_application') && !notification.name.includes('channel') && (
                                    <FiBell className="text-gray-500" size={20} />
                                  )}
                                </div>
                              </div>
                              
                              <div className="flex-1 min-w-0">
                                <h3 className="font-medium text-gray-900 dark:text-white">
                                  {getNotificationTitle(notification)}
                                </h3>
                                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                                  {getNotificationContent(notification)}
                                </p>
                                
                                {/* 显示发送者信息 */}
                                {notification.source_user_id && hasUserInfoInCache(notification.source_user_id) && (
                                  <div className="flex items-center space-x-2 mt-2">
                                    <span className="text-xs text-gray-500 dark:text-gray-400">
                                      {t('messages.sidebar.from')}
                                    </span>
                                    <span className="text-xs font-medium text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30 px-2 py-0.5 rounded">
                                      {(() => {
                                        // 从缓存获取用户名
                                        const cachedUser = getUserInfoFromCache(notification.source_user_id!);
                                        return cachedUser?.username || t('messages.sidebar.unknownUser');
                                      })()}
                                    </span>
                                  </div>
                                )}
                                
                                <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                                  {new Date(notification.created_at).toLocaleString()}
                                </p>
                                
                                {notification.name === 'team_application_store' && (
                                  <div className="flex space-x-2 mt-3">
                                    <button
                                      onClick={() => handleTeamRequest(notification, 'accept')}
                                      className="flex items-center space-x-1 px-3 py-1.5 bg-green-500 text-white text-sm rounded-md hover:bg-green-600 transition-colors"
                                    >
                                      <FiCheck size={14} />
                                      <span>{t('messages.actions.accept')}</span>
                                    </button>
                                    <button
                                      onClick={() => handleTeamRequest(notification, 'reject')}
                                      className="flex items-center space-x-1 px-3 py-1.5 bg-red-500 text-white text-sm rounded-md hover:bg-red-600 transition-colors"
                                    >
                                      <FiX size={14} />
                                      <span>{t('messages.actions.reject')}</span>
                                    </button>
                                  </div>
                                )}

                                {!notification.is_read && (
                                  <button
                                    onClick={() => handleNotificationMarkAsRead(notification)}
                                    className="text-xs text-osu-pink hover:text-osu-pink/80 mt-2"
                                  >
                                    {t('messages.sidebar.markAsRead')}
                                  </button>
                                )}
                              </div>
                          </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 主内容区域 */}
      <div className="flex-1 flex flex-col h-[calc(100vh-8rem)] md:h-[calc(100vh-4rem)] max-h-[calc(100vh-8rem)] md:max-h-[calc(100vh-4rem)] overflow-hidden">
        {selectedChannel ? (
          <>
            {/* 聊天头部 */}
            <div className="mt-[2px] h-16 bg-card border-b border-card flex items-center px-4 flex-shrink-0">
              <div className="flex items-center space-x-3">
                {isMobile && (
                  <button
                    onClick={() => setShowSidebar(true)}
                    className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                  >
                    <FiChevronLeft size={20} />
                  </button>
                )}
                <div>
                  <h2 className="font-semibold text-gray-900 dark:text-white">
                    {selectedChannel.name}
                  </h2>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {selectedChannel.type === 'PM'
                      ? t('messages.sidebar.channelTypes.private')
                      : selectedChannel.type === 'TEAM'
                        ? t('messages.sidebar.channelTypes.team')
                        : t('messages.sidebar.channelTypes.public')}
                  </p>
                </div>
              </div>
            </div>

            {/* 消息列表 */}
            <div className="flex-1 overflow-y-auto p-4 min-h-0">
              {messages.map((message, index) => {
                const prevMessage = messages[index - 1];
                
                // 改进消息分组逻辑
                let isGrouped = false;
                if (prevMessage && prevMessage.sender_id === message.sender_id) {
                  const timeDiff = new Date(message.timestamp).getTime() - new Date(prevMessage.timestamp).getTime();
                  // 临时禁用分组功能进行调试
                  isGrouped = false; // timeDiff < 300000; // 5分钟内才分组，而不是1分钟
                  console.log(`消息分组检查: ${message.message_id}, 时间差: ${timeDiff}ms, 是否分组: ${isGrouped}`);
                }
                
                return (
                  <div key={`message-${message.message_id}-${message.channel_id}-${index}`} data-message-id={message.message_id}>
                    <MessageBubble
                      message={message}
                      currentUser={user || undefined}
                      isGrouped={isGrouped}
                    />
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>

            {/* 消息输入框 */}
            <div className="flex-shrink-0">
              <MessageInput
                onSendMessage={sendMessage}
                disabled={!selectedChannel?.current_user_attributes?.can_message}
                placeholder={
                  selectedChannel?.current_user_attributes?.can_message_error ||
                  t('messages.chat.placeholder')
                }
                maxLength={selectedChannel?.message_length_limit || 1000}
              />
            </div>
          </>
        ) : (
          /* 未选择频道时的占位内容 */
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              {isMobile && (
                <button
                  onClick={() => setShowSidebar(true)}
                  className="mb-4 p-3 bg-osu-pink text-white rounded-lg"
                  aria-label={t('messages.sidebar.openSidebar')}
                >
                  <FiMessageCircle size={24} />
                </button>
              )}
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                {t('messages.sidebar.selectPromptTitle')}
              </h3>
              <p className="text-gray-500 dark:text-gray-400">
                {t('messages.sidebar.selectPromptDescription')}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* 移动端遮罩 */}
      {isMobile && showSidebar && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={() => setShowSidebar(false)}
        />
      )}

      {/* 新建私聊模态框 */}
      <PrivateMessageModal
        isOpen={showNewPMModal}
        onClose={() => setShowNewPMModal(false)}
        onMessageSent={async (newChannel) => {
          console.log('私聊消息发送成功，新频道:', newChannel);
          
          if (isAuthenticated && newChannel) {
            try {
              // 重新加载频道列表
              console.log('重新加载频道列表以包含新私聊频道');
              const channels = await chatAPI.getChannels();
              console.log('重新加载后的频道列表:', channels);
              
              // 过滤并排序频道：倒序排列，频道在前，最下面是第一个
              const sortedChannels = channels.sort((a: ChatChannel, b: ChatChannel) => {
                // 优先级：公共频道 > 私聊 > 团队 > 私有
                const typeOrder: Record<string, number> = { 'PUBLIC': 0, 'PM': 1, 'TEAM': 2, 'PRIVATE': 3 };
                const aOrder = typeOrder[a.type] || 4;
                const bOrder = typeOrder[b.type] || 4;
                
                if (aOrder !== bOrder) {
                  // 倒序排列：较大的 order 值在前
                  return bOrder - aOrder;
                }
                
                // 同类型内按名称倒序排列
                return b.name.localeCompare(a.name);
              });
              
              setChannels(sortedChannels);
              
              // 自动选择新创建的私聊频道
              console.log('自动选择新创建的私聊频道:', newChannel.name);
              await selectChannel(newChannel);
              
              // 确保消息被正确加载
              console.log('私聊频道选择完成，开始加载消息');
            } catch (error) {
              console.error('处理新私聊频道失败:', error);
              toast.error(t('messages.toasts.loadPrivateChannelFailed'));
            }
          }
        }}
        currentUser={user || undefined}
      />
    </div>
  );
};

export default MessagesPage;
