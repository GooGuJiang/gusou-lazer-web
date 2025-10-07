import React from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';

interface UserInfo {
  id: number;
  join_date?: string;
  last_visit?: string;
}

interface UserInfoCardProps {
  user: UserInfo;
  delay?: number;
}

const UserInfoCard: React.FC<UserInfoCardProps> = ({ user, delay = 0 }) => {
  const { t, i18n } = useTranslation();
  
  return (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay }}
    className="bg-card rounded-2xl shadow-lg p-4"
  >
    <div className="space-y-1.5">
      <div className="flex justify-between items-center">
        <span className="text-gray-600 dark:text-gray-400 text-sm font-medium">{t('common.userId')}</span>
        <span className="text-gray-900 dark:text-white font-bold text-lg">{user.id}</span>
      </div>

      {user.join_date && (
        <div className="flex justify-between items-center">
          <span className="text-gray-600 dark:text-gray-400 text-sm font-medium">{t('common.joinDate')}</span>
          <span className="text-gray-900 dark:text-white font-medium text-base">
            {new Date(user.join_date).toLocaleDateString(i18n.language === 'zh' ? 'zh-CN' : 'en-US', {
              year: 'numeric',
              month: 'short',
              day: 'numeric',
            })}
          </span>
        </div>
      )}

      {user.last_visit && (
        <div className="flex justify-between items-center">
          <span className="text-gray-600 dark:text-gray-400 text-sm font-medium">{t('common.lastVisit')}</span>
          <span className="text-gray-900 dark:text-white font-medium text-base">
            {new Date(user.last_visit).toLocaleDateString(i18n.language === 'zh' ? 'zh-CN' : 'en-US', {
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
};

export default UserInfoCard;

