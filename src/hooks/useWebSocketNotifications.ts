import { useState, useEffect, useRef, useCallback } from 'react';
import { notificationsAPI } from '../utils/api';
import { isRecord } from '../utils/typeGuards';
import type { 
  SocketMessage, 
  ChatEvent, 
  NotificationEvent, 
  APINotification,
  ChatMessage,
  User
} from '../types';
import { showCustomToast } from '../components/customToastUtils';

// 生成唯一通知 ID 的函数
let notificationIdCounter = 0;
const generateUniqueNotificationId = (): number => {
  return Date.now() * 10000 + (++notificationIdCounter % 10000);
};


const toOptionalString = (value: unknown): string | undefined => typeof value === 'string' ? value : undefined;
const toStringValue = (value: unknown): string => typeof value === 'string' ? value : String(value ?? '');
const toNumberValue = (value: unknown): number => typeof value === 'number' ? value : Number(value ?? 0);
const toBooleanValue = (value: unknown): boolean => typeof value === 'boolean' ? value : Boolean(value);
const getTitleFromDetails = (details: unknown): string | undefined => {
  if (!isRecord(details)) return undefined;
  return typeof details.title === 'string' ? details.title : undefined;
};
const toChatMessage = (value: unknown): ChatMessage | null => {
  if (!isRecord(value)) return null;
  if (!('message_id' in value) || !('channel_id' in value) || !('content' in value) || !('sender_id' in value) || !('timestamp' in value)) return null;
  return {
    message_id: toNumberValue(value.message_id),
    channel_id: toNumberValue(value.channel_id),
    content: toStringValue(value.content),
    timestamp: toStringValue(value.timestamp),
    sender_id: toNumberValue(value.sender_id),
    is_action: toBooleanValue(value.is_action),
    sender: isRecord(value.sender) ? value.sender as User : undefined,
    uuid: toOptionalString(value.uuid),
  };
};

interface UseWebSocketNotificationsProps {
  isAuthenticated: boolean;
  currentUser?: User | null;
  onNewMessage?: (message: ChatMessage) => void;
  onNewNotification?: (notification: APINotification) => void;
}

// ---------------- 全局单例状态，防止重复建立多个 WebSocket 连接 ----------------
let globalWsRef: WebSocket | null = null; // 共享连接
let globalConnecting = false; // 连接中标记
let globalIsConnected = false; // 全局连接状态
let globalConnectionError: string | null = null; // 全局连接错误
const globalMessageListeners = new Set<(m: ChatMessage) => void>();
const globalNotificationListeners = new Set<(n: APINotification) => void>();
const globalConnectionStateListeners = new Set<(connected: boolean, error: string | null) => void>(); // 连接状态监听器
let globalEndpointCache: string | null = null; // 端点缓存

// 分发函数
const dispatchChatMessage = (msg: ChatMessage) => {
  if (globalMessageListeners.size === 0) {
    messageBuffer.push(msg);
    return;
  }
  globalMessageListeners.forEach(fn => { try { fn(msg); } catch (e) { console.error('分发聊天消息给监听器失败', e); } });
};
const dispatchNotification = (n: APINotification) => {
  if (globalNotificationListeners.size === 0) {
    notificationBuffer.push(n);
    return;
  }
  globalNotificationListeners.forEach(fn => { try { fn(n); } catch (e) { console.error('分发通知给监听器失败', e); } });
};
const dispatchConnectionState = (connected: boolean, error: string | null) => {
  globalIsConnected = connected;
  globalConnectionError = error;
  globalConnectionStateListeners.forEach(fn => { try { fn(connected, error); } catch (e) { console.error('分发连接状态给监听器失败', e); } });
};

// 缓冲队列（在监听器尚未挂载时暂存）
const messageBuffer: ChatMessage[] = [];
const notificationBuffer: APINotification[] = [];

