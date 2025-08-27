import React, { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react';
import type { 
  ChatState, 
  Channel, 
  Message, 
  User, 
  NewChatMessageData,
  ChannelJoinData,
  ChannelPartData,
  NotificationItem
} from '../types/chat';
import { OsuWebSocketClient } from '../utils/osu-websocket';
import { ChannelManager } from '../utils/channel-manager';
import { MessageManager } from '../utils/message-manager';
import { NotificationClient, ChatUpdateClient } from '../utils/notification-client';

interface ChatContextType {
  // State
  state: ChatState;
  currentChannel: Channel | null;
  isConnecting: boolean;
  
  // Channel operations
  switchChannel: (channelId: number) => Promise<void>;
  joinChannel: (channelId: string | number, userId: number) => Promise<void>;
  leaveChannel: (channelId: string | number, userId: number) => Promise<void>;
  fetchChannels: () => Promise<void>;
  fetchMessages: (channelId: string | number, options?: {
    limit?: number;
    since?: number;
    until?: number;
  }) => Promise<void>;
  
  // Message operations
  sendMessage: (channelId: string | number, content: string, isAction?: boolean) => Promise<void>;
  createPrivateChat: (targetUserId: number, content: string, isAction?: boolean) => Promise<void>;
  markAsRead: (channelId: number) => Promise<void>;
  
  // Connection
  connect: (websocketUrl: string, token: string, userId: number) => Promise<void>;
  disconnect: () => void;
  
  // Notifications
  notifications: NotificationItem[];
  markNotificationsAsRead: (notificationIds: number[]) => Promise<void>;
}

const ChatContext = createContext<ChatContextType | null>(null);

export const useChatContext = () => {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error('useChatContext must be used within a ChatProvider');
  }
  return context;
};

interface ChatProviderProps {
  children: React.ReactNode;
}

