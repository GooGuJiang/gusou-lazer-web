"use client";

import React from 'react';
import { FiAward } from 'react-icons/fi';
import { useTranslation } from 'react-i18next';
import UserRankingCard from './UserRankingCard';
import type { TopUsersResponse, GameMode, RankingType, UserRanking } from '../../types';

interface Props {
  rankings: TopUsersResponse | null;
  currentPage: number;
  selectedMode: GameMode;
  rankingType: RankingType;
}

const UserRankingsList: React.FC<Props> = ({ rankings, currentPage, selectedMode, rankingType }) => {
  const { t } = useTranslation();
  
  if (!rankings || !rankings.ranking.length) {
    return (
      <div className="text-center py-20 px-4 sm:px-0">
        <div className="bg-gray-100 dark:bg-gray-700 rounded-full w-24 h-24 flex items-center justify-center mx-auto mb-6">
          <FiAward className="text-4xl text-gray-400 dark:text-gray-500" />
        </div>
        <h3 className="text-xl font-semibold text-gray-700 dark:text-gray-300 mb-2">{t('rankings.errors.noData')}</h3>
        <p className="text-gray-500 dark:text-gray-400">{t('common.noDataFound')}</p>
      </div>
    );
  }

  const startRank = (currentPage - 1) * 50 + 1;

  return (
    <div className="divide-y divide-gray-200 dark:divide-gray-700">
      {rankings.ranking.map((ranking: UserRanking, index: number) => (
        <UserRankingCard
          key={ranking.user.id}
          ranking={ranking}
          rank={startRank + index}
          selectedMode={selectedMode}
          rankingType={rankingType}
        />
      ))}
    </div>
  );
};

export default UserRankingsList;
