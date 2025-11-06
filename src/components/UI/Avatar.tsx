import React, { useState, useEffect, useMemo } from 'react';
import { FiCamera } from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';
import { userAPI } from '../../utils/api';
import AvatarUpload from './AvatarUpload';
import { useAuth } from '../../contexts/AuthContext';

const debugLog = (message: string, data?: unknown) => {
  if (process.env.NODE_ENV !== 'production') console.log(message, data);
};

interface AvatarProps {
  userId?: number;
  username: string;
  avatarUrl?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  className?: string;
  shape?: 'circle' | 'rounded';
  isCurrentUser?: boolean;
  currentUserId?: number;
  editable?: boolean;
  showUploadHint?: boolean;
  onAvatarUpdate?: (newAvatarUrl: string) => void;
}

/** 关键点一：把图片独立成 memo 组件，避免 hover 状态变更导致重新渲染 */
const ImageBlock = React.memo(function ImageBlock({
  src,
  alt,
  radiusClass,
  isLoading,
  onLoad,
  onError,
}: {
  src: string;
  alt: string;
  radiusClass: string;
  isLoading: boolean;
  onLoad: () => void;
  onError: () => void;
}) {
  return (
    <div className="relative w-full h-full" style={{ transform: 'translateZ(0)' }}>
      {isLoading && (
        <div className={`absolute inset-0 bg-gray-300 dark:bg-gray-700 animate-pulse ${radiusClass}`} />
      )}
      <img
        /** 关键点二：不给 <img> 设置任何会触发重算的 key；hover 时 props 不变、就不会重建节点 */
        src={src}
        alt={alt}
        loading="lazy"
        decoding="async"
        className={`block w-full h-full object-cover transition-opacity duration-200 ${
          isLoading ? 'opacity-0' : 'opacity-100'
        } ${radiusClass} will-change-[opacity]`}
        onLoad={onLoad}
        onError={onError}
        draggable={false}
        style={{ pointerEvents: 'none', backfaceVisibility: 'hidden' }}
      />
    </div>
  );
});

