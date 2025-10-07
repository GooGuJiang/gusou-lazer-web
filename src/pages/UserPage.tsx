import React, { useEffect, useState, useRef } from 'react';
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
  
  // 从 URL 参数获取模式
  const modeFromUrl = searchParams.get('mode') as GameMode | null;
  const [selectedMode, setSelectedMode] = useState<GameMode>(modeFromUrl || 'osu');
  
  // 使用 ref 来跟踪最新的请求，防止竞态条件
  const abortControllerRef = useRef<AbortController | null>(null);
  const latestModeRef = useRef<GameMode>(selectedMode);

  // 当用户数据加载后，如果 URL 没有指定模式，使用用户的 g0v0_playmode
  useEffect(() => {
    if (modeFromUrl) {
      setSelectedMode(modeFromUrl);
    } else if (user?.g0v0_playmode && selectedMode !== user.g0v0_playmode) {
      setSelectedMode(user.g0v0_playmode);
    }
  }, [modeFromUrl, user?.g0v0_playmode]);

  useEffect(() => {
    if (!userId) return;
    
    // 取消之前的请求
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    
    // 创建新的 AbortController
    const abortController = new AbortController();
    abortControllerRef.current = abortController;
    latestModeRef.current = selectedMode;
    
    setLoading(true);
    setError(null);
    
    userAPI
      .getUser(userId, selectedMode)
      .then((userData) => {
        // 只有当请求未被取消且仍然是最新的模式时才更新数据
        if (!abortController.signal.aborted && latestModeRef.current === selectedMode) {
          setUser(userData);
          setError(null);
        }
      })
      .catch((err: unknown) => {
        // 忽略被取消的请求
        if (abortController.signal.aborted) return;
        
        const message = (err as { response?: { data?: { detail?: string } } }).response?.data?.detail;
        setError(message || t('profile.errors.loadFailed'));
        setUser(null);
      })
      .finally(() => {
        if (!abortController.signal.aborted) {
          setLoading(false);
        }
      });
    
    // 清理函数：取消请求
    return () => {
      abortController.abort();
    };
  }, [userId, selectedMode, t]);

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

