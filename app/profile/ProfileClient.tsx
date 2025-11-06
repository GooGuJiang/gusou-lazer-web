"use client";

import React, { useEffect, useRef, useState } from 'react';

import UserProfileLayout from '@/components/User/UserProfileLayout';
import type { GameMode, User } from '@/types';
import { useAuth } from '@/hooks/useAuth';
import { userAPI, handleApiError } from '@/utils/api';

interface ProfileClientProps {
  initialUser: User;
  initialMode: GameMode;
}

export const ProfileClient: React.FC<ProfileClientProps> = ({ initialUser, initialMode }) => {
  const { updateUserMode, updateUser } = useAuth();
  const [user, setUser] = useState<User>(initialUser);
  const [selectedMode, setSelectedMode] = useState<GameMode>(initialMode);
  const isUpdatingModeRef = useRef(false);
  const latestModeRef = useRef<GameMode>(initialMode);

  useEffect(() => {
    setUser(initialUser);
  }, [initialUser]);

  useEffect(() => {
    if (initialUser.g0v0_playmode && initialUser.g0v0_playmode !== initialMode) {
      setSelectedMode(initialUser.g0v0_playmode);
      latestModeRef.current = initialUser.g0v0_playmode;
    }
  }, [initialMode, initialUser.g0v0_playmode]);

  useEffect(() => {
    const loadModeData = async () => {
      if (isUpdatingModeRef.current) return;
      if (latestModeRef.current === selectedMode) return;

      latestModeRef.current = selectedMode;
      isUpdatingModeRef.current = true;

      try {
        const data = await userAPI.getMe(selectedMode);
        setUser(data);
        updateUser(data);
        await updateUserMode(selectedMode);
      } catch (error) {
        handleApiError(error);
      } finally {
        isUpdatingModeRef.current = false;
      }
    };

    void loadModeData();
  }, [selectedMode, updateUserMode, updateUser]);

  return (
    <UserProfileLayout
      user={user}
      selectedMode={selectedMode}
      onModeChange={setSelectedMode}
      onUserUpdate={(updated) => {
        setUser(updated);
        updateUser(updated);
      }}
    />
  );
};
