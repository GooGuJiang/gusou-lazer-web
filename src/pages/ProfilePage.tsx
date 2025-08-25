import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { Tooltip as ReactTooltip } from 'react-tooltip';
import { useAuth } from '../hooks/useAuth';
import { Navigate } from 'react-router-dom';
import type { GameMode, MainGameMode } from '../types';
import { GAME_MODE_COLORS, GAME_MODE_GROUPS, GAME_MODE_NAMES, MAIN_MODE_ICONS } from '../types';
import EditableAvatar from '../components/UI/EditableAvatar';
import ProfileCover from '../components/UI/ProfileCover';
import TextSkeleton from '../components/UI/TextSkeleton';
import UserStatsSection from '../components/User/UserStatsSection';

const ProfilePage: React.FC = () => {
  const { user, isAuthenticated, isLoading, updateUserMode } = useAuth();
  const [selectedMode, setSelectedMode] = useState<GameMode>('osu');
  const [selectedMainMode, setSelectedMainMode] = useState<MainGameMode>('osu');
  const [showSubModes, setShowSubModes] = useState<MainGameMode | null>(null);
  const [isUpdatingMode, setIsUpdatingMode] = useState(false);
  const modeSelectRef = useRef<HTMLDivElement>(null);

  // 点击外部关闭子模式菜单
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (modeSelectRef.current && !modeSelectRef.current.contains(event.target as Node)) {
        setShowSubModes(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // 当选择的模式改变时，获取对应模式的用户数据
  useEffect(() => {
    if (isAuthenticated && selectedMode) {
      setIsUpdatingMode(true);
      updateUserMode(selectedMode).finally(() => {
        setIsUpdatingMode(false);
      });
    }
  }, [selectedMode, isAuthenticated, updateUserMode]);

  // 处理主模式切换
  const handleMainModeChange = (mainMode: MainGameMode) => {
    if (selectedMainMode === mainMode) {
      // 如果点击的是当前选中的模式，切换子模式显示状态
      setShowSubModes(showSubModes === mainMode ? null : mainMode);
    } else {
      // 如果点击的是不同的模式，选择该模式并显示其子模式
      setSelectedMainMode(mainMode);
      setShowSubModes(mainMode);
      // 默认选择该主模式的第一个子模式
      const firstSubMode = GAME_MODE_GROUPS[mainMode][0];
      setSelectedMode(firstSubMode);
    }
  };

  // 处理子模式选择
  const handleSubModeSelect = (mode: GameMode) => {
    setSelectedMode(mode);
    setShowSubModes(null); // 选择后隐藏子模式选项
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-osu-pink"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
        <div className="text-6xl mb-4">😕</div>
        <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-200 mb-2">
          无法加载个人资料
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          请尝试刷新页面
        </p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-6xl mx-auto p-4 sm:p-6 space-y-6 sm:space-y-8 overflow-x-hidden">
      {/* 用户基本信息 */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-full"
      >
        <ProfileCover
          coverUrl={user.cover_url || user.cover?.url}
          className="rounded-2xl shadow-lg"
        >
          <div className="p-4 sm:p-6 md:p-8 w-full max-w-full relative">
            {/* 游戏模式选择器 - 位于卡片右上角 */}
            <div className="absolute top-3 mr-[10px] right-4 sm:right-[100px] z-20" ref={modeSelectRef}>
              {/* 主模式图标 */}
              <div className="flex gap-1 sm:gap-2">
                {(Object.keys(GAME_MODE_GROUPS) as MainGameMode[]).map((mainMode) => (
                  <div key={mainMode} className="relative">
                    <button
                      onClick={() => handleMainModeChange(mainMode)}
                      className={`relative p-1.5 sm:p-2 rounded-lg transition-all duration-300 group overflow-hidden focus:outline-none focus-visible:ring-2 focus-visible:ring-white/60 focus-visible:ring-offset-2 focus-visible:ring-offset-black/30 ${
                        selectedMainMode === mainMode
                          ? 'scale-110 shadow-lg'
                          : 'hover:scale-105 opacity-80 hover:opacity-100'
                      }`}
                      data-tooltip-id={`main-mode-${mainMode}`}
                      data-tooltip-content={mainMode === 'osu' ? 'osu!' : 
                                          mainMode === 'taiko' ? 'osu!taiko' :
                                          mainMode === 'fruits' ? 'osu!catch' :
                                          'osu!mania'}
                      style={{
                        WebkitTapHighlightColor: 'transparent'
                      }}
                    >
                      <span
                        className="absolute inset-0 rounded-lg transition-all duration-300"
                        style={{
                          background: selectedMainMode === mainMode
                            ? `linear-gradient(135deg, ${GAME_MODE_COLORS[GAME_MODE_GROUPS[mainMode][0]]} 0%, ${GAME_MODE_COLORS[GAME_MODE_GROUPS[mainMode][0]]}CC 100%)`
                            : 'rgba(255,255,255,0.07)',
                          boxShadow: selectedMainMode === mainMode ? '0 4px 14px rgba(0,0,0,0.35)' : '0 2px 6px rgba(0,0,0,0.25)'
                        }}
                      />
                      <span
                        className="pointer-events-none absolute inset-0 rounded-lg opacity-0 group-hover:opacity-40 transition-opacity"
                        style={{
                          background: 'radial-gradient(circle at 30% 20%, rgba(255,255,255,0.35), transparent 70%)'
                        }}
                      />
                      {selectedMainMode === mainMode && (
                        <span
                          className="pointer-events-none absolute inset-0 rounded-lg ring-2 ring-white/50 ring-offset-2 ring-offset-black/30 animate-[pulse_2.4s_ease-in-out_infinite]"
                          style={{ boxShadow: '0 0 0 3px rgba(255,255,255,0.08)' }}
                        />
                      )}
                      <i
                        className={`${MAIN_MODE_ICONS[mainMode]} relative z-10 text-lg sm:text-xl transition-colors duration-300 drop-shadow-[0_2px_4px_rgba(0,0,0,0.45)]`}
                        style={{
                          color: selectedMainMode === mainMode ? '#fff' : 'rgba(255,255,255,0.85)'
                        }}
                      />
                    </button>

                    {/* 子模式弹出选项 */}
                    {showSubModes === mainMode && (
                      <motion.div
                        initial={{ opacity: 0, y: -10, scale: 0.9 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -10, scale: 0.9 }}
                        className="absolute top-full mt-2 right-0 bg-black/90 backdrop-blur-md border border-white/20 rounded-lg p-2 min-w-28 sm:min-w-32 shadow-xl z-30"
                      >
                        {GAME_MODE_GROUPS[mainMode].map((mode) => (
                          <button
                            key={mode}
                            onClick={() => handleSubModeSelect(mode)}
                            className={`w-full text-left px-2 sm:px-3 py-1.5 sm:py-2 rounded-md font-medium transition-all duration-200 text-xs sm:text-sm block ${
                              selectedMode === mode
                                ? 'text-white shadow-md'
                                : 'text-white/70 hover:text-white hover:bg-white/10'
                            }`}
                            style={{
                              backgroundColor: selectedMode === mode ? GAME_MODE_COLORS[mode] : 'transparent',
                            }}
                          >
                            {GAME_MODE_NAMES[mode]}
                          </button>
                        ))}
                      </motion.div>
                    )}
                  </div>
                ))}
              </div>

              {/* 模式图标的 Tooltip */}
              {(Object.keys(GAME_MODE_GROUPS) as MainGameMode[]).map((mainMode) => (
                <ReactTooltip
                  key={`tooltip-${mainMode}`}
                  id={`main-mode-${mainMode}`}
                  place="top"
                  variant="dark"
                  offset={10}
                  delayShow={300}
                  style={{
                    backgroundColor: 'rgba(0, 0, 0, 0.9)',
                    color: 'white',
                    borderRadius: '8px',
                    fontSize: '12px',
                    fontWeight: '500',
                    padding: '8px 12px',
                    backdropFilter: 'blur(4px)',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                    zIndex: 99999,
                    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
                  }}
                  classNameArrow="!border-t-black/90"
                />
              ))}
            </div>
            <div className="flex mt-[13px] flex-col lg:flex-row gap-6 lg:gap-8 w-full max-w-full">
              {/* 左侧：头像、用户名、国家 */}
              <div className="flex-1 lg:flex-[2] min-w-0 max-w-full mt-20 ml-10 sm:mt-0 lg:mt-0">
                <div className="flex items-center gap-4 w-full max-w-full">
                  {/* 可编辑头像 */}
                  <div className="flex-shrink-0">
                    <div className="relative">
                      <EditableAvatar
                        userId={user.id}
                        username={user.username}
                        avatarUrl={user.avatar_url}
                        size="xl"
                        editable={true}
                        className="relative z-10"
                        onAvatarUpdate={async (newAvatarUrl) => {
                          // 头像更新后，不立即刷新用户信息，避免造成头像闪烁
                          // EditableAvatar 组件会自动处理新的头像 URL
                          if (import.meta.env.DEV) {
                            console.log('头像已更新:', newAvatarUrl);
                          }
                        }}
                      />
                      {/* 头像边框 */}
                      <div className="absolute inset-0 rounded-full border-4 border-white/20"></div>
                    </div>
                  </div>

                  {/* 用户基本信息 */}
                  <div className="flex-1 text-left min-w-0 max-w-full">
                    <div className="flex flex-col gap-2 mb-3">
                      <div className="flex items中心 gap-3">
                        <h1 className="text-lg sm:text-xl md:text-2xl xl:text-3xl font-bold text-white text-shadow-lg leading-tight min-w-0 max-w-full">
                          <span className="inline-block break-all word-wrap break-words">{user.username}</span>
                        </h1>

                        {/* 等级信息 - 与用户名并排 */}
                        {isUpdatingMode || !user.statistics?.level ? (
                          <div className="relative h-6 w-12 rounded-full border-2 border-white/20 overflow-hidden flex-shrink-0">
                            <div className="absolute inset-0 animate-pulse bg-gray-300/50 dark:bg-gray-600/50 rounded-full"></div>
                            <div className="absolute inset-0 flex items-center justify-center">
                              <span className="text-white/50 font-bold text-xs">
                                {user.statistics?.level?.current || '--'}
                              </span>
                            </div>
                          </div>
                        ) : (
                          <div 
                            className="relative h-6 w-12 rounded-full border-2 border-white/30 overflow-hidden cursor-pointer transition-all duration-300 hover:scale-105 flex-shrink-0"
                            data-tooltip-id="level-tooltip"
                            data-tooltip-content={`等级进度: ${user.statistics.level.progress || 0}%`}
                          >
                            {/* 背景进度条 */}
                            <div 
                              className="absolute inset-0 transition-all duration-500"
                              style={{
                                background: `linear-gradient(90deg, ${GAME_MODE_COLORS[selectedMode]}40 0%, ${GAME_MODE_COLORS[selectedMode]} ${user.statistics.level.progress || 0}%, rgba(255,255,255,0.1) ${user.statistics.level.progress || 0}%)`
                              }}
                            />
                            
                            {/* 等级数字叠加 */}
                            <div className="absolute inset-0 flex items-center justify-center">
                              <span className="text-white font-bold text-xs drop-shadow-lg">
                                {user.statistics.level.current || 0}
                              </span>
                            </div>
                            
                            {/* 发光效果 */}
                            <div 
                              className="absolute inset-0 rounded-full opacity-30"
                              style={{
                                background: `radial-gradient(circle at center, ${GAME_MODE_COLORS[selectedMode]}20 0%, transparent 70%)`
                              }}
                            />
                          </div>
                        )}
                      </div>
                    </div>                    {/* React Tooltip */}
                    {user.statistics && user.statistics.level && (
                      <ReactTooltip
                        id="level-tooltip"
                        place="top"
                        variant="dark"
                        offset={10}
                        delayShow={300}
                        style={{
                          backgroundColor: 'rgba(0, 0, 0, 0.9)',
                          color: 'white',
                          borderRadius: '8px',
                          fontSize: '14px',
                          fontWeight: '500',
                          padding: '8px 12px',
                          backdropFilter: 'blur(4px)',
                          border: '1px solid rgba(255, 255, 255, 0.2)',
                          zIndex: 99999,
                          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
                        }}
                        classNameArrow="!border-t-black/90"
                      />
                    )}

                    {user.country && (
                      <div className="flex items-center gap-2 mb-3">
                        <img
                          src={`https://flagcdn.com/w20/${user.country.code.toLowerCase()}.png`}
                          alt={user.country.code}
                          className="w-5 h-auto drop-shadow-sm"
                        />
                        <span className="text-white/90 text-shadow font-medium text-base">
                          {user.country.name}
                        </span>
                      </div>
                    )}

                    {/* 用户状态信息 */}
                    <div className="flex flex-wrap items-center gap-4 text-sm">
                      <div className="flex items-center gap-2">
                        <div className={`w-3 h-3 rounded-full ${user.is_online ? 'bg-green-400 animate-pulse' : 'bg-gray-400'}`}></div>
                        <span className="text-white/90 text-shadow font-medium">
                          {user.is_online ? '在线' : '离线'}
                        </span>
                      </div>
                      
                      {user.follower_count > 0 && (
                        <div className="flex items-center gap-1">
                          <span className="text-white font-bold text-base">{user.follower_count.toLocaleString()}</span>
                          <span className="text-white/80 text-shadow">关注者</span>
                        </div>
                      )}
                      
                      {user.scores_best_count > 0 && (
                        <div className="flex items-center gap-1">
                          <span className="text白 font-bold text-base">{user.scores_best_count.toLocaleString()}</span>
                          <span className="text-white/80 text-shadow">最佳成绩</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

              </div>

              {/* 右侧：用户详细信息 - 桌面端显示 */}
              <div className="hidden lg:block flex-1 lg:flex-[1] lg:max-w-sm w-full min-w-0">
                <div className="space-y-3 sm:space-y-4 w全 max-w-full mt-6 sm:mt-5">
                  {/* 用户基本信息 */}
                  <div className="bg-black/20 backdrop-blur-sm rounded-xl p-3 sm:p-4 border border-white/20">
                    <div className="space-y-1 sm:space-y-1.5">
                      <div className="flex justify-between items-center">
                        <span className="text-white/70 text-xs sm:text-sm font-medium">用户 ID</span>
                        <span className="text-white font-bold text-sm sm:text-lg">{user.id}</span>
                      </div>
                      
                      {user.join_date && (
                        <div className="flex justify-between items-center">
                          <span className="text-white/70 text-xs sm:text-sm font-medium">加入时间</span>
                          <span className="text-white font-medium text-xs sm:text-base">
                            {new Date(user.join_date).toLocaleDateString('zh-CN', {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric'
                            })}
                          </span>
                        </div>
                      )}
                      
                      {user.last_visit && (
                        <div className="flex justify-between items-center">
                          <span className="text-white/70 text-xs sm:text-sm font-medium">最后访问</span>
                          <span className="text-white font-medium text-xs sm:text-base">
                            {new Date(user.last_visit).toLocaleDateString('zh-CN', {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric'
                            })}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* 游戏统计 */}
                  <div className="hidden">
                    <div className="flex items-center gap-6 text-xs">
                      <div className="text-left">
                        <p className="text-sm font-bold text-white">
                          {isUpdatingMode || !user.statistics ? (
                            <TextSkeleton>
                              {user.statistics?.play_count?.toLocaleString() || '999,999'}
                            </TextSkeleton>
                          ) : (
                            user.statistics.play_count?.toLocaleString() || '0'
                          )}
                        </p>
                        <p className="text-xs text-white/60">游戏次数</p>
                      </div>
                      <div className="text-left">
                        <p className="text-sm font-bold text-white">
                          {isUpdatingMode || !user.statistics ? (
                            <TextSkeleton>
                              {user.statistics?.total_score?.toLocaleString() || '99,999,999'}
                            </TextSkeleton>
                          ) : (
                            user.statistics.total_score?.toLocaleString() || '0'
                          )}
                        </p>
                        <p className="text-xs text-white/60">总分</p>
                      </div>
                      <div className="text-left">
                        <p className="text-sm font-bold text白">
                          {isUpdatingMode || !user.statistics ? (
                            <TextSkeleton>
                              {user.statistics?.ranked_score?.toLocaleString() || '99,999,999'}
                            </TextSkeleton>
                          ) : (
                            user.statistics.ranked_score?.toLocaleString() || '0'
                          )}
                        </p>
                        <p className="text-xs text-white/60">排名分数</p>
                      </div>
                      <div className="text-left">
                        <p className="text-sm font-bold text-white">
                          {isUpdatingMode || !user.statistics ? (
                            <TextSkeleton>
                              {user.statistics?.play_time ? `${Math.round(user.statistics.play_time / 3600).toLocaleString()}h` : '999h'}
                            </TextSkeleton>
                          ) : (
                            `${Math.round((user.statistics.play_time || 0) / 3600).toLocaleString()}h`
                          )}
                        </p>
                        <p className="text-xs text-white/60">游戏时间</p>
                      </div>
                    </div>
                  </div>

                  {/* 核心统计 */}
                  <div className="hidden">
                    <div className="flex items-center gap-6 text-xs">
                      <div className="text-left">
                        <div className="text-white font-bold text-sm sm:text-lg">
                          {isUpdatingMode || !user.statistics ? (
                            <TextSkeleton>
                              {user.statistics?.global_rank ? `#${user.statistics.global_rank.toLocaleString()}` : '#999,999'}
                            </TextSkeleton>
                          ) : (
                            user.statistics.global_rank ? `#${user.statistics.global_rank.toLocaleString()}` : 'N/A'
                          )}
                        </div>
                        <div className="text-white/70 text-xs sm:text-sm">全球排名</div>
                      </div>
                      <div className="text-left">
                        <div className="text-white font-bold text-lg">
                          {isUpdatingMode || !user.statistics ? (
                            <TextSkeleton>
                              {user.statistics?.country_rank ? `#${user.statistics.country_rank.toLocaleString()}` : '#999,999'}
                            </TextSkeleton>
                          ) : (
                            user.statistics.country_rank ? `#${user.statistics.country_rank.toLocaleString()}` : 'N/A'
                          )}
                        </div>
                        <div className="text-white/70 text-xs sm:text-sm">国家排名</div>
                      </div>
                      <div className="text-left">
                        <div 
                          className="text-white font-bold text-lg"
                          style={{ color: GAME_MODE_COLORS[selectedMode] }}
                        >
                          {isUpdatingMode || !user.statistics ? (
                            <TextSkeleton>
                              {user.statistics?.pp ? `${Math.round(user.statistics.pp).toLocaleString()}pp` : '9,999pp'}
                            </TextSkeleton>
                          ) : (
                            `${Math.round(user.statistics.pp || 0).toLocaleString()}pp`
                          )}
                        </div>
                        <div className="text-white/70 text-xs sm:text-sm">表现分数</div>
                      </div>
                      <div className="text-left">
                        <div className="text-white font-bold text-lg">
                          {isUpdatingMode || !user.statistics ? (
                            <TextSkeleton>
                              {user.statistics?.hit_accuracy ? `${user.statistics.hit_accuracy.toFixed(1)}%` : '99.9%'}
                            </TextSkeleton>
                          ) : (
                            `${(user.statistics.hit_accuracy || 0).toFixed(1)}%`
                          )}
                        </div>
                        <div className="text-white/70 text-xs sm:text-sm">准确率</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </ProfileCover>
      </motion.div>

      <UserStatsSection
        user={user}
        statistics={user.statistics}
        isUpdatingMode={isUpdatingMode}
        selectedMode={selectedMode}
      />

      {/* 排名历史图表 */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6"
      >
        <h3 className="text-xl font-bold text-gray-900 dark:text白 mb-6">
          排名历史趋势
        </h3>
        <div className="h-64">
          {isUpdatingMode ? (
            <div className="h-full flex items-center justify-center">
              <div className="animate-pulse text-gray-400 dark:text-gray-500 text-center">
                <div className="text-4xl mb-2">📊</div>
                <p>数据加载中...</p>
              </div>
            </div>
          ) : user.rank_history && user.rank_history.data && user.rank_history.data.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={user.rank_history.data.map((rank, index) => {
                  return {
                    day: index,
                    rank: rank === 0 ? null : rank,
                  };
                }).filter(item => item.rank !== null)}
                margin={{ top: 5, right: 30, left: 20, bottom: 25 }}
              >
                <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                <XAxis 
                  dataKey="day"
                  className="text-gray-600 dark:text-gray-400"
                  tickFormatter={(value) => {
                    const daysAgo = user.rank_history!.data.length - 1 - value;
                    if (daysAgo === 0) return '今天';
                    return `${daysAgo}天`;
                  }}
                  tick={{ fontSize: 12 }}
                />
                <YAxis 
                  reversed
                  className="text-gray-600 dark:text-gray-400"
                  tickFormatter={(value) => `#${value}`}
                  tick={{ fontSize: 12 }}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'var(--bg-primary)',
                    border: '1px solid var(--border-color)',
                    borderRadius: '8px',
                    fontSize: '14px'
                  }}
                  labelFormatter={(label) => {
                    const daysAgo = user.rank_history!.data.length - 1 - label;
                    return daysAgo === 0 ? '今天' : `${daysAgo}天前`;
                  }}
                  formatter={(value) => [`#${value}`, '全球排名']}
                />
                <Line
                  type="monotone"
                  dataKey="rank"
                  stroke={GAME_MODE_COLORS[selectedMode]}
                  strokeWidth={3}
                  dot={{ fill: GAME_MODE_COLORS[selectedMode], strokeWidth: 2, r: 4 }}
                  activeDot={{ r: 6, stroke: GAME_MODE_COLORS[selectedMode], strokeWidth: 2 }}
                  connectNulls={false}
                />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <div className="text-4xl mb-2 text-gray-400 dark:text-gray-500">📊</div>
                <p className="text-gray-500 dark:text-gray-400">暂无排名历史数据</p>
              </div>
            </div>
          )}
        </div>
      </motion.div>

      {/* 月度游戏次数图表 */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6"
      >
        <h3 className="text-xl font-bold text-gray-900 dark:text白 mb-6">
          月度游戏活跃度
        </h3>
        <div className="h-64">
          {isUpdatingMode ? (
            <div className="h-full flex items-center justify-center">
              <div className="animate-pulse text-gray-400 dark:text-gray-500 text-center">
                <div className="text-4xl mb-2">📅</div>
                <p>数据加载中...</p>
              </div>
            </div>
          ) : user.monthly_playcounts && user.monthly_playcounts.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={user.monthly_playcounts.map((item) => ({
                  month: new Date(item.start_date).toLocaleDateString('zh-CN', { 
                    year: 'numeric', 
                    month: 'short' 
                  }),
                  count: item.count,
                }))}
                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                <XAxis 
                  dataKey="month" 
                  className="text-gray-600 dark:text-gray-400"
                />
                <YAxis 
                  className="text-gray-600 dark:text-gray-400"
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'var(--bg-primary)',
                    border: '1px solid var(--border-color)',
                    borderRadius: '8px',
                  }}
                  formatter={(value) => [value, '游戏次数']}
                />
                <Bar 
                  dataKey="count" 
                  fill={GAME_MODE_COLORS[selectedMode]}
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <div className="text-4xl mb-2 text-gray-400 dark:text-gray-500">📅</div>
                <p className="text-gray-500 dark:text-gray-400">暂无月度活跃度数据</p>
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default ProfilePage;
