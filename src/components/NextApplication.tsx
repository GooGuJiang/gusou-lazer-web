'use client';

import { useState } from 'react';
import { I18nextProvider } from 'react-i18next';
import App from '../App';
import { AudioProvider } from './UI/AudioPlayer';
import { AuthProvider } from '../contexts/AuthContext';
import { ProfileColorProvider } from '../contexts/ProfileColorContext';
import SsrDataProvider from '../contexts/SsrDataProvider';
import { VerificationProvider } from '../contexts/VerificationContext';
import { createAppI18n } from '../i18n';
import type { AppLanguages } from '../i18n/resources';
import type { User, UserPageSsrPayload } from '../types';
import type { BeatmapsetsSsrSuccessPayload } from '../utils/beatmapsetsSsr';

interface NextApplicationProps {
  language: AppLanguages;
  location: string;
  initialUser: User | null;
  userPage: UserPageSsrPayload | null;
  beatmapsets: BeatmapsetsSsrSuccessPayload | null;
}

const NextApplication = ({
  language,
  location,
  initialUser,
  userPage,
  beatmapsets,
}: NextApplicationProps) => {
  const [i18n] = useState(() => createAppI18n(language));
  const router = typeof window === 'undefined' ? 'static' : 'browser';

  return (
    <I18nextProvider i18n={i18n}>
      <AuthProvider initialUser={initialUser}>
        <ProfileColorProvider>
          <VerificationProvider>
            <AudioProvider>
              <SsrDataProvider userPage={userPage} beatmapsets={beatmapsets}>
                <App router={router} basename={`/${language}`} location={location} />
              </SsrDataProvider>
            </AudioProvider>
          </VerificationProvider>
        </ProfileColorProvider>
      </AuthProvider>
    </I18nextProvider>
  );
};

export default NextApplication;
