import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { FaTimes, FaSave } from 'react-icons/fa';
import type { User } from '../../types';
import BBCodeEditor from './BBCodeEditor';
import { userAPI } from '../../utils/api';
import { useAuth } from '../../hooks/useAuth';

interface UserPageEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: User;
  onSave: (updatedUser: User) => void;
}

const UserPageEditModal: React.FC<UserPageEditModalProps> = ({
  isOpen,
  onClose,
  user,
  onSave,
}) => {
  const { t } = useTranslation();
  const { user: currentUser } = useAuth();
  const [content, setContent] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setContent(user.page?.raw || '');
      // 防止背景滚动
      document.body.style.overflow = 'hidden';
      
      // 添加全局键盘事件监听，仅处理Escape键
      const handleGlobalKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'Escape' && !e.defaultPrevented) {
          onClose();
        }
      };
      
      document.addEventListener('keydown', handleGlobalKeyDown);
      
      return () => {
        document.removeEventListener('keydown', handleGlobalKeyDown);
        document.body.style.overflow = 'unset';
      };
    } else {
      // 恢复背景滚动
      document.body.style.overflow = 'unset';
    }
  }, [isOpen, user.page?.raw, onClose]);

  const handleSave = async () => {
    if (!currentUser || currentUser.id !== user.id) return;

    setIsSaving(true);
    try {
      const response = await userAPI.updateUserPage(currentUser.id, content);
      
      // 尝试获取渲染后的HTML
      let html = '';
      if (response.html) {
        html = response.html;
      } else if (response.data?.html) {
        html = response.data.html;
      } else if (response.preview?.html) {
        html = response.preview.html;
      } else {
        // 如果没有HTML，尝试验证BBCode获取预览
        try {
          const validationResult = await userAPI.validateBBCode(content);
          if (validationResult.preview?.html) {
            html = validationResult.preview.html;
          }
        } catch (validationError) {
          console.warn('BBCode验证失败:', validationError);
          // 使用原始内容作为HTML（不理想但至少显示内容）
          html = content.replace(/\n/g, '<br>');
        }
      }
      
      // 更新用户数据
      const updatedUser = {
        ...user,
        page: {
          raw: content,
          html: html,
        }
      };
      
      // 通知父组件更新
      onSave(updatedUser);
      onClose();
    } catch (error) {
      console.error('Save failed:', error);
      // Error notification can be added here
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setContent(user.page?.raw || '');
    onClose();
  };

  // 阻止模态框内部的事件冒泡
  const handleModalContentClick = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

  // 阻止模态框内部的鼠标事件冒泡
  const handleModalContentMouseDown = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

  const handleModalContentMouseUp = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

  // 处理鼠标按下事件，记录按下位置和时间
  const [mouseDownTarget, setMouseDownTarget] = useState<EventTarget | null>(null);
  const [mouseDownTime, setMouseDownTime] = useState<number>(0);
  const [mouseDownPosition, setMouseDownPosition] = useState<{x: number, y: number} | null>(null);
  
  const handleBackdropMouseDown = (e: React.MouseEvent) => {
    setMouseDownTarget(e.target);
    setMouseDownTime(Date.now());
    setMouseDownPosition({ x: e.clientX, y: e.clientY });
  };

  const handleBackdropMouseUp = (e: React.MouseEvent) => {
    const timeDiff = Date.now() - mouseDownTime;
    const isQuickClick = timeDiff < 200; // 少于200ms认为是点击而非拖拽
    
    // 计算鼠标移动距离
    const distance = mouseDownPosition ? 
      Math.sqrt(
        Math.pow(e.clientX - mouseDownPosition.x, 2) + 
        Math.pow(e.clientY - mouseDownPosition.y, 2)
      ) : 0;
    
    const isStationary = distance < 5; // 移动距离小于5px认为是点击
    
    // 只有在同一个元素上按下和松开，且是快速点击或静止点击，且是背景层时，才关闭模态框
    if (e.target === e.currentTarget && 
        mouseDownTarget === e.target && 
        (isQuickClick || isStationary)) {
      onClose();
    }
    
    // 重置状态
    setMouseDownTarget(null);
    setMouseDownTime(0);
    setMouseDownPosition(null);
  };

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-2 md:p-4"
      onMouseDown={handleBackdropMouseDown}
      onMouseUp={handleBackdropMouseUp}
    >
      <div 
        className="bg-card rounded-lg shadow-xl w-full max-w-7xl h-[95vh] overflow-hidden flex flex-col"
        onClick={handleModalContentClick}
        onMouseDown={handleModalContentMouseDown}
        onMouseUp={handleModalContentMouseUp}
      >
        {/* 头部 */}
        <div className="flex items-center justify-between p-4 md:p-6 border-b border-gray-200 dark:border-gray-700 flex-shrink-0">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
            {t('profile.userPage.editTitle')}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
          >
            <FaTimes className="w-5 h-5" />
          </button>
        </div>

        {/* 内容 */}
        <div className="p-4 md:p-6 overflow-y-auto flex-1">
          <BBCodeEditor
            title={t('profile.userPage.title')}
            value={content}
            onChange={setContent}
            placeholder={t('profile.userPage.placeholder')}
            className="min-h-[60vh] h-full"
          />
        </div>

        {/* 底部按钮 */}
        <div className="flex items-center justify-end gap-3 p-4 md:p-6 border-t border-gray-200 dark:border-gray-700 flex-shrink-0">
          <button
            onClick={handleCancel}
            disabled={isSaving}
            className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100 transition-colors disabled:opacity-50"
          >
            {t('profile.userPage.cancel')}
          </button>
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="flex items-center gap-2 px-6 py-2 bg-osu-pink hover:opacity-90 text-white rounded-lg transition-colors disabled:opacity-50"
          >
            {isSaving ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                {t('profile.userPage.saving')}
              </>
            ) : (
              <>
                <FaSave className="w-4 h-4" />
                {t('profile.userPage.save')}
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default UserPageEditModal;