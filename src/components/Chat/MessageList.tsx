import React, { useEffect, useRef, useState } from 'react';
import type { Message, User } from '../../types/chat';
import { MessageItem } from './MessageItem';

interface MessageListProps {
  channelId: number;
  messages: Message[];
  users: Map<number, User>;
  currentUserId: number;
}

export const MessageList: React.FC<MessageListProps> = ({
  channelId,
  messages,
  users,
  currentUserId
}) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [isAtBottom, setIsAtBottom] = useState(true);
  const [showScrollToBottom, setShowScrollToBottom] = useState(false);

  // Auto-scroll to bottom when new messages arrive (if user is at bottom)
  useEffect(() => {
    if (isAtBottom && scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isAtBottom]);

  // Reset scroll position when channel changes
  useEffect(() => {
    setIsAtBottom(true);
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [channelId]);

  const handleScroll = () => {
    if (!scrollRef.current) return;

    const { scrollTop, scrollHeight, clientHeight } = scrollRef.current;
    const isNearBottom = scrollHeight - scrollTop - clientHeight < 50;
    
    setIsAtBottom(isNearBottom);
    setShowScrollToBottom(!isNearBottom && messages.length > 0);
  };

  const scrollToBottom = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
      setIsAtBottom(true);
      setShowScrollToBottom(false);
    }
  };

  // Group consecutive messages from the same user
  const groupedMessages = messages.reduce((groups: Message[][], message, index) => {
    const prevMessage = messages[index - 1];
    const shouldGroup = 
      prevMessage &&
      prevMessage.sender_id === message.sender_id &&
      !prevMessage.is_action &&
      !message.is_action &&
      new Date(message.timestamp).getTime() - new Date(prevMessage.timestamp).getTime() < 300000; // 5 minutes

    if (shouldGroup && groups.length > 0) {
      groups[groups.length - 1].push(message);
    } else {
      groups.push([message]);
    }

    return groups;
  }, []);

  if (messages.length === 0) {
    return (
      <div className="flex items-center justify-center h-full text-gray-500 text-sm">
        No messages yet. Start the conversation!
      </div>
    );
  }

  return (
    <div className="relative h-full">
      <div
        ref={scrollRef}
        onScroll={handleScroll}
        className="h-full overflow-y-auto p-4 space-y-4"
      >
        {groupedMessages.map((messageGroup, groupIndex) => {
          const firstMessage = messageGroup[0];
          const sender = firstMessage.sender || users.get(firstMessage.sender_id);
          const isOwnMessage = firstMessage.sender_id === currentUserId;

          return (
            <div key={`group-${groupIndex}`} className="group">
              <MessageItem
                message={firstMessage}
                sender={sender}
                isOwnMessage={isOwnMessage}
                showHeader={true}
                isFirstInGroup={true}
              />
              
              {/* Additional messages in the group */}
              {messageGroup.slice(1).map((message) => (
                <MessageItem
                  key={message.message_id}
                  message={message}
                  sender={sender}
                  isOwnMessage={isOwnMessage}
                  showHeader={false}
                  isFirstInGroup={false}
                />
              ))}
            </div>
          );
        })}
      </div>

      {/* Scroll to bottom button */}
      {showScrollToBottom && (
        <button
          onClick={scrollToBottom}
          className="absolute bottom-4 right-4 bg-blue-500 hover:bg-blue-600 text-white p-2 rounded-full shadow-lg transition-colors"
          title="Scroll to bottom"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
          </svg>
        </button>
      )}
    </div>
  );
};
