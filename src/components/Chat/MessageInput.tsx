import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FiSend } from 'react-icons/fi';
import { useTranslation } from 'react-i18next';

interface MessageInputProps {
  onSendMessage: (message: string) => void;
  disabled?: boolean;
  placeholder?: string;
  maxLength?: number;
}

const MessageInput: React.FC<MessageInputProps> = ({
  onSendMessage,
  disabled = false,
  placeholder,
  maxLength = 1000
}) => {
  const { t } = useTranslation();
  const [message, setMessage] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const resolvedPlaceholder = placeholder ?? t('messages.chat.placeholder');

  // 自动调整输入框高度
  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      // 先重置高度以获取正确的 scrollHeight
      textarea.style.height = '48px';
      const newHeight = Math.min(Math.max(textarea.scrollHeight, 48), 120);
      textarea.style.height = `${newHeight}px`;
      // 确保没有滚动条
      textarea.style.overflowY = newHeight >= 120 ? 'auto' : 'hidden';
    }
  }, [message]);

  const handleSend = () => {
    if (!message.trim() || disabled) return;
    
    onSendMessage(message.trim());
    setMessage('');
    
    // 重置输入框高度
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = '48px'; // 回到最小高度
      textareaRef.current.style.overflowY = 'hidden';
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    // 处理粘贴事件，确保不超过最大长度
    const pastedText = e.clipboardData.getData('text');
    const currentLength = message.length;
    const remainingLength = maxLength - currentLength;
    
    if (pastedText.length > remainingLength) {
      e.preventDefault();
      const truncatedText = pastedText.substring(0, remainingLength);
      setMessage(prev => prev + truncatedText);
    }
  };

  return (
    <div className=" px-3 pt-3 pb-2 bg-card border-t border-gray-200 dark:border-gray-700">
      <div className="mb-3 flex items-end space-x-3">
        {/* 消息输入区域 */}
        <div className="flex-1 relative">
          <textarea
            ref={textareaRef}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            onPaste={handlePaste}
            placeholder={resolvedPlaceholder}
            disabled={disabled}
            maxLength={maxLength}
            className={`
              w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 
              border border-gray-200 dark:border-gray-600 rounded-lg 
              resize-none text-gray-900 dark:text-white 
              placeholder-gray-500 dark:placeholder-gray-400 
              focus:outline-none focus:ring-2 focus:ring-osu-pink focus:border-transparent
              transition-all duration-200 overflow-hidden
              [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]
              ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
            `}
            rows={1}
            style={{ 
              minHeight: '48px', 
              maxHeight: '120px',
              scrollbarWidth: 'none',
              msOverflowStyle: 'none',
            }}
          />
          
          {/* 字符计数 */}
          {message.length > maxLength * 0.8 && (
            <div className={`
              absolute right-3 top-1 text-xs
              ${message.length >= maxLength ? 'text-red-500' : 'text-gray-400'}
            `}>
              {message.length}/{maxLength}
            </div>
          )}
        </div>

        {/* 发送按钮 */}
        <motion.button
          whileHover={{ scale: disabled ? 1 : 1.05 }}
          whileTap={{ scale: disabled ? 1 : 0.95 }}
          onClick={handleSend}
          disabled={!message.trim() || disabled}
          className={`mb-[5px]
            w-12 h-12 rounded-lg transition-all duration-200 flex items-center justify-center flex-shrink-0
            ${!message.trim() || disabled
              ? 'bg-gray-200 dark:bg-gray-700 text-gray-400 cursor-not-allowed'
              : 'bg-osu-pink text-white hover:bg-osu-pink/90 shadow-lg shadow-osu-pink/25'
            }
          `}
        >
          <FiSend size={16} />
        </motion.button>
      </div>
      
      {/* 简化的提示文字 */}
      {disabled && (
        <div className="mt-2 text-xs text-red-400">
          {t('messages.chat.cannotSend')}
        </div>
      )}
    </div>
  );
};

export default MessageInput;