const Avatar: React.FC<AvatarProps> = ({
  userId,
  username,
  avatarUrl,
  size = 'md',
  className = '',
  shape = 'rounded',
  isCurrentUser = false,
  currentUserId,
  editable = false,
  showUploadHint = true,
  onAvatarUpdate,
}) => {
  const [imageError, setImageError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [currentImageUrl, setCurrentImageUrl] = useState<string>('');
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [isHovering, setIsHovering] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const { user: currentUser } = useAuth()

  const isSelf = currentUser && userId && currentUser.id === userId;

  //const shouldShowUpload = Boolean(editable || isSelf);

  const sizeClasses = {
    sm: 'w-8 h-8 min-w-8 min-h-8 text-sm',
    md: 'w-12 h-12 min-w-12 min-h-12 text-base',
    lg: 'w-16 h-16 min-w-16 min-h-16 text-lg',
    xl: 'w-24 h-24 min-w-24 min-h-24 text-xl',
    '2xl': 'w-32 h-32 min-w-32 min-h-32 text-2xl',
  } as const;

  const hoverOverlaySizes = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base',
    xl: 'text-lg',
    '2xl': 'text-xl',
  } as const;

  const radius = shape === 'circle' ? 'rounded-full' : 'rounded-2xl';
  // 只有在明确设置 editable=true 或者未设置 editable 且是当前用户时才显示上传功能
  const shouldShowUpload = editable === true || (editable !== false && isSelf);

  useEffect(() => {
    debugLog('Avatar组件状态:', {
      shouldShowUpload,
      editable,
      isCurrentUser,
      currentUserId,
      userId,
      username,
    });
  }, [shouldShowUpload, editable, isCurrentUser, currentUserId, userId, username]);

  useEffect(() => {
    const getImageUrl = () => {
      debugLog('Avatar getImageUrl - avatarUrl:', { avatarUrl, userId, username });
      if (avatarUrl && avatarUrl.trim() !== '') return avatarUrl;
      if (userId) return userAPI.getAvatarUrl(userId);
      return '/default.jpg';
    };
    setImageError(false);
    setIsLoading(true);
    setRetryCount(0); // 重置重试计数
    setCurrentImageUrl(getImageUrl());
  }, [userId, username, avatarUrl]);

  const shouldShowImage = currentImageUrl && !imageError;
  const fallbackLetter = (username || '?').charAt(0).toUpperCase();

  const handleImageLoad = () => {
    debugLog('图片加载成功:', currentImageUrl);
    setIsLoading(false);
  };

  const handleImageError = () => {
    debugLog('图片加载失败:', currentImageUrl);
    
    // 如果是API生成的头像URL且重试次数少于3次，则重试
    if (userId && currentImageUrl.includes(`/users/${userId}/avatar`) && retryCount < 3) {
      debugLog(`头像加载失败，${1000 * (retryCount + 1)}ms后重试第${retryCount + 1}次`);
      setTimeout(() => {
        setRetryCount(prev => prev + 1);
        const retryUrl = userAPI.getAvatarUrl(userId, true); // 破坏缓存重试
        setCurrentImageUrl(retryUrl);
        setIsLoading(true);
      }, 1000 * (retryCount + 1)); // 递增延迟：1s, 2s, 3s
      return;
    }
    
    // 如果不是API头像URL或已达到重试上限，尝试加载默认图片
    if (currentImageUrl !== '/default.jpg') {
      debugLog('尝试加载默认图片');
      setCurrentImageUrl('/default.jpg');
      setImageError(false);
      setIsLoading(true);
      setRetryCount(0); // 重置重试计数
    } else {
      debugLog('默认图片也加载失败，显示字母');
      setImageError(true);
      setIsLoading(false);
      setRetryCount(0); // 重置重试计数
    }
  };

  const handleUploadSuccess = (newAvatarUrl: string) => {
    debugLog('Avatar upload success:', newAvatarUrl);
    
    // 重置重试计数和错误状态
    setRetryCount(0);
    setImageError(false);
    setIsLoading(false);
    
    // 立即更新本地显示的头像URL（带时间戳破坏缓存）
    const urlWithTimestamp = `${newAvatarUrl}${newAvatarUrl.includes('?') ? '&' : '?'}t=${Date.now()}`;
    setCurrentImageUrl(urlWithTimestamp);
    
    // 延迟执行用户信息刷新，给服务器一些时间处理头像
    setTimeout(() => {
      debugLog('延迟刷新用户信息和头像缓存');
      // 如果有userId，使用API重新获取头像URL（破坏缓存）
      if (userId) {
        const refreshedUrl = userAPI.getAvatarUrl(userId, true); // 破坏缓存
        setCurrentImageUrl(refreshedUrl);
      }
      onAvatarUpdate?.(newAvatarUrl);
    }, 2000); // 延迟2秒
  };

  const handleAvatarClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    debugLog('Avatar点击事件触发', {
      shouldShowUpload,
      editable,
      isCurrentUser,
      currentUserId,
      userId,
    });
    if (shouldShowUpload) {
      setShowUploadModal(true);
    }
  };

  /** 关键点三：overlay 的内容用 useMemo（避免重复创建），并用 framer-motion 控制显隐动画 */
  const Overlay = useMemo(
    () => (
      <AnimatePresence initial={false}>
        {shouldShowUpload && isHovering && (
          <motion.div
            key="overlay"
            className={`absolute inset-0 bg-black bg-opacity-60 flex flex-col items-center justify-center ${radius} z-10 will-change-[opacity,transform]`}
            /** 不抢事件，让容器来处理点击/hover */
            style={{ pointerEvents: 'none' }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.12, ease: 'easeInOut' }}
          >
            <FiCamera
              className={`${size === 'sm' || size === 'md' ? 'w-4 h-4' : 'w-6 h-6'} text-white mb-1`}
            />
            {showUploadHint && (size === 'lg' || size === 'xl' || size === '2xl') && (
              <span className={`text-white text-xs ${hoverOverlaySizes[size]} text-center px-1 leading-tight`}>
                点击上传
              </span>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    ),
    [shouldShowUpload, isHovering, radius, size, showUploadHint]
  );

  return (
    <>
      <div
        className={[
          sizeClasses[size],
          radius,
          'overflow-hidden flex-shrink-0 shadow-md relative',
          shouldShowUpload ? 'cursor-pointer hover:shadow-lg transition-all duration-200 select-none' : '',
          className,
        ]
          .filter(Boolean)
          .join(' ')}
        style={{ display: 'inline-block', transform: 'translateZ(0)' }} // 关键点四：强制合成层，减少抖动
        onClick={shouldShowUpload ? handleAvatarClick : undefined}
        onMouseEnter={
          shouldShowUpload
            ? () => {
                debugLog('鼠标进入头像区域');
                setIsHovering(true);
              }
            : undefined
        }
        onMouseLeave={
          shouldShowUpload
            ? () => {
                debugLog('鼠标离开头像区域');
                setIsHovering(false);
              }
            : undefined
        }
        title={shouldShowUpload ? '点击上传头像' : `${username}的头像`}
        role={shouldShowUpload ? 'button' : 'img'}
        tabIndex={shouldShowUpload ? 0 : -1}
        onKeyDown={
          shouldShowUpload
            ? (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  handleAvatarClick(e as any);
                }
              }
            : undefined
        }
      >
        {/* 图片渲染与 hover 状态解耦：hover 时 ImageBlock 的 props 不变，不会重建或触发加载 */}
        {shouldShowImage ? (
          <ImageBlock
            src={currentImageUrl}
            alt={`${username}的头像`}
            radiusClass={radius}
            isLoading={isLoading}
            onLoad={handleImageLoad}
            onError={handleImageError}
          />
        ) : (
          <div className={`w-full h-full flex items-center justify-center bg-gray-400 text-white font-bold ${radius}`}>
            {fallbackLetter}
          </div>
        )}

        {/* 使用 framer-motion 渐隐渐现的悬浮层，不会影响 <img> 的生命周期 */}
        {Overlay}
      </div>

      {showUploadModal && (
        <AvatarUpload
          userId={userId}
          currentAvatarUrl={currentImageUrl}
          onUploadSuccess={handleUploadSuccess}
          onClose={() => setShowUploadModal(false)}
        />
      )}
    </>
  );
};

export default Avatar;
