import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import Avatar from '../UI/Avatar';
import GameModeSelector from '../UI/GameModeSelector';
import RankHistoryChart from '../UI/RankHistoryChart';
import PlayerRankCard from '../User/PlayerRankCard';
import StatsCard from '../User/StatsCard';
import LevelProgress from '../UI/LevelProgress';
import { type User, type GameMode } from '../../types';
import FriendStats from './FriendStats';
import UserRecentActivity from './UserRecentActivity';
import UserBestScores from './UserBestScores';
import UserPageDisplay from './UserPageDisplay';
import RestrictedBanner from './RestrictedBanner';
import { BiSolidPencil } from 'react-icons/bi';
import { FaTools } from "react-icons/fa";
import { Tooltip } from 'react-tooltip';
import { useAuth } from '../../hooks/useAuth';

interface UserProfileLayoutProps {
  user: User;
  selectedMode: GameMode;
  onModeChange: (mode: GameMode) => void;
  onUserUpdate?: (user: User) => void; // 添加用户更新回调
}

const formatPlayTime = (seconds: number | undefined): string => {
  if (!seconds) return '0m';
  const days = Math.floor(seconds / 86400);
  const hours = Math.floor((seconds % 86400) / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const parts: string[] = [];
  if (days) parts.push(`${days}d`);
  if (hours) parts.push(`${hours}h`);
  if (minutes) parts.push(`${minutes}m`);
  return parts.join(' ') || '0m';
};

/** 头图懒加载 + blur 过渡 */
const CoverImage: React.FC<{ src?: string; alt?: string }> = ({ src, alt = 'cover' }) => {
  const ref = useRef<HTMLDivElement | null>(null);
  const [inView, setInView] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(false);
  //const [isUpdatingMode, setIsUpdatingMode] = useState(false);

  useEffect(() => {
    if (!ref.current) return;
    if (typeof window === 'undefined' || !('IntersectionObserver' in window)) {
      setInView(true);
      return;
    }
    const io = new IntersectionObserver(
      entries => {
        entries.forEach(e => {
          if (e.isIntersecting) {
            setInView(true);
            io.disconnect();
          }
        });
      },
      { rootMargin: '200px' }
    );
    io.observe(ref.current);
    return () => io.disconnect();
  }, []);

  return (
    <div ref={ref} className="relative w-full overflow-hidden h-[180px] md:h-[288px]">
      {/* 骨架 or 渐变背景兜底 */}
      <div className="absolute inset-0 cover-bg">
        <div className="h-full w-full bg-white/0 dark:bg-black/10" />
      </div>

      {inView && src && !error && (
        <img
          src={src}
          alt={alt}
          loading="lazy"
          decoding="async"
          className={`absolute inset-0 w-full h-full object-cover transition duration-500 ${loaded ? 'opacity-100 blur-0' : 'opacity-0 blur-md'}`}
          onLoad={() => setLoaded(true)}
          onError={() => setError(true)}
        />
      )}

      {/* 黑色顶层渐变，保证文字可读 */}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/35 via-black/10 to-transparent" />
    </div>
  );
};

const UserProfileLayout: React.FC<UserProfileLayoutProps> = ({ user, selectedMode, onModeChange, onUserUpdate }) => {
  const { t } = useTranslation();
  const { refreshUser, user: currentUser } = useAuth();
  const navigate = useNavigate();
  
  const stats = user.statistics;
  const gradeCounts = stats?.grade_counts ?? { ssh: 0, ss: 0, sh: 0, s: 0, a: 0 };
  const levelProgress = stats?.level?.progress ?? 0;
  const levelCurrent = stats?.level?.current ?? 0;
  const playTime = formatPlayTime(stats?.play_time);
  const user_achievements = Array.isArray(user.user_achievements)
    ? user.user_achievements.filter(
        (a): a is { achievement_id: number; achieved_at: string } =>
          typeof a === 'object' &&
          a !== null &&
          typeof (a as any).achievement_id === 'number' &&
          typeof (a as any).achieved_at === 'string'
      )
    : undefined;

  const coverUrlRaw = user.cover_url || user.cover?.url || undefined;
  const coverUrl =
    coverUrlRaw === "https://assets.ppy.sh/user-profile-covers/default.jpeg"
      ? "/image/backgrounds/bgcover.jpg"
      : coverUrlRaw;
  const [isUpdatingMode] = useState(false);

  // 检查是否可以编辑（仅自己的页面）
  const canEdit = currentUser?.id === user.id;

  // 处理编辑按钮点击
  const handleEditClick = () => {
    navigate('/settings');
  };

  // 处理头像更新
  const handleAvatarUpdate = async (newAvatarUrl: string) => {
    console.log('头像更新成功，延迟刷新用户信息:', newAvatarUrl);
    // 延迟刷新用户信息，确保服务器端已经处理完成
    setTimeout(async () => {
      console.log('执行延迟刷新用户信息');
      await refreshUser();
    }, 3000); // 延迟3秒，给服务器更多时间处理
  };

  return (
    <main className="max-w-7xl mx-auto px-4 lg:px-6 py-4 md:py-6">
      {/* 主卡片 */}
      <div className="bg-transparent md:bg-white/95 md:dark:bg-gray-900/85 md:main-card-shadow md:rounded-t-2xl md:rounded-b-2xl overflow-hidden md:border md:border-gray-100/70 md:dark:border-white/10">
        
        {/* 受限用户提示 - 仅管理员可见 */}
        {user.is_restricted && currentUser?.is_admin && (
          <div className="px-3 md:px-6 pt-4">
            <RestrictedBanner />
          </div>
        )}

        {/* 头部栏 + 模式选择（与头图同容器） */}
        <div className="relative overflow-hidden">
          <div className="bg-white/95 dark:bg-gray-900/85 text-gray-900 dark:text-gray-100 px-4 md:px-6 py-3 md:py-4 flex items-center justify-between md:rounded-t-2xl border-b border-gray-100/70 dark:border-white/10">
            <div className="flex items-center gap-3">
              <div className="w-1 h-6 bg-osu-pink rounded-full"></div>
              <div className="text-base md:text-lg font-bold">{t('profile.info.title')}</div>
            </div>
            <div className="flex items-center gap-2 md:gap-3">
              {/* 右侧模式按钮们（来自你的 GameModeSelector） */}
              <GameModeSelector
                selectedMode={selectedMode}
                onModeChange={onModeChange}
                variant="compact"
                className=""
              />
            </div>
          </div>

          {/* 头图懒加载 */}
          <CoverImage src={coverUrl} alt={`${user.username} cover`} />

          {/* 编辑按钮 - 仅在自己的页面显示 */}
          {canEdit && (
            <button 
              onClick={handleEditClick}
              className="absolute bottom-2 right-2 md:bottom-3 md:right-3 w-7 h-7 md:w-9 md:h-9 rounded-full bg-black/50 text-white grid place-items-center edit-button-shadow text-xs md:text-sm hover:bg-black/70 transition-colors" 
              aria-label={t('profile.userPage.editCover')}
            >
              <BiSolidPencil />
            </button>
          )}
        </div>

        {/* 头像与基本信息条 */}
        <div className="bg-white/95 dark:bg-gray-900/85 px-3 md:px-8 py-4 md:py-6 flex items-center gap-4 md:gap-6 border-b border-gray-200/60 dark:border-white/10 relative">
          {/* 头像：渐变边 + 阴影，左下沉覆盖 */}
          <div className="-mt-16">
            <Avatar
              userId={user.id}
              username={user.username}
              avatarUrl={user.avatar_url}
              size="xl"
              shape="rounded"
              editable={false}
              className="mt-[10px]  md:mt-[1px] md:!w-32 md:!h-32 md:!min-w-32 md:!min-h-32"
              onAvatarUpdate={handleAvatarUpdate}
            />
          </div>
          {/* 用户名 + 国家 + 团队旗帜 */}
          <div className="flex-1">
            <h1 className="mt-[-12px] md:mt-[-15px] ml-0 md:ml-[-10px] text-xl md:text-3xl font-bold mb-3 md:mb-2 text-gray-900 dark:text-gray-100">
              {user.username}
            </h1>
            <div className="flex mt-[-10px] items-center gap-2 md:gap-4 md:mt-[10px] md:ml-[-8px] flex-wrap">
              {/* 国旗和国家名 */}
              {user.country?.code && (
                <div className="flex items-center gap-2">
                  <img
                    src={`/image/flag/${user.country.code.toLowerCase()}.svg`}
                    alt={user.country.name}
                    className="h-[20px] md:h-[25px] w-auto rounded-sm object-contain cursor-help"
                    loading="lazy"
                    decoding="async"
                    data-tooltip-id="country-tooltip"
                    data-tooltip-content={user.country?.name || '国家'}
                  />
                  <span className="text-gray-600 dark:text-gray-300 text-sm md:text-base">
                    {user.country?.code || '国家'}
                  </span>
                </div>
              )}

              {/* 团队旗帜和名称 */}
              {user.team && (
                <div className="flex items-center gap-2">
                  <img
                    src={user.team.flag_url}
                    alt="团队旗帜"
                    className="h-[20px] md:h-[25px] w-auto rounded-sm object-contain cursor-help"
                    loading="lazy"
                    decoding="async"
                    data-tooltip-id="team-tooltip"
                    data-tooltip-content={user.team.name}
                  />
                  <span className="text-gray-600 dark:text-gray-300 text-sm md:text-base">
                    {user.team.short_name || user.team.name}
                  </span>
                </div>
              )}
            </div>
          </div>
          </div>

        {/* Tooltips */}
        <Tooltip id="country-tooltip" />
        <Tooltip id="team-tooltip" />



        {/* 中部：左 3/4（排名+折线+信息），右 1/4（统计） */}
        <div className="bg-white/95 dark:bg-gray-900/85 px-3 md:px-6 py-4 border-b border-gray-200/60 dark:border-white/10">
          <div className="flex flex-col md:flex-row gap-4">
            {/* 左侧 3/4 */}
            <div className="flex-[3] flex flex-col gap-3">
              {/* 排名 */}
              <div className="flex gap-8 p-3 md:rounded-lg md:rank-card-shadow mb-[20px] ml-0 md:ml-[-10px]">
                <div className="text-center">
                  <div className="text-gray-500 dark:text-gray-400 mb-[-5px] mb-1 text-[12px]">{t('profile.info.globalRank')}</div>
                  <div className="font-bold text-primary text-[20px]">#{stats?.global_rank ?? '—'}</div>
                </div>
                <div className="text-center">
                  <div className="text-gray-500 dark:text-gray-400 mb-[-5px] text-[12px]">{t('profile.info.countryRank')}</div>
                  <div className="font-bold text-primary text-[20px]">#{stats?.country_rank ?? '—'}</div>
                </div>
              </div>

              {/* 折线图 */}
              <div className="w-full mt-[-45px]">
                <RankHistoryChart
                  rankHistory={user.rank_history}
                  isUpdatingMode={isUpdatingMode}
                  selectedModeColor="#ED8EA6"
                  delay={0.4}
                  height="8rem"
                />
              </div>

              {/* 附加信息（PP / 游戏时间 / 成绩徽章） */}
              <div className="w-full mt-[-55px]">
                <PlayerRankCard
                  stats={stats}
                  playTime={playTime}
                  user_achievements={user_achievements}
                  gradeCounts={gradeCounts}
                />
              </div>
            </div>

            {/* 右侧 1/4：统计信息 */}
            <div className="flex-1">
              <div className="bg-gray-50 dark:bg-gray-800/60 p-3 md:rounded-lg h-full flex flex-col justify-center md:stats-card-shadow">
                <StatsCard stats={stats} />
              </div>
            </div>
          </div>
        </div>

        {/* 好友/消息 + 等级进度 */}
        <div className="bg-white/95 dark:bg-gray-900/85 px-3 md:px-6 lg:px-8 py-4 md:py-6 relative border-b border-gray-200/60 dark:border-white/10">
          <div className="flex items-center justify-between relative">
              <FriendStats user={user} />
            <div className="flex items-center gap-4">
              {/* 进度条 */}
              <LevelProgress
                levelCurrent={levelCurrent}
                levelProgress={levelProgress}
                className="flex-1"
                tint="#ED8EA6"
              />
            </div>
          </div>
        </div>

        {/* 个人页面 */}
        <div className="bg-white/95 dark:bg-gray-900/85 px-3 md:px-6 lg:px-8 py-3 md:py-4 border-b border-gray-200/60 dark:border-white/10">
          <UserPageDisplay
            user={user}
            onUserUpdate={onUserUpdate}
          />
        </div>

        {/* 用户最近活动 */}
        <div className="bg-white/95 dark:bg-gray-900/85 px-3 md:px-6 lg:px-8 py-3 md:py-4 border-b border-gray-200/60 dark:border-white/10">
          <UserRecentActivity userId={user.id} />
        </div>

        {/* 用户最佳成绩 */}
        <div className="bg-white/95 dark:bg-gray-900/85 px-3 md:px-6 lg:px-8 py-3 md:py-4 border-b border-gray-200/60 dark:border-white/10">
          <UserBestScores userId={user.id} selectedMode={selectedMode} user={user} />
        </div>

        {/* 施工中 */}
        <div className="bg-gray-50 dark:bg-gray-800/60 p-3 md:rounded-lg h-[500px] flex flex-col justify-center">
          <div className="flex justify-center items-center h-full">
            <p className="flex items-center gap-2 text-gray-500 dark:text-gray-400">
              <FaTools className="text-lg" />
              {t('profile.info.underConstruction')}
            </p>
          </div>
        </div>

      </div>
    </main>
  );
};

export default UserProfileLayout;