export const useWebSocketNotifications = ({
  isAuthenticated,
  currentUser,
  onNewMessage,
  onNewNotification
}: UseWebSocketNotificationsProps) => {
  const [isConnected, setIsConnected] = useState(globalIsConnected);
  const [connectionError, setConnectionError] = useState<string | null>(globalConnectionError);
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const reconnectAttemptsRef = useRef(0);
  const maxReconnectAttempts = 5;
  const reconnectDelayBase = 1000;
  const endpointCacheRef = useRef<string | null>(null);
  const lastConnectAttemptRef = useRef<number>(0);
  const connectionThrottleMs = 2000; // 2秒内不重复连接

  // 获取WebSocket端点（带缓存）
  const getWebSocketEndpoint = useCallback(async (): Promise<string | null> => {
    if (!isAuthenticated) {
      endpointCacheRef.current = null;
      globalEndpointCache = null;
      return null;
    }
    // 先用全局缓存
    if (globalEndpointCache) return globalEndpointCache;
    if (endpointCacheRef.current) return endpointCacheRef.current;
    try {
      const response = await notificationsAPI.getNotifications();
      endpointCacheRef.current = response.notification_endpoint;
      globalEndpointCache = endpointCacheRef.current;
      return endpointCacheRef.current;
    } catch (error) {
      console.error('Failed to get notification endpoint:', error);
      return null;
    }
  }, [isAuthenticated]);

  // 发送消息到WebSocket
  const sendMessage = useCallback((message: SocketMessage) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(message));
    }
  }, []);

  // 处理WebSocket消息
  const handleMessage = useCallback((event: MessageEvent) => {
    try {
      const message: SocketMessage = JSON.parse(event.data);
      console.log('WebSocket收到原始消息:', message);
      
  // 处理各种聊天消息事件
      if (message.event === 'chat.message.new' || 
          message.event === 'new_message' || 
          message.event === 'message') {
        const chatEvent = message as ChatEvent;
        console.log('聊天事件数据:', chatEvent.data);
        
        if (chatEvent.data?.messages) {
          console.log('处理消息数组:', chatEvent.data.messages);
          chatEvent.data.messages.forEach(msg => {
            // 过滤自己的消息
            if (msg.sender_id && currentUser && msg.sender_id === currentUser.id) {
              console.log(`✓ 过滤自己的聊天消息: ${msg.message_id}, 发送者ID: ${msg.sender_id}`);
              return;
            }
            console.log('发送他人消息到回调:', msg);
            dispatchChatMessage(msg);
          });
        } else if (isRecord(chatEvent.data) && chatEvent.data.message) {
          // 可能是单个消息而不是数组
          const msg = toChatMessage(chatEvent.data.message);
          if (!msg) return;
          // 过滤自己的消息
          if (msg.sender_id && currentUser && msg.sender_id === currentUser.id) {
            console.log(`✓ 过滤自己的单个聊天消息: ${msg.message_id}, 发送者ID: ${msg.sender_id}`);
            return;
          }
          console.log('处理他人单个消息:', msg);
          dispatchChatMessage(msg);
        } else if (chatEvent.data && typeof chatEvent.data === 'object') {
          // 可能消息数据直接在data中
          const msg = chatEvent.data as ChatMessage;
          // 过滤自己的消息
          if (msg.sender_id && currentUser && msg.sender_id === currentUser.id) {
            console.log(`✓ 过滤自己的直接消息数据: ${msg.message_id}, 发送者ID: ${msg.sender_id}`);
            return;
          }
          console.log('处理他人直接消息数据:', msg);
          dispatchChatMessage(msg);
        }
      }
      // 处理直接的消息格式（服务器直接发送ChatMessage格式的数据）
      else if (message.data && 
               typeof message.data === 'object' && 
               'message_id' in message.data && 
               'channel_id' in message.data && 
               'content' in message.data && 
               'sender_id' in message.data && 
               'timestamp' in message.data) {
        // 服务器直接发送ChatMessage格式的消息
        console.log('处理直接ChatMessage格式:', message.data);
        const chatMessage: ChatMessage = {
          message_id: message.data.message_id as number,
          channel_id: message.data.channel_id as number,
          content: message.data.content as string,
          timestamp: message.data.timestamp as string,
          sender_id: message.data.sender_id as number,
          is_action: (message.data.is_action as boolean) || false,
          sender: isRecord(message.data.sender) ? message.data.sender as User : undefined,
          uuid: message.data.uuid as string | undefined
        };
        
        // 过滤自己的消息
        if (chatMessage.sender_id && currentUser && chatMessage.sender_id === currentUser.id) {
          console.log(`✓ 过滤自己的直接ChatMessage: ${chatMessage.message_id}, 发送者ID: ${chatMessage.sender_id}`);
          return;
        }
        
  dispatchChatMessage(chatMessage);
      }
      // 如果消息本身就是ChatMessage格式（没有嵌套在data中）
      else if ('message_id' in message && 
               'channel_id' in message && 
               'content' in message && 
               'sender_id' in message && 
               'timestamp' in message) {
        // 消息直接是ChatMessage格式
        console.log('处理直接消息格式（无嵌套）:', message);
        const chatMessage = toChatMessage(message);
        if (!chatMessage) return;
        
        // 过滤自己的消息
        if (chatMessage.sender_id && currentUser && chatMessage.sender_id === currentUser.id) {
          console.log(`✓ 过滤自己的无嵌套消息: ${chatMessage.message_id}, 发送者ID: ${chatMessage.sender_id}`);
          return;
        }
        
  dispatchChatMessage(chatMessage);
      }
      
      // 处理新通知
      else if (message.event === 'new_private_notification') {
        const notificationEvent = message as NotificationEvent;
        if (notificationEvent.data) {
          // 检查是否是自己的消息，如果是则不显示通知
          if (notificationEvent.data.source_user_id && currentUser && notificationEvent.data.source_user_id === currentUser.id) {
            console.log(`✓ 过滤自己的私人通知: ${notificationEvent.data.source_user_id}, 当前用户ID: ${currentUser.id}`);
            return;
          }

          const notification: APINotification = {
            id: generateUniqueNotificationId(),
            name: notificationEvent.data.name,
            created_at: new Date().toISOString(),
            object_type: notificationEvent.data.object_type,
            object_id: notificationEvent.data.object_id.toString(),
            source_user_id: notificationEvent.data.source_user_id,
            is_read: false,
            details: notificationEvent.data.details
          };
          
          dispatchNotification(notification);
          
          // 显示自定义通知提示
          const notificationTitle = getNotificationTitle(notification);
          if (notificationTitle) {
            showCustomToast({
              title: notificationTitle,
              message: '您有新的通知',
              sourceUserId: notification.source_user_id,
              type: 'default'
            });
          }
        }
      }
      
      // 处理新的通知事件（包括私聊通知）
      else if (message.event === 'new') {
        console.log('处理新通知事件:', message);
        
        if (message.data && typeof message.data === 'object') {
          const data = message.data;
          
          // 根据频道类型创建相应的通知
          if (data.category === 'channel' && data.name === 'channel_message') {
            const channelType = data.details?.type?.toLowerCase();
            console.log(`检测到频道通知，类型: ${channelType}`, data);
            
            let notificationName = 'channel_message';
            let defaultTitle = '频道消息';
            
            // 根据频道类型设置通知名称和默认标题
            switch (channelType) {
              case 'pm':
                notificationName = 'channel_message';
                defaultTitle = '私聊消息';
                break;
              case 'team':
                notificationName = 'channel_team';
                defaultTitle = '团队消息';
                break;
              case 'public':
                notificationName = 'channel_public';
                defaultTitle = '公共频道';
                break;
              case 'private':
                notificationName = 'channel_private';
                defaultTitle = '私有频道';
                break;
              case 'multiplayer':
                notificationName = 'channel_multiplayer';
                defaultTitle = '多人游戏';
                break;
              case 'spectator':
                notificationName = 'channel_spectator';
                defaultTitle = '观战频道';
                break;
              case 'temporary':
                notificationName = 'channel_temporary';
                defaultTitle = '临时频道';
                break;
              case 'group':
                notificationName = 'channel_group';
                defaultTitle = '群组频道';
                break;
              case 'system':
                notificationName = 'channel_system';
                defaultTitle = '系统频道';
                break;
              case 'announce':
                notificationName = 'channel_announce';
                defaultTitle = '公告频道';
                break;
              default:
                notificationName = 'channel_message';
                defaultTitle = '频道消息';
                break;
            }
            
            const notification: APINotification = {
              id: generateUniqueNotificationId(),
              name: notificationName,
              created_at: data.created_at || new Date().toISOString(),
              object_type: data.object_type || 'channel',
              object_id: data.object_id?.toString() || data.id?.toString(),
              source_user_id: data.source_user_id,
              is_read: data.is_read || false,
              details: {
                type: data.details?.type || channelType || 'unknown',
                title: data.details?.title || defaultTitle,
                cover_url: data.details?.cover_url || ''
              }
            };
            
            console.log(`创建${defaultTitle}通知对象:`, notification, '根据source_user_id判断是不是自己消息 - source_user_id:', notification.source_user_id);
            
            // 检查是否是自己的消息，如果是则不创建通知
            if (notification.source_user_id && currentUser && notification.source_user_id === currentUser.id) {
              console.log(`✓ 在WebSocket层过滤自己的消息通知: ${notification.id}, 发送者ID: ${notification.source_user_id}, 当前用户ID: ${currentUser.id}`);
              return; // 直接返回，不调用 onNewNotification
            }
            
            console.log(`✓ 准备发送他人的消息通知: ${notification.id}`);
            dispatchNotification(notification);
            
            // 显示自定义通知提示
            const notificationTitle = getNotificationTitle(notification);
            if (notificationTitle) {
              const toastType = channelType === 'pm' ? 'pm' : 
                              channelType === 'team' ? 'team' : 
                              channelType === 'public' ? 'public' : 'default';
              
              let toastMessage = '';
              switch (channelType) {
                case 'pm': {
                  // 显示实际的消息内容
                  const messageContent = getTitleFromDetails(data.details);
                  if (messageContent && messageContent.length > 0 && messageContent !== '来自用户') {
                    // 如果消息被截断，显示提示
                    if (messageContent.length >= 36) {
                      toastMessage = `${messageContent}... (可能有更多内容)`;
                    } else {
                      toastMessage = messageContent;
                    }
                  } else {
                    toastMessage = '发送了一条私聊消息';
                  }
                  break;
                }
                case 'team': {
                  const teamMessage = getTitleFromDetails(data.details);
                  toastMessage = teamMessage || '在团队频道发送了消息';
                  break;
                }
                case 'public': {
                  const publicMessage = getTitleFromDetails(data.details);
                  toastMessage = publicMessage || '在公共频道发送了消息';
                  break;
                }
                default: {
                  const generalMessage = getTitleFromDetails(data.details);
                  toastMessage = generalMessage || '发送了一条消息';
                  break;
                }
              }
              
              showCustomToast({
                title: channelType === 'pm' ? '新私聊消息' : notificationTitle,
                message: toastMessage,
                sourceUserId: notification.source_user_id,
                type: toastType
              });
            }
          }
          // 其他类型的通知
          else {
            console.log('检测到其他类型通知:', data);
            
            const notification: APINotification = {
              id: generateUniqueNotificationId(),
              name: data.name || 'unknown',
              created_at: data.created_at || new Date().toISOString(),
              object_type: data.object_type || 'unknown',
              object_id: data.object_id?.toString() || data.id?.toString(),
              source_user_id: data.source_user_id,
              is_read: data.is_read || false,
              details: data.details || {}
            };
            
            console.log('创建通用通知对象:', notification);
            
            // 检查是否是自己的消息，如果是则不显示通知
            if (notification.source_user_id && currentUser && notification.source_user_id === currentUser.id) {
              console.log(`✓ 过滤自己的通用通知: ${notification.id}, 发送者ID: ${notification.source_user_id}`);
              return;
            }
            
            dispatchNotification(notification);
            
            // 显示自定义通用通知提示
            const notificationTitle = getNotificationTitle(notification);
            if (notificationTitle) {
              showCustomToast({
                title: notificationTitle,
                message: '您有新的通知',
                sourceUserId: notification.source_user_id,
                type: 'default'
              });
            }
          }
        }
      }
      
      // 处理错误消息
      if (message.error) {
        console.error('WebSocket error:', message.error);
        setConnectionError(message.error);
      }
      
    } catch (error) {
      console.error('Failed to parse WebSocket message:', error);
    }
  }, [onNewMessage, onNewNotification, currentUser]);

  // 重新绑定处理函数（单例复用）
  useEffect(() => {
    if (globalWsRef) {
      console.log('[WebSocket] 重新绑定 onmessage 处理函数 (依赖更新, 单例)');
      globalWsRef.onmessage = handleMessage;
      wsRef.current = globalWsRef;
    }
  }, [handleMessage]);

  // 注册监听器（组件层）
  useEffect(() => {
    // 注册连接状态监听器
    const connectionStateListener = (connected: boolean, error: string | null) => {
      setIsConnected(connected);
      setConnectionError(error);
    };
    globalConnectionStateListeners.add(connectionStateListener);
    
    if (onNewMessage) {
      globalMessageListeners.add(onNewMessage);
    }
    if (onNewNotification) {
      globalNotificationListeners.add(onNewNotification);
    }
    // 回放缓冲（只在新增监听器时执行一次）
    if (onNewMessage && messageBuffer.length) {
      console.log(`[WebSocket] 回放缓冲消息 ${messageBuffer.length} 条`);
      messageBuffer.splice(0).forEach(m => { try { onNewMessage(m); } catch (error) { console.error('回放缓冲处理失败', error); } });
    }
    if (onNewNotification && notificationBuffer.length) {
      console.log(`[WebSocket] 回放缓冲通知 ${notificationBuffer.length} 条`);
      notificationBuffer.splice(0).forEach(n => { try { onNewNotification(n); } catch (error) { console.error('回放缓冲处理失败', error); } });
    }
    return () => {
      globalConnectionStateListeners.delete(connectionStateListener);
      if (onNewMessage) globalMessageListeners.delete(onNewMessage);
      if (onNewNotification) globalNotificationListeners.delete(onNewNotification);
      // 不再在每次监听器清理时立即关闭连接，避免由于组件重渲染导致的闪断。
      // 连接关闭交由 disconnect()（认证失效或真正卸载）管理。
    };
  }, [onNewMessage, onNewNotification]);

  // 获取通知标题
  const getNotificationTitle = (notification: APINotification): string => {
    switch (notification.name) {
      case 'team_application_store':
        return `${notification.details.title} 申请加入团队`;
      case 'team_application_accept':
        return `您的团队申请已被接受`;
      case 'team_application_reject':
        return `您的团队申请已被拒绝`;
      case 'channel_message':
        // 根据类型显示不同的标题
        if (notification.details?.type === 'pm') {
          return `新私聊消息: ${notification.details.title || '来自用户'}`;
        } else if (notification.details?.type === 'team') {
          return `新团队消息: ${notification.details.title || '团队频道'}`;
        }
        return `新私聊消息`;
      case 'channel_team':
        return `新团队消息: ${notification.details?.title || '团队频道'}`;
      case 'channel_public':
        return `新公共频道消息: ${notification.details?.title || '公共频道'}`;
      case 'channel_private':
        return `新私有频道消息: ${notification.details?.title || '私有频道'}`;
      case 'channel_multiplayer':
        return `新多人游戏消息: ${notification.details?.title || '多人游戏'}`;
      case 'channel_spectator':
        return `新观战频道消息: ${notification.details?.title || '观战频道'}`;
      case 'channel_temporary':
        return `新临时频道消息: ${notification.details?.title || '临时频道'}`;
      case 'channel_group':
        return `新群组消息: ${notification.details?.title || '群组频道'}`;
      case 'channel_system':
        return `新系统消息: ${notification.details?.title || '系统频道'}`;
      case 'channel_announce':
        return `新公告: ${notification.details?.title || '公告频道'}`;
      default:
        // 尝试从details中获取更有意义的标题
        if (notification.details?.title) {
          return `新通知: ${notification.details.title}`;
        }
        return '新通知';
    }
  };

  // WebSocket连接
  const connect = useCallback(async () => {
  if (!isAuthenticated) return;

    // 节流机制：避免频繁连接
    const now = Date.now();
  if (now - lastConnectAttemptRef.current < connectionThrottleMs) {
      console.log('连接请求过于频繁，已跳过');
      return;
    }
    lastConnectAttemptRef.current = now;

    // 若全局连接已存在并且未关闭，复用
    if (globalWsRef && (globalWsRef.readyState === WebSocket.OPEN || globalWsRef.readyState === WebSocket.CONNECTING)) {
      console.log('[WebSocket] 复用已有全局连接');
      wsRef.current = globalWsRef;
      if (globalWsRef.readyState === WebSocket.OPEN) {
        // 同步当前连接状态到本地状态
        setIsConnected(globalIsConnected);
        setConnectionError(globalConnectionError);
      }
      return;
    }
    if (globalConnecting) {
      console.log('[WebSocket] 已在建立连接中，跳过新建');
      return;
    }
    globalConnecting = true;

    const endpoint = await getWebSocketEndpoint();
    if (!endpoint) {
      dispatchConnectionState(false, 'Failed to get WebSocket endpoint');
      return;
    }

    try {
      dispatchConnectionState(false, null);
      
      // 构建WebSocket URL，添加认证参数
      const token = localStorage.getItem('access_token');
      if (!token) {
        dispatchConnectionState(false, 'No access token available');
        return;
      }

      // 确保endpoint是完整的WebSocket URL
      let wsUrl: string;
      if (endpoint.startsWith('ws://') || endpoint.startsWith('wss://')) {
        wsUrl = `${endpoint}?access_token=${encodeURIComponent(token)}`;
      } else {
        // 如果是相对路径，构建完整的WebSocket URL
        const baseUrl = window.location.protocol === 'https:' ? 'wss://' : 'ws://';
        const host = window.location.host;
        wsUrl = `${baseUrl}${host}${endpoint}?access_token=${encodeURIComponent(token)}`;
      }
  const ws = new WebSocket(wsUrl);
  globalWsRef = ws;
      
      ws.onopen = () => {
        console.log('WebSocket connected (单例)');
        dispatchConnectionState(true, null);
        reconnectAttemptsRef.current = 0;
        globalConnecting = false;
        
        // 发送启动消息
        ws.send(JSON.stringify({
          event: 'chat.start'
        }));
      };  ws.onmessage = handleMessage;

      ws.onclose = (event) => {
        console.log('WebSocket disconnected (单例):', event.code, event.reason);
        dispatchConnectionState(false, null);
        if (wsRef.current === ws) wsRef.current = null;
        if (globalWsRef === ws) globalWsRef = null;
        globalConnecting = false;
        
        // 自动重连
        if (isAuthenticated && (globalMessageListeners.size > 0 || globalNotificationListeners.size > 0) && reconnectAttemptsRef.current < maxReconnectAttempts) {
          const delay = reconnectDelayBase * Math.pow(2, reconnectAttemptsRef.current);
          reconnectAttemptsRef.current++;
          
          console.log(`Attempting to reconnect in ${delay}ms (attempt ${reconnectAttemptsRef.current})`);
          
          reconnectTimeoutRef.current = setTimeout(() => {
            connect();
          }, delay);
        } else {
          dispatchConnectionState(false, 'Connection lost and max reconnect attempts reached');
        }
      };

      ws.onerror = (error) => {
        console.error('WebSocket error (单例):', error);
        console.log('WebSocket URL:', wsUrl);
        console.log('Endpoint:', endpoint);
        dispatchConnectionState(false, `WebSocket connection error: ${endpoint}`);
      };

      wsRef.current = ws;
      
    } catch (error) {
      console.error('Failed to create WebSocket connection:', error);
      dispatchConnectionState(false, 'Failed to create WebSocket connection');
      globalConnecting = false;
    }
  }, [isAuthenticated, getWebSocketEndpoint, handleMessage]);

  // 断开连接
  const disconnect = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }
    // 只有当没有剩余监听器时才真正关闭全局连接
    const shouldClose = globalMessageListeners.size === 0 && globalNotificationListeners.size === 0;
    if (shouldClose && globalWsRef) {
      try {
        if (globalWsRef.readyState === WebSocket.OPEN) {
          globalWsRef.send(JSON.stringify({ event: 'chat.end' }));
        }
        globalWsRef.close();
      } catch { /* ignore */ }
      globalWsRef = null;
    }
    if (wsRef.current && wsRef.current !== globalWsRef) {
      try { wsRef.current.close(); } catch { /* ignore */ }
      wsRef.current = null;
    }
    globalConnecting = false;
    dispatchConnectionState(false, null);
    reconnectAttemptsRef.current = 0;
    
    // 清理缓存
    if (shouldClose) {
      endpointCacheRef.current = null;
      globalEndpointCache = null;
      lastConnectAttemptRef.current = 0;
    }
  }, []);

  // 管理连接状态
  useEffect(() => {
    if (isAuthenticated) {
      connect();
    } else {
      disconnect();
    }
    return () => {
      disconnect();
    };
  }, [isAuthenticated]);

  // 页面可见性变化时重连
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible' && isAuthenticated && !isConnected) {
        connect();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [isAuthenticated, isConnected, connect]);

  return {
    isConnected,
    connectionError,
    sendMessage,
    reconnect: connect
  };
};
