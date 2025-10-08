import React, { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { userAPI } from '../../utils/api';
import type { BestScore, GameMode, User } from '../../types';
import { useProfileColor } from '../../contexts/ProfileColorContext';
import { useAuth } from '../../hooks/useAuth';
import LoadingSpinner from '../UI/LoadingSpinner';
import LazyBackgroundImage from '../UI/LazyBackgroundImage';
import BeatmapLink from '../UI/BeatmapLink';
import ScoreActionsMenu from '../Score/ScoreActionsMenu';

interface UserBestScoresProps {
  userId: number;
  selectedMode: GameMode;
  user?: User;
  className?: string;
  refreshRef?: React.MutableRefObject<(() => void) | null>;
  onPinnedListRefresh?: () => void;
  pinActionRef?: React.MutableRefObject<{
    handlePin: (score: BestScore) => void;
    handleUnpin: (scoreId: number) => void;
  } | null>;
  bestScoresActionRef?: React.MutableRefObject<{
    updatePinStatus: (scoreId: number, isPinned: boolean) => void;
  } | null>;
}

// 时间格式化函数
const formatTimeAgo = (dateString: string, t: any): string => {
  const date = new Date(dateString);
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffInSeconds < 60) {
    return t('profile.activities.timeAgo.justNow');
  } else if (diffInSeconds < 3600) {
    const minutes = Math.floor(diffInSeconds / 60);
    return t('profile.activities.timeAgo.minutesAgo', { count: minutes });
  } else if (diffInSeconds < 86400) {
    const hours = Math.floor(diffInSeconds / 3600);
    return t('profile.activities.timeAgo.hoursAgo', { count: hours });
  } else if (diffInSeconds < 2592000) {
    const days = Math.floor(diffInSeconds / 86400);
    return t('profile.activities.timeAgo.daysAgo', { count: days });
  } else if (diffInSeconds < 31536000) {
    const months = Math.floor(diffInSeconds / 2592000);
    return t('profile.activities.timeAgo.monthsAgo', { count: months });
  } else {
    const years = Math.floor(diffInSeconds / 31536000);
    return t('profile.activities.timeAgo.yearsAgo', { count: years });
  }
};

// 评级图标映射
const getRankIcon = (rank: string) => {
  const rankImageMap: Record<string, string> = {
    // SS 系列
    XH: '/image/grades/SS-Silver.svg', // 银 SS（SSH）
    X:  '/image/grades/SS.svg',        // 金 SS（SS）

    // S 系列
    SH: '/image/grades/S-Silver.svg',  // 银 S
    S:  '/image/grades/S.svg',         // 金 S

    // 其他等级
    A:  '/image/grades/A.svg',
    B:  '/image/grades/B.svg',
    C:  '/image/grades/C.svg',
    D:  '/image/grades/D.svg',
    F:  '/image/grades/F.svg', 
  };

  return rankImageMap[rank] || rankImageMap['F'];
};


// MOD 图标组件
const ModIcon: React.FC<{ mod: { acronym: string } }> = ({ mod }) => {
  return (
    <div className="w-6 h-6 flex items-center justify-center text-xs font-bold text-gray-700 dark:text-gray-300">
      {mod.acronym}
    </div>
  );
};

// 模组组件
const ModsDisplay: React.FC<{ mods: Array<{ acronym: string }> }> = ({ mods }) => {
  if (!mods || mods.length === 0) return null;

  return (
    <div className="flex items-center gap-1">
      {mods.map((mod, index) => (
        <ModIcon key={index} mod={mod} />
      ))}
    </div>
  );
};

