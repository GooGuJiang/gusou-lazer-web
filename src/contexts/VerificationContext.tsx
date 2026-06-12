import React, { useState, useEffect, useCallback } from 'react';
import { VerificationModal } from '../components/VerificationModal/VerificationModal';
import { verificationAPI, isVerificationError, getVerificationMethod } from '../utils/api/verification';
import { setGlobalVerificationHandler } from '../utils/api/client';
import { VerificationContext } from './verificationContextCore';
import type { VerificationContextType, VerificationProviderProps } from './verificationContextCore';

export const VerificationProvider: React.FC<VerificationProviderProps> = ({ children }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentMethod, setCurrentMethod] = useState<'totp' | 'mail'>('totp');
  const [resolveVerification, setResolveVerification] = useState<(() => void) | null>(null);
  const [, setRejectVerification] = useState<((error: Error) => void) | null>(null);

  const showVerificationModal = (method: 'totp' | 'mail'): Promise<void> => {
    return new Promise((resolve, reject) => {
      setCurrentMethod(method);
      setIsModalOpen(true);
      setResolveVerification(() => resolve);
      setRejectVerification(() => reject);
    });
  };

  const handleVerify = async (code: string): Promise<void> => {
    await verificationAPI.verify(code);
    setIsModalOpen(false);
    if (resolveVerification) {
      resolveVerification();
      setResolveVerification(null);
      setRejectVerification(null);
    }
    // 验证成功后刷新页面以重新请求API
    window.location.reload();
  };

  const handleSwitchMethod = async (): Promise<void> => {
    if (currentMethod === 'totp') {
      // 从 TOTP 切换到邮箱验证
      await verificationAPI.switchToMailFallback();
      setCurrentMethod('mail');
    } else {
      // 从邮箱切换到 TOTP（这里可能需要根据API设计调整）
      setCurrentMethod('totp');
    }
  };

  const handleResendCode = async (): Promise<void> => {
    if (currentMethod === 'mail') {
      await verificationAPI.reissueCode();
    }
  };

  const handleVerificationError = useCallback((error: unknown): boolean => {
    if (isVerificationError(error)) {
      const method = getVerificationMethod(error);
      if (method) {
        showVerificationModal(method).catch(() => {
          // 如果用户取消验证，这里可以处理
        });
        return true;
      }
    }
    return false;
  }, [showVerificationModal]);

  // 在组件挂载时设置全局验证处理器
  useEffect(() => {
    setGlobalVerificationHandler(handleVerificationError);
    
    // 清理函数
    return () => {
      setGlobalVerificationHandler(() => false);
    };
  }, [handleVerificationError]);

  const contextValue: VerificationContextType = {
    showVerificationModal,
    handleVerificationError,
  };

  return (
    <VerificationContext.Provider value={contextValue}>
      {children}
      <VerificationModal
        isOpen={isModalOpen}
        method={currentMethod}
        onVerify={handleVerify}
        onSwitchMethod={handleSwitchMethod}
        onResendCode={currentMethod === 'mail' ? handleResendCode : undefined}
      />
    </VerificationContext.Provider>
  );
};