export const ChatProvider: React.FC<ChatProviderProps> = ({ children }) => {
  // State
  const [state, setState] = useState<ChatState>({
    channels: new Map(),
    messages: new Map(),
    currentChannel: undefined,
    isConnected: false,
    users: new Map(),
    unreadCounts: new Map()
  });
  
  const [currentChannel, setCurrentChannel] = useState<Channel | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  
  // Refs for managers
  const wsClient = useRef<OsuWebSocketClient | null>(null);
  const channelManager = useRef<ChannelManager>(new ChannelManager());
  const messageManager = useRef<MessageManager | null>(null);
  const notificationClient = useRef<NotificationClient | null>(null);
  const updateClient = useRef<ChatUpdateClient>(new ChatUpdateClient());
  const currentUserId = useRef<number | null>(null);

  // Update state from managers
  const updateState = useCallback(() => {
    setState({
      channels: new Map(channelManager.current.getAllChannels().map(c => [c.channel_id, c])),
      messages: new Map(channelManager.current.getAllChannels().map(c => [c.channel_id, channelManager.current.getMessages(c.channel_id)])),
      currentChannel: state.currentChannel,
      isConnected: wsClient.current?.isConnected() || false,
      users: new Map(), // Will be updated from channel manager
      unreadCounts: new Map(channelManager.current.getAllChannels().map(c => [c.channel_id, channelManager.current.getUnreadCount(c.channel_id)]))
    });
  }, [state.currentChannel]);

  // WebSocket event handlers
  const handleChannelJoin = useCallback((data: ChannelJoinData) => {
    channelManager.current.addChannel(data.channel);
    updateState();
  }, [updateState]);

  const handleChannelPart = useCallback((data: ChannelPartData) => {
    // Don't remove channel, just update state
    updateState();
  }, [updateState]);

  const handleNewMessage = useCallback((data: NewChatMessageData) => {
    // Add users first
    channelManager.current.addUsers(data.users);
    
    // Process messages and assign sender information
    const messagesWithSender = data.messages.map(message => {
      const sender = data.users.find(user => user.id === message.sender_id);
      return { ...message, sender };
    });
    
    messagesWithSender.forEach(message => {
      if (messageManager.current) {
        messageManager.current.handleIncomingMessage(message);
      }
      channelManager.current.addMessage(message);
      
      // Increment unread count if not current channel
      if (state.currentChannel !== message.channel_id) {
        channelManager.current.incrementUnreadCount(message.channel_id);
      }
    });
    
    updateState();
  }, [state.currentChannel, updateState]);

  const handleWebSocketConnected = useCallback(() => {
    setState(prev => ({ ...prev, isConnected: true }));
    
    // Fetch initial data
    fetchChannels();
    
    // Start periodic updates
    startPeriodicUpdates();
  }, []);

  const handleWebSocketDisconnected = useCallback(() => {
    setState(prev => ({ ...prev, isConnected: false }));
  }, []);

  const handleWebSocketError = useCallback((error: string) => {
    console.error('WebSocket error:', error);
    setState(prev => ({ ...prev, isConnected: false }));
  }, []);

  // Message manager callbacks
  const handleMessageSent = useCallback((message: Message) => {
    // Replace local echo with real message
    channelManager.current.addMessage(message);
    updateState();
  }, [updateState]);

  const handleMessageFailed = useCallback((uuid: string, error: string) => {
    console.error('Message failed:', uuid, error);
    // Could show error notification here
  }, []);

  const handleMessageReceived = useCallback((message: Message) => {
    channelManager.current.addMessage(message);
    updateState();
  }, [updateState]);

  // Notification handlers
  const handleNotification = useCallback((notification: NotificationItem) => {
    setNotifications(prev => [notification, ...prev]);
  }, []);

  // Periodic updates
  const startPeriodicUpdates = useCallback(async () => {
    try {
      const updates = await updateClient.current.getUpdates();
      
      if (updates.presence) {
        channelManager.current.addUsers(updates.presence);
      }
      
      if (updates.messages) {
        updates.messages.forEach(message => {
          if (messageManager.current) {
            messageManager.current.handleIncomingMessage(message);
          }
          channelManager.current.addMessage(message);
        });
      }
      
      updateState();
    } catch (error) {
      console.error('Failed to get updates:', error);
    }
  }, [updateState]);

  // Public methods
  const connect = useCallback(async (fallbackWebsocketUrl: string, token: string, userId: number) => {
    if (isConnecting || state.isConnected) return;
    
    setIsConnecting(true);
    currentUserId.current = userId;
    
    try {
      // Initialize managers
      messageManager.current = new MessageManager(
        handleMessageSent,
        handleMessageFailed,
        handleMessageReceived
      );
      
      notificationClient.current = new NotificationClient();
      
      // First connect to notification client to get WebSocket endpoint
      if (notificationClient.current) {
        notificationClient.current.on('notification', handleNotification);
        await notificationClient.current.connect();
      }
      
      // Get WebSocket URL from notification endpoint or use fallback
      const websocketUrl = notificationClient.current?.getNotificationEndpoint() || fallbackWebsocketUrl;
      
      // Setup WebSocket client
      wsClient.current = new OsuWebSocketClient(websocketUrl, token);
      wsClient.current.on('chat.channel.join', handleChannelJoin);
      wsClient.current.on('chat.channel.part', handleChannelPart);
      wsClient.current.on('chat.message.new', handleNewMessage);
      wsClient.current.on('connected', handleWebSocketConnected);
      wsClient.current.on('disconnected', handleWebSocketDisconnected);
      wsClient.current.on('error', handleWebSocketError);
      
      // Connect WebSocket
      await wsClient.current.connect();
      
    } catch (error) {
      console.error('Failed to connect chat:', error);
      throw error;
    } finally {
      setIsConnecting(false);
    }
  }, [isConnecting, state.isConnected, handleChannelJoin, handleChannelPart, handleNewMessage, handleWebSocketConnected, handleWebSocketDisconnected, handleWebSocketError, handleMessageSent, handleMessageFailed, handleMessageReceived, handleNotification]);

  const disconnect = useCallback(() => {
    if (wsClient.current) {
      wsClient.current.disconnect();
      wsClient.current = null;
    }
    
    if (notificationClient.current) {
      notificationClient.current.disconnect();
      notificationClient.current = null;
    }
    
    channelManager.current.clear();
    updateClient.current.reset();
    setNotifications([]);
    
    setState({
      channels: new Map(),
      messages: new Map(),
      currentChannel: undefined,
      isConnected: false,
      users: new Map(),
      unreadCounts: new Map()
    });
    
    setCurrentChannel(null);
  }, []);

  const switchChannel = useCallback(async (channelId: number) => {
    const channel = channelManager.current.getChannel(channelId);
    if (channel) {
      setCurrentChannel(channel);
      setState(prev => ({ ...prev, currentChannel: channelId }));
      
      // Mark as read
      await markAsRead(channelId);
      
      // Load recent messages if not already loaded
      const messages = channelManager.current.getMessages(channelId);
      if (messages.length === 0) {
        try {
          await fetchMessages(channelId, { limit: 50 });
        } catch (error) {
          console.error('Failed to load messages for channel:', error);
        }
      }
    }
  }, []);

  const fetchChannels = useCallback(async () => {
    try {
      await channelManager.current.fetchChannels();
      updateState();
    } catch (error) {
      console.error('Failed to fetch channels:', error);
      throw error;
    }
  }, [updateState]);

  const fetchMessages = useCallback(async (channelId: string | number, options = {}) => {
    try {
      await channelManager.current.fetchMessages(channelId, options);
      updateState();
    } catch (error) {
      console.error('Failed to fetch messages:', error);
      throw error;
    }
  }, [updateState]);

  const joinChannel = useCallback(async (channelId: string | number, userId: number) => {
    try {
      await channelManager.current.joinChannel(channelId, userId);
      updateState();
    } catch (error) {
      console.error('Failed to join channel:', error);
      throw error;
    }
  }, [updateState]);

  const leaveChannel = useCallback(async (channelId: string | number, userId: number) => {
    try {
      await channelManager.current.leaveChannel(channelId, userId);
      updateState();
    } catch (error) {
      console.error('Failed to leave channel:', error);
      throw error;
    }
  }, [updateState]);

  const sendMessage = useCallback(async (channelId: string | number, content: string, isAction = false) => {
    if (!messageManager.current || !currentUserId.current) {
      throw new Error('Chat not initialized');
    }
    
    try {
      await messageManager.current.sendMessage(channelId, content, isAction, currentUserId.current);
    } catch (error) {
      console.error('Failed to send message:', error);
      throw error;
    }
  }, []);

  const createPrivateChat = useCallback(async (targetUserId: number, content: string, isAction = false) => {
    if (!messageManager.current || !currentUserId.current) {
      throw new Error('Chat not initialized');
    }
    
    try {
      const result = await messageManager.current.createPrivateChat(targetUserId, content, isAction, currentUserId.current);
      // Refresh channels to get the new private channel
      await fetchChannels();
      return result;
    } catch (error) {
      console.error('Failed to create private chat:', error);
      throw error;
    }
  }, [fetchChannels]);

  const markAsRead = useCallback(async (channelId: number) => {
    const messages = channelManager.current.getMessages(channelId);
    if (messages.length > 0) {
      const lastMessage = messages[messages.length - 1];
      try {
        await channelManager.current.markMessageAsRead(channelId, lastMessage.message_id);
        updateState();
      } catch (error) {
        console.error('Failed to mark as read:', error);
        throw error;
      }
    }
  }, [updateState]);

  const markNotificationsAsRead = useCallback(async (notificationIds: number[]) => {
    if (!notificationClient.current) return;
    
    try {
      await notificationClient.current.markNotificationsAsRead(notificationIds);
      // Remove marked notifications from the list since they're considered "read"
      setNotifications(prev => 
        prev.filter(notification => !notificationIds.includes(notification.id))
      );
    } catch (error) {
      console.error('Failed to mark notifications as read:', error);
      throw error;
    }
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      disconnect();
    };
  }, [disconnect]);

  const contextValue: ChatContextType = {
    state,
    currentChannel,
    isConnecting,
    switchChannel,
    joinChannel,
    leaveChannel,
    fetchChannels,
    fetchMessages,
    sendMessage,
    createPrivateChat,
    markAsRead,
    connect,
    disconnect,
    notifications,
    markNotificationsAsRead
  };

  return (
    <ChatContext.Provider value={contextValue}>
      {children}
    </ChatContext.Provider>
  );
};
