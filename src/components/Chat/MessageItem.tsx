import React from 'react';
import type { Message, User } from '../../types/chat';

interface MessageItemProps {
  message: Message;
  sender?: User;
  isOwnMessage: boolean;
  showHeader: boolean;
  isFirstInGroup: boolean;
}

export const MessageItem: React.FC<MessageItemProps> = ({
  message,
  sender,
  isOwnMessage,
  showHeader,
  isFirstInGroup
}) => {
  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const getUsernameColor = (username: string) => {
    // Generate consistent color based on username
    let hash = 0;
    for (let i = 0; i < username.length; i++) {
      hash = username.charCodeAt(i) + ((hash << 5) - hash);
    }
    
    const colors = [
      'text-red-500',
      'text-blue-500',
      'text-green-500',
      'text-purple-500',
      'text-pink-500',
      'text-indigo-500',
      'text-yellow-600',
      'text-orange-500'
    ];
    
    return colors[Math.abs(hash) % colors.length];
  };

  const isPending = message.message_id === -1;

  if (message.is_action) {
    // Action message (e.g., "/me does something")
    return (
      <div className={`text-sm italic text-gray-600 dark:text-gray-400 ${isFirstInGroup ? 'mt-4' : 'mt-1'}`}>
        <span className="text-xs text-gray-400 mr-2">
          {formatTime(message.timestamp)}
        </span>
        <span className={sender ? getUsernameColor(sender.username) : 'text-gray-500'}>
          {sender?.username || `User ${message.sender_id}`}
        </span>
        <span className="ml-1">{message.content}</span>
        {isPending && (
          <span className="ml-2 text-xs text-gray-400">Sending...</span>
        )}
      </div>
    );
  }

  return (
    <div className={`${isFirstInGroup ? 'mt-4' : 'mt-1'} ${isPending ? 'opacity-70' : ''}`}>
      {showHeader && (
        <div className="flex items-baseline space-x-2 mb-1">
          {/* Avatar */}
          <div className="w-6 h-6 rounded-full overflow-hidden flex-shrink-0">
            {sender?.avatar_url ? (
              <img
                src={sender.avatar_url}
                alt={sender.username}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-gray-300 dark:bg-gray-600 flex items-center justify-center text-xs font-bold text-gray-600 dark:text-gray-300">
                {sender?.username?.[0]?.toUpperCase() || '?'}
              </div>
            )}
          </div>

          {/* Username */}
          <span className={`text-sm font-semibold ${
            isOwnMessage 
              ? 'text-blue-600 dark:text-blue-400' 
              : sender ? getUsernameColor(sender.username) : 'text-gray-500'
          }`}>
            {sender?.username || `User ${message.sender_id}`}
          </span>

          {/* Timestamp */}
          <span className="text-xs text-gray-400">
            {formatTime(message.timestamp)}
          </span>

          {/* Status indicators */}
          {sender?.is_supporter && (
            <span className="text-xs bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200 px-1 rounded">
              ⭐
            </span>
          )}

          {sender?.is_bot && (
            <span className="text-xs bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200 px-1 rounded">
              BOT
            </span>
          )}

          {isPending && (
            <span className="text-xs text-gray-400">Sending...</span>
          )}
        </div>
      )}

      {/* Message content */}
      <div className={`text-sm text-gray-800 dark:text-gray-200 ${showHeader ? 'ml-8' : 'ml-8'}`}>
        <div className="break-words">
          {/* Format message content */}
          <span dangerouslySetInnerHTML={{
            __html: message.content
              .replace(/\n/g, '<br>')
              .replace(/(https?:\/\/[^\s]+)/g, '<a href="$1" target="_blank" rel="noopener noreferrer" class="text-blue-500 hover:underline">$1</a>')
              .replace(/@(\w+)/g, '<span class="bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 px-1 rounded">@$1</span>')
          }} />
        </div>

        {/* Message metadata */}
        {message.uuid && (
          <div className="text-xs text-gray-400 mt-1 opacity-0 group-hover:opacity-100 transition-opacity">
            ID: {message.message_id}
          </div>
        )}
      </div>
    </div>
  );
};
