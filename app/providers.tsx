"use client";

import React from 'react';

import { AuthProvider, useAuth } from '@/contexts/AuthContext';
import { ProfileColorProvider } from '@/contexts/ProfileColorContext';
import { NotificationProvider } from '@/contexts/NotificationContext';
import { VerificationProvider } from '@/contexts/VerificationContext';

interface ProvidersProps {
  children: React.ReactNode;
}

const NotificationBridge: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, user } = useAuth();

  return (
    <NotificationProvider isAuthenticated={isAuthenticated} user={user}>
      {children}
    </NotificationProvider>
  );
};

export const Providers: React.FC<ProvidersProps> = ({ children }) => {
  return (
    <AuthProvider>
      <ProfileColorProvider>
        <VerificationProvider>
          <NotificationBridge>{children}</NotificationBridge>
        </VerificationProvider>
      </ProfileColorProvider>
    </AuthProvider>
  );
};
