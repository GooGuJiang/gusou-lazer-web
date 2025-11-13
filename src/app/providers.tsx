'use client';

import React from 'react';
import { AuthProvider } from '@/contexts/AuthContext';
import { AudioProvider } from '@/components/UI/AudioPlayer';
import { VerificationProvider } from '@/contexts/VerificationContext';
import { ProfileColorProvider } from '@/contexts/ProfileColorContext';
import '@/i18n';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <ProfileColorProvider>
        <VerificationProvider>
          <AudioProvider>
            {children}
          </AudioProvider>
        </VerificationProvider>
      </ProfileColorProvider>
    </AuthProvider>
  );
}
