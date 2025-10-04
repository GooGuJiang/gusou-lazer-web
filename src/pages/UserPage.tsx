import React, { useEffect, useState } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import UserProfileLayout from '../components/User/UserProfileLayout';
import { userAPI } from '../utils/api';
import type { User, GameMode } from '../types';

const UserPage: React.FC = () => {
  const { t } = useTranslation();
  const { userId } = useParams<{ userId: string }>();
  const [searchParams] = useSearchParams();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // 从 URL 参数获取模式,如果没有则默认为 'osu'
  const modeFromUrl = searchParams.get('mode') as GameMode | null;
  const [selectedMode, setSelectedMode] = useState<GameMode>(modeFromUrl || 'osu');

  // 当 URL 参数中的模式变化时,更新选中的模式
  useEffect(() => {
    if (modeFromUrl) {
      setSelectedMode(modeFromUrl);
    }
  }, [modeFromUrl]);

  useEffect(() => {
    if (!userId) return;
    setLoading(true);
    userAPI
      .getUser(userId, selectedMode)
      .then(setUser)
      .catch((err: unknown) => {
        const message = (err as { response?: { data?: { detail?: string } } }).response?.data?.detail;
        setError(message || t('profile.errors.loadFailed'));
        setUser(null);
      })
      .finally(() => setLoading(false));
  }, [userId, selectedMode]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-osu-pink" />
      </div>
    );
  }

  if (error || !user) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
        <div className="text-6xl mb-4">😕</div>
        <h2 className="text-2xl font-bold text-gray-800 mb-2">{t('profile.errors.userNotFound')}</h2>
        <p className="text-gray-600">{error || t('profile.errors.checkId')}</p>
      </div>
    );
  }

  return (
    <UserProfileLayout
      user={user}
      selectedMode={selectedMode}
      onModeChange={setSelectedMode}
      onUserUpdate={setUser}
    />
  );
};

export default UserPage;