// 单个成绩卡片组件 - 基于 osu! 官方设计
const ScoreCard: React.FC<{ 
  score: BestScore; 
  t: any; 
  profileColor: string;
  canEdit?: boolean;
  onPinChange?: (scoreId: number, isPinned: boolean) => void;
  onPinnedListChange?: () => void;
}> = ({ score, t, profileColor, canEdit = false, onPinChange, onPinnedListChange }) => {
  // 必取字段处理
  const rank = score.rank; // 等级徽章（S/A/B/C/D/F）
  const title = score.beatmapset?.title_unicode || score.beatmapset?.title || 'Unknown Title';
  const artist = score.beatmapset?.artist_unicode || score.beatmapset?.artist || 'Unknown Artist';
  const version = score.beatmap?.version || 'Unknown'; // 难度名
  const endedAt = formatTimeAgo(score.ended_at, t); // 相对时间
  const accuracy = (score.accuracy * 100).toFixed(2); // 命中率（百分比）
  const originalPp = Math.round(score.pp || 0); // 原始pp
  const mods = score.mods || []; // MOD列表
  const isPinned = score.current_user_attributes?.pin?.is_pinned || false; // 是否已置顶
  const hasReplay = score.has_replay || false; // 是否有回放

  const beatmapUrl = score.beatmap?.url || '#';
  const coverImage = score.beatmapset?.covers?.['cover@2x'] || score.beatmapset?.covers?.cover;

  // 将主题颜色转换为 RGB 以便使用透明度
  const hexToRgb = (hex: string): string => {
    const cleanHex = hex.replace('#', '');
    const r = parseInt(cleanHex.substring(0, 2), 16);
    const g = parseInt(cleanHex.substring(2, 4), 16);
    const b = parseInt(cleanHex.substring(4, 6), 16);
    return `${r}, ${g}, ${b}`;
  };

  const themeRgb = hexToRgb(profileColor);

  return (
    <LazyBackgroundImage 
      src={coverImage}
      className="relative overflow-hidden border-b border-gray-100 dark:border-gray-700/50 last:border-b-0"
    >
      {/* 渐变遮罩层确保文字可读性 - 使用主题颜色 */}
      <div 
        className="absolute inset-0 bg-gradient-to-r" 
        style={{
          background: `linear-gradient(to right, rgba(${themeRgb}, 0.15) 0%, rgba(${themeRgb}, 0.08) 50%, rgba(${themeRgb}, 0.03) 100%)`
        }}
      />
      <div className="absolute inset-0 bg-gradient-to-r from-white/90 via-white/75 to-white/60 dark:from-gray-800/90 dark:via-gray-800/75 dark:to-gray-800/60" />
      
      <div className="relative bg-transparent hover:bg-white/20 dark:hover:bg-gray-800/20 transition-colors duration-150 group">
        {/* 桌面端布局 */}
        <div className="hidden sm:block">
          {/* 主要内容区域 */}
          <div className="flex items-center h-12 pl-5 pr-24">
            {/* 等级徽章 */}
            <div className="flex-shrink-0 mr-3">
              <img 
                src={getRankIcon(rank)} 
                alt={rank}
                className="w-18 h-12 object-contain"
              />
            </div>

            {/* 谱面信息 */}
            <div className="flex-1 min-w-0">
              <div className="flex flex-col -space-y-0.5">
                {/* 标题和艺术家 */}
                <div className="flex items-baseline gap-1 text-sm leading-tight">
                  <BeatmapLink
                    beatmapUrl={beatmapUrl}
                    className="font-semibold text-gray-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 truncate transition-colors"
                    title={title}
                  >
                    {title}
                  </BeatmapLink>
                  <span className="text-gray-600 dark:text-gray-400 text-xs flex-shrink-0">
                    {t('profile.bestScores.by')}
                  </span>
                  <span className="text-gray-600 dark:text-gray-400 text-xs truncate">
                    {artist}
                  </span>
                </div>
                
                {/* 难度名和时间 */}
                <div className="flex items-center gap-3 text-xs">
                  <span className="text-yellow-600 dark:text-yellow-400 font-medium">
                    {version}
                  </span>
                  <span className="text-gray-500 dark:text-gray-400">
                    {endedAt}
                  </span>
                </div>
              </div>
            </div>

            {/* 中间成绩数据 */}
            <div className="flex-shrink-0 flex items-center gap-2 mr-6">
              {/* MOD图标 + 准确率 */}
              <ModsDisplay mods={mods} />
              <div className="text-sm font-bold text-cyan-600 dark:text-cyan-300 ml-2 drop-shadow-[0_1px_1px_rgba(255,255,255,0.8)] dark:drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]">
                {accuracy}%
              </div>
            </div>
          </div>

          {/* 右侧性能区域 */}
          <div className="absolute right-0 top-0 h-full flex items-center justify-center gap-2 pr-2">
            {/* PP 值 */}
            <div className="text-sm font-bold text-profile-color drop-shadow-[0_1px_1px_rgba(255,255,255,0.8)] dark:drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]">
              {originalPp} PP
            </div>
            {/* 操作菜单 */}
            {canEdit && (
              <ScoreActionsMenu
                scoreId={score.id}
                isPinned={isPinned}
                hasReplay={hasReplay}
                onPinChange={onPinChange}
                onPinnedListChange={onPinnedListChange}
              />
            )}
          </div>
        </div>

        {/* 手机端布局 */}
        <div className="block sm:hidden p-4">
          <div className="flex items-start gap-3">
            {/* 等级徽章 */}
            <div className="flex-shrink-0">
              <img 
                src={getRankIcon(rank)} 
                alt={rank}
                className="w-16 h-10 object-contain"
              />
            </div>

            {/* 主要内容 */}
            <div className="flex-1 min-w-0">
              {/* 第一行：标题和艺术家 */}
              <div className="flex items-baseline gap-1 text-sm leading-tight mb-1">
                <BeatmapLink
                  beatmapUrl={beatmapUrl}
                  className="font-semibold text-gray-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 truncate transition-colors"
                  title={title}
                >
                  {title}
                </BeatmapLink>
                <span className="text-gray-600 dark:text-gray-400 text-xs flex-shrink-0">
                  {t('profile.bestScores.by')}
                </span>
                <span className="text-gray-600 dark:text-gray-400 text-xs truncate">
                  {artist}
                </span>
              </div>
              
              {/* 第二行：难度名和时间 */}
              <div className="flex items-center gap-3 text-xs mb-2">
                <span className="text-yellow-600 dark:text-yellow-400 font-medium">
                  {version}
                </span>
                <span className="text-gray-500 dark:text-gray-400">
                  {endedAt}
                </span>
              </div>

              {/* 第三行：MOD、准确率和PP */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <ModsDisplay mods={mods} />
                  <div className="text-sm font-bold text-cyan-600 dark:text-cyan-300 drop-shadow-[0_1px_1px_rgba(255,255,255,0.8)] dark:drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]">
                    {accuracy}%
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="text-sm font-bold text-profile-color drop-shadow-[0_1px_1px_rgba(255,255,255,0.8)] dark:drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]">
                    {originalPp} PP
                  </div>
                  {/* 操作菜单 */}
                  {canEdit && (
                    <ScoreActionsMenu
                      scoreId={score.id}
                      isPinned={isPinned}
                      hasReplay={hasReplay}
                      onPinChange={onPinChange}
                      onPinnedListChange={onPinnedListChange}
                    />
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </LazyBackgroundImage>
  );
};

const UserBestScores: React.FC<UserBestScoresProps> = ({ userId, selectedMode, user, className = '', refreshRef, onPinnedListRefresh, pinActionRef, bestScoresActionRef }) => {
  const { t } = useTranslation();
  const { profileColor } = useProfileColor();
  const { user: currentUser } = useAuth();
  const [scores, setScores] = useState<BestScore[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [offset, setOffset] = useState(0);
  
  // 检查是否是当前用户自己的页面
  const canEdit = currentUser?.id === userId;

  const loadScores = async (reset = false) => {
    try {
      const currentOffset = reset ? 0 : offset;
      
      if (reset) {
        setLoading(true);
        setError(null);
        // 重置时先重置 hasMore 状态
        setHasMore(true);
      } else {
        setLoadingMore(true);
      }

      const response = await userAPI.getBestScores(userId, selectedMode, 6, currentOffset);
      
      // 处理 API 响应 - 根据 osu! API，应该直接返回 SoloScoreInfo[] 数组
      const newScores = Array.isArray(response) ? response : [];
      
      // 判断是否还有更多数据的逻辑
      let hasMoreData: boolean;
      
      if (reset) {
        // 重置时：如果返回的数据数量等于请求的数量(6)，说明可能还有更多数据
        hasMoreData = newScores.length === 6;
        setScores(newScores);
        setOffset(newScores.length);
      } else {
        // 加载更多时：检查返回数据数量和总数量
        const totalScores = user?.scores_best_count || 0;
        const currentTotal = scores.length + newScores.length;
        hasMoreData = newScores.length === 6 && currentTotal < totalScores;
        setScores(prev => [...prev, ...newScores]);
        setOffset(prev => prev + newScores.length);
      }

      setHasMore(hasMoreData);
    } catch (err) {
      console.error('Failed to load user best scores:', err);
      setError(t('profile.bestScores.loadFailed'));
      // 出错时也重置 hasMore 状态
      setHasMore(false);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  useEffect(() => {
    if (userId) {
      // 重置所有相关状态
      setOffset(0);
      setScores([]);
      setError(null);
      setHasMore(true);
      loadScores(true);
    }
  }, [userId, selectedMode]);

  const handleLoadMore = () => {
    if (!loadingMore && hasMore) {
      loadScores(false);
    }
  };

  const handleRefresh = () => {
    // 刷新当前页面的成绩
    loadScores(true);
  };

  // 将刷新函数暴露给父组件
  useEffect(() => {
    if (refreshRef) {
      refreshRef.current = handleRefresh;
    }
  }, [refreshRef]);

  // 更新成绩的置顶状态（供置顶列表调用）
  const updatePinStatus = (scoreId: number, isPinned: boolean) => {
    setScores(prevScores => 
      prevScores.map(s => 
        s.id === scoreId 
          ? {
              ...s,
              current_user_attributes: {
                ...s.current_user_attributes,
                pin: {
                  ...s.current_user_attributes?.pin,
                  is_pinned: isPinned,
                }
              }
            }
          : s
      )
    );
  };

  // 暴露 updatePinStatus 给置顶列表
  useEffect(() => {
    if (bestScoresActionRef) {
      bestScoresActionRef.current = {
        updatePinStatus,
      };
    }
  }, [bestScoresActionRef, updatePinStatus]);

  // Pin/Unpin 后的本地更新
  const handlePinChange = useCallback((scoreId: number, isPinned: boolean) => {
    // 1. 先找到成绩对象
    const score = scores.find(s => s.id === scoreId);
    
    if (!score) {
      console.error('Score not found:', scoreId);
      return;
    }

    // 2. 创建更新后的成绩对象
    const updatedScore = {
      ...score,
      current_user_attributes: {
        ...score.current_user_attributes,
        pin: {
          ...score.current_user_attributes?.pin,
          is_pinned: !isPinned,
        }
      }
    };

    // 3. 更新本地状态
    setScores(prevScores => 
      prevScores.map(s => s.id === scoreId ? updatedScore : s)
    );

    // 4. 同步更新置顶列表（在状态更新之外）
    if (pinActionRef?.current) {
      if (isPinned) {
        // 取消置顶
        pinActionRef.current.handleUnpin(scoreId);
      } else {
        // 置顶成绩 - 使用已更新的成绩对象
        pinActionRef.current.handlePin(updatedScore);
      }
    }
  }, [scores, pinActionRef]);

  if (loading) {
    return (
      <div className={`${className}`}>
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-3">
            <div className="w-1 h-6 rounded-full" style={{ backgroundColor: profileColor }}></div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100">
              {t('profile.bestScores.title')}
            </h3>
          </div>
        </div>
        <LoadingSpinner size="md" />
      </div>
    );
  }

  if (error) {
    return (
      <div className={`${className}`}>
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-3">
            <div className="w-1 h-6 rounded-full" style={{ backgroundColor: profileColor }}></div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100">
              {t('profile.bestScores.title')}
            </h3>
          </div>
        </div>
        <div className="text-center text-red-500 dark:text-red-400 text-sm">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className={`${className}`}>
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-3">
          <div className="w-1 h-6 rounded-full" style={{ backgroundColor: profileColor }}></div>
          <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100">
            {t('profile.bestScores.title')}
          </h3>
          {user?.scores_best_count && (
            <span className="text-sm text-gray-500 dark:text-gray-400 ml-2">
              ({user.scores_best_count})
            </span>
          )}
        </div>
      </div>
      
      {scores.length === 0 ? (
        <div className="text-center text-gray-500 dark:text-gray-400 py-6 text-sm">
          {t('profile.bestScores.noScores')}
        </div>
      ) : (
        <div className="shadow-sm overflow-hidden rounded-lg">
          {/* 头部圆角div */}
          <div className="bg-card h-[30px] rounded-t-lg border-x border-t border-gray-200/50 dark:border-gray-600/30 flex items-center justify-center">
            <div className="w-16 h-1 rounded-full" style={{ backgroundColor: profileColor }}></div>
          </div>
          
          {/* 主要内容区域 - 无圆角 */}
          <div className="bg-card border-x border-gray-200/50 dark:border-gray-600/30">
            {scores.map((score) => (
              <ScoreCard
                key={score.id}
                score={score}
                t={t}
                profileColor={profileColor}
                canEdit={canEdit}
                onPinChange={handlePinChange}
                onPinnedListChange={onPinnedListRefresh}
              />
            ))}

            {hasMore && (
              <div className="flex justify-center p-4 border-t border-gray-100 dark:border-gray-700/50">
                <button
                  onClick={handleLoadMore}
                  disabled={loadingMore}
                  className="min-w-[80px] sm:min-w-[100px] h-[32px] px-3 py-1.5 disabled:bg-gray-400 text-white rounded text-xs sm:text-sm transition-colors flex items-center justify-center gap-1.5"
                  style={{ backgroundColor: loadingMore ? undefined : profileColor }}
                  onMouseEnter={(e) => !loadingMore && (e.currentTarget.style.opacity = '0.9')}
                  onMouseLeave={(e) => !loadingMore && (e.currentTarget.style.opacity = '1')}
                >
                  {loadingMore ? (
                    <>
                      <LoadingSpinner size="sm" />
                      <span>{t('profile.bestScores.loading')}</span>
                    </>
                  ) : (
                    <span>{t('profile.bestScores.loadMore')}</span>
                  )}
                </button>
              </div>
            )}
          </div>
          
          {/* 尾部圆角div */}
          <div className="bg-card h-[30px] rounded-b-lg border-x border-b border-gray-200/50 dark:border-gray-600/30 flex items-center justify-center">
          </div>
        </div>
      )}
    </div>
  );
};

export default UserBestScores;
