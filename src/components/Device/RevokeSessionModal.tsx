import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiX, FiTrash2, FiAlertTriangle } from 'react-icons/fi';
import { useTranslation } from 'react-i18next';
import type { DeviceSession } from '../../types/device';

interface RevokeSessionModalProps {
  isOpen: boolean;
  session: DeviceSession | null;
  isRevoking: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

const RevokeSessionModal: React.FC<RevokeSessionModalProps> = ({
  isOpen,
  session,
  isRevoking,
  onClose,
  onConfirm,
}) => {
  const { t } = useTranslation();

  // 防止背景滚动
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      document.body.style.paddingRight = '0px';
    } else {
      document.body.style.overflow = 'unset';
      document.body.style.paddingRight = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
      document.body.style.paddingRight = 'unset';
    };
  }, [isOpen]);

  if (!session) return null;

  // 获取客户端显示名称（简化版本，与主组件保持一致）
  const getClientDisplayName = (session: DeviceSession) => {
    if (session.user_agent === 'osu!' || session.user_agent.toLowerCase().includes('osu!')) {
      return 'osu!lazer';
    }
    if (session.client_display_name && session.client_display_name !== 'osu! web') {
      return session.client_display_name;
    }
    if (session.device_type === 'osu_web') {
      return 'osu! web';
    }
    const ua = session.user_agent.toLowerCase();
    if (ua.includes('edge')) return 'Microsoft Edge';
    if (ua.includes('chrome') && !ua.includes('edge')) return 'Google Chrome';
    if (ua.includes('firefox')) return 'Mozilla Firefox';
    if (ua.includes('safari') && !ua.includes('chrome')) return 'Safari';
    if (ua.includes('opera')) return 'Opera';
    return t('settings.device.browsers.unknown');
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* 背景遮罩 */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
          />

          {/* 模态框内容 */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative bg-card rounded-xl shadow-2xl w-full max-w-md mx-4"
          >
            {/* 头部 */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-red-100 dark:bg-red-900/20 rounded-lg">
                  <FiAlertTriangle className="w-5 h-5 text-red-600 dark:text-red-400" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  {t('settings.device.sessions.revokeTitle', '撤销会话')}
                </h3>
              </div>
              <button
                onClick={onClose}
                disabled={isRevoking}
                className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <FiX className="w-5 h-5" />
              </button>
            </div>

            {/* 内容 */}
            <div className="p-6">
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                {t('settings.device.sessions.revokeConfirm')}
              </p>
              
              {/* 会话信息 */}
              <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4 mb-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-gray-100 dark:bg-gray-600 rounded-lg">
                    <FiTrash2 className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900 dark:text-white">
                      {getClientDisplayName(session)}
                    </h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {session.location && !session.location.startsWith('IP:') 
                        ? session.location 
                        : '未知位置'
                      }
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4 mb-6">
                <p className="text-sm text-yellow-700 dark:text-yellow-300">
                  {t('settings.device.sessions.revokeWarning', '撤销此会话后，该设备将需要重新登录。')}
                </p>
              </div>
            </div>

            {/* 底部按钮 */}
            <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200 dark:border-gray-700">
              <button
                onClick={onClose}
                disabled={isRevoking}
                className="px-4 py-2 text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {t('settings.username.cancel', '取消')}
              </button>
              <button
                onClick={onConfirm}
                disabled={isRevoking}
                className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isRevoking ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    <span>{t('settings.device.sessions.revoking', '撤销中...')}</span>
                  </>
                ) : (
                  <>
                    <FiTrash2 className="w-4 h-4" />
                    <span>{t('settings.device.sessions.revoke', '撤销会话')}</span>
                  </>
                )}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default RevokeSessionModal;
