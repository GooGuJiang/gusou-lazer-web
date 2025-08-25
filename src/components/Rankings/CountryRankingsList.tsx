import React from 'react';
import { FiGlobe } from 'react-icons/fi';
import CountryRankingCard from './CountryRankingCard';
import type { CountryResponse, CountryRanking, GameMode } from '../../types';

interface Props {
  rankings: CountryResponse | null;
  currentPage: number;
  selectedMode: GameMode;
}

const CountryRankingsList: React.FC<Props> = ({ rankings, currentPage, selectedMode }) => {
  if (!rankings || !rankings.ranking.length) {
    return (
      <div className="text-center py-20">
        <div className="bg-gray-100 dark:bg-gray-700 rounded-full w-24 h-24 flex items-center justify-center mx-auto mb-6">
          <FiGlobe className="text-4xl text-gray-400 dark:text-gray-500" />
        </div>
        <h3 className="text-xl font-semibold text-gray-700 dark:text-gray-300 mb-2">暂无国家排行榜数据</h3>
        <p className="text-gray-500 dark:text-gray-400">当前模式下没有找到国家数据</p>
      </div>
    );
  }

  const startRank = (currentPage - 1) * 50 + 1;

  return (
    <div className="space-y-3">
      {rankings.ranking.map((ranking: CountryRanking, index: number) => (
        <CountryRankingCard
          key={ranking.code}
          ranking={ranking}
          rank={startRank + index}
          selectedMode={selectedMode}
        />
      ))}
    </div>
  );
};

export default CountryRankingsList;
