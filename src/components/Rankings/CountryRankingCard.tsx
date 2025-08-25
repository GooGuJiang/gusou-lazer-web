import React from 'react';
import RankBadge from '../UI/RankBadge';
import { GAME_MODE_COLORS } from '../../types';
import type { CountryRanking, GameMode } from '../../types';

interface Props {
  ranking: CountryRanking;
  rank: number;
  selectedMode: GameMode;
}

const CountryRankingCard: React.FC<Props> = ({ ranking, rank, selectedMode }) => {
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

        {/* 国旗 */}
        <div className="flex-shrink-0">
          <img
            src={`https://flagcdn.com/48x36/${ranking.code.toLowerCase()}.png`}
            alt={ranking.code}
            className="w-12 h-9 rounded border border-gray-200 dark:border-gray-600"
          />
        </div>

        {/* 国家信息 */}
        <div className="flex-1 min-w-0">
          <div className="font-semibold text-lg text-gray-900 dark:text-white truncate mb-1">{ranking.name}</div>
          <div className="text-sm text-gray-500 dark:text-gray-400">
            {ranking.active_users.toLocaleString()} 活跃用户 • {ranking.play_count.toLocaleString()} 游戏次数
          </div>
        </div>

        {/* 统计数据 */}
        <div className="text-right">
          <div className="text-xl font-bold" style={{ color: GAME_MODE_COLORS[selectedMode] }}>
            {Math.round(ranking.performance).toLocaleString()}pp
          </div>
          <div className="text-sm text-gray-500 dark:text-gray-400">总体表现</div>
        </div>
      </div>
    </div>
  );
};

export default CountryRankingCard;
