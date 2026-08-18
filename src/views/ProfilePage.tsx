import React, { useEffect, useState, useRef } from 'react';
import { Navigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../hooks/useAuth';
import UserProfileLayout from '../components/User/UserProfileLayout';
import type { GameMode } from '../types';

const ProfilePage: React.FC = () => {
  const { t } = useTranslation();
  const { user, isAuthenticated, isLoading, updateUserMode, updateUser } = useAuth();
  const [selectedMode, setSelectedMode] = useState<GameMode>('osu');

  // 使用 ref 跟踪是否正在更新模式，防止重复请求
  const isUpdatingModeRef = useRef(false);
  const latestModeRef = useRef<GameMode>(selectedMode);

  // 当用户数据加载后，根据用户的 g0v0_playmode 设置初始模式
  useEffect(() => {
    if (user?.g0v0_playmode && user.g0v0_playmode !== selectedMode) {
      setSelectedMode(user.g0v0_playmode);
      latestModeRef.current = user.g0v0_playmode;
    }
  }, [user?.g0v0_playmode]);

  useEffect(() => {
    // 如果正在更新或未认证，跳过
    if (!isAuthenticated || isUpdatingModeRef.current) return;

    // 如果模式没有变化，跳过
    if (latestModeRef.current === selectedMode && user?.g0v0_playmode === selectedMode) {
      return;
    }

    latestModeRef.current = selectedMode;
    isUpdatingModeRef.current = true;

    updateUserMode(selectedMode)
      .catch(() => {})
      .finally(() => {
        isUpdatingModeRef.current = false;
      });
  }, [selectedMode, isAuthenticated, updateUserMode, user?.g0v0_playmode]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-osu-pink" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
        <div className="text-6xl mb-4">😕</div>
        <h2 className="text-2xl font-bold text-gray-800 mb-2">{t('profile.errors.loadFailed')}</h2>
        <p className="text-gray-600">{t('profile.errors.tryRefresh')}</p>
      </div>
    );
  }

  return (
    <UserProfileLayout
      user={user}
      selectedMode={selectedMode}
      onModeChange={setSelectedMode}
      onUserUpdate={updateUser}
    />
  );
};

export default ProfilePage;
