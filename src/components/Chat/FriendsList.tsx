import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FiUser, FiMessageCircle, FiX } from 'react-icons/fi';
import Avatar from '../UI/Avatar';
import { friendsAPI } from '../../utils/api';
import type { FriendRelation, User } from '../../types';
import toast from 'react-hot-toast';

interface FriendsListProps {
  currentUser?: User; // 预留参数（当前未使用）
  onStartPrivateChat: (user: User) => void;
  onClose: () => void;
}

const FriendsList: React.FC<FriendsListProps> = ({ currentUser: _currentUser, onStartPrivateChat, onClose }) => {
  const [friends, setFriends] = useState<FriendRelation[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  // 加载好友列表
  useEffect(() => {
    loadFriends();
  }, []);

  // 防止背景滚动
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    document.body.style.paddingRight = '0px';

    return () => {
      document.body.style.overflow = 'unset';
      document.body.style.paddingRight = 'unset';
    };
  }, []);

  // 添加键盘快捷键支持
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        console.log('ESC键按下，关闭好友列表');
        onClose();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  // 调试onClose回调
  useEffect(() => {
    console.log('FriendsList组件挂载，onClose回调:', onClose);
  }, [onClose]);

  const loadFriends = async () => {
    try {
      setIsLoading(true);
      const friendsData = await friendsAPI.getFriends();
      setFriends(friendsData);
    } catch (error) {
      console.error('加载好友列表失败:', error);
      toast.error('加载好友列表失败');
    } finally {
      setIsLoading(false);
    }
  };

  // 处理私聊开始并关闭列表
  const handleStartPrivateChatAndClose = (user: User) => {
    console.log('选择用户进行私聊:', user.username);
    onStartPrivateChat(user);
    // 立即关闭好友列表
    onClose();
  };

  // 移除好友
  const removeFriend = async (userId: number) => {
    try {
      await friendsAPI.removeFriend(userId);
      toast.success('已移除好友');
      // 重新加载好友列表
      loadFriends();
    } catch (error) {
      console.error('移除好友失败:', error);
      toast.error('移除好友失败');
    }
  };



  const filteredFriends = friends.filter(friend => 
    friend.target?.username?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
      onClick={() => {
        console.log('背景被点击，关闭好友列表');
        onClose();
      }}
    >
      <motion.div
        initial={{ y: 50 }}
        animate={{ y: 0 }}
        exit={{ y: 50 }}
        className="bg-card rounded-lg shadow-xl w-full max-w-md max-h-[80vh] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* 头部 */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">好友管理</h2>
          <button
            onClick={() => {
              console.log('关闭按钮被点击');
              onClose();
            }}
            className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          >
            <FiX size={20} />
          </button>
        </div>

        {/* 标题栏 */}
        <div className="py-3 px-4 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">
            好友列表 ({friends.length})
          </h3>
        </div>

        {/* 内容区域 */}
        <div className="p-4 max-h-[60vh] overflow-y-auto">
          {/* 搜索框 */}
          <div className="mb-4">
            <input
              type="text"
              placeholder="搜索好友..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-osu-pink focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
          </div>

          {/* 好友列表 */}
          <div className="space-y-3">
            {isLoading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-osu-pink mx-auto"></div>
                <p className="text-gray-500 dark:text-gray-400 mt-2">加载中...</p>
              </div>
            ) : filteredFriends.length === 0 ? (
              <div className="text-center py-8">
                <FiUser className="mx-auto h-12 w-12 text-gray-400" />
                <p className="text-gray-500 dark:text-gray-400 mt-2">
                  {searchQuery ? '没有找到匹配的好友' : '暂无好友'}
                </p>
              </div>
            ) : (
              filteredFriends.map((friend) => (
                <div
                  key={friend.target_id}
                  className="flex items-center space-x-3 p-3 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50"
                >
                  <Avatar
                    userId={friend.target_id}
                    username={friend.target?.username || '未知用户'}
                    avatarUrl={friend.target?.avatar_url}
                    size="md"
                  />
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2">
                      <h3 className="font-medium text-gray-900 dark:text-white truncate">
                        {friend.target?.username || '未知用户'}
                      </h3>
                      {friend.mutual && (
                        <span className="text-xs px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 rounded-full">
                          互相关注
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {friend.target?.country_code ? `来自 ${friend.target.country_code}` : '未知地区'}
                    </p>
                  </div>

                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => {
                        if (friend.target) {
                          handleStartPrivateChatAndClose(friend.target);
                        }
                      }}
                      className="p-2 text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
                      title="发送私聊"
                    >
                      <FiMessageCircle size={16} />
                    </button>
                    <button
                      onClick={() => removeFriend(friend.target_id)}
                      className="p-2 text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                      title="移除好友"
                    >
                      <FiX size={16} />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default FriendsList;
