import React, { useState, useEffect } from 'react';
import { Mail, Smartphone, RefreshCw } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';

interface VerificationModalProps {
  isOpen: boolean;
  method: 'totp' | 'mail';
  onVerify: (code: string) => Promise<void>;
  onSwitchMethod: () => Promise<void>;
  onResendCode?: () => Promise<void>;
}

export const VerificationModal: React.FC<VerificationModalProps> = ({
  isOpen,
  method,
  onVerify,
  onSwitchMethod,
  onResendCode,
}) => {
  const { t } = useTranslation();
  const [code, setCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [resendLoading, setResendLoading] = useState(false);
  const [resendMessage, setResendMessage] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setCode('');
      setError(null);
      setResendMessage(null);
      
      // 防止背景滚动
      const scrollBarWidth = window.innerWidth - document.documentElement.clientWidth;
      document.body.style.overflow = 'hidden';
      document.body.style.paddingRight = `${scrollBarWidth}px`;
      // 防止整个页面滚动
      document.documentElement.style.overflow = 'hidden';
    } else {
      // 恢复背景滚动
      document.body.style.overflow = '';
      document.body.style.paddingRight = '';
      document.documentElement.style.overflow = '';
    }

    return () => {
      // 清理函数确保在组件卸载时恢复滚动
      document.body.style.overflow = '';
      document.body.style.paddingRight = '';
      document.documentElement.style.overflow = '';
    };
  }, [isOpen, method]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim()) return;

    setIsLoading(true);
    setError(null);

    try {
      await onVerify(code.trim());
      setCode('');
    } catch (err: any) {
      console.error('验证失败:', err);
      
      // 处理特定的 TOTP 错误
      const errorMessage = err?.response?.data?.error;
      const errorDetail = err?.response?.data?.detail;
      const errorString = err?.message || JSON.stringify(err?.response?.data || err);
      
      // 检查多种可能的错误格式
      if (errorMessage === 'No TOTP setup in progress or invalid data' || 
          errorString.includes('No TOTP setup in progress or invalid data')) {
        setError(t('verification.errors.totpInvalidOrExpired'));
      } else if (errorDetail && typeof errorDetail === 'string' && 
                 errorDetail.includes('No TOTP setup in progress or invalid data')) {
        setError(t('verification.errors.totpInvalidOrExpired'));
      } else {
        setError(t('verification.errors.totpGenericError'));
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleSwitchMethod = async () => {
    setIsLoading(true);
    setError(null);
    setResendMessage(null);
    
    try {
      await onSwitchMethod();
    } catch (err) {
      setError(t('verification.errors.switchFailed'));
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendCode = async () => {
    if (!onResendCode) return;
    
    setResendLoading(true);
    setError(null);
    setResendMessage(null);

    try {
      await onResendCode();
      setResendMessage(t('verification.codeResent'));
    } catch (err) {
      setError(t('verification.errors.resendFailed'));
    } finally {
      setResendLoading(false);
    }
  };

  const getTitle = () => {
    return method === 'totp' ? t('verification.totpTitle') : t('verification.mailTitle');
  };

  const getDescription = () => {
    return method === 'totp' 
      ? t('verification.totpDescription')
      : t('verification.mailDescription');
  };

  const getIcon = () => {
    return method === 'totp' ? 
      <Smartphone className="w-5 h-5 text-osu-pink" /> : 
      <Mail className="w-5 h-5 text-osu-pink" />;
  };

  const getCodeLength = () => {
    return method === 'totp' ? 6 : 8;
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4" style={{ overflow: 'hidden' }}>
          {/* 背景遮罩 */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={(e) => e.stopPropagation()}
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
              {/* 标题和图标 */}
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-osu-pink/10 dark:bg-osu-pink/20 rounded-lg">
                    {getIcon()}
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                      {getTitle()}
                    </h2>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                      {getDescription()}
                    </p>
                  </div>
                </div>
              </div>

              {/* 验证表单 */}
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label htmlFor="verification-code" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    {method === 'totp' ? t('verification.enterTotpCode') : t('verification.enterMailCode')}
                  </label>
                  <input
                    id="verification-code"
                    type="text"
                    value={code}
                    onChange={(e) => {
                      const value = e.target.value.replace(/\D/g, '').slice(0, getCodeLength());
                      setCode(value);
                    }}
                    placeholder={t('verification.codeHint', { length: getCodeLength() })}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg text-center text-lg tracking-[0.3em] bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-osu-pink focus:border-transparent transition-colors"
                    maxLength={getCodeLength()}
                    disabled={isLoading}
                    autoFocus
                  />
                </div>

                {error && (
                  <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                    <p className="text-sm text-red-600 dark:text-red-400">
                      {error}
                    </p>
                  </div>
                )}

                {resendMessage && (
                  <div className="p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                    <p className="text-sm text-green-600 dark:text-green-400">
                      {resendMessage}
                    </p>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isLoading || code.length !== getCodeLength()}
                  className="w-full bg-osu-pink hover:bg-osu-pink/90 disabled:bg-gray-300 dark:disabled:bg-gray-600 text-white py-3 px-4 rounded-lg font-medium disabled:cursor-not-allowed flex items-center justify-center transition-colors"
                >
                  {isLoading ? (
                    <>
                      <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                      {t('verification.verifying')}
                    </>
                  ) : (
                    t('verification.verify')
                  )}
                </button>
              </form>

              {/* 分割线 */}
              <div className="my-6 border-t border-gray-200 dark:border-gray-700"></div>

              {/* 操作按钮 */}
              <div className="space-y-3">
                <button
                  onClick={handleSwitchMethod}
                  disabled={isLoading}
                  className="w-full text-osu-pink hover:text-osu-pink/80 text-sm font-medium py-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {method === 'totp' ? t('verification.switchToMail') : t('verification.totpTitle')}
                </button>

                {method === 'mail' && onResendCode && (
                  <button
                    onClick={handleResendCode}
                    disabled={resendLoading || isLoading}
                    className="w-full text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 text-sm font-medium py-2 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center transition-colors"
                  >
                    {resendLoading ? (
                      <>
                        <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                        {t('verification.resending')}
                      </>
                    ) : (
                      t('verification.resendCode')
                    )}
                  </button>
                )}
              </div>

              {/* 安全提示 */}
              <div className="mt-6 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
                  {t('verification.securityNotice')}
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};