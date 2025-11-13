'use client';

import React, { useEffect } from 'react';
import { AuthProvider } from '@/contexts/AuthContext';
import { AudioProvider } from '@/components/UI/AudioPlayer';
import { VerificationProvider } from '@/contexts/VerificationContext';
import { ProfileColorProvider } from '@/contexts/ProfileColorContext';
import { I18nInitializer } from './i18n-initializer';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <I18nInitializer>
      <AuthProvider>
        <ProfileColorProvider>
          <VerificationProvider>
            <AudioProvider>
              {children}
            </AudioProvider>
          </VerificationProvider>
        </ProfileColorProvider>
      </AuthProvider>
    </I18nInitializer>
  );
}
