import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiX, FiShield, FiDownload, FiEye, FiEyeOff } from 'react-icons/fi';
import { useTranslation } from 'react-i18next';
import QRCode from 'react-qr-code';
import toast from 'react-hot-toast';
import { userAPI, type TOTPCreateStart, type TOTPBackupCodes } from '../../utils/api';

interface TotpSetupModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

// 使用从 API 导入的类型
type TotpSecret = TOTPCreateStart;

const TotpSetupModal: React.FC<TotpSetupModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const { t } = useTranslation();
  const [step, setStep] = useState<'setup' | 'verify' | 'backup'>('setup');
  const [totpSecret, setTotpSecret] = useState<TotpSecret | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [verificationCode, setVerificationCode] = useState('');
  const [backupCodes, setBackupCodes] = useState<TOTPBackupCodes>([]);
  const [showSecret, setShowSecret] = useState(false);
  const [verificationError, setVerificationError] = useState<string>('');

  // 开始TOTP设置流程
  const handleStartSetup = async () => {
    setIsLoading(true);
    try {
      const response = await userAPI.totp.createStart();
      setTotpSecret(response);
      setStep('verify');
    } catch (error) {
      console.error('创建TOTP密钥失败:', error);
      toast.error(t('settings.totp.errors.createFailed'));
    } finally {
      setIsLoading(false);
    }
  };

  // 验证TOTP代码
  const handleVerifyCode = async () => {
    if (verificationCode.length !== 6) {
      setVerificationError(t('settings.totp.errors.invalidCodeLength', { length: 6 }));
      return;
    }

    setIsLoading(true);
    setVerificationError('');

    try {
      const response = await userAPI.totp.createComplete(verificationCode);
      setBackupCodes(response);
      setStep('backup');
      toast.success(t('settings.totp.setupSuccess'));
    } catch (error: unknown) {
      console.error('TOTP验证失败:', error);
      console.error('错误详情:', error.response?.data);

      // 处理不同类型的错误
      if (error.response?.status === 400) {
        const errorDetail = error.response?.data?.detail;
        if (Array.isArray(errorDetail) && errorDetail.length > 0) {
          // 处理验证错误
          setVerificationError(t('settings.totp.errors.invalidCode'));
        } else if (error.response?.data?.error === 'Invalid TOTP code') {
          setVerificationError(t('settings.totp.errors.invalidCode'));
        } else {
          setVerificationError(t('settings.totp.errors.invalidCode'));
        }
      } else {
        setVerificationError(t('settings.totp.errors.verificationFailed'));
      }
    } finally {
      setIsLoading(false);
    }
  };

  // 下载备份码
  const handleDownloadBackupCodes = () => {
    const content = backupCodes.join('\n');
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'totp-backup-codes.txt';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    toast.success(t('settings.totp.backupCodesDownloaded'));
  };

  // 完成设置
  const handleFinishSetup = () => {
    onSuccess();
    onClose();
  };

  // 处理验证码输入
  const handleCodeInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, '').slice(0, 6);
    setVerificationCode(value);
    setVerificationError('');
  };

  // 重置状态
  const resetState = () => {
    setStep('setup');
    setTotpSecret(null);
    setVerificationCode('');
    setBackupCodes([]);
    setShowSecret(false);
    setVerificationError('');
  };

  // 监听关闭事件重置状态
  useEffect(() => {
    if (!isOpen) {
      resetState();
    }
  }, [isOpen]);

  // 监听验证码长度自动验证
  useEffect(() => {
    if (verificationCode.length === 6 && step === 'verify' && !isLoading) {
      handleVerifyCode();
    }
  }, [verificationCode, step, isLoading]);

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
            className="absolute m-[-10px] inset-1 bg-black/60 backdrop-blur-sm"
            onClick={onClose}
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
                  <FiShield className="w-6 h-6 text-osu-pink" />
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                    {t('settings.totp.setupTitle')}
                  </h2>
                </div>
                <button
                  onClick={onClose}
                  className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                >
                  <FiX className="w-5 h-5" />
                </button>
              </div>

              <AnimatePresence mode="wait">
                {/* 第一步：说明和开始设置 */}
                {step === 'setup' && (
                  <motion.div
                    key="setup"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="space-y-4"
                  >
                    <p className="text-gray-600 dark:text-gray-300">
                      {t('settings.totp.setupDescription')}
                    </p>
                    <ul className="text-sm text-gray-500 dark:text-gray-400 space-y-1 list-disc list-inside">
                      <li>{t('settings.totp.setupStep1')}</li>
                      <li>{t('settings.totp.setupStep2')}</li>
                      <li>{t('settings.totp.setupStep3')}</li>
                    </ul>
                    <button
                      onClick={handleStartSetup}
                      disabled={isLoading}
                      className="w-full btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isLoading ? t('settings.totp.starting') : t('settings.totp.startSetup')}
                    </button>
                  </motion.div>
                )}

                {/* 第二步：显示二维码和验证 */}
                {step === 'verify' && totpSecret && (
                  <motion.div
                    key="verify"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="space-y-6"
                  >
                    {/* 二维码 */}
                    <div className="flex justify-center">
                      <div className="bg-white p-4 rounded-lg">
                        <QRCode value={totpSecret.uri} size={200} level="M" />
                      </div>
                    </div>

                    {/* 手动输入密钥 */}
                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        {t('settings.totp.manualEntry')}
                      </label>
                      <div className="flex items-center gap-2">
                        <input
                          type={showSecret ? 'text' : 'password'}
                          value={totpSecret.secret}
                          readOnly
                          className="flex-1 px-3 py-2 text-sm font-mono bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg"
                        />
                        <button
                          onClick={() => setShowSecret(!showSecret)}
                          className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                        >
                          {showSecret ? (
                            <FiEyeOff className="w-4 h-4" />
                          ) : (
                            <FiEye className="w-4 h-4" />
                          )}
                        </button>
                      </div>
                    </div>

                    {/* 验证码输入 */}
                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        {t('settings.totp.enterCode')}
                      </label>
                      <input
                        type="text"
                        value={verificationCode}
                        onChange={handleCodeInputChange}
                        placeholder="123456"
                        className="w-full px-4 py-3 text-center text-lg font-mono border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-osu-pink focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        maxLength={6}
                      />
                      {verificationError && (
                        <p className="text-sm text-red-500">{verificationError}</p>
                      )}
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {t('settings.totp.codeHint')}
                      </p>
                      <p className="text-xs text-yellow-600 dark:text-yellow-400 mt-1">
                        {t('settings.totp.codeExpireHint')}
                      </p>
                    </div>

                    {isLoading && (
                      <div className="flex items-center justify-center py-4">
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-osu-pink"></div>
                      </div>
                    )}
                  </motion.div>
                )}

                {/* 第三步：显示备份码 */}
                {step === 'backup' && (
                  <motion.div
                    key="backup"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="space-y-4"
                  >
                    <div className="text-center">
                      <div className="text-4xl mb-2">🎉</div>
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                        {t('settings.totp.setupComplete')}
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-300">
                        {t('settings.totp.backupCodesDescription')}
                      </p>
                    </div>

                    {/* 备份码 */}
                    <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                      <div className="grid grid-cols-2 gap-2 font-mono text-sm">
                        {backupCodes.map((code, index) => (
                          <div key={index} className="text-center py-1">
                            {code}
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* 下载按钮 */}
                    <button
                      onClick={handleDownloadBackupCodes}
                      className="w-full btn-secondary flex items-center justify-center gap-2"
                    >
                      <FiDownload className="w-4 h-4" />
                      {t('settings.totp.downloadBackupCodes')}
                    </button>

                    {/* 完成按钮 */}
                    <button onClick={handleFinishSetup} className="w-full btn-primary">
                      {t('settings.totp.finishSetup')}
                    </button>

                    <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
                      {t('settings.totp.backupCodesWarning')}
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default TotpSetupModal;
