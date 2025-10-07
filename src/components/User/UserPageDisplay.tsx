import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import type { User } from '../../types';
import { useAuth } from '../../hooks/useAuth';
import { useProfileColor } from '../../contexts/ProfileColorContext';
import { FaEdit, FaUser } from 'react-icons/fa';
import ContentContainer from '../UI/ContentContainer';
import UserPageEditModal from './UserPageEditModal';
import { parseBBCode } from '../../utils/bbcodeParser';

interface UserPageDisplayProps {
  user: User;
  onUserUpdate?: (user: User) => void;
  className?: string;
}

const UserPageDisplay: React.FC<UserPageDisplayProps> = ({
  user,
  onUserUpdate,
  className = '',
}) => {
  const { t } = useTranslation();
  const { user: currentUser } = useAuth();
  const { profileColor } = useProfileColor();
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  // 移除图片边框的样式优化
  useEffect(() => {
    const style = document.createElement('style');
    style.textContent = `
      .user-page-content img {
        border: none !important;
        outline: none !important;
        max-width: 100%;
        height: auto;
      }
    `;
    document.head.appendChild(style);
    return () => {
      document.head.removeChild(style);
    };
  }, []);

  // 检查是否可以编辑（仅自己的页面）
  const canEdit = currentUser?.id === user.id;

  // 从用户对象中获取页面内容
  const userPage = user.page;
  // 更健壮的内容检查：检查HTML或原始内容
  const hasContent = (userPage?.html && userPage.html.trim()) || 
                    (userPage?.raw && userPage.raw.trim());

  const handleEditClick = () => {
    setIsEditModalOpen(true);
  };

  const handleModalSave = (updatedUser: User) => {
    onUserUpdate?.(updatedUser);
  };

  // 没有内容的空状态
  if (!hasContent) {
    return (
      <div className={className}>
        {canEdit ? (
          // 自己的页面：显示编辑按钮
          <div className="pt-0 pb-16 min-h-[200px] md:min-h-[250px] flex flex-col">
            {/* 标题在左上角 */}
            <div className="flex items-center gap-3 mb-8">
              <div className="w-1 h-6 rounded-full" style={{ backgroundColor: profileColor }}></div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100">
                {t('profile.userPage.title')}
              </h3>
            </div>
            
            {/* 中心内容 */}
            <div className="flex-1 flex flex-col items-center justify-center text-center">
              <p className="text-gray-600 dark:text-gray-400 mb-8">
                {t('profile.userPage.noContent')}
              </p>
              <button
                onClick={handleEditClick}
                className="flex items-center gap-2 px-6 py-3 text-white rounded-lg transition-colors"
                style={{ backgroundColor: profileColor }}
                onMouseEnter={(e) => e.currentTarget.style.opacity = '0.9'}
                onMouseLeave={(e) => e.currentTarget.style.opacity = '1'}
              >
                <FaEdit className="w-4 h-4" />
                <span>{t('profile.userPage.writeButton')}</span>
              </button>
            </div>
          </div>
        ) : (
          // 其他人的页面：显示空状态
          <div className="pt-0 pb-16 min-h-[250px] md:min-h-[300px] flex flex-col">
            {/* 标题在左上角 */}
            <div className="flex items-center gap-3 mb-12">
              <div className="w-1 h-6 rounded-full" style={{ backgroundColor: profileColor }}></div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100">
                {t('profile.userPage.title')}
              </h3>
            </div>
            
            {/* 中心内容 */}
            <div className="flex-1 flex flex-col items-center justify-center text-center">
              <FaUser className="w-16 h-16 text-gray-400 mx-auto mb-6" />
              <h4 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-3">
                {user.username} {t('profile.userPage.noContent')}
              </h4>
              <p className="text-gray-600 dark:text-gray-400">
                {t('profile.userPage.noContent')}
              </p>
            </div>
          </div>
        )}

        {/* 编辑模态框 */}
        <UserPageEditModal
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          user={user}
          onSave={handleModalSave}
        />
      </div>
    );
  }

  // 有内容的正常显示
  return (
    <div className={`${className} min-h-[250px] md:min-h-[300px]`}>
      {/* 头部标题和编辑按钮 */}
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-3">
          <div className="w-1 h-6 rounded-full" style={{ backgroundColor: profileColor }}></div>
          <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100">
            {t('profile.userPage.title')}
          </h3>
        </div>
        {canEdit && (
          <button
            onClick={handleEditClick}
            className="flex items-center gap-2 px-4 py-2 text-sm text-white rounded-lg transition-colors"
            style={{ backgroundColor: profileColor }}
            onMouseEnter={(e) => e.currentTarget.style.opacity = '0.9'}
            onMouseLeave={(e) => e.currentTarget.style.opacity = '1'}
          >
            <FaEdit className="w-3 h-3" />
            <span>{t('profile.userPage.editButton')}</span>
          </button>
        )}
      </div>

      {/* 内容 */}
      <ContentContainer maxHeight={300} className="user-page-content">
        <div className="prose prose-sm dark:prose-invert max-w-none">
          {userPage.html ? (
            <div dangerouslySetInnerHTML={{ __html: userPage.html }} />
          ) : userPage.raw ? (
            // 如果没有HTML但有原始内容，使用本地BBCode解析器
            <div dangerouslySetInnerHTML={{ __html: parseBBCode(String(userPage.raw || '')).html }} />
          ) : (
            <div className="text-gray-500 dark:text-gray-400 italic">
              {t('profile.userPage.processing')}
            </div>
          )}
        </div>
      </ContentContainer>

      {/* 编辑模态框 */}
      <UserPageEditModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        user={user}
        onSave={handleModalSave}
      />
    </div>
  );
};

export default UserPageDisplay;