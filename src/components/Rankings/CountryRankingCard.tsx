import React from 'react';
import { useTranslation } from 'react-i18next';
import RankBadge from '../UI/RankBadge';
import LazyFlag from '../UI/LazyFlag';
import { GAME_MODE_COLORS } from '../../types';
import type { CountryRanking, GameMode } from '../../types';
import { getCountryName } from '../../utils/countryName';

interface Props {
  ranking: CountryRanking;
  rank: number;
  selectedMode: GameMode;
}

const CountryRankingCard: React.FC<Props> = ({ ranking, rank, selectedMode }) => {
  const { t } = useTranslation();
  const isTopThree = rank <= 3;
  
  // 获取国家的翻译名称
  const countryName = getCountryName(t, ranking.code, ranking.name);

  return (
    <div
      className={`relative overflow-hidden hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors duration-200 ${
        isTopThree ? 'bg-gradient-to-r from-yellow-50/50 to-transparent dark:from-yellow-900/10' : ''
      }`}
    >
      <div className="flex items-center gap-3 sm:gap-4 px-4 py-3">
        {/* 排名徽章 */}
        <div className="flex-shrink-0">
          <RankBadge rank={rank} size="sm" />
        </div>

        {/* 国旗 */}
        <div className="flex-shrink-0">
          <LazyFlag
            src={`/image/flag/${ranking.code.toLowerCase()}.svg`}
            alt={ranking.code}
            className="w-10 h-7 rounded border border-gray-200 dark:border-gray-600"
            title={countryName}
          />
        </div>

        {/* 国家信息 */}
        <div className="flex-1 min-w-0">
          <div className="font-semibold text-sm sm:text-base text-gray-900 dark:text-white truncate">{countryName}</div>
          <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
            <span>{ranking.active_users.toLocaleString()} {t('rankings.countryCard.activeUsers')} • {ranking.play_count.toLocaleString()} {t('rankings.countryCard.playCount')}</span>
          </div>
        </div>

        {/* 统计数据 */}
        <div className="flex flex-col gap-1 text-right flex-shrink-0">
          {/* 分数 */}
          <div className="text-xs text-gray-500 dark:text-gray-400">
            <div className="whitespace-nowrap">
              {t('common.score')}: {ranking.ranked_score.toLocaleString()}
            </div>
          </div>
          
          {/* 表现分 */}
          <div className="text-base sm:text-lg font-bold" style={{ color: GAME_MODE_COLORS[selectedMode] }}>
            {Math.round(ranking.performance).toLocaleString()}pp
          </div>
        </div>
      </div>
    </div>
  );
};

export default CountryRankingCard;
