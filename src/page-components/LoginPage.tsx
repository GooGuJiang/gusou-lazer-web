import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../hooks/useAuth';
import LoginForm from '../components/Auth/LoginForm';

const LoginPage: React.FC = () => {
  const { isAuthenticated } = useAuth();
  const router = useRouter();

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      router.push('/profile');
    }
  }, [isAuthenticated, router]);

  return (
    <div className="h-screen bg-gray-50 dark:bg-gray-900 flex justify-center px-4 sm:px-6 lg:px-8 overflow-hidden pt-16 sm:pt-20 lg:pt-0 lg:items-center">
      <LoginForm />
    </div>
  );
};

export default LoginPage;
