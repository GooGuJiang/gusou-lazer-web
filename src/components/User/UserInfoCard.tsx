import React from 'react';
import { motion } from 'framer-motion';

interface UserInfo {
  id: number;
  join_date?: string;
  last_visit?: string;
}

interface UserInfoCardProps {
  user: UserInfo;
  delay?: number;
}

const UserInfoCard: React.FC<UserInfoCardProps> = ({ user, delay = 0 }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay }}
    className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-4"
  >
    <div className="space-y-1.5">
      <div className="flex justify-between items-center">
        <span className="text-gray-600 dark:text-gray-400 text-sm font-medium">用户 ID</span>
        <span className="text-gray-900 dark:text白 font-bold text-lg">{user.id}</span>
      </div>

      {user.join_date && (
        <div className="flex justify-between items-center">
          <span className="text-gray-600 dark:text-gray-400 text-sm font-medium">加入时间</span>
          <span className="text-gray-900 dark:text白 font-medium text-base">
            {new Date(user.join_date).toLocaleDateString('zh-CN', {
              year: 'numeric',
              month: 'short',
              day: 'numeric',
            })}
          </span>
        </div>
      )}

      {user.last_visit && (
        <div className="flex justify-between items-center">
          <span className="text-gray-600 dark:text-gray-400 text-sm font-medium">最后访问</span>
          <span className="text-gray-900 dark:text白 font-medium text-base">
            {new Date(user.last_visit).toLocaleDateString('zh-CN', {
              year: 'numeric',
              month: 'short',
              day: 'numeric',
            })}
          </span>
        </div>
      )}
    </div>
  </motion.div>
);

export default UserInfoCard;

