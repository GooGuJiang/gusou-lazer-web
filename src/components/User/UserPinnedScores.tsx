import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { userAPI, scoreAPI, handleApiError } from '../../utils/api';
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
  onRefresh?: () => void;
}> = ({ score, t, profileColor, canEdit, onRefresh }) => {
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
        onRefresh={onRefresh}
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
  onRefresh?: () => void;
  dragHandleProps?: any;
}> = ({ score, t, profileColor, canEdit = false, onRefresh, dragHandleProps }) => {
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
                onPinChange={onRefresh}
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
                      onPinChange={onRefresh}
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

const UserPinnedScores: React.FC<UserPinnedScoresProps> = ({ userId, selectedMode, className = '', refreshRef }) => {
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

  const loadScores = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await userAPI.getPinnedScores(userId, selectedMode);
      const newScores = Array.isArray(response) ? response : [];
      setScores(newScores);
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
    loadScores();
  };

  // 将刷新函数暴露给父组件
  useEffect(() => {
    if (refreshRef) {
      refreshRef.current = handleRefresh;
    }
  }, [refreshRef]);

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

    // 乐观更新 UI
    const newScores = arrayMove(scores, oldIndex, newIndex);
    setScores(newScores);

    try {
      // 确定调用哪个 API：before 或 after
      const movedScoreId = active.id as number;
      
      if (newIndex === 0) {
        // 移动到第一位，使用 before_score_id
        await scoreAPI.reorderPinnedScore(movedScoreId, {
          before_score_id: newScores[1]?.id,
        });
      } else {
        // 移动到其他位置，使用 after_score_id
        await scoreAPI.reorderPinnedScore(movedScoreId, {
          after_score_id: newScores[newIndex - 1]?.id,
        });
      }

      toast.success(t('profile.pinnedScores.reorderSuccess'));
    } catch (error) {
      // 失败时还原
      setScores(scores);
      handleApiError(error);
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

  if (scores.length === 0) {
    return null; // 没有置顶成绩时不显示这个区块
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
                  onRefresh={handleRefresh}
                />
              ))}
            </SortableContext>
          </div>
          
          {/* 尾部圆角div */}
          <div className="bg-card h-[30px] rounded-b-lg border-x border-b border-gray-200/50 dark:border-gray-600/30 flex items-center justify-center">
          </div>
        </div>
      </DndContext>
    </div>
  );
};

export default UserPinnedScores;

