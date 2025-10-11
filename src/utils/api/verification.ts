import { api } from './client';
import { getDeviceUUID } from '../deviceUUID';

export interface VerificationError {
  error: {
    error: string;
    method: 'totp' | 'mail';
  };
}

export interface VerificationResponse {
  method: 'totp' | 'mail';
}

export interface ResendResponse {
  success: boolean;
  message: string;
}

export const verificationAPI = {
  // 验证会话
  verify: async (verificationKey: string): Promise<void> => {
    const formData = new URLSearchParams();
    formData.append('verification_key', verificationKey);

    // 获取设备UUID（异步）
    const deviceUUID = await getDeviceUUID();

    const response = await api.post('/api/v2/session/verify', formData, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'X-UUID': deviceUUID,
      },
    });
    
    return response.data;
  },

  // 重新发送验证码（邮箱）
  reissueCode: async (): Promise<ResendResponse> => {
    const response = await api.post('/api/v2/session/verify/reissue');
    return response.data;
  },

  // 切换到邮箱验证模式
  switchToMailFallback: async (): Promise<VerificationResponse> => {
    const response = await api.post('/api/v2/session/verify/mail-fallback');
    return response.data;
  },
};

// 检查错误是否为用户验证错误
export const isVerificationError = (error: any): error is { response: { data: VerificationError } } => {
  return (
    error?.response?.data?.error?.error === 'User not verified' &&
    (error?.response?.data?.error?.method === 'totp' || error?.response?.data?.error?.method === 'mail')
  );
};

// 从错误中获取验证方法
export const getVerificationMethod = (error: any): 'totp' | 'mail' | null => {
  if (isVerificationError(error)) {
    return error.response.data.error.method;
  }
  return null;
};





