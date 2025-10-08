import React, { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { userAPI, scoreAPI } from '../../utils/api';
import type { BestScore, GameMode, User } from '../../types';
import { useProfileColor } from '../../contexts/ProfileColorContext';
import { useAuth } from '../../hooks/useAuth';
import LoadingSpinner from '../UI/LoadingSpinner';
import LazyBackgroundImage from '../UI/LazyBackgroundImage';
import BeatmapLink from '../UI/BeatmapLink';
import ScoreActionsMenu from '../Score/ScoreActionsMenu';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import toast from 'react-hot-toast';

interface UserPinnedScoresProps {
  userId: number;
  selectedMode: GameMode;
  user?: User;
  className?: string;
  refreshRef?: React.MutableRefObject<(() => void) | null>;
  onPinActionRef?: React.MutableRefObject<{
    handlePin: (score: BestScore) => void;
    handleUnpin: (scoreId: number) => void;
  } | null>;
  bestScoresActionRef?: React.MutableRefObject<{
    updatePinStatus: (scoreId: number, isPinned: boolean) => void;
  } | null>; // 通知最佳成绩列表更新置顶状态
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
    XH: '/image/grades/SS-Silver.svg',
    X:  '/image/grades/SS.svg',
    SH: '/image/grades/S-Silver.svg',
    S:  '/image/grades/S.svg',
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

// 可拖拽的成绩卡片组件
const SortableScoreCard: React.FC<{
  score: BestScore;
  t: any;
  profileColor: string;
  canEdit?: boolean;
  onPinChange?: (scoreId: number, isPinned: boolean) => void;
}> = ({ score, t, profileColor, canEdit, onPinChange }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: score.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div ref={setNodeRef} style={style}>
      <ScoreCard
        score={score}
        t={t}
        profileColor={profileColor}
        canEdit={canEdit}
        onPinChange={onPinChange}
        dragHandleProps={canEdit ? { ...attributes, ...listeners } : undefined}
      />
    </div>
  );
};

// 单个成绩卡片组件
const ScoreCard: React.FC<{ 
  score: BestScore; 
  t: any; 
  profileColor: string;
  canEdit?: boolean;
  onPinChange?: (scoreId: number, isPinned: boolean) => void;
  dragHandleProps?: any;
}> = ({ score, t, profileColor, canEdit = false, onPinChange, dragHandleProps }) => {
  const rank = score.rank;
  const title = score.beatmapset?.title_unicode || score.beatmapset?.title || 'Unknown Title';
  const artist = score.beatmapset?.artist_unicode || score.beatmapset?.artist || 'Unknown Artist';
  const version = score.beatmap?.version || 'Unknown';
  const endedAt = formatTimeAgo(score.ended_at, t);
  const accuracy = (score.accuracy * 100).toFixed(2);
  const originalPp = Math.round(score.pp || 0);
  const mods = score.mods || [];
  const isPinned = score.current_user_attributes?.pin?.is_pinned || false;
  const hasReplay = score.has_replay || false;

  const beatmapUrl = score.beatmap?.url || '#';
  const coverImage = score.beatmapset?.covers?.['cover@2x'] || score.beatmapset?.covers?.cover;

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
      {/* 渐变遮罩层 - 使用主题颜色 */}
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
          <div className="flex items-center h-12 pl-5 pr-24">
            <div className="flex-shrink-0 mr-3 flex items-center gap-2">
              {/* 拖拽手柄 */}
              {canEdit && dragHandleProps && (
                <div {...dragHandleProps} className="cursor-grab active:cursor-grabbing p-1">
                  <svg className="w-4 h-4 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M7 2a2 2 0 1 0 .001 4.001A2 2 0 0 0 7 2zm0 6a2 2 0 1 0 .001 4.001A2 2 0 0 0 7 8zm0 6a2 2 0 1 0 .001 4.001A2 2 0 0 0 7 14zm6-8a2 2 0 1 0-.001-4.001A2 2 0 0 0 13 6zm0 2a2 2 0 1 0 .001 4.001A2 2 0 0 0 13 8zm0 6a2 2 0 1 0 .001 4.001A2 2 0 0 0 13 14z"></path>
                  </svg>
                </div>
              )}
              <img 
                src={getRankIcon(rank)} 
                alt={rank}
                className="w-18 h-12 object-contain"
              />
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex flex-col -space-y-0.5">
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

            <div className="flex-shrink-0 flex items-center gap-2 mr-6">
              <ModsDisplay mods={mods} />
              <div className="text-sm font-bold text-cyan-600 dark:text-cyan-300 ml-2 drop-shadow-[0_1px_1px_rgba(255,255,255,0.8)] dark:drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]">
                {accuracy}%
              </div>
            </div>
          </div>

          <div className="absolute right-0 top-0 h-full flex items-center justify-center gap-2 pr-2">
            <div className="text-sm font-bold text-profile-color drop-shadow-[0_1px_1px_rgba(255,255,255,0.8)] dark:drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]">
              {originalPp} PP
            </div>
            {canEdit && (
              <ScoreActionsMenu
                scoreId={score.id}
                isPinned={isPinned}
                hasReplay={hasReplay}
                onPinChange={onPinChange}
              />
            )}
          </div>
        </div>

        {/* 手机端布局 */}
        <div className="block sm:hidden p-4">
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0 flex items-center gap-2">
              {/* 拖拽手柄 */}
              {canEdit && dragHandleProps && (
                <div {...dragHandleProps} className="cursor-grab active:cursor-grabbing p-1">
                  <svg className="w-4 h-4 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M7 2a2 2 0 1 0 .001 4.001A2 2 0 0 0 7 2zm0 6a2 2 0 1 0 .001 4.001A2 2 0 0 0 7 8zm0 6a2 2 0 1 0 .001 4.001A2 2 0 0 0 7 14zm6-8a2 2 0 1 0-.001-4.001A2 2 0 0 0 13 6zm0 2a2 2 0 1 0 .001 4.001A2 2 0 0 0 13 8zm0 6a2 2 0 1 0 .001 4.001A2 2 0 0 0 13 14z"></path>
                  </svg>
                </div>
              )}
              <img 
                src={getRankIcon(rank)} 
                alt={rank}
                className="w-16 h-10 object-contain"
              />
            </div>

            <div className="flex-1 min-w-0">
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
              
              <div className="flex items-center gap-3 text-xs mb-2">
                <span className="text-yellow-600 dark:text-yellow-400 font-medium">
                  {version}
                </span>
                <span className="text-gray-500 dark:text-gray-400">
                  {endedAt}
                </span>
              </div>

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
                  {canEdit && (
                    <ScoreActionsMenu
                      scoreId={score.id}
                      isPinned={isPinned}
                      hasReplay={hasReplay}
                      onPinChange={onPinChange}
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

const UserPinnedScores: React.FC<UserPinnedScoresProps> = ({ userId, selectedMode, className = '', refreshRef, onPinActionRef, bestScoresActionRef }) => {
  const { t } = useTranslation();
  const { profileColor } = useProfileColor();
  const { user: currentUser } = useAuth();
  const [scores, setScores] = useState<BestScore[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const canEdit = currentUser?.id === userId;

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // 本地缓存 key
  const getCacheKey = useCallback(() => `pinned_scores_${userId}_${selectedMode}`, [userId, selectedMode]);

  // 从本地缓存加载
  const loadFromCache = useCallback((): BestScore[] | null => {
    try {
      const cached = localStorage.getItem(getCacheKey());
      if (cached) {
        const parsed = JSON.parse(cached);
        // 检查缓存时间（30分钟内有效，因为服务器也有缓存）
        if (parsed.timestamp && Date.now() - parsed.timestamp < 30 * 60 * 1000) {
          return parsed.scores;
        }
      }
    } catch (e) {
      console.error('Failed to load from cache:', e);
    }
    return null;
  }, [getCacheKey]);

  // 保存到本地缓存
  const saveToCache = useCallback((scores: BestScore[]) => {
    try {
      localStorage.setItem(getCacheKey(), JSON.stringify({
        scores,
        timestamp: Date.now()
      }));
    } catch (e) {
      console.error('Failed to save to cache:', e);
    }
  }, [getCacheKey]);

  const loadScores = async (useCache = true) => {
    try {
      setLoading(true);
      setError(null);

      // 先尝试从缓存加载
      if (useCache) {
        const cachedScores = loadFromCache();
        if (cachedScores) {
          setScores(cachedScores);
          setLoading(false);
          // 后台更新
          const response = await userAPI.getPinnedScores(userId, selectedMode);
          const newScores = Array.isArray(response) ? response : [];
          if (JSON.stringify(newScores) !== JSON.stringify(cachedScores)) {
            setScores(newScores);
            saveToCache(newScores);
          }
          return;
        }
      }

      // 从服务器加载
      const response = await userAPI.getPinnedScores(userId, selectedMode);
      const newScores = Array.isArray(response) ? response : [];
      setScores(newScores);
      saveToCache(newScores);
    } catch (err) {
      console.error('Failed to load user pinned scores:', err);
      setError(t('profile.pinnedScores.loadFailed'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (userId) {
      loadScores();
    }
  }, [userId, selectedMode]);

  const handleRefresh = () => {
    // 优先使用本地缓存，然后后台更新
    loadScores(true);
  };

  // Pin 成绩时添加到列表
  const handlePinScore = useCallback((score: BestScore) => {
    // 乐观更新：立即添加到置顶列表末尾
    setScores(prevScores => {
      // 检查是否已存在，避免重复
      if (prevScores.some(s => s.id === score.id)) {
        return prevScores;
      }
      const newScores = [...prevScores, score];  // 添加到末尾
      saveToCache(newScores);
      return newScores;
    });
  }, [saveToCache]);

  // Unpin 成绩时从列表移除
  const handleUnpinScore = useCallback((scoreId: number) => {
    // 乐观更新：立即从置顶列表移除
    setScores(prevScores => {
      const newScores = prevScores.filter(s => s.id !== scoreId);
      saveToCache(newScores);
      return newScores;
    });
  }, [saveToCache]);

  // 处理 ScoreActionsMenu 的 pin 状态变化
  const handlePinChangeFromMenu = useCallback((scoreId: number, isPinned: boolean) => {
    if (isPinned) {
      // 当前是置顶状态，点击后要取消置顶
      handleUnpinScore(scoreId);
      // 通知最佳成绩列表更新该成绩的置顶状态为 false
      bestScoresActionRef?.current?.updatePinStatus(scoreId, false);
    }
    // 注意：置顶列表不会显示非置顶的成绩，所以不需要处理 pin 的情况
  }, [handleUnpinScore, bestScoresActionRef]);

  // 将刷新函数暴露给父组件
  useEffect(() => {
    if (refreshRef) {
      refreshRef.current = handleRefresh;
    }
  }, [refreshRef]);

  // 将 pin/unpin 操作暴露给父组件和兄弟组件
  useEffect(() => {
    if (onPinActionRef) {
      onPinActionRef.current = {
        handlePin: handlePinScore,
        handleUnpin: handleUnpinScore,
      };
    }
  }, [onPinActionRef, handlePinScore, handleUnpinScore]);

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;

    if (!over || active.id === over.id) {
      return;
    }

    const oldIndex = scores.findIndex((score) => score.id === active.id);
    const newIndex = scores.findIndex((score) => score.id === over.id);

    if (oldIndex === -1 || newIndex === -1) {
      return;
    }

    // 1. 立即更新 UI（乐观更新）
    const newScores = arrayMove(scores, oldIndex, newIndex);
    setScores(newScores);
    
    // 2. 立即保存到本地缓存
    saveToCache(newScores);

    // 3. 立即显示成功提示
    toast.success(t('profile.pinnedScores.reorderSuccess'));

    // 4. 后台发送到服务器（不等待响应，不回滚）
    try {
      const movedScoreId = active.id as number;
      
      if (newIndex === 0) {
        // 移动到第一位，使用 before_score_id
        scoreAPI.reorderPinnedScore(movedScoreId, {
          before_score_id: newScores[1]?.id,
        }).catch(err => {
          console.error('Reorder API failed:', err);
          // 服务器失败不回滚，因为可能是缓存问题
        });
      } else {
        // 移动到其他位置，使用 after_score_id
        scoreAPI.reorderPinnedScore(movedScoreId, {
          after_score_id: newScores[newIndex - 1]?.id,
        }).catch(err => {
          console.error('Reorder API failed:', err);
          // 服务器失败不回滚，因为可能是缓存问题
        });
      }
    } catch (error) {
      // 捕获同步错误
      console.error('Reorder failed:', error);
    }
  };

  if (loading) {
    return (
      <div className={`${className}`}>
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-3">
            <div className="w-1 h-6 rounded-full" style={{ backgroundColor: profileColor }}></div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100">
              {t('profile.pinnedScores.title')}
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
              {t('profile.pinnedScores.title')}
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
            {t('profile.pinnedScores.title')}
          </h3>
          <span className="text-sm text-gray-500 dark:text-gray-400 ml-2">
            ({scores.length})
          </span>
        </div>
      </div>
      
      {scores.length === 0 ? (
        <div className="shadow-sm overflow-hidden rounded-lg">
          {/* 头部圆角div */}
          <div className="bg-card h-[30px] rounded-t-lg border-x border-t border-gray-200/50 dark:border-gray-600/30 flex items-center justify-center">
            <div className="w-16 h-1 rounded-full" style={{ backgroundColor: profileColor }}></div>
          </div>
          
          {/* 空状态提示 */}
          <div className="bg-card border-x border-gray-200/50 dark:border-gray-600/30 py-12">
            <div className="text-center text-gray-400 dark:text-gray-500 text-sm">
              {t('profile.pinnedScores.empty')}
            </div>
          </div>
          
          {/* 尾部圆角div */}
          <div className="bg-card h-[30px] rounded-b-lg border-x border-b border-gray-200/50 dark:border-gray-600/30 flex items-center justify-center">
          </div>
        </div>
      ) : (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <div className="shadow-sm overflow-hidden rounded-lg">
            {/* 头部圆角div */}
            <div className="bg-card h-[30px] rounded-t-lg border-x border-t border-gray-200/50 dark:border-gray-600/30 flex items-center justify-center">
              <div className="w-16 h-1 rounded-full" style={{ backgroundColor: profileColor }}></div>
            </div>
            
            {/* 主要内容区域 */}
            <div className="bg-card border-x border-gray-200/50 dark:border-gray-600/30">
              <SortableContext
                items={scores.map(score => score.id)}
                strategy={verticalListSortingStrategy}
              >
                {scores.map((score) => (
                  <SortableScoreCard
                    key={score.id} 
                    score={score} 
                    t={t} 
                    profileColor={profileColor}
                    canEdit={canEdit}
                    onPinChange={handlePinChangeFromMenu}
                  />
                ))}
              </SortableContext>
            </div>
            
            {/* 尾部圆角div */}
            <div className="bg-card h-[30px] rounded-b-lg border-x border-b border-gray-200/50 dark:border-gray-600/30 flex items-center justify-center">
            </div>
          </div>
        </DndContext>
      )}
    </div>
  );
};

export default UserPinnedScores;

