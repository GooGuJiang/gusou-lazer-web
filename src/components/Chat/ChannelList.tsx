import React from 'react';
import type { Channel } from '../../types/chat';

interface ChannelListProps {
  channels: Channel[];
  currentChannelId?: number;
  unreadCounts: Map<number, number>;
  onChannelSelect: (channelId: number) => void;
  isConnected: boolean;
}

export const ChannelList: React.FC<ChannelListProps> = ({
  channels,
  currentChannelId,
  unreadCounts,
  onChannelSelect,
  isConnected
}) => {
  const getChannelIcon = (type: string) => {
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

  const getChannelTypeColor = (type: string) => {
    switch (type) {
      case 'public':
        return 'text-blue-500';
      case 'pm':
        return 'text-green-500';
      case 'multiplayer':
        return 'text-purple-500';
      case 'spectator':
        return 'text-orange-500';
      case 'group':
        return 'text-pink-500';
      default:
        return 'text-gray-500';
    }
  };

  // Sort channels: public first, then by activity
  const sortedChannels = [...channels].sort((a, b) => {
    // Public channels first
    if (a.type === 'public' && b.type !== 'public') return -1;
    if (b.type === 'public' && a.type !== 'public') return 1;
    
    // Then by last message activity
    const aLastMessage = a.last_message_id || 0;
    const bLastMessage = b.last_message_id || 0;
    return bLastMessage - aLastMessage;
  });

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="p-3 border-b border-gray-200 dark:border-gray-700">
        <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300">
          Channels
        </h3>
        <div className="flex items-center mt-1">
          <div className={`w-2 h-2 rounded-full mr-2 ${isConnected ? 'bg-green-500' : 'bg-red-500'}`} />
          <span className="text-xs text-gray-500">
            {isConnected ? 'Connected' : 'Disconnected'}
          </span>
        </div>
      </div>

      {/* Channel List */}
      <div className="flex-1 overflow-y-auto">
        {sortedChannels.length === 0 ? (
          <div className="p-4 text-center text-gray-500 text-sm">
            No channels available
          </div>
        ) : (
          <div className="space-y-1 p-2">
            {sortedChannels.map((channel) => {
              const unreadCount = unreadCounts.get(channel.channel_id) || 0;
              const isActive = currentChannelId === channel.channel_id;
              
              return (
                <button
                  key={channel.channel_id}
                  onClick={() => onChannelSelect(channel.channel_id)}
                  className={`w-full text-left p-2 rounded-md transition-colors group ${
                    isActive
                      ? 'bg-blue-500 text-white'
                      : 'hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300'
                  }`}
                  title={channel.description || channel.name}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center min-w-0 flex-1">
                      <span className={`text-sm mr-2 ${isActive ? 'text-white' : getChannelTypeColor(channel.type)}`}>
                        {getChannelIcon(channel.type)}
                      </span>
                      <span className="text-sm font-medium truncate">
                        {channel.name}
                      </span>
                    </div>
                    
                    {/* Unread count */}
                    {unreadCount > 0 && (
                      <span className={`ml-2 px-2 py-1 text-xs rounded-full font-medium ${
                        isActive
                          ? 'bg-white bg-opacity-20 text-white'
                          : 'bg-red-500 text-white'
                      }`}>
                        {unreadCount > 99 ? '99+' : unreadCount}
                      </span>
                    )}
                  </div>
                  
                  {/* Channel description or type indicator */}
                  {channel.description && (
                    <div className={`text-xs mt-1 truncate ${
                      isActive ? 'text-white text-opacity-80' : 'text-gray-500'
                    }`}>
                      {channel.description}
                    </div>
                  )}
                  
                  {/* Moderated indicator */}
                  {channel.moderated && (
                    <div className={`text-xs mt-1 ${
                      isActive ? 'text-white text-opacity-80' : 'text-yellow-600 dark:text-yellow-400'
                    }`}>
                      🛡️ Moderated
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Add Channel Button (for future use) */}
      <div className="p-2 border-t border-gray-200 dark:border-gray-700">
        <button
          className="w-full p-2 text-sm text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md transition-colors"
          title="Join Channel"
          disabled={!isConnected}
        >
          + Join Channel
        </button>
      </div>
    </div>
  );
};
