import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FiMail, FiLock, FiEye, FiEyeOff, FiArrowLeft, FiKey } from 'react-icons/fi';
import { useTranslation } from 'react-i18next';
import { Turnstile } from '@marsidev/react-turnstile';
import { useAuth } from '../hooks/useAuth';
import LoadingSpinner from '../components/UI/LoadingSpinner';
import { authAPI } from '../utils/api';
import toast from 'react-hot-toast';

const TURNSTILE_SITE_KEY = import.meta.env.VITE_TURNSTILE_SITE_KEY || '1x00000000000000000000AA'; // Test key by default

type ResetStep = 'request' | 'reset';

interface FormData {
  email: string;
  resetCode: string;
  newPassword: string;
  confirmPassword: string;
}

const PasswordResetPage: React.FC = () => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [step, setStep] = useState<ResetStep>('request');
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    email: '',
    resetCode: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState<Partial<FormData>>({});
  const [resendCountdown, setResendCountdown] = useState(0);
  const [turnstileToken, setTurnstileToken] = useState<string>('');
  const turnstileRef = useRef<any>(null);

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/profile');
    }
  }, [isAuthenticated, navigate]);

  // Countdown timer for resend
  useEffect(() => {
    if (resendCountdown > 0) {
      const timer = setTimeout(() => setResendCountdown(resendCountdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendCountdown]);

  const validateEmail = (email: string): string | null => {
    if (!email) {
      return t('auth.passwordReset.errors.emailRequired');
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return t('auth.passwordReset.errors.emailInvalid');
    }
    return null;
  };

  const validateResetCode = (code: string): string | null => {
    if (!code) {
      return t('auth.passwordReset.errors.codeRequired');
    }
    if (!/^\d{8}$/.test(code)) {
      return t('auth.passwordReset.errors.codeInvalid');
    }
    return null;
  };

  const validatePassword = (password: string): string | null => {
    if (!password) {
      return t('auth.passwordReset.errors.passwordRequired');
    }
    if (password.length < 8) {
      return t('auth.passwordReset.errors.passwordMin');
    }
    if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(password)) {
      return t('auth.passwordReset.errors.passwordStrength');
    }
    return null;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear error when user starts typing
    if (errors[name as keyof FormData]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleRequestCode = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const emailError = validateEmail(formData.email);
    if (emailError) {
      setErrors({ email: emailError });
      return;
    }

    setIsLoading(true);
    try {
      await authAPI.requestPasswordReset(formData.email, turnstileToken);
      toast.success(t('auth.passwordReset.codeSent'));
      setStep('reset');
      setResendCountdown(60); // 60 seconds countdown
      // Reset turnstile token for the next step
      setTurnstileToken('');
    } catch (error: any) {
      console.error('Failed to request password reset:', error);
      
      // Refresh turnstile on error
      if (turnstileRef.current) {
        turnstileRef.current.reset();
      }
      
      // 如果是请求过于频繁的错误，说明验证码已发送，直接跳转到重置步骤
      if (error.response?.data?.error === '请求过于频繁，请稍后再试' || 
          error.response?.data?.detail?.includes('频繁') ||
          error.response?.status === 429) {
        toast.success(t('auth.passwordReset.codeSent'));
        setStep('reset');
        setResendCountdown(60);
        setTurnstileToken('');
      } else {
        toast.error(t('auth.passwordReset.errors.sendFailed'));
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendCode = async () => {
    if (resendCountdown > 0) return;

    setIsLoading(true);
    try {
      await authAPI.requestPasswordReset(formData.email, turnstileToken);
      toast.success(t('auth.passwordReset.codeSent'));
      setResendCountdown(60);
    } catch (error) {
      console.error('Failed to resend code:', error);
      toast.error(t('auth.passwordReset.errors.sendFailed'));
      // Refresh turnstile on error
      if (turnstileRef.current) {
        turnstileRef.current.reset();
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();

    const newErrors: Partial<FormData> = {};
    
    const codeError = validateResetCode(formData.resetCode);
    if (codeError) newErrors.resetCode = codeError;

    const passwordError = validatePassword(formData.newPassword);
    if (passwordError) newErrors.newPassword = passwordError;

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = t('auth.passwordReset.errors.confirmPasswordRequired');
    } else if (formData.newPassword !== formData.confirmPassword) {
      newErrors.confirmPassword = t('auth.passwordReset.errors.confirmPasswordMatch');
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setIsLoading(true);
    try {
      await authAPI.resetPassword(formData.email, formData.resetCode, formData.newPassword, turnstileToken);
      toast.success(t('auth.passwordReset.success'));
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    } catch (error: any) {
      console.error('Failed to reset password:', error);
      // Refresh turnstile on error
      if (turnstileRef.current) {
        turnstileRef.current.reset();
      }
      if (error.response?.status === 400 || error.response?.status === 404) {
        toast.error(t('auth.passwordReset.errors.invalidCode'));
      } else {
        toast.error(t('auth.passwordReset.errors.resetFailed'));
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleTurnstileSuccess = useCallback((token: string) => {
    setTurnstileToken(token);
  }, []);

  const handleTurnstileError = useCallback(() => {
    setTurnstileToken('');
    if (turnstileRef.current) {
      turnstileRef.current.reset();
    }
  }, []);

  return (
    <div className="h-screen bg-gray-50 dark:bg-gray-900 flex justify-center px-4 sm:px-6 lg:px-8 overflow-auto pt-8 sm:pt-12 lg:pt-0 lg:items-center">
      <div className="max-w-md w-full space-y-3 pb-4 lg:pb-0">
        <div className="text-center">
          <div className="w-12 h-12 mx-auto flex items-center justify-center mb-2">
            <img
              src="/image/logos/logo.svg"
              alt={t('common.brandAlt')}
              className="w-12 h-12 object-contain"
            />
          </div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">
            {t('auth.passwordReset.title')}
          </h2>
          <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
            {step === 'request' 
              ? t('auth.passwordReset.subtitle')
              : t('auth.passwordReset.codeExpiry')}
          </p>
        </div>

        <div className="sm:bg-white sm:dark:bg-gray-800 sm:py-4 sm:px-6 sm:shadow-sm sm:rounded-lg sm:border sm:border-gray-200 sm:dark:border-gray-700 py-2">
          {step === 'request' ? (
            <form className="space-y-3" onSubmit={handleRequestCode}>
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  {t('auth.passwordReset.email')}
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FiMail className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    required
                    className={`w-full px-3 py-2 pl-10 border rounded-md shadow-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-osu-pink focus:border-transparent ${
                      errors.email ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                    }`}
                    placeholder={t('auth.passwordReset.emailPlaceholder')}
                    value={formData.email}
                    onChange={handleInputChange}
                    disabled={isLoading}
                  />
                </div>
                {errors.email && (
                  <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.email}</p>
                )}
              </div>

              <div>
                <button
                  type="submit"
                  disabled={isLoading || !formData.email || !turnstileToken}
                  className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-osu-pink hover:bg-osu-pink/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-osu-pink disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                >
                  {isLoading ? <LoadingSpinner size="sm" /> : t('auth.passwordReset.sendCode')}
                </button>
              </div>

              <div className="flex justify-center">
                <Turnstile
                  ref={turnstileRef}
                  siteKey={TURNSTILE_SITE_KEY}
                  onSuccess={handleTurnstileSuccess}
                  onError={handleTurnstileError}
                  onExpire={handleTurnstileError}
                  options={{
                    theme: 'auto',
                    size: 'normal',
                  }}
                />
              </div>

              <div className="text-center">
                <Link
                  to="/login"
                  className="text-sm font-medium text-osu-pink hover:text-osu-pink/80 dark:text-osu-pink dark:hover:text-osu-pink/80 flex items-center justify-center gap-1"
                >
                  <FiArrowLeft className="w-4 h-4" />
                  {t('auth.passwordReset.backToLogin')}
                </Link>
              </div>
            </form>
          ) : (
            <form className="space-y-3" onSubmit={handleResetPassword}>
              <div>
                <label htmlFor="resetCode" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  {t('auth.passwordReset.resetCode')}
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FiKey className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="resetCode"
                    name="resetCode"
                    type="text"
                    required
                    maxLength={8}
                    className={`w-full px-3 py-2 pl-10 border rounded-md shadow-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-osu-pink focus:border-transparent ${
                      errors.resetCode ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                    }`}
                    placeholder={t('auth.passwordReset.resetCodePlaceholder')}
                    value={formData.resetCode}
                    onChange={handleInputChange}
                    disabled={isLoading}
                  />
                </div>
                {errors.resetCode && (
                  <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.resetCode}</p>
                )}
                <div className="mt-1 flex items-center justify-between">
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {formData.email}
                  </p>
                  <button
                    type="button"
                    onClick={handleResendCode}
                    disabled={resendCountdown > 0 || isLoading}
                    className="text-xs text-osu-pink hover:text-osu-pink/80 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {resendCountdown > 0 
                      ? t('auth.passwordReset.resendAvailableIn', { seconds: resendCountdown })
                      : t('auth.passwordReset.resendCode')}
                  </button>
                </div>
              </div>

              <div>
                <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  {t('auth.passwordReset.newPassword')}
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FiLock className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="newPassword"
                    name="newPassword"
                    type={showPassword ? 'text' : 'password'}
                    required
                    className={`w-full px-3 py-2 pl-10 pr-10 border rounded-md shadow-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-osu-pink focus:border-transparent ${
                      errors.newPassword ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                    }`}
                    placeholder={t('auth.passwordReset.newPasswordPlaceholder')}
                    value={formData.newPassword}
                    onChange={handleInputChange}
                    disabled={isLoading}
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center hover:text-gray-600 dark:hover:text-gray-300"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
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
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  {t('auth.passwordReset.confirmPassword')}
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FiLock className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type={showConfirmPassword ? 'text' : 'password'}
                    required
                    className={`w-full px-3 py-2 pl-10 pr-10 border rounded-md shadow-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-osu-pink focus:border-transparent ${
                      errors.confirmPassword ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                    }`}
                    placeholder={t('auth.passwordReset.confirmPasswordPlaceholder')}
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    disabled={isLoading}
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center hover:text-gray-600 dark:hover:text-gray-300"
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

              <div>
                <button
                  type="submit"
                  disabled={isLoading || !formData.resetCode || !formData.newPassword || !formData.confirmPassword || !turnstileToken}
                  className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-osu-pink hover:bg-osu-pink/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-osu-pink disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                >
                  {isLoading ? <LoadingSpinner size="sm" /> : t('auth.passwordReset.resetPassword')}
                </button>
              </div>

              <div className="flex justify-center">
                <Turnstile
                  ref={turnstileRef}
                  siteKey={TURNSTILE_SITE_KEY}
                  onSuccess={handleTurnstileSuccess}
                  onError={handleTurnstileError}
                  onExpire={handleTurnstileError}
                  options={{
                    theme: 'auto',
                    size: 'normal',
                  }}
                />
              </div>

              <div className="text-center">
                <button
                  type="button"
                  onClick={() => setStep('request')}
                  className="text-sm font-medium text-osu-pink hover:text-osu-pink/80 dark:text-osu-pink dark:hover:text-osu-pink/80 flex items-center justify-center gap-1 mx-auto"
                >
                  <FiArrowLeft className="w-4 h-4" />
                  {t('auth.passwordReset.backToLogin')}
                </button>
              </div>
            </form>
          )}
        </div>

        <div className="text-center">
          <p className="text-xs text-gray-500 dark:text-gray-400">
            {t('common.authAgreement')}
          </p>
        </div>
      </div>
    </div>
  );
};

export default PasswordResetPage;

