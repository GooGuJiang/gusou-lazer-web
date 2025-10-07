import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import { userAPI } from '../utils/api';
import { FiMessageCircle, FiUsers, FiBell, FiX } from 'react-icons/fi';

interface CustomToastProps {
  title: string;
  message: string;
  sourceUserId?: number;
  type: 'pm' | 'team' | 'public' | 'system' | 'default';
  avatar?: string;
  username?: string;
  onDismiss?: () => void;
}

export const CustomToast: React.FC<CustomToastProps> = ({
  title,
  message,
  sourceUserId,
  type,
  avatar,
  username,
  onDismiss
}) => {
  const { t } = useTranslation();
  const [userInfo, setUserInfo] = useState<{ username: string; avatar_url: string } | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // 获取用户信息
  useEffect(() => {
    if (sourceUserId && !username && !avatar) {
      setIsLoading(true);
      userAPI.getUser(sourceUserId)
        .then(user => {
          setUserInfo({
            username: user.username,
            avatar_url: user.avatar_url || userAPI.getAvatarUrl(sourceUserId)
          });
        })
        .catch(error => {
          console.error(t('common.fetchUserInfoFailed'), error);
          setUserInfo({
            username: t('common.unknownUser'),
            avatar_url: userAPI.getAvatarUrl(sourceUserId)
          });
        })
        .finally(() => {
          setIsLoading(false);
        });
    }
  }, [sourceUserId, username, avatar]);

  const getIcon = () => {
    switch (type) {
      case 'pm':
        return <FiMessageCircle className="text-blue-500" size={20} />;
      case 'team':
        return <FiUsers className="text-orange-500" size={20} />;
      case 'public':
        return <FiMessageCircle className="text-green-500" size={20} />;
      case 'system':
        return <FiBell className="text-purple-500" size={20} />;
      default:
        return <FiBell className="text-gray-500" size={20} />;
    }
  };

  const getAvatarUrl = () => {
    if (avatar) return avatar;
    if (userInfo?.avatar_url) return userInfo.avatar_url;
    if (sourceUserId) return userAPI.getAvatarUrl(sourceUserId);
    return null;
  };

  const getDisplayUsername = () => {
    if (username) return username;
    if (userInfo?.username) return userInfo.username;
    return t('common.loadingUser');
  };

  const avatarUrl = getAvatarUrl();
  const displayUsername = getDisplayUsername();

  return (
    <div className="flex items-start space-x-3 p-4 bg-card rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 max-w-sm min-w-[300px] relative">
      {/* 关闭按钮 */}
      {onDismiss && (
        <button
          onClick={onDismiss}
          className="absolute top-2 right-2 p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
        >
          <FiX size={16} />
        </button>
      )}

      {/* 头像或图标 */}
      <div className="flex-shrink-0">
        {avatarUrl && !isLoading ? (
          <img
            src={avatarUrl}
            alt={displayUsername}
            className="w-12 h-12 rounded-lg object-cover border-2 border-gray-200 dark:border-gray-600"
            onError={(e) => {
              // {t('common.avatarLoadFailed')}
              e.currentTarget.style.display = 'none';
              const iconContainer = e.currentTarget.nextElementSibling as HTMLElement;
              if (iconContainer) {
                iconContainer.style.display = 'flex';
              }
            }}
          />
        ) : null}
        <div 
          className={`w-12 h-12 rounded-lg flex items-center justify-center ${
            avatarUrl && !isLoading ? 'hidden' : ''
          } ${
            type === 'pm' ? 'bg-blue-500/20' :
            type === 'team' ? 'bg-orange-500/20' :
            type === 'public' ? 'bg-green-500/20' :
            type === 'system' ? 'bg-purple-500/20' :
            'bg-gray-500/20'
          } border-2 border-gray-200 dark:border-gray-600`}
          style={{ display: avatarUrl && !isLoading ? 'none' : 'flex' }}
        >
          {isLoading ? (
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-gray-500"></div>
          ) : (
            getIcon()
          )}
        </div>
      </div>
      
      {/* 内容 */}
      <div className="flex-1 min-w-0 pt-1">
        <div className="flex items-center space-x-2 mb-2">
          <h4 className="font-semibold text-gray-900 dark:text-white text-sm">
            {title}
          </h4>
        </div>
        
        {/* 用户名 */}
        {(username || userInfo?.username) && (
          <div className="flex items-center space-x-1 mb-2">
            <span className="text-xs text-gray-500 dark:text-gray-400">{t('common.from')}</span>
            <span className="text-sm font-medium text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30 px-2 py-0.5 rounded">
              {displayUsername}
            </span>
          </div>
        )}
        
        {/* 消息内容 */}
        <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
          {message}
        </p>
      </div>
    </div>
  );
};

// 自定义 toast 显示函数
export const showCustomToast = (props: CustomToastProps) => {
  return toast.custom(
    (t: any) => (
      <CustomToast 
        {...props} 
        onDismiss={() => toast.dismiss(t.id)}
      />
    ),
    {
      duration: 5000,
      position: 'top-right',
    }
  );
};
