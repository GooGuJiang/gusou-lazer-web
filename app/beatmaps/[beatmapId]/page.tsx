import { notFound } from 'next/navigation';
import React from 'react';

import BeatmapClient from '@/app/beatmapsets/[beatmapsetId]/BeatmapClient';
import { fetchBeatmapById, ApiError } from '@/lib/server/api';

interface BeatmapPageProps {
  params: { beatmapId: string };
}

export default async function BeatmapPage({ params }: BeatmapPageProps) {
  try {
    const beatmapset = await fetchBeatmapById(params.beatmapId);
    return <BeatmapClient beatmapset={beatmapset} initialBeatmapId={Number(params.beatmapId)} />;
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) {
      notFound();
    }
    throw error;
  }
}
