import { notFound } from 'next/navigation';
import React from 'react';

import { UserProfileClient } from './UserProfileClient';
import { fetchUserProfile, ApiError } from '@/lib/server/api';
import type { GameMode } from '@/types';

interface UserPageProps {
  params: { userId: string };
  searchParams: { [key: string]: string | string[] | undefined };
}

export default async function UserPage({ params, searchParams }: UserPageProps) {
  const modeParam = searchParams.mode;
  const requestedMode = Array.isArray(modeParam) ? modeParam[0] : modeParam;
  const mode = (requestedMode || 'osu') as GameMode;

  try {
    const user = await fetchUserProfile(params.userId, mode);

    return (
      <div className="pb-12" style={{ background: 'var(--bg-primary)' }}>
        <div className="max-w-7xl mx-auto px-4 lg:px-6">
          <UserProfileClient initialUser={user} initialMode={mode} userId={user.id} />
        </div>
      </div>
    );
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) {
      notFound();
    }
    throw error;
  }
}
