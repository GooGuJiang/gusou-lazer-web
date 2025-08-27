import React, { useState, useRef } from 'react';

interface MessageInputProps {
  onSendMessage: (content: string, isAction?: boolean) => Promise<void>;
  placeholder?: string;
  maxLength?: number;
  disabled?: boolean;
}

export const MessageInput: React.FC<MessageInputProps> = ({
  onSendMessage,
  placeholder = "Type a message...",
  maxLength = 2000,
  disabled = false
}) => {
  const [message, setMessage] = useState('');
  const [isSending, setIsSending] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    
    if (!message.trim() || isSending || disabled) return;

    const content = message.trim();
    const isAction = content.startsWith('/me ');
    const finalContent = isAction ? content.slice(4) : content;

    if (!finalContent) return;

    setIsSending(true);
    try {
      await onSendMessage(finalContent, isAction);
      setMessage('');
      
      // Reset textarea height
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
      }
    } catch (error) {
      console.error('Failed to send message:', error);
      // Could show error notification here
    } finally {
      setIsSending(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    
    if (value.length <= maxLength) {
      setMessage(value);
    }

    // Auto-resize textarea
    const textarea = e.target;
    textarea.style.height = 'auto';
    textarea.style.height = Math.min(textarea.scrollHeight, 120) + 'px';
  };

  const isActionMessage = message.trim().startsWith('/me ');
  const characterCount = message.length;
  const isOverLimit = characterCount > maxLength;

  return (
    <div className="border-t border-gray-200 dark:border-gray-700 p-3">
      <form onSubmit={handleSubmit} className="space-y-2">
        <div className="relative">
          <textarea
            ref={textareaRef}
            value={message}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            disabled={disabled || isSending}
            className={`w-full resize-none border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm 
              bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100
              placeholder-gray-500 dark:placeholder-gray-400
              focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
              disabled:opacity-50 disabled:cursor-not-allowed
              ${isOverLimit ? 'border-red-500 focus:ring-red-500' : ''}
              ${isActionMessage ? 'font-italic' : ''}
            `}
            rows={1}
            style={{ minHeight: '38px', maxHeight: '120px' }}
          />

          {/* Send button */}
          <button
            type="submit"
            disabled={!message.trim() || isSending || disabled || isOverLimit}
            className="absolute right-2 bottom-2 p-1 rounded-md transition-colors
              disabled:opacity-50 disabled:cursor-not-allowed
              enabled:hover:bg-gray-100 dark:enabled:hover:bg-gray-600
              enabled:text-blue-500 disabled:text-gray-400"
            title="Send message (Enter)"
          >
            {isSending ? (
              <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
            ) : (
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
            )}
          </button>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between text-xs text-gray-500">
          <div className="flex items-center space-x-2">
            {isActionMessage && (
              <span className="text-purple-500">Action message</span>
            )}
            <span>
              Press Enter to send, Shift+Enter for new line
            </span>
          </div>
          
          <div className={`${isOverLimit ? 'text-red-500' : ''}`}>
            {characterCount}/{maxLength}
          </div>
        </div>

        {/* Commands help */}
        {message.startsWith('/') && message.length > 1 && !isActionMessage && (
          <div className="text-xs text-gray-500 bg-gray-50 dark:bg-gray-700 p-2 rounded border">
            <div className="font-medium mb-1">Available commands:</div>
            <div>/me [action] - Send an action message</div>
          </div>
        )}
      </form>
    </div>
  );
};
