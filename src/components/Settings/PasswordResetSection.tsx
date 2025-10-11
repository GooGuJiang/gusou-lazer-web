import React, { useState, useEffect } from 'react';
import { FiLock, FiEye, FiEyeOff, FiCheck, FiX, FiShield } from 'react-icons/fi';
import { useTranslation } from 'react-i18next';
import toast from 'react-hot-toast';
import { userAPI, type TOTPStatus } from '../../utils/api';

interface FormData {
  currentPassword: string;
  totpCode: string;
  newPassword: string;
  confirmPassword: string;
}

const PasswordResetSection: React.FC = () => {
  const { t } = useTranslation();
  const [isExpanded, setIsExpanded] = useState(false);
  const [isChanging, setIsChanging] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [totpStatus, setTotpStatus] = useState<TOTPStatus | null>(null);
  const [isLoadingTotpStatus, setIsLoadingTotpStatus] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    currentPassword: '',
    totpCode: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [errors, setErrors] = useState<Partial<FormData>>({});

  // 获取 TOTP 状态
  useEffect(() => {
    const fetchTotpStatus = async () => {
      if (!isExpanded) return;
      
      setIsLoadingTotpStatus(true);
      try {
        const status = await userAPI.totp.getStatus();
        setTotpStatus(status);
      } catch (error) {
        console.error('获取TOTP状态失败:', error);
        setTotpStatus({ enabled: false });
      } finally {
        setIsLoadingTotpStatus(false);
      }
    };

    fetchTotpStatus();
  }, [isExpanded]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear error when user starts typing
    if (errors[name as keyof FormData]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validatePassword = (password: string): string | null => {
    if (!password) {
      return t('settings.password.errors.newPasswordRequired');
    }
    if (password.length < 8) {
      return t('settings.password.errors.passwordMin');
    }
    if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(password)) {
      return t('settings.password.errors.passwordStrength');
    }
    return null;
  };

  const handleChangePassword = async () => {
    const newErrors: Partial<FormData> = {};

    // 验证方式：如果启用了 TOTP，使用 TOTP 验证；否则使用密码验证
    if (totpStatus?.enabled) {
      if (!formData.totpCode) {
        newErrors.totpCode = t('settings.password.errors.totpCodeRequired');
      } else if (!/^\d{6}$/.test(formData.totpCode) && !/^[A-Z0-9]{10}$/.test(formData.totpCode)) {
        newErrors.totpCode = t('settings.password.errors.totpCodeInvalid');
      }
    } else {
      if (!formData.currentPassword) {
        newErrors.currentPassword = t('settings.password.errors.currentPasswordRequired');
      }
    }

    const passwordError = validatePassword(formData.newPassword);
    if (passwordError) newErrors.newPassword = passwordError;

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = t('settings.password.errors.confirmPasswordRequired');
    } else if (formData.newPassword !== formData.confirmPassword) {
      newErrors.confirmPassword = t('settings.password.errors.confirmPasswordMatch');
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setIsChanging(true);
    try {
      await userAPI.changePassword(
        formData.newPassword,
        totpStatus?.enabled ? undefined : formData.currentPassword,
        totpStatus?.enabled ? formData.totpCode : undefined
      );
      toast.success(t('settings.password.success'));
      toast(t('settings.password.logoutNotice'), {
        icon: '🔒',
        duration: 5000,
      });
      setFormData({
        currentPassword: '',
        totpCode: '',
        newPassword: '',
        confirmPassword: '',
      });
      setIsExpanded(false);
      
      // 延迟后重定向到登录页（因为所有会话都被清除了）
      setTimeout(() => {
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        window.location.href = '/login';
      }, 3000);
    } catch (error: any) {
      console.error('Failed to change password:', error);
      const errorMessage = error?.message || error?.toString() || '';
      
      if (errorMessage.includes('Invalid') || errorMessage.includes('incorrect')) {
        if (totpStatus?.enabled) {
          toast.error(t('settings.password.errors.invalidTotpCode'));
        } else {
          toast.error(t('settings.password.errors.incorrectPassword'));
        }
      } else {
        toast.error(t('settings.password.errors.failed'));
      }
    } finally {
      setIsChanging(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      currentPassword: '',
      totpCode: '',
      newPassword: '',
      confirmPassword: '',
    });
    setErrors({});
    setIsExpanded(false);
  };

  return (
    <div className="space-y-4">
      {!isExpanded ? (
        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {t('settings.password.description')}
          </p>
          <button
            onClick={() => setIsExpanded(true)}
            className="btn-primary !px-4 !py-2 text-sm"
          >
            {t('settings.password.change')}
          </button>
        </div>
      ) : (
        <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-6 border border-gray-200 dark:border-gray-600 space-y-4">
          {isLoadingTotpStatus ? (
            <div className="flex items-center justify-center py-4">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-osu-pink"></div>
              <span className="ml-2 text-sm text-gray-500 dark:text-gray-400">
                {t('settings.password.checkingTotpStatus')}
              </span>
            </div>
          ) : (
            <>
              {/* 提示信息 */}
              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3">
                <p className="text-sm text-blue-700 dark:text-blue-300 flex items-center gap-2">
                  <FiShield className="w-4 h-4" />
                  {totpStatus?.enabled 
                    ? t('settings.password.totpRequired') 
                    : t('settings.password.passwordRequired')}
                </p>
              </div>

              {/* 当前密码或 TOTP 验证码 */}
              {totpStatus?.enabled ? (
                <div>
                  <label htmlFor="totpCode" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    {t('settings.password.totpCode')}
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <FiShield className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      id="totpCode"
                      name="totpCode"
                      type="text"
                      maxLength={10}
                      className={`w-full px-4 py-3 pl-10 border rounded-lg focus:ring-2 focus:ring-osu-pink focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-center tracking-wider ${
                        errors.totpCode ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                      }`}
                      placeholder={t('settings.password.totpCodePlaceholder')}
                      value={formData.totpCode}
                      onChange={handleInputChange}
                    />
                  </div>
                  {errors.totpCode && (
                    <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.totpCode}</p>
                  )}
                  <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                    {t('settings.password.totpCodeHint')}
                  </p>
                </div>
              ) : (
                <div>
                  <label htmlFor="currentPassword" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    {t('settings.password.currentPassword')}
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <FiLock className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      id="currentPassword"
                      name="currentPassword"
                      type={showCurrentPassword ? 'text' : 'password'}
                      className={`w-full px-4 py-3 pl-10 pr-10 border rounded-lg focus:ring-2 focus:ring-osu-pink focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white ${
                        errors.currentPassword ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                      }`}
                      placeholder={t('settings.password.currentPasswordPlaceholder')}
                      value={formData.currentPassword}
                      onChange={handleInputChange}
                    />
                    <button
                      type="button"
                      className="absolute inset-y-0 right-0 pr-3 flex items-center"
                      onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                    >
                      {showCurrentPassword ? (
                        <FiEyeOff className="h-5 w-5 text-gray-400" />
                      ) : (
                        <FiEye className="h-5 w-5 text-gray-400" />
                      )}
                    </button>
                  </div>
                  {errors.currentPassword && (
                    <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.currentPassword}</p>
                  )}
                </div>
              )}
            </>
          )}

          <div>
            <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {t('settings.password.newPassword')}
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FiLock className="h-5 w-5 text-gray-400" />
              </div>
              <input
                id="newPassword"
                name="newPassword"
                type={showNewPassword ? 'text' : 'password'}
                className={`w-full px-4 py-3 pl-10 pr-10 border rounded-lg focus:ring-2 focus:ring-osu-pink focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white ${
                  errors.newPassword ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                }`}
                placeholder={t('settings.password.newPasswordPlaceholder')}
                value={formData.newPassword}
                onChange={handleInputChange}
              />
              <button
                type="button"
                className="absolute inset-y-0 right-0 pr-3 flex items-center"
                onClick={() => setShowNewPassword(!showNewPassword)}
              >
                {showNewPassword ? (
                  <FiEyeOff className="h-5 w-5 text-gray-400" />
                ) : (
                  <FiEye className="h-5 w-5 text-gray-400" />
                )}
              </button>
            </div>
            {errors.newPassword && (
              <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.newPassword}</p>
            )}
          </div>

          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {t('settings.password.confirmPassword')}
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FiLock className="h-5 w-5 text-gray-400" />
              </div>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type={showConfirmPassword ? 'text' : 'password'}
                className={`w-full px-4 py-3 pl-10 pr-10 border rounded-lg focus:ring-2 focus:ring-osu-pink focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white ${
                  errors.confirmPassword ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                }`}
                placeholder={t('settings.password.confirmPasswordPlaceholder')}
                value={formData.confirmPassword}
                onChange={handleInputChange}
              />
              <button
                type="button"
                className="absolute inset-y-0 right-0 pr-3 flex items-center"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              >
                {showConfirmPassword ? (
                  <FiEyeOff className="h-5 w-5 text-gray-400" />
                ) : (
                  <FiEye className="h-5 w-5 text-gray-400" />
                )}
              </button>
            </div>
            {errors.confirmPassword && (
              <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.confirmPassword}</p>
            )}
          </div>

          {/* 警告信息 */}
          <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-3">
            <p className="text-sm text-yellow-700 dark:text-yellow-300">
              ⚠️ {t('settings.password.warningMessage')}
            </p>
          </div>

          <div className="flex gap-3">
            <button
              onClick={handleChangePassword}
              disabled={isChanging || isLoadingTotpStatus}
              className="flex items-center gap-2 btn-primary !px-4 !py-2 !text-sm !inline-flex disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <FiCheck className="w-4 h-4" />
              {isChanging ? t('settings.password.changing') : t('settings.password.change')}
            </button>
            <button
              onClick={handleCancel}
              disabled={isChanging}
              className="flex items-center gap-2 btn-secondary !px-4 !py-2 !text-sm !inline-flex disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <FiX className="w-4 h-4" />
              {t('settings.password.cancel')}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default PasswordResetSection;

