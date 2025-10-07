import React from 'react';
import { motion } from 'framer-motion';
import TextSkeleton from '../UI/TextSkeleton';
import { GAME_MODE_COLORS } from '../../types';
import type { UserStatistics, GameMode } from '../../types';

interface CoreStatsCardProps {
  statistics?: UserStatistics;
  isUpdatingMode: boolean;
  selectedMode: GameMode;
  delay?: number;
}

const CoreStatsCard: React.FC<CoreStatsCardProps> = ({ statistics, isUpdatingMode, selectedMode, delay = 0 }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay }}
    className="bg-card rounded-2xl shadow-lg p-4"
  >
    <div className="grid grid-cols-2 gap-4">
      <div className="text-center">
        <div className="text-lg font-bold text-gray-900 dark:text白">
          {isUpdatingMode || !statistics ? (
            <TextSkeleton>
              {statistics?.global_rank ? `#${statistics.global_rank.toLocaleString()}` : '#999,999'}
            </TextSkeleton>
          ) : (
            statistics.global_rank ? `#${statistics.global_rank.toLocaleString()}` : 'N/A'
          )}
        </div>
        <div className="text-sm text-gray-600 dark:text-gray-400">全球排名</div>
      </div>
      <div className="text-center">
        <div className="text-lg font-bold text-gray-900 dark:text白">
          {isUpdatingMode || !statistics ? (
            <TextSkeleton>
              {statistics?.country_rank ? `#${statistics.country_rank.toLocaleString()}` : '#999,999'}
            </TextSkeleton>
          ) : (
            statistics.country_rank ? `#${statistics.country_rank.toLocaleString()}` : 'N/A'
          )}
        </div>
        <div className="text-sm text-gray-600 dark:text-gray-400">国家排名</div>
      </div>
      <div className="text-center">
        <div className="text-lg font-bold" style={{ color: GAME_MODE_COLORS[selectedMode] }}>
          {isUpdatingMode || !statistics ? (
            <TextSkeleton>
              {statistics?.pp ? `${Math.round(statistics.pp).toLocaleString()}pp` : '9,999pp'}
            </TextSkeleton>
          ) : (
            `${Math.round(statistics.pp || 0).toLocaleString()}pp`
          )}
        </div>
        <div className="text-sm text-gray-600 dark:text-gray-400">表现分数</div>
      </div>
      <div className="text-center">
        <div className="text-lg font-bold text-gray-900 dark:text白">
          {isUpdatingMode || !statistics ? (
            <TextSkeleton>
              {statistics?.hit_accuracy ? `${statistics.hit_accuracy.toFixed(1)}%` : '99.9%'}
            </TextSkeleton>
          ) : (
            `${(statistics.hit_accuracy || 0).toFixed(1)}%`
          )}
        </div>
        <div className="text-sm text-gray-600 dark:text-gray-400">准确率</div>
      </div>
    </div>
  </motion.div>
);

export default CoreStatsCard;

