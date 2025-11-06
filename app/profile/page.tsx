import { redirect } from 'next/navigation';
import React from 'react';

import { ProfileClient } from './ProfileClient';
import { fetchCurrentUser } from '@/lib/server/api';
import type { GameMode } from '@/types';

interface ProfilePageProps {
  searchParams: { [key: string]: string | string[] | undefined };
}

export default async function ProfilePage({ searchParams }: ProfilePageProps) {
  const modeParam = searchParams.mode;
  const requestedMode = Array.isArray(modeParam) ? modeParam[0] : modeParam;
  const mode = (requestedMode || 'osu') as GameMode;

  const user = await fetchCurrentUser(mode);

  if (!user) {
    redirect(`/login?redirect=${encodeURIComponent('/profile')}`);
  }

  return (
    <div className="pb-12" style={{ background: 'var(--bg-primary)' }}>
      <div className="max-w-7xl mx-auto px-4 lg:px-6">
        <ProfileClient initialUser={user} initialMode={mode} />
      </div>
    </div>
  );
}
