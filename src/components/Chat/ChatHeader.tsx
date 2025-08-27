import React from 'react';
import type { Channel } from '../../types/chat';

interface ChatHeaderProps {
  currentChannel: Channel | null;
  isConnected: boolean;
  isConnecting: boolean;
  onToggleNotifications: () => void;
  onCollapse: () => void;
  showNotifications: boolean;
  onDebug?: () => void;
}

export const ChatHeader: React.FC<ChatHeaderProps> = ({
  currentChannel,
  isConnected,
  isConnecting,
  onToggleNotifications,
  onCollapse,
  showNotifications,
  onDebug
}) => {
  const getChannelTypeIcon = (type?: string) => {
    switch (type) {
      case 'public':
        return '#';
      case 'pm':
        return '@';
      case 'multiplayer':
        return '🎮';
      case 'spectator':
        return '👁️';
      case 'group':
        return '👥';
      default:
        return '#';
    }
  };

  const getStatusColor = () => {
    if (isConnecting) return 'text-yellow-500';
    return isConnected ? 'text-green-500' : 'text-red-500';
  };

  const getStatusText = () => {
    if (isConnecting) return 'Connecting...';
    return isConnected ? 'Connected' : 'Disconnected';
  };

  return (
    <div className="flex items-center justify-between p-3 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
      {/* Left side - Channel info */}
      <div className="flex items-center min-w-0 flex-1">
        {showNotifications ? (
          <div className="flex items-center">
            <svg className="w-4 h-4 mr-2 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-5 5v-5zM5.07 7H19.93a8 8 0 010 16H5.07A8 8 0 015.07 7z" />
            </svg>
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Notifications
            </span>
          </div>
        ) : currentChannel ? (
          <div className="flex items-center min-w-0">
            <span className="text-blue-500 mr-2 text-sm">
              {getChannelTypeIcon(currentChannel.type)}
            </span>
            <div className="min-w-0 flex-1">
              <h2 className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                {currentChannel.name}
              </h2>
              {currentChannel.description && (
                <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                  {currentChannel.description}
                </p>
              )}
            </div>
            {currentChannel.moderated && (
              <span className="ml-2 text-xs bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200 px-2 py-1 rounded">
                🛡️ Moderated
              </span>
            )}
          </div>
        ) : (
          <div className="flex items-center">
            <span className="text-sm text-gray-500">Chat</span>
          </div>
        )}
      </div>

      {/* Right side - Controls */}
      <div className="flex items-center space-x-2 ml-2">
        {/* Connection status */}
        <div className="flex items-center space-x-1">
          <div className={`w-2 h-2 rounded-full ${getStatusColor()}`} />
          <span className="text-xs text-gray-500 hidden sm:inline">
            {getStatusText()}
          </span>
        </div>

        {/* Notifications toggle */}
        <button
          onClick={onToggleNotifications}
          className={`p-1 rounded-md transition-colors ${
            showNotifications
              ? 'bg-blue-500 text-white'
              : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
          }`}
          title="Toggle notifications"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-5 5v-5zM5.07 7H19.93a8 8 0 010 16H5.07A8 8 0 015.07 7z" />
          </svg>
        </button>

        {/* Debug button (development only) */}
        {onDebug && process.env.NODE_ENV === 'development' && (
          <button
            onClick={onDebug}
            className="p-1 rounded-md text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            title="Debug WebSocket connection"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18.5L12 5.5M5.5 12L18.5 12" />
            </svg>
          </button>
        )}

        {/* Settings button (placeholder) */}
        <button
          className="p-1 rounded-md text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          title="Chat settings"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        </button>

        {/* Collapse button */}
        <button
          onClick={onCollapse}
          className="p-1 rounded-md text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          title="Minimize chat"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
          </svg>
        </button>
      </div>
    </div>
  );
};
