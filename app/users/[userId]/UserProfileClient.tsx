"use client";

import React, { useEffect, useRef, useState } from 'react';

import UserProfileLayout from '@/components/User/UserProfileLayout';
import type { GameMode, User } from '@/types';
import { userAPI, handleApiError } from '@/utils/api';

interface UserProfileClientProps {
  userId: number;
  initialUser: User;
  initialMode: GameMode;
}

export const UserProfileClient: React.FC<UserProfileClientProps> = ({
  userId,
  initialUser,
  initialMode,
}) => {
  const [user, setUser] = useState<User>(initialUser);
  const [selectedMode, setSelectedMode] = useState<GameMode>(initialMode);
  const isFetchingRef = useRef(false);
  const latestModeRef = useRef<GameMode>(initialMode);

  useEffect(() => {
    setUser(initialUser);
  }, [initialUser]);

  useEffect(() => {
    const loadUser = async () => {
      if (isFetchingRef.current) return;
      if (latestModeRef.current === selectedMode) return;

      latestModeRef.current = selectedMode;
      isFetchingRef.current = true;

      try {
        const data = await userAPI.getUser(userId, selectedMode);
        setUser(data);
      } catch (error) {
        handleApiError(error);
      } finally {
        isFetchingRef.current = false;
      }
    };

    void loadUser();
  }, [selectedMode, userId]);

  return (
    <UserProfileLayout
      user={user}
      selectedMode={selectedMode}
      onModeChange={setSelectedMode}
      onUserUpdate={setUser}
    />
  );
};
