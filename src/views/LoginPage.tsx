import React, { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import LoginForm from '../components/Auth/LoginForm';

const LoginPage: React.FC = () => {
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const redirect = searchParams.get('redirect');
  // 只允许站内相对路径，防止开放重定向
  const safeRedirect = redirect && redirect.startsWith('/') && !redirect.startsWith('//');

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated && user) {
      navigate(safeRedirect ? redirect : `/users/${user.id}`);
    }
  }, [isAuthenticated, user, navigate, redirect, safeRedirect]);

  return (
    <div className="h-screen bg-gray-50 dark:bg-gray-900 flex justify-center px-4 sm:px-6 lg:px-8 overflow-hidden pt-16 sm:pt-20 lg:pt-0 lg:items-center">
      <LoginForm />
    </div>
  );
};

export default LoginPage;
