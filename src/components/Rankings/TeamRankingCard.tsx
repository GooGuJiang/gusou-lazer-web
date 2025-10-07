import React from 'react';
import { Link } from 'react-router-dom';
import { FiUsers, FiTrendingUp } from 'react-icons/fi';
import { useTranslation } from 'react-i18next';
import RankBadge from '../UI/RankBadge';
import LazyBackgroundImage from '../UI/LazyBackgroundImage';
import { GAME_MODE_COLORS } from '../../types';
import type { TeamRanking, Team, GameMode, RankingType } from '../../types';

interface Props {
  ranking: TeamRanking;
  team: Team | null;
  rank: number;
  selectedMode: GameMode;
  rankingType: RankingType;
  isLoading?: boolean;
}

const TeamRankingCard: React.FC<Props> = ({ 
  ranking, 
  team, 
  rank, 
  selectedMode, 
  rankingType,
  isLoading = false 
}) => {
  const { t } = useTranslation();
  const formatNumber = (num: number): string => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M';
    } else if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
  };

  const isTopThree = rank <= 3;

  if (isLoading || !team) {
    return (
      <div className={`relative overflow-hidden hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors duration-200 animate-pulse ${
        isTopThree 
          ? 'bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/10' 
          : 'bg-card'
      }`}>
        <div className="relative flex items-center gap-3 sm:gap-4 px-4 py-3">
          {/* 排名徽章 */}
          <div className="flex-shrink-0">
            <div className="w-6 h-6 bg-gray-200 dark:bg-gray-700 rounded" />
          </div>

          {/* 战队旗帜 */}
          <div className="flex-shrink-0">
            <div className="w-12 h-6 sm:w-16 sm:h-8 bg-gray-200 dark:bg-gray-700 rounded border border-gray-200 dark:border-gray-600" />
          </div>

          {/* 战队信息 */}
          <div className="flex-1 min-w-0">
            <div className="h-5 sm:h-6 bg-gray-200 dark:bg-gray-700 rounded w-32 sm:w-40 mb-1" />
            <div className="flex items-center gap-4 sm:gap-6">
              <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-20" />
              <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-24" />
            </div>
          </div>

          {/* 分数显示 */}
          <div className="text-right flex-shrink-0">
            <div className="h-5 sm:h-6 bg-gray-200 dark:bg-gray-700 rounded w-16 sm:w-20" />
          </div>
        </div>
      </div>
    );
  }

  // 过滤掉默认封面URL
  const rawCoverUrl = team.cover_url;
  const defaultCoverUrls = [
    'https://assets-ppy.g0v0.top/user-profile-covers/default.jpeg',
    'https://assets.ppy.sh/user-profile-covers/default.jpeg',
    // 其他可能的默认URL变体
  ];
  const coverUrl = rawCoverUrl && !defaultCoverUrls.includes(rawCoverUrl) ? rawCoverUrl : undefined;

  // 根据是否有背景图片决定渲染方式
  if (!coverUrl) {
    // 没有背景图片时，使用普通 div 和默认背景
    return (
      <div
        className={`relative overflow-hidden hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors duration-200 ${
          isTopThree 
            ? 'bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/10' 
            : 'bg-card'
        }`}
      >
        <div className="relative flex items-center gap-3 sm:gap-4 px-4 py-3">
          {/* 排名徽章 */}
          <div className="flex-shrink-0">
            <RankBadge rank={rank} size="sm" />
          </div>

          {/* 战队旗帜 - 2:1 比例 (240:120) */}
          <div className="flex-shrink-0">
            <div className="w-12 h-6 sm:w-16 sm:h-8 rounded overflow-hidden border border-gray-200 dark:border-gray-600 bg-gray-100 dark:bg-gray-700">
              <img
                src={team.flag_url}
                alt={`${team.name} flag`}
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                }}
              />
            </div>
          </div>

          {/* 战队信息 */}
          <div className="flex-1 min-w-0">
            <Link
              to={`/teams/${team.id}?mode=${selectedMode}`}
              className="font-semibold text-sm sm:text-base text-gray-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 transition-colors truncate block"
            >
              {team.name}
            </Link>
            <div className="flex items-center gap-2 sm:gap-4 mt-0.5">
              <div className="flex items-center gap-1 text-gray-500 dark:text-gray-400">
                <FiUsers className="w-3 h-3" />
                <span className="text-xs">
                  {ranking.member_count || 0} {t('common.members')}
                </span>
              </div>
              <div className="flex items-center gap-1 text-gray-500 dark:text-gray-400">
                <FiTrendingUp className="w-3 h-3" />
                <span className="text-xs">
                  {ranking.play_count || 0} {t('common.playCount')}
                </span>
              </div>
            </div>
          </div>

          {/* 分数显示 */}
          <div className="text-right flex-shrink-0">
            <div className="text-base sm:text-lg font-bold" style={{ color: GAME_MODE_COLORS[selectedMode] }}>
              {rankingType === 'performance'
                ? `${formatNumber(ranking.performance || 0)}pp`
                : `${formatNumber(ranking.ranked_score || 0)}`}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // 有背景图片时，使用 LazyBackgroundImage
  const teamContent = (
    <LazyBackgroundImage 
      src={coverUrl} 
      className="overflow-hidden transition-colors duration-200 hover:bg-gray-50 dark:hover:bg-gray-800/50"
    >
      {/* 背景遮罩层 */}
      <div className="absolute inset-0 bg-gradient-to-r from-white/90 via-white/85 to-white/80 dark:from-gray-900/90 dark:via-gray-900/85 dark:to-gray-900/80 hover:from-white/85 hover:via-white/80 hover:to-white/75 dark:hover:from-gray-900/85 dark:hover:via-gray-900/80 dark:hover:to-gray-900/75 transition-all duration-300" />
      
      {/* TOP 3 特效遮罩 */}
      {isTopThree && (
        <div className="absolute inset-0 bg-gradient-to-r from-yellow-400/10 via-orange-400/5 to-transparent" />
      )}
      
      <div className="relative flex items-center gap-3 sm:gap-4 px-4 py-3">
        {/* 排名徽章 */}
        <div className="flex-shrink-0">
          <RankBadge rank={rank} size="sm" />
        </div>

        {/* 战队旗帜 - 2:1 比例 (240:120) */}
        <div className="flex-shrink-0">
          <div className="w-12 h-6 sm:w-16 sm:h-8 rounded overflow-hidden border border-gray-200 dark:border-gray-600 bg-gray-100 dark:bg-gray-700">
            <img
              src={team.flag_url}
              alt={`${team.name} flag`}
              className="w-full h-full object-cover"
              onError={(e) => {
                e.currentTarget.style.display = 'none';
              }}
            />
          </div>
        </div>

        {/* 战队信息 */}
        <div className="flex-1 min-w-0">
          <Link
            to={`/teams/${team.id}?mode=${selectedMode}`}
            className="font-semibold text-sm sm:text-base text-gray-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 transition-colors truncate block"
          >
            {team.name}
          </Link>
          <div className="flex items-center gap-2 sm:gap-4 mt-0.5">
            <div className="flex items-center gap-1 text-gray-500 dark:text-gray-400">
              <FiUsers className="w-3 h-3" />
              <span className="text-xs">
                {ranking.member_count || 0} {t('common.members')}
              </span>
            </div>
            <div className="flex items-center gap-1 text-gray-500 dark:text-gray-400">
              <FiTrendingUp className="w-3 h-3" />
              <span className="text-xs">
                {ranking.play_count || 0} {t('common.playCount')}
              </span>
            </div>
          </div>
        </div>

        {/* 分数显示 */}
        <div className="text-right flex-shrink-0">
          <div className="text-base sm:text-lg font-bold" style={{ color: GAME_MODE_COLORS[selectedMode] }}>
            {rankingType === 'performance'
              ? `${formatNumber(ranking.performance || 0)}pp`
              : `${formatNumber(ranking.ranked_score || 0)}`}
          </div>
        </div>
      </div>
    </LazyBackgroundImage>
  );

  return (
    <Link to={`/teams/${team.id}?mode=${selectedMode}`}>
      {teamContent}
    </Link>
  );
};

export default TeamRankingCard;
