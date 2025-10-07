import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiAlertTriangle, FiX } from 'react-icons/fi';
import { useTranslation } from 'react-i18next';

interface RemoveDeviceModalProps {
  isOpen: boolean;
  isRemoving: boolean;
  deviceName: string;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  confirmText: string;
  warningText: string;
}

const RemoveDeviceModal: React.FC<RemoveDeviceModalProps> = ({
  isOpen,
  isRemoving,
  deviceName,
  onClose,
  onConfirm,
  title,
  confirmText,
  warningText,
}) => {
  const { t } = useTranslation();

  const handleClose = () => {
    if (isRemoving) return;
    onClose();
  };

  // 防止背景滚动
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      document.body.style.paddingRight = '0px'; // 防止滚动条消失导致的跳动
    } else {
      document.body.style.overflow = 'unset';
      document.body.style.paddingRight = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
      document.body.style.paddingRight = 'unset';
    };
  }, [isOpen]);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* 背景遮罩 */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
          />

          {/* 弹窗内容 */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: 'spring', duration: 0.3 }}
            className="relative w-full max-w-md bg-card rounded-2xl shadow-2xl overflow-hidden"
          >
            {/* 关闭按钮 */}
            <button
              onClick={handleClose}
              disabled={isRemoving}
              className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <FiX className="w-5 h-5" />
            </button>

            {/* 内容区域 */}
            <div className="p-6">
              {/* 警告图标 */}
              <div className="flex justify-center mb-4">
                <div className="w-16 h-16 rounded-full bg-red-100 dark:bg-red-900/20 flex items-center justify-center">
                  <FiAlertTriangle className="w-8 h-8 text-red-600 dark:text-red-400" />
                </div>
              </div>

              {/* 标题 */}
              <h3 className="text-xl font-bold text-gray-900 dark:text-white text-center mb-2">
                {title}
              </h3>

              {/* 设备名称 */}
              <p className="text-center text-gray-600 dark:text-gray-400 mb-4">
                <span className="font-medium text-gray-900 dark:text-white">{deviceName}</span>
              </p>

              {/* 警告信息 */}
              <div className="bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-800 rounded-lg p-4 mb-6">
                <p className="text-sm text-red-700 dark:text-red-300">
                  {warningText}
                </p>
              </div>

              {/* 按钮组 */}
              <div className="flex gap-3">
                <button
                  onClick={handleClose}
                  disabled={isRemoving}
                  className="flex-1 px-4 py-2.5 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {t('settings.username.cancel')}
                </button>
                <button
                  onClick={onConfirm}
                  disabled={isRemoving}
                  className="flex-1 px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isRemoving ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      <span>{t('settings.device.trustedDevices.removing')}</span>
                    </>
                  ) : (
                    confirmText
                  )}
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default RemoveDeviceModal;

