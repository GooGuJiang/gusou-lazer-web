import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiX, FiAlertTriangle } from 'react-icons/fi';
import { useTranslation } from 'react-i18next';
import toast from 'react-hot-toast';
import { userAPI } from '../../utils/api';

interface TotpDisableModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const TotpDisableModal: React.FC<TotpDisableModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const { t } = useTranslation();
  const [verificationCode, setVerificationCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>('');

  // 禁用TOTP
  const handleDisableTotp = async () => {
    if (verificationCode.length !== 6) {
      setError(t('settings.totp.errors.invalidCodeLength', { length: 6 }));
      return;
    }

    setIsLoading(true);
    setError('');
    
    try {
      await userAPI.totp.disable(verificationCode);
      toast.success(t('settings.totp.disableSuccess'));
      onSuccess();
      onClose();
    } catch (error: any) {
      console.error('TOTP禁用失败:', error);
      if (error.response?.data?.error === 'Invalid TOTP code') {
        setError(t('settings.totp.errors.invalidCode'));
      } else {
        setError(t('settings.totp.errors.disableFailed'));
      }
    } finally {
      setIsLoading(false);
    }
  };

  // 处理验证码输入
  const handleCodeInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, '').slice(0, 6);
    setVerificationCode(value);
    setError('');
  };

  // 重置状态
  const resetState = () => {
    setVerificationCode('');
    setError('');
  };

  // 处理关闭
  const handleClose = () => {
    resetState();
    onClose();
  };

  // 处理确认
  const handleConfirm = (e: React.FormEvent) => {
    e.preventDefault();
    handleDisableTotp();
  };

  // 阻止背景滚动
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      document.body.style.paddingRight = '0px'; // 防止滚动条消失导致的跳动
    } else {
      document.body.style.overflow = 'unset';
      document.body.style.paddingRight = 'unset';
    }
    
    // 清理函数
    return () => {
      document.body.style.overflow = 'unset';
      document.body.style.paddingRight = 'unset';
    };
  }, [isOpen]);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 overflow-hidden">
          {/* 背景遮罩 */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={handleClose}
          />
          
          {/* 模态框内容 */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative bg-card rounded-xl shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6">
        {/* 标题和关闭按钮 */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <FiAlertTriangle className="w-6 h-6 text-red-500" />
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              {t('settings.totp.disableTitle')}
            </h2>
          </div>
          <button
            onClick={handleClose}
            className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          >
            <FiX className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleConfirm} className="space-y-4">
          {/* 警告信息 */}
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
            <p className="text-sm text-red-700 dark:text-red-300">
              {t('settings.totp.disableWarning')}
            </p>
          </div>

          {/* 验证码输入 */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              {t('settings.totp.enterCodeToDisable')}
            </label>
            <input
              type="text"
              value={verificationCode}
              onChange={handleCodeInputChange}
              placeholder="123456"
              className="w-full px-4 py-3 text-center text-lg font-mono border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              maxLength={6}
              required
            />
            {error && (
              <p className="text-sm text-red-500">{error}</p>
            )}
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {t('settings.totp.disableCodeHint')}
            </p>
          </div>

          {/* 按钮 */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={handleClose}
              className="flex-1 btn-secondary"
              disabled={isLoading}
            >
              {t('common.cancel')}
            </button>
            <button
              type="submit"
              disabled={isLoading || verificationCode.length !== 6}
              className="flex-1 bg-red-600 hover:bg-red-700 disabled:bg-red-400 text-white font-medium py-2.5 px-4 rounded-lg transition-colors disabled:cursor-not-allowed"
            >
              {isLoading ? t('settings.totp.disabling') : t('settings.totp.disableConfirm')}
            </button>
          </div>
            </form>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default TotpDisableModal;
