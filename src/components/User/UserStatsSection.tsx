import React from 'react';
import UserInfoCard from './UserInfoCard';
import GameStatsCard from './GameStatsCard';
import CoreStatsCard from './CoreStatsCard';
import type { UserStatistics, GameMode } from '../../types';

interface BasicUserInfo {
  id: number;
  join_date?: string;
  last_visit?: string;
}

interface UserStatsSectionProps {
  user: BasicUserInfo;
  statistics?: UserStatistics;
  isUpdatingMode: boolean;
  selectedMode: GameMode;
}

const UserStatsSection: React.FC<UserStatsSectionProps> = ({
  user,
  statistics,
  isUpdatingMode,
  selectedMode,
}) => (
  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
    <UserInfoCard user={user} />
    <GameStatsCard statistics={statistics} isUpdatingMode={isUpdatingMode} />
    <CoreStatsCard
      statistics={statistics}
      isUpdatingMode={isUpdatingMode}
      selectedMode={selectedMode}
    />
  </div>
);

export default UserStatsSection;

