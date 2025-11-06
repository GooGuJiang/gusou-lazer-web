"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import { VerificationModal } from '../components/VerificationModal/VerificationModal';
import { verificationAPI, isVerificationError, getVerificationMethod } from '../utils/api/verification';
import { setGlobalVerificationHandler } from '../utils/api/client';

interface VerificationContextType {
  showVerificationModal: (method: 'totp' | 'mail') => Promise<void>;
  handleVerificationError: (error: any) => boolean;
}

const VerificationContext = createContext<VerificationContextType | undefined>(undefined);

interface VerificationProviderProps {
  children: ReactNode;
}

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
    try {
      await verificationAPI.verify(code);
      setIsModalOpen(false);
      if (resolveVerification) {
        resolveVerification();
        setResolveVerification(null);
        setRejectVerification(null);
      }
      // 验证成功后刷新页面以重新请求API
      window.location.reload();
    } catch (error) {
      // 如果验证失败，抛出错误让模态框显示错误信息
      throw error;
    }
  };

  const handleSwitchMethod = async (): Promise<void> => {
    try {
      if (currentMethod === 'totp') {
        // 从 TOTP 切换到邮箱验证
        await verificationAPI.switchToMailFallback();
        setCurrentMethod('mail');
      } else {
        // 从邮箱切换到 TOTP（这里可能需要根据API设计调整）
        setCurrentMethod('totp');
      }
    } catch (error) {
      throw error;
    }
  };

  const handleResendCode = async (): Promise<void> => {
    if (currentMethod === 'mail') {
      await verificationAPI.reissueCode();
    }
  };

  const handleVerificationError = (error: any): boolean => {
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
  };

  // 在组件挂载时设置全局验证处理器
  useEffect(() => {
    setGlobalVerificationHandler(handleVerificationError);
    
    // 清理函数
    return () => {
      setGlobalVerificationHandler(() => false);
    };
  }, []);

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

export const useVerification = (): VerificationContextType => {
  const context = useContext(VerificationContext);
  if (context === undefined) {
    throw new Error('useVerification must be used within a VerificationProvider');
  }
  return context;
};
