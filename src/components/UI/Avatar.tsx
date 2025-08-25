import React, { useState, useEffect } from 'react';
import { userAPI } from '../../utils/api';

// 开发环境调试工具
const debugLog = (message: string, data?: unknown) => {
  if (import.meta.env.DEV) {
    console.log(message, data);
  }
};

interface AvatarProps {
  userId?: number;
  username: string;
  avatarUrl?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  className?: string;
}

const Avatar: React.FC<AvatarProps> = ({ 
  userId, 
  username, 
  avatarUrl, 
  size = 'md', 
  className = '' 
}) => {
  const [imageError, setImageError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [currentImageUrl, setCurrentImageUrl] = useState<string>('');

  // 尺寸映射 - 更精确的尺寸定义
  const sizeClasses = {
    sm: 'w-8 h-8 min-w-8 min-h-8 text-sm',
    md: 'w-12 h-12 min-w-12 min-h-12 text-base',
    lg: 'w-16 h-16 min-w-16 min-h-16 text-lg',
    xl: 'w-24 h-24 min-w-24 min-h-24 text-xl',
    '2xl': 'w-32 h-32 min-w-32 min-h-32 text-2xl',
  };

  // 当参数变化时，重置状态并设置新的图片URL
  useEffect(() => {
    // 获取头像URL的优先级：
    // 1. 用户提供的avatarUrl（如果存在且不为空）
    // 2. 通过userId构建的API头像URL
    // 3. 默认头像 /default.jpg
    const getImageUrl = () => {
      debugLog('Avatar getImageUrl - avatarUrl:', { avatarUrl, userId, username });
      if (avatarUrl && avatarUrl.trim() !== '') {
        debugLog('使用提供的 avatarUrl:', avatarUrl);
        return avatarUrl;
      }
      if (userId) {
        const apiUrl = userAPI.getAvatarUrl(userId);
        debugLog('使用 API 构建的头像 URL:', apiUrl);
        return apiUrl;
      }
      debugLog('使用默认头像');
      return '/default.jpg'; // 使用默认头像
    };

    setImageError(false);
    setIsLoading(true);
    const newUrl = getImageUrl();
    debugLog('Avatar 设置新的图片 URL:', newUrl);
    setCurrentImageUrl(newUrl);
  }, [userId, username, avatarUrl]);

  const shouldShowImage = currentImageUrl && !imageError;
  const fallbackLetter = username.charAt(0).toUpperCase();

  const handleImageLoad = () => {
    setIsLoading(false);
  };

  const handleImageError = () => {
    // 如果当前不是默认头像，尝试使用默认头像
    if (currentImageUrl !== '/default.jpg') {
      setCurrentImageUrl('/default.jpg');
      setImageError(false);
      setIsLoading(true);
    } else {
      // 如果默认头像也加载失败，则显示字母头像
      setImageError(true);
      setIsLoading(false);
    }
  };

  return (
    <div className={`${sizeClasses[size]} rounded-full overflow-hidden flex-shrink-0 border-2 border-gray-200 dark:border-gray-600 shadow-md ${className}`}>
      {shouldShowImage ? (
        <div className="relative w-full h-full">
          {isLoading && (
            <div className="absolute inset-0 bg-gray-300 dark:bg-gray-600 animate-pulse rounded-full" />
          )}
          <img
            src={currentImageUrl}
            alt={`${username}的头像`}
            className={`w-full h-full object-cover transition-opacity duration-200 ${
              isLoading ? 'opacity-0' : 'opacity-100'
            }`}
            onLoad={handleImageLoad}
            onError={handleImageError}
          />
        </div>
      ) : (
        <div className="w-full h-full bg-gradient-to-r from-osu-pink to-osu-purple flex items-center justify-center text-white font-bold">
          {fallbackLetter}
        </div>
      )}
    </div>
  );
};

export default Avatar;
