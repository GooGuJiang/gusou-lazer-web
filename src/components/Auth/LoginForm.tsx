import React, { useState, useRef, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FiUser, FiLock, FiEye, FiEyeOff } from 'react-icons/fi';
import { useTranslation } from 'react-i18next';
import { Turnstile } from '@marsidev/react-turnstile';
import { useAuth } from '../../hooks/useAuth';
import LoadingSpinner from '../UI/LoadingSpinner';
import type { LoginForm as LoginFormType } from '../../types';

const TURNSTILE_SITE_KEY = import.meta.env.VITE_TURNSTILE_SITE_KEY || '1x00000000000000000000AA'; // Test key by default

const LoginForm: React.FC = () => {
  const { login, isLoading } = useAuth();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [formData, setFormData] = useState<LoginFormType>({ username: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [turnstileToken, setTurnstileToken] = useState<string>('');
  const turnstileRef = useRef<any>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.username || !formData.password) return;

    const success = await login(formData.username, formData.password, turnstileToken);
    if (success) {
      navigate('/profile');
    } else {
      // Refresh turnstile on error
      if (turnstileRef.current) {
        turnstileRef.current.reset();
      }
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
    <div className="max-w-md w-full space-y-3">
      <div className="text-center">
        <div className="w-12 h-12 mx-auto flex items-center justify-center mb-2">
          <img src="/image/logos/logo.svg" alt={t('common.brandAlt')} className="w-12 h-12 object-contain" />
        </div>
        <h2 className="text-xl font-bold text-gray-900 dark:text-white">{t('auth.login.title')}</h2>
        <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">{t('auth.login.subtitle')}</p>
      </div>

      <div className="sm:bg-white sm:dark:bg-gray-800 sm:py-4 sm:px-6 sm:shadow-sm sm:rounded-lg sm:border sm:border-gray-200 sm:dark:border-gray-700 py-2">
        <form className="space-y-3" onSubmit={handleSubmit}>
          <div>
            <label htmlFor="username" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              {t('auth.login.username')}
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FiUser className="h-5 w-5 text-gray-400" />
              </div>
              <input
                id="username"
                name="username"
                type="text"
                required
                className="w-full px-3 py-2 pl-10 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-osu-pink focus:border-transparent"
                placeholder={t('auth.login.usernamePlaceholder')}
                value={formData.username}
                onChange={handleInputChange}
                disabled={isLoading}
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                {t('auth.login.password')}
              </label>
              <Link
                to="/password-reset"
                className="text-xs font-medium text-osu-pink hover:text-osu-pink/80 dark:text-osu-pink dark:hover:text-osu-pink/80"
              >
                {t('auth.login.forgotPassword')}
              </Link>
            </div>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FiLock className="h-5 w-5 text-gray-400" />
              </div>
              <input
                id="password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                required
                className="w-full px-3 py-2 pl-10 pr-10 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-osu-pink focus:border-transparent"
                placeholder={t('auth.login.passwordPlaceholder')}
                value={formData.password}
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
          </div>

          <div>
            <button
              type="submit"
              disabled={isLoading || !formData.username || !formData.password || !turnstileToken}
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-osu-pink hover:bg-osu-pink/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-osu-pink disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
            >
              {isLoading ? <LoadingSpinner size="sm" /> : t('auth.login.submit')}
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
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {t('auth.login.noAccount')}{' '}
              <Link to="/register" className="font-medium text-osu-pink hover:text-osu-pink/80 dark:text-osu-pink dark:hover:text-osu-pink/80">
                {t('auth.login.registerNow')}
              </Link>
            </p>
          </div>
        </form>
      </div>

      <div className="text-center">
        <p className="text-xs text-gray-500 dark:text-gray-400">
          {t('common.authAgreement')}
        </p>
      </div>
    </div>
  );
};

export default LoginForm;
