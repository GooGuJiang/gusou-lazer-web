import { notFound, redirect } from 'next/navigation';
import React from 'react';

import TeamDetailClient from './TeamDetailClient';
import { fetchTeamDetail, ApiError } from '@/lib/server/api';
import type { GameMode } from '@/types';

interface TeamDetailPageProps {
  params: { teamId: string };
  searchParams: { [key: string]: string | string[] | undefined };
}

export default async function TeamDetailPage({ params, searchParams }: TeamDetailPageProps) {
  const modeParam = searchParams.mode;
  const requestedMode = Array.isArray(modeParam) ? modeParam[0] : modeParam;
  const mode = (requestedMode || 'osu') as GameMode;

  try {
    const detail = await fetchTeamDetail(params.teamId);
    return <TeamDetailClient teamId={Number(detail.team.id)} initialData={detail} selectedMode={mode} />;
  } catch (error) {
    if (error instanceof ApiError) {
      if (error.status === 401) {
        redirect(`/login?redirect=${encodeURIComponent(`/teams/${params.teamId}`)}`);
      }
      if (error.status === 404) {
        notFound();
      }
    }
    throw error;
  }
}
