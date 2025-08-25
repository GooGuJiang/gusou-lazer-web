import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { FiUser, FiCheck, FiX, FiImage } from 'react-icons/fi';
import { useAuth } from '../hooks/useAuth';
import { Navigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { userAPI } from '../utils/api';
import EditableCover from '../components/UI/EditableCover';

const SettingsPage: React.FC = () => {
  const { user, isAuthenticated, isLoading, refreshUser } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [newUsername, setNewUsername] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-osu-pink"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
        <div className="text-6xl mb-4">😕</div>
        <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-200 mb-2">
          无法加载设置
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          请尝试刷新页面
        </p>
      </div>
    );
  }

  const handleStartEdit = () => {
    setNewUsername(user.username);
    setIsEditing(true);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setNewUsername('');
  };

  const handleSubmitUsername = async () => {
    if (!newUsername.trim()) {
      toast.error('用户名不能为空');
      return;
    }

    if (newUsername.trim() === user.username) {
      toast.error('新用户名与当前用户名相同');
      return;
    }

    setIsSubmitting(true);
    try {
      await userAPI.rename(newUsername.trim());
      
      toast.success('用户名修改成功！');
      setIsEditing(false);
      setNewUsername('');
      
      // 延迟刷新用户信息，避免立即刷新导致头像缓存问题
      setTimeout(async () => {
        await refreshUser();
      }, 1000);
    } catch (error) {
      console.error('修改用户名失败:', error);
      const err = error as { response?: { status?: number } };
      if (err.response?.status === 409) {
        toast.error('用户名已被占用，请选择其他用户名');
      } else if (err.response?.status === 404) {
        toast.error('找不到指定用户');
      } else {
        toast.error('修改用户名失败，请稍后重试');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto p-4 sm:p-6 space-y-6 sm:space-y-8">
      {/* 页面标题 */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center"
      >
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          账户设置
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          管理您的账户信息和偏好设置
        </p>
      </motion.div>

      {/* 用户名设置 */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6"
      >
        <div className="flex items-center gap-3 mb-6">
          <FiUser className="w-6 h-6 text-osu-pink" />
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            用户名设置
          </h2>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              当前用户名
            </label>
            {!isEditing ? (
              <div className="flex items-center justify-between">
                <span className="text-lg font-medium text-gray-900 dark:text-white">
                  {user.username}
                </span>
                <button
                  onClick={handleStartEdit}
                  className="btn-secondary !px-4 !py-2 text-sm"
                >
                  修改用户名
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                <div>
                  <input
                    type="text"
                    value={newUsername}
                    onChange={(e) => setNewUsername(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-osu-pink focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    placeholder="输入新的用户名"
                    maxLength={50}
                  />
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    用户名修改后，您的原用户名将保存在历史记录中
                  </p>
                </div>
                
                <div className="flex gap-3">
                  <button
                    onClick={handleSubmitUsername}
                    disabled={isSubmitting}
                    className="flex items-center gap-2 btn-primary !px-4 !py-2 !text-sm !inline-flex disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <FiCheck className="w-4 h-4" />
                    {isSubmitting ? '保存中...' : '保存'}
                  </button>
                  <button
                    onClick={handleCancelEdit}
                    disabled={isSubmitting}
                    className="flex items-center gap-2 btn-secondary !px-4 !py-2 !text-sm !inline-flex disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <FiX className="w-4 h-4" />
                    取消
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </motion.div>

      {/* 头图设置 */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
        className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6"
      >
        <div className="flex items-center gap-3 mb-6">
          <FiImage className="w-6 h-6 text-osu-pink" />
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            头图设置
          </h2>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              个人资料头图
            </label>
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-4">
              建议尺寸：2000x500 像素（官方推荐 4:1 比例），支持 PNG、JPEG、GIF 格式，最大 10MB
            </p>
            <EditableCover
              userId={user.id}
              username={user.username}
              coverUrl={user.cover_url}
              editable={true}
              onCoverUpdate={(newCoverUrl) => {
                if (import.meta.env.DEV) {
                  console.log('头图已更新:', newCoverUrl);
                }
                // 这里可以选择是否立即刷新用户信息
                // 暂时不刷新，让用户看到更新效果
              }}
            />
          </div>
        </div>
      </motion.div>

      {/* 用户信息 */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6"
      >
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
          账户信息
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              用户 ID
            </label>
            <div className="px-4 py-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <span className="text-gray-900 dark:text-white font-mono">
                {user.id}
              </span>
            </div>
          </div>

          {user.join_date && (
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                注册时间
              </label>
              <div className="px-4 py-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <span className="text-gray-900 dark:text-white">
                  {new Date(user.join_date).toLocaleDateString('zh-CN', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </span>
              </div>
            </div>
          )}

          {user.country && (
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                国家/地区
              </label>
              <div className="px-4 py-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <div className="flex items-center gap-2">
                  <img
                    src={`https://flagcdn.com/w20/${user.country.code.toLowerCase()}.png`}
                    alt={user.country.code}
                    className="w-5 h-auto"
                  />
                  <span className="text-gray-900 dark:text-white">
                    {user.country.name}
                  </span>
                </div>
              </div>
            </div>
          )}

          {user.last_visit && (
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                最后访问
              </label>
              <div className="px-4 py-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <span className="text-gray-900 dark:text-white">
                  {new Date(user.last_visit).toLocaleDateString('zh-CN', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </span>
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default SettingsPage;
