import { notFound } from 'next/navigation';
import React from 'react';

import BeatmapClient from './BeatmapClient';
import { fetchBeatmapset, ApiError } from '@/lib/server/api';

interface BeatmapsetPageProps {
  params: { beatmapsetId: string };
  searchParams: { [key: string]: string | string[] | undefined };
}

export default async function BeatmapsetPage({ params, searchParams }: BeatmapsetPageProps) {
  const beatmapParam = searchParams.beatmap;
  const beatmapId = Number(Array.isArray(beatmapParam) ? beatmapParam[0] : beatmapParam);

  try {
    const beatmapset = await fetchBeatmapset(params.beatmapsetId);
    return <BeatmapClient beatmapset={beatmapset} initialBeatmapId={Number.isFinite(beatmapId) ? beatmapId : undefined} />;
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) {
      notFound();
    }
    throw error;
  }
}
