"use client";

import React, { useCallback, useState } from 'react';

import TeamDetailUserCard from '@/components/Rankings/TeamDetailUserCard';
import TeamActions from '@/components/Teams/TeamActions';
import MemberActions from '@/components/Teams/MemberActions';
import LoadingSpinner from '@/components/UI/LoadingSpinner';
import type { GameMode, TeamDetailResponse, User } from '@/types';
import { teamsAPI, handleApiError } from '@/utils/api';
import { FiArrowLeft, FiAward, FiUsers } from 'react-icons/fi';
import { useTranslation } from 'react-i18next';
import Link from 'next/link';

interface TeamDetailClientProps {
  teamId: number;
  initialData: TeamDetailResponse;
  selectedMode: GameMode;
}

const TeamDetailClient: React.FC<TeamDetailClientProps> = ({ teamId, initialData, selectedMode }) => {
  const { t, i18n } = useTranslation();
  const [teamDetail, setTeamDetail] = useState<TeamDetailResponse>(initialData);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const formatDate = useCallback(
    (dateString: string) => {
      return new Date(dateString).toLocaleDateString(i18n.language === 'zh' ? 'zh-CN' : 'en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
    },
    [i18n.language],
  );

  const handleTeamUpdate = useCallback(async () => {
    setIsRefreshing(true);
    try {
      const data = await teamsAPI.getTeam(teamId);
      setTeamDetail(data);
    } catch (error) {
      handleApiError(error);
    } finally {
      setIsRefreshing(false);
    }
  }, [teamId]);

  const leader = teamDetail.members.find((member) => member.id === teamDetail.team.leader_id) || null;
  const nonLeaderMembers = teamDetail.members.filter((member) => member.id !== teamDetail.team.leader_id);

  if (isRefreshing) {
    return (
      <div className="flex items-center justify-center py-24">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 lg:px-6 py-6 sm:py-8">
      <div className="mb-6">
        <Link
          href="/teams"
          className="inline-flex items-center text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
        >
          <FiArrowLeft className="mr-2" />
          {t('teams.detail.backToTeams')}
        </Link>
      </div>

      <div className="-mx-4 sm:mx-0 sm:bg-card sm:rounded-xl sm:shadow-sm sm:border sm:border-card mb-8">
        <div className="relative h-32 sm:h-48 bg-gradient-to-r from-blue-500 to-purple-600 sm:rounded-t-xl overflow-hidden">
          <img
            src={teamDetail.team.cover_url}
            alt={`${teamDetail.team.name} cover`}
            className="w-full h-full object-cover"
            onError={(e) => {
              e.currentTarget.style.display = 'none';
            }}
          />
          <div className="absolute inset-0 bg-black bg-opacity-30" />
        </div>

        <div className="relative px-4 sm:px-6 py-6 sm:bg-card sm:rounded-b-xl">
          <div className="flex flex-col sm:flex-row sm:items-center gap-4">
            <div className="w-32 h-16 sm:w-40 sm:h-20 rounded-xl overflow-hidden border-4 border-white dark:border-gray-800 bg-gray-100 dark:bg-gray-700 flex-shrink-0 -mt-12 sm:-mt-16">
              <img
                src={teamDetail.team.flag_url}
                alt={`${teamDetail.team.name} flag`}
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                }}
              />
            </div>

            <div className="flex-1">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-1">
                    {teamDetail.team.name}
                  </h1>
                  {teamDetail.team.short_name !== teamDetail.team.name && (
                    <p className="text-lg text-gray-600 dark:text-gray-400">{teamDetail.team.short_name}</p>
                  )}
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                  <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-sm text-gray-600 dark:text-gray-400">
                    <div className="flex items-center gap-1">
                      <FiUsers className="w-4 h-4" />
                      <span>{t('teams.detail.members', { count: teamDetail.members.length })}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <FiAward className="w-4 h-4" />
                      <span>{t('teams.detail.createdAt', { date: formatDate(teamDetail.team.created_at) })}</span>
                    </div>
                  </div>

                  <div className="relative overflow-visible">
                    <TeamActions team={teamDetail.team} members={teamDetail.members} onTeamUpdate={handleTeamUpdate} />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {leader && (
        <div className="sm:bg-card sm:rounded-xl sm:shadow-sm sm:border sm:border-card sm:p-6 mb-8">
          <div className="flex items-center gap-3 mb-4 px-4 sm:px-0">
            <FiAward className="w-5 h-5 text-yellow-500" />
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">{t('teams.detail.captain')}</h2>
          </div>
          <div className="-mx-4 sm:-mx-6 sm:border sm:border-card overflow-hidden">
            <TeamDetailUserCard
              ranking={{
                user: leader,
                ranked_score: leader.statistics?.ranked_score,
                pp: leader.statistics?.pp,
              }}
              selectedMode={selectedMode}
              rankingType="performance"
            />
          </div>
        </div>
      )}

      {nonLeaderMembers.length > 0 && (
        <div className="sm:bg-card sm:rounded-xl sm:shadow-sm sm:border sm:border-card sm:p-6">
          <div className="flex items-center gap-3 mb-6 px-4 sm:px-0">
            <FiUsers className="w-5 h-5 text-blue-500" />
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">{t('teams.detail.teamMembers')}</h2>
            <span className="text-sm text-gray-500 dark:text-gray-400">
              {t('teams.detail.memberCount', { count: nonLeaderMembers.length })}
            </span>
          </div>

          <div className="-mx-4 sm:-mx-6 sm:divide-y divide-gray-200 dark:divide-gray-700 sm:border sm:border-card overflow-hidden">
            {nonLeaderMembers.map((member: User) => (
              <div key={member.id} className="relative">
                <TeamDetailUserCard
                  ranking={{
                    user: member,
                    ranked_score: member.statistics?.ranked_score,
                    pp: member.statistics?.pp,
                  }}
                  selectedMode={selectedMode}
                  rankingType="performance"
                />
                <div className="absolute top-4 right-4 sm:right-6">
                  <MemberActions member={member} team={teamDetail.team} onMemberRemoved={handleTeamUpdate} />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default TeamDetailClient;
