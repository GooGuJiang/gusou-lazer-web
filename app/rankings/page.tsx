import React from 'react';

import RankingsClient from './RankingsClient';
import { fetchUserRankings } from '@/lib/server/api';
import type { GameMode, RankingType } from '@/types';

interface RankingsPageProps {
  searchParams: { [key: string]: string | string[] | undefined };
}

export default async function RankingsPage({ searchParams }: RankingsPageProps) {
  const modeParam = searchParams.mode;
  const typeParam = searchParams.sort;
  const pageParam = searchParams.page;

  const mode = (Array.isArray(modeParam) ? modeParam[0] : modeParam || 'osu') as GameMode;
  const rankingType = (Array.isArray(typeParam) ? typeParam[0] : typeParam || 'performance') as RankingType;
  const page = Number(Array.isArray(pageParam) ? pageParam[0] : pageParam) || 1;

  const userRankings = await fetchUserRankings(mode, rankingType, page);

  return (
    <RankingsClient
      initialUserRankings={userRankings}
      initialMode={mode}
      initialType={rankingType}
      initialPage={page}
    />
  );
}
