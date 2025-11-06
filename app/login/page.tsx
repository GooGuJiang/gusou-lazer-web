import React from 'react';

import LoginForm from '@/components/Auth/LoginForm';

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--bg-primary)] px-4 py-8">
      <LoginForm />
    </div>
  );
}
