"use client";

import React, { useMemo, useState } from 'react';

import type { Beatmap, Beatmapset } from '@/types';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useTranslation } from 'react-i18next';

interface BeatmapClientProps {
  beatmapset: Beatmapset;
  initialBeatmapId?: number;
}

const formatLength = (seconds: number) => {
  const minutes = Math.floor(seconds / 60);
  const remainder = seconds % 60;
  return `${minutes}:${remainder.toString().padStart(2, '0')}`;
};

const difficultyColor = (stars: number) => {
  if (stars < 2) return 'text-pink-400';
  if (stars < 3) return 'text-pink-500';
  if (stars < 4) return 'text-pink-600';
  if (stars < 5) return 'text-pink-700';
  if (stars < 6) return 'text-pink-800';
  return 'text-pink-900';
};

const BeatmapClient: React.FC<BeatmapClientProps> = ({ beatmapset, initialBeatmapId }) => {
  const { t } = useTranslation();
  const router = useRouter();
  const [selectedBeatmap, setSelectedBeatmap] = useState<Beatmap | null>(() => {
    if (!beatmapset.beatmaps?.length) return null;
    if (initialBeatmapId) {
      return beatmapset.beatmaps.find((beatmap) => beatmap.id === initialBeatmapId) || beatmapset.beatmaps[0];
    }
    return beatmapset.beatmaps[0];
  });

  const sortedBeatmaps = useMemo(() => {
    return [...(beatmapset.beatmaps || [])].sort((a, b) => a.difficulty_rating - b.difficulty_rating);
  }, [beatmapset.beatmaps]);

  const handleBeatmapSelect = (beatmap: Beatmap) => {
    setSelectedBeatmap(beatmap);
    router.replace(`/beatmapsets/${beatmapset.id}?beatmap=${beatmap.id}`);
  };

  return (
    <div className="max-w-5xl mx-auto py-8 space-y-8">
      <div className="bg-card rounded-2xl shadow-lg border border-card overflow-hidden">
        <div className="relative h-48 sm:h-64 bg-gradient-to-r from-osu-pink/20 to-purple-500/20">
          <img
            src={beatmapset.covers['cover@2x'] || beatmapset.covers.cover}
            alt={beatmapset.title}
            className="w-full h-full object-cover"
            onError={(e) => {
              e.currentTarget.style.display = 'none';
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-black/10" />
          <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
            <h1 className="text-3xl font-bold">{beatmapset.title_unicode || beatmapset.title}</h1>
            <p className="text-lg opacity-90">{beatmapset.artist_unicode || beatmapset.artist}</p>
            <p className="text-sm opacity-80 mt-2">
              {t('beatmap.mappedBy', { mapper: beatmapset.creator, defaultValue: 'Mapped by {{mapper}}' })}
            </p>
          </div>
        </div>

        {selectedBeatmap && (
          <div className="p-6 grid gap-6 sm:grid-cols-2">
            <div>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                {selectedBeatmap.version}
              </h2>
              <div className="space-y-2 text-sm text-gray-600 dark:text-gray-300">
                <p>
                  <span className="font-medium">{t('beatmap.length', { defaultValue: 'Length' })}:</span>{' '}
                  {formatLength(selectedBeatmap.total_length)}
                </p>
                <p>
                  <span className="font-medium">BPM:</span> {selectedBeatmap.bpm}
                </p>
                <p>
                  <span className="font-medium">AR:</span> {selectedBeatmap.ar.toFixed(1)} | <span className="font-medium">OD:</span>{' '}
                  {selectedBeatmap.accuracy.toFixed(1)}
                </p>
                <p>
                  <span className="font-medium">CS:</span> {selectedBeatmap.cs.toFixed(1)} | <span className="font-medium">HP:</span>{' '}
                  {selectedBeatmap.drain.toFixed(1)}
                </p>
                <p>
                  <span className="font-medium">{t('beatmap.maxCombo', { defaultValue: 'Max Combo' })}:</span>{' '}
                  {selectedBeatmap.max_combo}
                </p>
              </div>
            </div>
            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">
                  {t('beatmap.status', { defaultValue: 'Status' })}
                </p>
                <p className="text-base font-semibold text-gray-900 dark:text-white capitalize">{selectedBeatmap.status}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">
                  {t('beatmap.favouriteCount', { defaultValue: 'Favourites' })}
                </p>
                <p className="text-base font-semibold text-gray-900 dark:text-white">
                  {beatmapset.favourite_count.toLocaleString()}
                </p>
              </div>
              <Link
                href={`https://osu.ppy.sh/beatmapsets/${beatmapset.id}#${selectedBeatmap.mode}/${selectedBeatmap.id}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center px-4 py-2 bg-osu-pink text-white rounded-lg hover:bg-osu-pink/90 transition"
              >
                {t('beatmap.openInOsu', { defaultValue: 'View on osu!' })}
              </Link>
            </div>
          </div>
        )}
      </div>

      <div className="bg-card rounded-2xl shadow-lg border border-card">
        <div className="px-6 py-4 border-b border-card">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            {t('beatmap.difficulties', { defaultValue: 'Difficulties' })}
          </h2>
        </div>
        <div className="divide-y divide-gray-100 dark:divide-gray-700">
          {sortedBeatmaps.map((beatmap) => {
            const isActive = selectedBeatmap?.id === beatmap.id;
            return (
              <button
                key={beatmap.id}
                onClick={() => handleBeatmapSelect(beatmap)}
                className={`w-full px-6 py-4 text-left transition-colors ${
                  isActive
                    ? 'bg-osu-pink/10 border-l-4 border-osu-pink'
                    : 'hover:bg-gray-50 dark:hover:bg-gray-800'
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{beatmap.mode.toUpperCase()}</p>
                    <p className="text-base font-semibold text-gray-900 dark:text-white">{beatmap.version}</p>
                  </div>
                  <div className="flex items-center gap-6 text-sm text-gray-600 dark:text-gray-300">
                    <span className={difficultyColor(beatmap.difficulty_rating)}>
                      ★ {beatmap.difficulty_rating.toFixed(2)}
                    </span>
                    <span>
                      {t('beatmap.lengthShort', {
                        length: formatLength(beatmap.total_length),
                        defaultValue: 'Length {{length}}',
                      })}
                    </span>
                    <span>Combo {beatmap.max_combo}</span>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default BeatmapClient;
