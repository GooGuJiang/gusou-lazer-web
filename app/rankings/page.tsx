import React from 'react';

import RankingsClient from './RankingsClient';
import { fetchTeamRankings, fetchUserRankings } from '@/lib/server/api';
import type { GameMode, RankingType, TabType, TeamRankingsResponse, TopUsersResponse } from '@/types';

interface RankingsPageProps {
  searchParams: { [key: string]: string | string[] | undefined };
}

export default async function RankingsPage({ searchParams }: RankingsPageProps) {
  const modeParam = searchParams.mode;
  const typeParam = searchParams.sort;
  const pageParam = searchParams.page;
  const tabParam = searchParams.tab;

  const mode = (Array.isArray(modeParam) ? modeParam[0] : modeParam || 'osu') as GameMode;
  const rankingType = (Array.isArray(typeParam) ? typeParam[0] : typeParam || 'performance') as RankingType;
  const page = Number(Array.isArray(pageParam) ? pageParam[0] : pageParam) || 1;
  const tab = ((Array.isArray(tabParam) ? tabParam[0] : tabParam) === 'teams' ? 'teams' : 'users') as TabType;

  let userRankings: TopUsersResponse | null = null;
  let teamRankings: TeamRankingsResponse | null = null;

  if (tab === 'teams') {
    teamRankings = await fetchTeamRankings(mode, rankingType, page);
  } else {
    userRankings = await fetchUserRankings(mode, rankingType, page);
  }

  return (
    <RankingsClient
      selectedMode={mode}
      rankingType={rankingType}
      currentPage={page}
      activeTab={tab}
      userRankings={userRankings}
      teamRankings={teamRankings}
    />
  );
}
