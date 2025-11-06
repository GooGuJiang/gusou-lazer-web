"use client";

import React, { useCallback, useEffect, useState } from 'react';

import UserRankingsList from '@/components/Rankings/UserRankingsList';
import TeamRankingsList from '@/components/Rankings/TeamRankingsList';
import PaginationControls from '@/components/Rankings/PaginationControls';
import GameModeSelector from '@/components/UI/GameModeSelector';
import RankingTypeSelector from '@/components/UI/RankingTypeSelector';
import LoadingSpinner from '@/components/UI/LoadingSpinner';
import { rankingsAPI, handleApiError } from '@/utils/api';
import type { GameMode, RankingType, TeamRankingsResponse, TopUsersResponse } from '@/types';
import { useTranslation } from 'react-i18next';

interface RankingsClientProps {
  initialUserRankings: TopUsersResponse;
  initialMode: GameMode;
  initialType: RankingType;
  initialPage: number;
}

type TabType = 'users' | 'teams';

const RankingsClient: React.FC<RankingsClientProps> = ({
  initialUserRankings,
  initialMode,
  initialType,
  initialPage,
}) => {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState<TabType>('users');
  const [selectedMode, setSelectedMode] = useState<GameMode>(initialMode);
  const [rankingType, setRankingType] = useState<RankingType>(initialType);
  const [currentPage, setCurrentPage] = useState(initialPage);
  const [userRankings, setUserRankings] = useState<TopUsersResponse | null>(initialUserRankings);
  const [teamRankings, setTeamRankings] = useState<TeamRankingsResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const loadRankings = useCallback(
    async (tab: TabType, mode: GameMode, type: RankingType, page: number) => {
      setIsLoading(true);
      try {
        if (tab === 'users') {
          const data = await rankingsAPI.getUserRankings(mode, type, undefined, page);
          setUserRankings(data);
        } else {
          const data = await rankingsAPI.getTeamRankings(mode, type, page);
          setTeamRankings(data);
        }
      } catch (error) {
        handleApiError(error);
      } finally {
        setIsLoading(false);
      }
    },
    [],
  );

  useEffect(() => {
    if (activeTab === 'users') {
      setUserRankings(initialUserRankings);
    } else {
      setTeamRankings(null);
      void loadRankings('teams', selectedMode, rankingType, 1);
    }
    setCurrentPage(1);
  }, [activeTab, initialUserRankings, loadRankings, rankingType, selectedMode]);

  useEffect(() => {
    void loadRankings(activeTab, selectedMode, rankingType, currentPage);
  }, [activeTab, selectedMode, rankingType, currentPage, loadRankings]);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const currentTotal = activeTab === 'users' ? userRankings?.total ?? 0 : teamRankings?.total ?? 0;

  return (
    <div className="min-h-screen" style={{ background: 'var(--bg-primary)' }}>
      <div className="max-w-7xl mx-auto px-4 lg:px-6 py-6 sm:py-8">
        <div className="mb-6">
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-2">
            {t('rankings.title', { defaultValue: 'Rankings' })}
          </h1>
          <p className="text-base sm:text-lg text-gray-600 dark:text-gray-400">
            {t('rankings.description', { defaultValue: 'Discover the top players and teams across gusou! lazer.' })}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 mb-6">
          <button
            onClick={() => setActiveTab('users')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              activeTab === 'users'
                ? 'bg-osu-pink text-white'
                : 'bg-card border border-card text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800'
            }`}
          >
            {t('rankings.usersTab', { defaultValue: 'Players' })}
          </button>
          <button
            onClick={() => setActiveTab('teams')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              activeTab === 'teams'
                ? 'bg-osu-pink text-white'
                : 'bg-card border border-card text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800'
            }`}
          >
            {t('rankings.teamsTab', { defaultValue: 'Teams' })}
          </button>
        </div>

        <div className="flex flex-col xl:flex-row xl:items-center gap-4 sm:gap-6 mb-4 sm:mb-6">
          <div className="bg-card rounded-lg shadow-sm border-card p-2">
            <GameModeSelector selectedMode={selectedMode} onModeChange={setSelectedMode} variant="compact" />
          </div>

          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 xl:flex-1">
            <div className="w-full sm:w-48">
              <RankingTypeSelector value={rankingType} onChange={setRankingType} />
            </div>
          </div>
        </div>

        <div className="-mx-4 sm:mx-0 sm:bg-card sm:rounded-xl sm:shadow-sm sm:border-card sm:p-6">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-16 px-4 sm:px-0">
              <LoadingSpinner size="lg" className="mb-4" />
              <p className="text-gray-500 dark:text-gray-400 font-medium">
                {t('rankings.loading', { defaultValue: 'Loading rankings…' })}
              </p>
            </div>
          ) : activeTab === 'users' ? (
            <UserRankingsList
              rankings={userRankings}
              currentPage={currentPage}
              selectedMode={selectedMode}
              rankingType={rankingType}
            />
          ) : (
            <TeamRankingsList
              rankings={teamRankings}
              currentPage={currentPage}
              selectedMode={selectedMode}
              rankingType={rankingType}
            />
          )}

          {!isLoading && currentTotal > 0 && (
            <PaginationControls total={currentTotal} currentPage={currentPage} onPageChange={handlePageChange} />
          )}
        </div>
      </div>
    </div>
  );
};

export default RankingsClient;
