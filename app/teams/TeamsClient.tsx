"use client";

import React, { useCallback, useEffect, useState } from 'react';

import TeamRankingsList from '@/components/Rankings/TeamRankingsList';
import PaginationControls from '@/components/Rankings/PaginationControls';
import GameModeSelector from '@/components/UI/GameModeSelector';
import RankingTypeSelector from '@/components/UI/RankingTypeSelector';
import LoadingSpinner from '@/components/UI/LoadingSpinner';
import { useAuth } from '@/hooks/useAuth';
import { rankingsAPI, handleApiError } from '@/utils/api';
import type { GameMode, RankingType, TeamRankingsResponse } from '@/types';
import Link from 'next/link';
import { FiEdit, FiEye, FiPlus } from 'react-icons/fi';
import { useTranslation } from 'react-i18next';

interface TeamsClientProps {
  initialRankings: TeamRankingsResponse;
  initialMode: GameMode;
  initialType: RankingType;
  initialPage: number;
}

const TeamsClient: React.FC<TeamsClientProps> = ({
  initialRankings,
  initialMode,
  initialType,
  initialPage,
}) => {
  const { t } = useTranslation();
  const { isAuthenticated, user } = useAuth();
  const [selectedMode, setSelectedMode] = useState<GameMode>(initialMode);
  const [rankingType, setRankingType] = useState<RankingType>(initialType);
  const [currentPage, setCurrentPage] = useState(initialPage);
  const [rankings, setRankings] = useState<TeamRankingsResponse | null>(initialRankings);
  const [isLoading, setIsLoading] = useState(false);

  const loadRankings = useCallback(async (mode: GameMode, type: RankingType, page: number) => {
    setIsLoading(true);
    try {
      const data = await rankingsAPI.getTeamRankings(mode, type, page);
      setRankings(data);
    } catch (error) {
      handleApiError(error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    setRankings(initialRankings);
    setCurrentPage(initialPage);
  }, [initialRankings, initialPage]);

  useEffect(() => {
    setCurrentPage(1);
    void loadRankings(selectedMode, rankingType, 1);
  }, [selectedMode, rankingType, loadRankings]);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    void loadRankings(selectedMode, rankingType, page);
  };

  return (
    <div className="min-h-screen" style={{ background: 'var(--bg-primary)' }}>
      <div className="max-w-7xl mx-auto px-4 lg:px-6 py-6 sm:py-8">
        <div className="mb-6 sm:mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-2">
                {t('teams.title')}
              </h1>
              <p className="text-base sm:text-lg text-gray-600 dark:text-gray-400">
                {t('teams.description')}
              </p>
            </div>

            {isAuthenticated && (
              user?.team ? (
                user.id === user.team.leader_id ? (
                  <Link
                    href={`/teams/${user.team.id}/edit`}
                    className="inline-flex items-center px-4 py-2 bg-osu-pink text-white rounded-lg hover:bg-osu-pink/90 transition-colors self-start sm:self-auto"
                  >
                    <FiEdit className="mr-2" />
                    {t('teams.editTeam')}
                  </Link>
                ) : (
                  <Link
                    href={`/teams/${user.team.id}`}
                    className="inline-flex items-center px-4 py-2 bg-osu-pink text-white rounded-lg hover:bg-osu-pink/80 transition-colors self-start sm:self-auto"
                  >
                    <FiEye className="mr-2" />
                    {t('teams.viewTeam')}
                  </Link>
                )
              ) : (
                <Link
                  href="/teams/create"
                  className="inline-flex items-center px-4 py-2 bg-osu-pink text-white rounded-lg hover:bg-osu-pink/90 transition-colors self-start sm:self-auto"
                >
                  <FiPlus className="mr-2" />
                  {t('teams.createTeam')}
                </Link>
              )
            )}
          </div>
        </div>

        <div className="flex flex-col xl:flex-row xl:items-center gap-4 sm:gap-6 mb-4 sm:mb-6">
          <div className="bg-card rounded-lg shadow-sm border-card p-2">
            <GameModeSelector
              selectedMode={selectedMode}
              onModeChange={(mode) => setSelectedMode(mode)}
              variant="compact"
            />
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
              <p className="text-gray-500 dark:text-gray-400 font-medium">{t('teams.loadingTeams')}</p>
            </div>
          ) : (
            <TeamRankingsList
              rankings={rankings}
              currentPage={currentPage}
              selectedMode={selectedMode}
              rankingType={rankingType}
            />
          )}

          {!isLoading && rankings && (
            <PaginationControls
              total={rankings.total}
              currentPage={currentPage}
              onPageChange={handlePageChange}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default TeamsClient;
