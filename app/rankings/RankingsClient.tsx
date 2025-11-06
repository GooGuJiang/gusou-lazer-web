"use client";

import React, { useCallback, useEffect, useState, useTransition } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';

import UserRankingsList from '@/components/Rankings/UserRankingsList';
import TeamRankingsList from '@/components/Rankings/TeamRankingsList';
import PaginationControls from '@/components/Rankings/PaginationControls';
import GameModeSelector from '@/components/UI/GameModeSelector';
import RankingTypeSelector from '@/components/UI/RankingTypeSelector';
import LoadingSpinner from '@/components/UI/LoadingSpinner';
import type { GameMode, RankingType, TabType, TeamRankingsResponse, TopUsersResponse } from '@/types';
import { useTranslation } from 'react-i18next';

interface RankingsClientProps {
  selectedMode: GameMode;
  rankingType: RankingType;
  currentPage: number;
  activeTab: TabType;
  userRankings: TopUsersResponse | null;
  teamRankings: TeamRankingsResponse | null;
}

const RankingsClient: React.FC<RankingsClientProps> = ({
  selectedMode,
  rankingType,
  currentPage,
  activeTab,
  userRankings,
  teamRankings,
}) => {
  const { t } = useTranslation();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const [tabState, setTabState] = useState<TabType>(activeTab);
  const [modeState, setModeState] = useState<GameMode>(selectedMode);
  const [rankingTypeState, setRankingTypeState] = useState<RankingType>(rankingType);
  const [pageState, setPageState] = useState(currentPage);

  useEffect(() => {
    setTabState(activeTab);
  }, [activeTab]);

  useEffect(() => {
    setModeState(selectedMode);
  }, [selectedMode]);

  useEffect(() => {
    setRankingTypeState(rankingType);
  }, [rankingType]);

  useEffect(() => {
    setPageState(currentPage);
  }, [currentPage]);

  const createQueryString = useCallback(
    (updates: Record<string, string | null>) => {
      const params = new URLSearchParams(searchParams.toString());
      Object.entries(updates).forEach(([key, value]) => {
        if (value === null) {
          params.delete(key);
        } else {
          params.set(key, value);
        }
      });
      return params.toString();
    },
    [searchParams],
  );

  const navigateWithParams = useCallback(
    (updates: Record<string, string | null>) => {
      const queryString = createQueryString(updates);
      startTransition(() => {
        router.push(queryString ? `${pathname}?${queryString}` : pathname, { scroll: false });
      });
    },
    [createQueryString, pathname, router],
  );

  const handleTabChange = (nextTab: TabType) => {
    if (nextTab === tabState) return;
    setTabState(nextTab);
    setPageState(1);
    navigateWithParams({
      tab: nextTab === 'users' ? null : nextTab,
      page: null,
    });
  };

  const handleModeChange = (mode: GameMode) => {
    if (mode === modeState) return;
    setModeState(mode);
    setPageState(1);
    navigateWithParams({
      mode: mode === 'osu' ? null : mode,
      page: null,
    });
  };

  const handleRankingTypeChange = (type: RankingType) => {
    if (type === rankingTypeState) return;
    setRankingTypeState(type);
    setPageState(1);
    navigateWithParams({
      sort: type === 'performance' ? null : type,
      page: null,
    });
  };

  const handlePageChange = (page: number) => {
    if (page === pageState) return;
    setPageState(page);
    navigateWithParams({
      page: page > 1 ? page.toString() : null,
    });
  };

  const showingUsers = tabState === 'users';
  const currentUserRankings = showingUsers ? userRankings : null;
  const currentTeamRankings = showingUsers ? null : teamRankings;
  const shouldShowLoading = isPending || (showingUsers ? !currentUserRankings : !currentTeamRankings);
  const currentTotal = showingUsers
    ? currentUserRankings?.total ?? 0
    : currentTeamRankings?.total ?? 0;

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
            onClick={() => handleTabChange('users')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              tabState === 'users'
                ? 'bg-osu-pink text-white'
                : 'bg-card border border-card text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800'
            }`}
            disabled={isPending}
          >
            {t('rankings.usersTab', { defaultValue: 'Players' })}
          </button>
          <button
            onClick={() => handleTabChange('teams')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              tabState === 'teams'
                ? 'bg-osu-pink text-white'
                : 'bg-card border border-card text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800'
            }`}
            disabled={isPending}
          >
            {t('rankings.teamsTab', { defaultValue: 'Teams' })}
          </button>
        </div>

        <div className="flex flex-col xl:flex-row xl:items-center gap-4 sm:gap-6 mb-4 sm:mb-6">
          <div className="bg-card rounded-lg shadow-sm border-card p-2">
            <GameModeSelector
              selectedMode={modeState}
              onModeChange={handleModeChange}
              variant="compact"
            />
          </div>

          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 xl:flex-1">
            <div className="w-full sm:w-48">
              <RankingTypeSelector value={rankingTypeState} onChange={handleRankingTypeChange} />
            </div>
          </div>
        </div>

        <div className="-mx-4 sm:mx-0 sm:bg-card sm:rounded-xl sm:shadow-sm sm:border-card sm:p-6">
          {shouldShowLoading ? (
            <div className="flex flex-col items-center justify-center py-16 px-4 sm:px-0">
              <LoadingSpinner size="lg" className="mb-4" />
              <p className="text-gray-500 dark:text-gray-400 font-medium">
                {t('rankings.loading', { defaultValue: 'Loading rankings…' })}
              </p>
            </div>
          ) : showingUsers ? (
            <UserRankingsList
              rankings={currentUserRankings}
              currentPage={pageState}
              selectedMode={modeState}
              rankingType={rankingTypeState}
            />
          ) : (
            <TeamRankingsList
              rankings={currentTeamRankings}
              currentPage={pageState}
              selectedMode={modeState}
              rankingType={rankingTypeState}
            />
          )}

          {!shouldShowLoading && currentTotal > 0 && (
            <PaginationControls total={currentTotal} currentPage={pageState} onPageChange={handlePageChange} />
          )}
        </div>
      </div>
    </div>
  );
};

export default RankingsClient;
