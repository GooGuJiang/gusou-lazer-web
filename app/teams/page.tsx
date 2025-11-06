import React from 'react';

import TeamsClient from './TeamsClient';
import { fetchTeamRankings } from '@/lib/server/api';
import type { GameMode, RankingType } from '@/types';

interface TeamsPageProps {
  searchParams: { [key: string]: string | string[] | undefined };
}

export default async function TeamsPage({ searchParams }: TeamsPageProps) {
  const modeParam = searchParams.mode;
  const typeParam = searchParams.sort;
  const pageParam = searchParams.page;

  const mode = (Array.isArray(modeParam) ? modeParam[0] : modeParam || 'osu') as GameMode;
  const rankingType = (Array.isArray(typeParam) ? typeParam[0] : typeParam || 'performance') as RankingType;
  const page = Number(Array.isArray(pageParam) ? pageParam[0] : pageParam) || 1;

  const rankings = await fetchTeamRankings(mode, rankingType, page);

  return <TeamsClient initialRankings={rankings} initialMode={mode} initialType={rankingType} initialPage={page} />;
}
