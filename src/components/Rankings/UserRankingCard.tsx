import React from 'react';
import { Link } from 'react-router-dom';
import RankBadge from '../UI/RankBadge';
import { GAME_MODE_COLORS } from '../../types';
import type { UserRanking, GameMode, RankingType } from '../../types';

interface Props {
  ranking: UserRanking;
  rank: number;
  selectedMode: GameMode;
  rankingType: RankingType;
}

const UserRankingCard: React.FC<Props> = ({ ranking, rank, selectedMode, rankingType }) => {
  const isTopThree = rank <= 3;

  return (
    <div
      className={`group relative overflow-hidden rounded-xl bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 hover:border-gray-200 dark:hover:border-gray-600 hover:shadow-lg transition-all duration-200 ${isTopThree ? 'ring-2 ring-yellow-400/20 bg-gradient-to-r from-yellow-50 to-transparent dark:from-yellow-900/10' : ''}`}
    >
      <div className="flex items-center gap-4 p-5">
        {/* 排名徽章 */}
        <div className="flex-shrink-0">
          <RankBadge rank={rank} size="md" />
        </div>

        {/* 用户头像 */}
        <Link to={`/users/${ranking.user.id}`} className="flex-shrink-0">
          <img
            src={ranking.user.avatar_url || '/default.jpg'}
            alt={ranking.user.username}
            className="w-12 h-12 rounded-xl border-2 border-gray-200 dark:border-gray-600 hover:border-blue-400 dark:hover:border-blue-500 transition-colors duration-200"
          />
        </Link>

        {/* 用户信息 */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <Link
              to={`/users/${ranking.user.id}`}
              className="font-semibold text-lg text-gray-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 transition-colors truncate"
            >
              {ranking.user.username}
            </Link>
            {ranking.user.country_code && (
              <img
                src={`https://flagcdn.com/20x15/${ranking.user.country_code.toLowerCase()}.png`}
                alt={ranking.user.country_code}
                className="w-5 h-4 rounded-sm"
                title={ranking.user.country?.name || ranking.user.country_code}
              />
            )}
          </div>
          <div className="text-sm text-gray-500 dark:text-gray-400">
            {ranking.user.country?.name || ranking.user.country_code}
          </div>
        </div>

        {/* 分数显示 */}
        <div className="text-right">
          <div className="text-xl font-bold" style={{ color: GAME_MODE_COLORS[selectedMode] }}>
            {rankingType === 'performance'
              ? `${Math.round(ranking.pp || 0).toLocaleString()}pp`
              : `${(ranking.ranked_score || 0).toLocaleString()}`}
          </div>
          <div className="text-sm text-gray-500 dark:text-gray-400">
            {rankingType === 'performance' ? '表现分数' : '总分'}
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserRankingCard;
