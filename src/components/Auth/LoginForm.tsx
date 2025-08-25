import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FiUser, FiLock, FiEye, FiEyeOff } from 'react-icons/fi';
import { useAuth } from '../../hooks/useAuth';
import LoadingSpinner from '../UI/LoadingSpinner';
import type { LoginForm as LoginFormType } from '../../types';

const LoginForm: React.FC = () => {
  const { login, isLoading } = useAuth();
  const navigate = useNavigate();
  const [formData, setFormData] = useState<LoginFormType>({ username: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.username || !formData.password) return;

    const success = await login(formData.username, formData.password);
    if (success) {
      navigate('/profile');
    }
  };

  return (
    <div className="max-w-md w-full space-y-6">
      <div className="text-center">
        <div className="w-16 h-16 mx-auto bg-gradient-to-r from-pink-400 to-teal-400 rounded-full flex items-center justify-center mb-4">
          <img src="/image/logo.svg" alt="Logo" className="w-10 h-10 object-contain" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">登录</h2>
        <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">登录到你的 咕哦！ 账户</p>
      </div>

      <div className="bg-white dark:bg-gray-800 py-8 px-6 shadow-sm rounded-lg border border-gray-200 dark:border-gray-700">
        <form className="space-y-6" onSubmit={handleSubmit}>
          <div>
            <label htmlFor="username" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              用户名
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
                className="w-full px-3 py-2 pl-10 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                placeholder="输入用户名"
                value={formData.username}
                onChange={handleInputChange}
                disabled={isLoading}
              />
            </div>
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              密码
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FiLock className="h-5 w-5 text-gray-400" />
              </div>
              <input
                id="password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                required
                className="w-full px-3 py-2 pl-10 pr-10 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                placeholder="输入密码"
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
              disabled={isLoading || !formData.username || !formData.password}
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-gradient-to-r from-pink-400 to-teal-400 hover:from-pink-500 hover:to-teal-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-pink-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
            >
              {isLoading ? <LoadingSpinner size="sm" /> : '登录'}
            </button>
          </div>

          <div className="text-center">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              还没有账户？{' '}
              <Link to="/register" className="font-medium text-pink-600 hover:text-pink-500 dark:text-pink-400 dark:hover:text-pink-300">
                立即注册
              </Link>
            </p>
          </div>
        </form>
      </div>

      <div className="text-center">
        <p className="text-xs text-gray-500 dark:text-gray-400">
          登录即表示你同意我们的服务条款和隐私政策
        </p>
      </div>
    </div>
  );
};

export default LoginForm;
