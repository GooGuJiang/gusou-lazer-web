import React from 'react';
import { motion } from 'framer-motion';
import TextSkeleton from '../UI/TextSkeleton';
import type { UserStatistics } from '../../types';

interface GameStatsCardProps {
  statistics?: UserStatistics;
  isUpdatingMode: boolean;
  delay?: number;
}

const GameStatsCard: React.FC<GameStatsCardProps> = ({ statistics, isUpdatingMode, delay = 0 }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay }}
    className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-4"
  >
    <div className="grid grid-cols-2 gap-4">
      <div className="text-center">
        <p className="text-lg font-bold text-gray-900 dark:text白">
          {isUpdatingMode || !statistics ? (
            <TextSkeleton>{statistics?.play_count?.toLocaleString() || '999,999'}</TextSkeleton>
          ) : (
            statistics.play_count?.toLocaleString() || '0'
          )}
        </p>
        <p className="text-sm text-gray-600 dark:text-gray-400">游戏次数</p>
      </div>
      <div className="text-center">
        <p className="text-lg font-bold text-gray-900 dark:text白">
          {isUpdatingMode || !statistics ? (
            <TextSkeleton>{statistics?.total_score?.toLocaleString() || '99,999,999'}</TextSkeleton>
          ) : (
            statistics.total_score?.toLocaleString() || '0'
          )}
        </p>
        <p className="text-sm text-gray-600 dark:text-gray-400">总分</p>
      </div>
      <div className="text-center">
        <p className="text-lg font-bold text-gray-900 dark:text白">
          {isUpdatingMode || !statistics ? (
            <TextSkeleton>{statistics?.ranked_score?.toLocaleString() || '99,999,999'}</TextSkeleton>
          ) : (
            statistics.ranked_score?.toLocaleString() || '0'
          )}
        </p>
        <p className="text-sm text-gray-600 dark:text-gray-400">排名分数</p>
      </div>
      <div className="text-center">
        <p className="text-lg font-bold text-gray-900 dark:text白">
          {isUpdatingMode || !statistics ? (
            <TextSkeleton>
              {statistics?.play_time
                ? `${Math.round(statistics.play_time / 3600).toLocaleString()}h`
                : '999h'}
            </TextSkeleton>
          ) : (
            `${Math.round((statistics.play_time || 0) / 3600).toLocaleString()}h`
          )}
        </p>
        <p className="text-sm text-gray-600 dark:text-gray-400">游戏时间</p>
      </div>
    </div>
  </motion.div>
);

export default GameStatsCard;

