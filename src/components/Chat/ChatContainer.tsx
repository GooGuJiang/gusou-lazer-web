import React, { useState, useEffect } from 'react';
import { useChatContext } from '../../contexts/ChatContext';
import { ChannelList } from './ChannelList';
import { MessageList } from './MessageList';
import { MessageInput } from './MessageInput';
import { NotificationList } from './NotificationList';
import { ChatHeader } from './ChatHeader';
import { WebSocketDebugger } from '../../utils/websocket-debug';

interface ChatContainerProps {
  userId: number;
  websocketUrl: string;
  token: string;
  className?: string;
}

export const ChatContainer: React.FC<ChatContainerProps> = ({
  userId,
  websocketUrl,
  token,
  className = ''
}) => {
  const {
    state,
    currentChannel,
    isConnecting,
    connect,
    disconnect,
    switchChannel,
    sendMessage,
    fetchChannels,
    markAsRead
  } = useChatContext();

  const [showNotifications, setShowNotifications] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [showDebug, setShowDebug] = useState(false);

  // Connect on mount
  useEffect(() => {
    if (!state.isConnected && !isConnecting) {
      connect(websocketUrl, token, userId).catch(error => {
        console.error('Failed to connect to chat:', error);
      });
    }

    return () => {
      disconnect();
    };
  }, [connect, disconnect, websocketUrl, token, userId, state.isConnected, isConnecting]);

  // Auto-select first channel
  useEffect(() => {
    if (state.isConnected && !currentChannel && state.channels.size > 0) {
      const firstChannel = Array.from(state.channels.values())[0];
      switchChannel(firstChannel.channel_id);
    }
  }, [state.isConnected, currentChannel, state.channels, switchChannel]);

  const handleSendMessage = async (content: string, isAction: boolean = false) => {
    if (!currentChannel) return;
    
    try {
      await sendMessage(currentChannel.channel_id, content, isAction);
    } catch (error) {
      console.error('Failed to send message:', error);
      // Could show error toast here
    }
  };

  const handleChannelSelect = async (channelId: number) => {
    try {
      await switchChannel(channelId);
    } catch (error) {
      console.error('Failed to switch channel:', error);
    }
  };

  const handleDebugWebSocket = async () => {
    try {
      console.log('Starting WebSocket debug test...');
      await WebSocketDebugger.testConnection(websocketUrl, token);
    } catch (error) {
      console.error('WebSocket debug test failed:', error);
    }
  };

  if (isCollapsed) {
    return (
      <div className={`fixed bottom-4 right-4 z-50 ${className}`}>
        <button
          onClick={() => setIsCollapsed(false)}
          className="bg-blue-600 hover:bg-blue-700 text-white p-3 rounded-full shadow-lg transition-colors"
          title="Open Chat"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
          {/* Unread count badge */}
          {Array.from(state.unreadCounts.values()).reduce((sum, count) => sum + count, 0) > 0 && (
            <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
              {Array.from(state.unreadCounts.values()).reduce((sum, count) => sum + count, 0)}
            </span>
          )}
        </button>
      </div>
    );
  }

  return (
    <div className={`fixed bottom-4 right-4 w-96 h-[600px] bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-xl flex flex-col z-50 ${className}`}>
      {/* Header */}
      <ChatHeader
        currentChannel={currentChannel}
        isConnected={state.isConnected}
        isConnecting={isConnecting}
        onToggleNotifications={() => setShowNotifications(!showNotifications)}
        onCollapse={() => setIsCollapsed(true)}
        showNotifications={showNotifications}
        onDebug={handleDebugWebSocket}
      />

      <div className="flex flex-1 min-h-0">
        {/* Channel List */}
        <div className="w-1/3 border-r border-gray-200 dark:border-gray-700 flex flex-col">
          <ChannelList
            channels={Array.from(state.channels.values())}
            currentChannelId={currentChannel?.channel_id}
            unreadCounts={state.unreadCounts}
            onChannelSelect={handleChannelSelect}
            isConnected={state.isConnected}
          />
        </div>

        {/* Main Chat Area */}
        <div className="flex-1 flex flex-col">
          {showNotifications ? (
            <NotificationList />
          ) : (
            <>
              {/* Messages */}
              <div className="flex-1 min-h-0">
                {currentChannel ? (
                  <MessageList
                    channelId={currentChannel.channel_id}
                    messages={state.messages.get(currentChannel.channel_id) || []}
                    users={state.users}
                    currentUserId={userId}
                  />
                ) : (
                  <div className="flex items-center justify-center h-full text-gray-500">
                    {state.isConnected ? 'Select a channel to start chatting' : 'Connecting...'}
                  </div>
                )}
              </div>

              {/* Message Input */}
              {currentChannel && state.isConnected && (
                <MessageInput
                  onSendMessage={handleSendMessage}
                  placeholder={`Message ${currentChannel.name}...`}
                  maxLength={2000}
                />
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};
