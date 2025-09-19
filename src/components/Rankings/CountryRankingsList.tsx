import React from 'react';
import { FiGlobe } from 'react-icons/fi';
import { useTranslation } from 'react-i18next';
import CountryRankingCard from './CountryRankingCard';
import type { CountryResponse, CountryRanking, GameMode } from '../../types';

interface Props {
  rankings: CountryResponse | null;
  currentPage: number;
  selectedMode: GameMode;
}

const CountryRankingsList: React.FC<Props> = ({ rankings, currentPage, selectedMode }) => {
  const { t } = useTranslation();
  
  if (!rankings || !rankings.ranking.length) {
    return (
      <div className="text-center py-20 px-4 sm:px-0">
        <div className="bg-gray-100 dark:bg-gray-700 rounded-full w-24 h-24 flex items-center justify-center mx-auto mb-6">
          <FiGlobe className="text-4xl text-gray-400 dark:text-gray-500" />
        </div>
        <h3 className="text-xl font-semibold text-gray-700 dark:text-gray-300 mb-2">{t('rankings.errors.noData')}</h3>
        <p className="text-gray-500 dark:text-gray-400">{t('common.noDataFound')}</p>
      </div>
    );
  }

  const startRank = (currentPage - 1) * 50 + 1;

  return (
    <div className="divide-y divide-gray-200 dark:divide-gray-700">
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
