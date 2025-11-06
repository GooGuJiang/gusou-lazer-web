"use client";

import React, { useCallback, useEffect, useState, useTransition } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';

import UserProfileLayout from '@/components/User/UserProfileLayout';
import type { GameMode, User } from '@/types';
import { useAuth } from '@/hooks/useAuth';

interface ProfileClientProps {
  initialUser: User;
  initialMode: GameMode;
}

export const ProfileClient: React.FC<ProfileClientProps> = ({ initialUser, initialMode }) => {
  const { updateUser } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [, startTransition] = useTransition();
  const [user, setUser] = useState<User>(initialUser);
  const [selectedMode, setSelectedMode] = useState<GameMode>(initialMode);

  useEffect(() => {
    setUser(initialUser);
    updateUser(initialUser);
  }, [initialUser, updateUser]);

  useEffect(() => {
    setSelectedMode(initialMode);
  }, [initialMode]);

  useEffect(() => {
    if (initialUser.g0v0_playmode && initialUser.g0v0_playmode !== initialMode) {
      setSelectedMode(initialUser.g0v0_playmode as GameMode);
    }
  }, [initialMode, initialUser.g0v0_playmode]);

  const buildQueryString = useCallback(
    (nextMode: GameMode) => {
      const params = new URLSearchParams(searchParams.toString());
      if (nextMode === 'osu') {
        params.delete('mode');
      } else {
        params.set('mode', nextMode);
      }
      return params.toString();
    },
    [searchParams],
  );

  const handleModeChange = useCallback(
    (mode: GameMode) => {
      if (mode === selectedMode) return;
      setSelectedMode(mode);
      startTransition(() => {
        const queryString = buildQueryString(mode);
        router.push(queryString ? `${pathname}?${queryString}` : pathname, { scroll: false });
      });
    },
    [buildQueryString, pathname, router, selectedMode, startTransition],
  );

  return (
    <UserProfileLayout
      user={user}
      selectedMode={selectedMode}
      onModeChange={handleModeChange}
      onUserUpdate={(updated) => {
        setUser(updated);
        updateUser(updated);
      }}
    />
  );
};
