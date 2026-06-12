import React from 'react';
import { useTranslation } from 'react-i18next';

interface Stats {
  hit_accuracy?: number;
  pp?: number;
  ranked_score?: number;
  total_score?: number;
  play_count?: number;
  total_hits?: number;
  maximum_combo?: number;
  replays_watched_by_others?: number;
}

interface StatsCardProps {
  stats?: Stats;
}

const StatsCard: React.FC<StatsCardProps> = ({ stats }) => {
  const { t } = useTranslation();
  // 每次游玩击打数 = 总命中次数 / 游戏次数
  const avgHitsPerPlay =
    stats?.play_count && stats?.play_count > 0
      ? Math.round((stats.total_hits ?? 0) / stats.play_count)
      : 0;

  return (
    <div>
      <div className="flex flex-col gap-2 sm:gap-3 md:gap-4 text-xs">
        {/* 计分成绩总分 */}
        <div className="flex justify-between items-center">
          <span className="text-gray-600 dark:text-gray-300">{t('profile.stats.rankedScore')}</span>
          <span className="text-gray-800 dark:text-gray-100 font-bold">
            {stats?.ranked_score?.toLocaleString() ?? 0}
          </span>
        </div>

        {/* 准确率 */}
        <div className="flex justify-between items-center">
          <span className="text-gray-600 dark:text-gray-300">{t('profile.stats.accuracy')}</span>
          <span className="text-gray-800 dark:text-gray-100 font-bold">
            {(stats?.hit_accuracy ?? 0).toFixed(2)}%
          </span>
        </div>

        {/* 游戏次数 */}
        <div className="flex justify-between items-center">
          <span className="text-gray-600 dark:text-gray-300">{t('profile.stats.playCount')}</span>
          <span className="text-gray-800 dark:text-gray-100 font-bold">
            {stats?.play_count?.toLocaleString() ?? 0}
          </span>
        </div>

        {/* 总分 */}
        <div className="flex justify-between items-center">
          <span className="text-gray-600 dark:text-gray-300">{t('profile.stats.totalScore')}</span>
          <span className="text-gray-800 dark:text-gray-100 font-bold">
            {stats?.total_score?.toLocaleString() ?? 0}
          </span>
        </div>

        {/* 总命中次数 */}
        <div className="flex justify-between items-center">
          <span className="text-gray-600 dark:text-gray-300">{t('profile.stats.totalHits')}</span>
          <span className="text-gray-800 dark:text-gray-100 font-bold">
            {stats?.total_hits?.toLocaleString() ?? 0}
          </span>
        </div>

        {/* 每次游玩击打数 */}
        <div className="flex justify-between items-center">
          <span className="text-gray-600 dark:text-gray-300">{t('profile.stats.hitsPerPlay')}</span>
          <span className="text-gray-800 dark:text-gray-100 font-bold">
            {avgHitsPerPlay.toLocaleString()}
          </span>
        </div>

        {/* 最大连击 */}
        <div className="flex justify-between items-center">
          <span className="text-gray-600 dark:text-gray-300">{t('profile.stats.maxCombo')}</span>
          <span className="text-gray-800 dark:text-gray-100 font-bold">
            {stats?.maximum_combo?.toLocaleString() ?? 0}
          </span>
        </div>

        {/* 回放被观看次数 */}
        <div className="flex justify-between items-center">
          <span className="text-gray-600 dark:text-gray-300">
            {t('profile.stats.replaysWatched')}
          </span>
          <span className="text-gray-800 dark:text-gray-100 font-bold">
            {stats?.replays_watched_by_others?.toLocaleString() ?? 0}
          </span>
        </div>
      </div>
    </div>
  );
};

export default StatsCard;
