import React, { useEffect, useState, useRef, useMemo } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import UserProfileLayout from '../components/User/UserProfileLayout';
import { userAPI } from '../utils/api';
import type { User, GameMode, UserPageSsrPayload } from '../types';
import { getUserPageSsrMaxAge, getUserPageSsrPayloadFromDocument } from '../utils/userPageSsr';

const UserPage: React.FC = () => {
  const { t } = useTranslation();
  const { userId } = useParams<{ userId: string }>();
  const [searchParams] = useSearchParams();
  const modeFromUrl = searchParams.get('mode') as GameMode | null;
  const initialSsrPayload = useMemo<UserPageSsrPayload | null>(() => {
    const payload = getUserPageSsrPayloadFromDocument();
    if (!payload || !userId) return null;

    const isCurrentRoute = payload.route.userId === userId;
    const isCurrentMode = modeFromUrl ? payload.route.mode === modeFromUrl : !payload.route.mode;
    const isFresh = Date.now() - new Date(payload.fetchedAt).getTime() <= getUserPageSsrMaxAge();

    return isCurrentRoute && isCurrentMode && isFresh ? payload : null;
  }, [modeFromUrl, userId]);
  const [user, setUser] = useState<User | null>(() => initialSsrPayload?.user ?? null);
  const [loading, setLoading] = useState(!initialSsrPayload);
  const [error, setError] = useState<string | null>(null);

  // 从 URL 参数、SSR 用户默认模式或后端返回的用户默认模式获取当前模式
  const [selectedMode, setSelectedMode] = useState<GameMode>(
    modeFromUrl || initialSsrPayload?.route.mode || initialSsrPayload?.user.g0v0_playmode || 'osu'
  );

  const [isRankHistoryUpdating, setIsRankHistoryUpdating] = useState(false);
  const [rankHistoryAnimationKey, setRankHistoryAnimationKey] = useState(0);

  // 使用 ref 来跟踪最新的请求，防止竞态条件
  const abortControllerRef = useRef<AbortController | null>(null);
  const latestModeRef = useRef<GameMode>(selectedMode);
  const latestLoadedModeRef = useRef<GameMode>(initialSsrPayload?.route.mode ?? selectedMode);
  const latestLoadedRequestModeRef = useRef<GameMode | undefined>(initialSsrPayload?.route.mode);
  const hasVisibleUserRef = useRef(Boolean(initialSsrPayload));
  const userInitiatedModeChangeRef = useRef(false);

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

    const isUserModeSwitch = userInitiatedModeChangeRef.current;
    const requestedMode = modeFromUrl ?? (isUserModeSwitch ? selectedMode : undefined);
    const isSsrMatchingRequest = modeFromUrl
      ? initialSsrPayload?.route.mode === modeFromUrl
      : !initialSsrPayload?.route.mode;

    if (initialSsrPayload && isSsrMatchingRequest && !isUserModeSwitch) {
      setUser(initialSsrPayload.user);
      latestLoadedModeRef.current = selectedMode;
      latestLoadedRequestModeRef.current = requestedMode;
      hasVisibleUserRef.current = true;
      setIsRankHistoryUpdating(false);
      setLoading(false);
      setError(null);
      return;
    }

    if (
      !modeFromUrl &&
      !userInitiatedModeChangeRef.current &&
      hasVisibleUserRef.current &&
      latestLoadedRequestModeRef.current === undefined
    ) {
      return;
    }

    // 取消之前的请求
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    // 创建新的 AbortController
    const abortController = new AbortController();
    abortControllerRef.current = abortController;
    latestModeRef.current = selectedMode;

    // 首次加载才显示 loading，模式切换时保持当前数据可见
    if (!user) {
      setLoading(true);
    }
    const shouldAnimateRankRefresh =
      userInitiatedModeChangeRef.current &&
      hasVisibleUserRef.current &&
      latestLoadedModeRef.current !== selectedMode;
    setIsRankHistoryUpdating(shouldAnimateRankRefresh);
    setError(null);

    userAPI
      .getUser(userId, requestedMode)
      .then((userData) => {
        // 只有当请求未被取消且仍然是最新的模式时才更新数据
        if (!abortController.signal.aborted && latestModeRef.current === selectedMode) {
          const resolvedMode = !modeFromUrl && !isUserModeSwitch && userData.g0v0_playmode
            ? userData.g0v0_playmode
            : selectedMode;
          setUser(userData);
          if (resolvedMode !== selectedMode) {
            setSelectedMode(resolvedMode);
          }
          latestLoadedModeRef.current = resolvedMode;
          latestLoadedRequestModeRef.current = requestedMode;
          hasVisibleUserRef.current = true;
          if (shouldAnimateRankRefresh) {
            setRankHistoryAnimationKey((current) => current + 1);
          }
          setError(null);
        }
      })
      .catch((err: unknown) => {
        // 忽略被取消的请求
        if (abortController.signal.aborted) return;

        const message = (err as { response?: { data?: { detail?: string } } }).response?.data
          ?.detail;
        setError(message || t('profile.errors.loadFailed'));
        setUser(null);
        hasVisibleUserRef.current = false;
      })
      .finally(() => {
        if (!abortController.signal.aborted) {
          userInitiatedModeChangeRef.current = false;
          setIsRankHistoryUpdating(false);
          setLoading(false);
        }
      });

    // 清理函数：取消请求
    return () => {
      abortController.abort();
    };
  }, [initialSsrPayload, modeFromUrl, userId, selectedMode, t]);

  const handleModeChange = (mode: GameMode) => {
    if (mode !== selectedMode) {
      userInitiatedModeChangeRef.current = true;
    }
    setSelectedMode(mode);
  };

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
        <h2 className="text-2xl font-bold text-gray-800 mb-2">
          {t('profile.errors.userNotFound')}
        </h2>
        <p className="text-gray-600">{error || t('profile.errors.checkId')}</p>
      </div>
    );
  }

  return (
    <UserProfileLayout
      user={user}
      selectedMode={selectedMode}
      onModeChange={handleModeChange}
      onUserUpdate={setUser}
      isRankHistoryUpdating={isRankHistoryUpdating}
      rankHistoryAnimationKey={rankHistoryAnimationKey}
      initialRecentActivities={initialSsrPayload?.recentActivities}
      initialRecentActivitiesHasMore={initialSsrPayload?.recentActivitiesHasMore}
    />
  );
};

export default UserPage;
