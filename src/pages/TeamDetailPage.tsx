import React, { useState, useEffect } from 'react';
import { useParams, Link, useSearchParams } from 'react-router-dom';
import { FiArrowLeft, FiLoader, FiUsers, FiCalendar, FiAward } from 'react-icons/fi';
import { useTranslation } from 'react-i18next';
import { teamsAPI, handleApiError } from '../utils/api';
import TeamDetailUserCard from '../components/Rankings/TeamDetailUserCard';
import TeamActions from '../components/Teams/TeamActions';
import MemberActions from '../components/Teams/MemberActions';
import type { TeamDetailResponse, User, GameMode } from '../types';

const TeamDetailPage: React.FC = () => {
  const { t, i18n } = useTranslation();
  const { teamId } = useParams<{ teamId: string }>();
  const [searchParams] = useSearchParams();
  const [teamDetail, setTeamDetail] = useState<TeamDetailResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  // 从 URL 参数获取模式,如果没有则默认为 'osu'
  const modeFromUrl = searchParams.get('mode') as GameMode | null;
  const selectedMode: GameMode = modeFromUrl || 'osu';

  useEffect(() => {
    if (!teamId) return;

    const loadTeamDetail = async () => {
      setIsLoading(true);
      try {
        const response = await teamsAPI.getTeam(parseInt(teamId));
        setTeamDetail(response);
      } catch (error) {
        handleApiError(error);
        console.error('加载战队详情失败:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadTeamDetail();
  }, [teamId]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString(i18n.language === 'zh' ? 'zh-CN' : 'en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getLeader = () => {
    if (!teamDetail) return null;
    return teamDetail.members.find(member => member.id === teamDetail.team.leader_id);
  };

  const getNonLeaderMembers = () => {
    if (!teamDetail) return [];
    return teamDetail.members.filter(member => member.id !== teamDetail.team.leader_id);
  };

  const handleTeamUpdate = () => {
    if (!teamId) return;
    const loadTeamDetail = async () => {
      setIsLoading(true);
      try {
        const response = await teamsAPI.getTeam(parseInt(teamId));
        setTeamDetail(response);
      } catch (error) {
        handleApiError(error);
        console.error('加载战队详情失败:', error);
      } finally {
        setIsLoading(false);
      }
    };
    loadTeamDetail();
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--bg-primary)' }}>
        <div className="text-center">
          <FiLoader className="animate-spin h-12 w-12 text-blue-500 mx-auto mb-4" />
          <p className="text-gray-500 dark:text-gray-400 font-medium">{t('teams.detail.loading')}</p>
        </div>
      </div>
    );
  }

  if (!teamDetail) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--bg-primary)' }}>
        <div className="text-center">
          <FiUsers className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-700 dark:text-gray-300 mb-2">
            {t('teams.detail.notFound')}
          </h3>
          <p className="text-gray-500 dark:text-gray-400 mb-6">
            {t('teams.detail.notFoundDescription')}
          </p>
          <Link
            to="/teams"
            className="inline-flex items-center px-4 py-2 bg-osu-pink text-white rounded-lg hover:bg-osu-pink/90 transition-colors"
          >
            <FiArrowLeft className="mr-2" />
            {t('teams.detail.backToTeams')}
          </Link>
        </div>
      </div>
    );
  }

  const { team, members } = teamDetail;
  const leader = getLeader();
  const nonLeaderMembers = getNonLeaderMembers();

  return (
    <div className="min-h-screen" style={{ background: 'var(--bg-primary)' }}>
      <div className="max-w-7xl mx-auto px-4 lg:px-6 py-6 sm:py-8">
        {/* 返回按钮 */}
        <div className="mb-6">
          <Link
            to="/teams"
            className="inline-flex items-center text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
          >
            <FiArrowLeft className="mr-2" />
            {t('teams.detail.backToTeams')}
          </Link>
        </div>

        {/* 战队头部信息 */}
        <div className="-mx-4 sm:mx-0 sm:bg-card sm:rounded-xl sm:shadow-sm sm:border sm:border-card mb-8">
          {/* 封面图片 */}
          <div className="relative h-32 sm:h-48 bg-gradient-to-r from-blue-500 to-purple-600 sm:rounded-t-xl overflow-hidden">
            <img
              src={team.cover_url}
              alt={`${team.name} cover`}
              className="w-full h-full object-cover"
              onError={(e) => {
                e.currentTarget.style.display = 'none';
              }}
            />
            <div className="absolute inset-0 bg-black bg-opacity-30" />
          </div>

          {/* 战队信息 */}
          <div className="relative px-4 sm:px-6 py-6 sm:bg-card sm:rounded-b-xl">
            <div className="flex flex-col sm:flex-row sm:items-center gap-4">
              {/* 战队旗帜 - 2:1 比例 (240:120) */}
              <div className="w-32 h-16 sm:w-40 sm:h-20 rounded-xl overflow-hidden border-4 border-white dark:border-gray-800 bg-gray-100 dark:bg-gray-700 flex-shrink-0 -mt-12 sm:-mt-16">
                <img
                  src={team.flag_url}
                  alt={`${team.name} flag`}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                  }}
                />
              </div>

              {/* 战队基本信息 */}
              <div className="flex-1">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div>
                    <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-1">
                      {team.name}
                    </h1>
                    {team.short_name !== team.name && (
                      <p className="text-lg text-gray-600 dark:text-gray-400">
                        {team.short_name}
                      </p>
                    )}
                  </div>

                  <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-sm text-gray-600 dark:text-gray-400">
                      <div className="flex items-center gap-1">
                        <FiCalendar className="w-4 h-4" />
                        <span>{t('teams.detail.createdAt', { date: formatDate(team.created_at) })}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <FiUsers className="w-4 h-4" />
                        <span>{t('teams.detail.members', { count: members.length })}</span>
                      </div>
                    </div>
                    
                    {/* 战队操作按钮 */}
                    <div className="relative overflow-visible">
                      <TeamActions
                        team={team}
                        members={members}
                        onTeamUpdate={handleTeamUpdate}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 队长信息 */}
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
                  pp: leader.statistics?.pp
                }}
                selectedMode={selectedMode}
                rankingType="performance"
              />
            </div>
          </div>
        )}

        {/* 团队成员 */}
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
                      pp: member.statistics?.pp
                    }}
                    selectedMode={selectedMode}
                    rankingType="performance"
                  />
                  
                  {/* 成员操作按钮 */}
                  <div className="absolute top-4 right-4 sm:right-6">
                    <MemberActions
                      member={member}
                      team={team}
                      onMemberRemoved={handleTeamUpdate}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TeamDetailPage;
