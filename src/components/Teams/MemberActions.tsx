import React, { useState } from 'react';
import { FiUserX, FiMoreHorizontal } from 'react-icons/fi';
import { useTranslation } from 'react-i18next';
import { teamsAPI, handleApiError } from '../../utils/api';
import { useAuth } from '../../hooks/useAuth';
import toast from 'react-hot-toast';
import type { User, Team } from '../../types';

interface Props {
  member: User;
  team: Team;
  onMemberRemoved?: () => void;
}

const MemberActions: React.FC<Props> = ({ member, team, onMemberRemoved }) => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [showActions, setShowActions] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isLeader = user?.id === team.leader_id;
  const isTargetLeader = member.id === team.leader_id;
  const canKick = isLeader && !isTargetLeader && user?.id !== member.id;

  // 踢出成员
  const handleKickMember = async () => {
    if (!confirm(t('teams.detail.confirmKick', { username: member.username }))) return;

    setIsSubmitting(true);
    try {
      await teamsAPI.removeMember(team.id, member.id);
      toast.success(t('teams.detail.memberKicked', { username: member.username }));
      onMemberRemoved?.();
    } catch (error) {
      handleApiError(error);
    } finally {
      setIsSubmitting(false);
      setShowActions(false);
    }
  };

  if (!canKick) return null;

  return (
    <div className="relative">
      <button
        onClick={() => setShowActions(!showActions)}
        className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded transition-colors"
      >
        <FiMoreHorizontal className="w-4 h-4" />
      </button>

      {showActions && (
        <>
          <div className="absolute right-0 top-full mt-1 w-32 bg-card border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-50">
            <div className="py-1">
              <button
                onClick={handleKickMember}
                disabled={isSubmitting}
                className="flex items-center w-full px-3 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 disabled:opacity-50"
              >
                <FiUserX className="mr-2 w-3 h-3" />
                {isSubmitting ? t('teams.detail.kicking') : t('teams.detail.kickMember')}
              </button>
            </div>
          </div>

          {/* 点击外部关闭菜单 */}
          <div
            className="fixed inset-0 z-40"
            onClick={() => setShowActions(false)}
          />
        </>
      )}
    </div>
  );
};

export default MemberActions;
