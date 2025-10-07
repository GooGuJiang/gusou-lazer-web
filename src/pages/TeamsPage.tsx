import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { FiPlus, FiEdit, FiEye } from 'react-icons/fi';
import { Tooltip as ReactTooltip } from 'react-tooltip';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../hooks/useAuth';
import LoadingSpinner from '../components/UI/LoadingSpinner';
import { rankingsAPI, handleApiError } from '../utils/api';
import TeamRankingsList from '../components/Rankings/TeamRankingsList';
import RankingTypeSelector from '../components/UI/RankingTypeSelector';
import PaginationControls from '../components/Rankings/PaginationControls';
import {
  GAME_MODE_NAMES,
  GAME_MODE_COLORS,
  GAME_MODE_GROUPS,
  MAIN_MODE_ICONS
} from '../types';
import type {
  GameMode,
  MainGameMode,
  TeamRankingsResponse,
  RankingType
} from '../types';
import { useProfileColor } from '../contexts/ProfileColorContext';

const TeamsPage: React.FC = () => {
  const { t } = useTranslation();
  const { isAuthenticated, user } = useAuth();
  const { profileColor } = useProfileColor();
  const [selectedMode, setSelectedMode] = useState<GameMode>('osu');
  const [selectedMainMode, setSelectedMainMode] = useState<MainGameMode>('osu');
  const [showSubModes, setShowSubModes] = useState<MainGameMode | null>(null);
  const [rankingType, setRankingType] = useState<RankingType>('performance');
  const [currentPage, setCurrentPage] = useState(1);
  const modeSelectRef = useRef<HTMLDivElement>(null);
  
  const [teamRankings, setTeamRankings] = useState<TeamRankingsResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // 获取实际的颜色值 - 如果是主题色模式，使用 profileColor
  const getBrandColor = (mode: GameMode): string => {
    const colorValue = GAME_MODE_COLORS[mode];
    // 如果颜色值包含 CSS 变量，则使用当前的 profileColor
    if (colorValue.includes('var(--profile-color')) {
      return profileColor;
    }
    return colorValue;
  };

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

  // 处理主模式切换
  const handleMainModeChange = (mainMode: MainGameMode) => {
    if (selectedMainMode === mainMode) {
      setShowSubModes(showSubModes === mainMode ? null : mainMode);
    } else {
      setSelectedMainMode(mainMode);
      setShowSubModes(mainMode);
      const firstSubMode = GAME_MODE_GROUPS[mainMode][0];
      setSelectedMode(firstSubMode);
    }
  };

  // 处理子模式选择
  const handleSubModeSelect = (mode: GameMode) => {
    setSelectedMode(mode);
    setShowSubModes(null);
  };
  
  // 加载战队排行榜
  const loadTeamRankings = async () => {
    setIsLoading(true);
    try {
      const response = await rankingsAPI.getTeamRankings(
        selectedMode, 
        rankingType, 
        currentPage
      );
      setTeamRankings(response);
    } catch (error) {
      handleApiError(error);
      console.error('加载战队排行榜失败:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // 重置分页并加载数据
  const resetAndLoad = () => {
    setCurrentPage(1);
    loadTeamRankings();
  };

  // 模式改变时重置并加载数据
  useEffect(() => {
    resetAndLoad();
  }, [selectedMode, rankingType]);

  // 分页改变时加载数据
  useEffect(() => {
    loadTeamRankings();
  }, [currentPage]);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  return (
    <div className="min-h-screen" style={{ background: 'var(--bg-primary)' }}>
      <div className="max-w-7xl mx-auto px-4 lg:px-6 py-6 sm:py-8">
        {/* 页面标题 */}
        <div className="mb-6 sm:mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-2">
                {t('teams.title')}
              </h1>
              <p className="text-base sm:text-lg text-gray-600 dark:text-gray-400">
                {t('teams.description')}
              </p>
            </div>
            
            {isAuthenticated && (
              user?.team ? (
                // 检查用户是否是队长
                user.id === user.team.leader_id ? (
                  <Link
                    to={`/teams/${user.team.id}/edit`}
                    className="inline-flex items-center px-4 py-2 bg-osu-pink text-white rounded-lg hover:bg-osu-pink/90 transition-colors self-start sm:self-auto"
                  >
                    <FiEdit className="mr-2" />
                    {t('teams.editTeam')}
                  </Link>
                ) : (
                  <Link
                      to={`/teams/${user.team.id}`}
                      className="inline-flex items-center px-4 py-2 bg-osu-pink text-white rounded-lg hover:bg-osu-pink/80 transition-colors self-start sm:self-auto"
                    >
                    <FiEye className="mr-2" />
                    {t('teams.viewTeam')}
                  </Link>
                )
              ) : (
                <Link
                  to="/teams/create"
                  className="inline-flex items-center px-4 py-2 bg-osu-pink text-white rounded-lg hover:bg-osu-pink/90 transition-colors self-start sm:self-auto"
                >
                  <FiPlus className="mr-2" />
                  {t('teams.createTeam')}
                </Link>
              )
            )}
          </div>
        </div>

        {/* 控制面板：模式选择 + 筛选选项 */}
        <div className="flex flex-col xl:flex-row xl:items-center gap-4 sm:gap-6 mb-4 sm:mb-6">
          
          {/* 游戏模式选择 */}
          <div className="flex justify-start" ref={modeSelectRef}>
            <div className="inline-flex gap-1 sm:gap-2 bg-card rounded-lg sm:rounded-xl p-1.5 sm:p-2 shadow-sm border-card min-h-[44px] sm:min-h-[48px] items-center">
              {(Object.keys(GAME_MODE_GROUPS) as MainGameMode[]).map((mainMode) => (
                <div key={mainMode} className="relative">
                  <button
                    onClick={() => handleMainModeChange(mainMode)}
                    className={`relative px-3 py-2 sm:px-4 sm:py-2.5 rounded-md sm:rounded-lg transition-all duration-200 focus:outline-none flex items-center justify-center min-h-[32px] sm:min-h-[36px] ${
                      selectedMainMode === mainMode
                        ? 'shadow-sm sm:shadow-md'
                        : 'opacity-70 hover:opacity-100 hover:scale-105 hover:shadow-sm cursor-pointer'
                    }`}
                    data-tooltip-id={`main-mode-${mainMode}`}
                    data-tooltip-content={GAME_MODE_NAMES[GAME_MODE_GROUPS[mainMode][0]]}
                  >
                    <div
                      className="absolute inset-0 rounded-md sm:rounded-lg transition-all duration-200"
                      style={{
                        background: selectedMainMode === mainMode
                          ? `linear-gradient(135deg, ${getBrandColor(GAME_MODE_GROUPS[mainMode][0])} 0%, ${getBrandColor(GAME_MODE_GROUPS[mainMode][0])}CC 100%)`
                          : 'var(--card-bg)'
                      }}
                    />
                    <div className="flex items-center justify-center gap-1">
                      <i
                        className={`${MAIN_MODE_ICONS[mainMode]} relative z-10 text-xl sm:text-2xl transition-colors duration-200`}
                        style={{
                          color: selectedMainMode === mainMode ? 'white' : 'var(--text-primary)'
                        }}
                      />
                      <i
                        className="fas fa-chevron-down relative z-10 text-[8px] sm:text-[10px] transition-all duration-200 opacity-60"
                        style={{
                          color: selectedMainMode === mainMode ? 'white' : 'var(--text-primary)',
                          transform: showSubModes === mainMode ? 'rotate(180deg)' : 'rotate(0deg)'
                        }}
                      />
                    </div>
                  </button>

                  {/* 子模式弹出选项 */}
                  {showSubModes === mainMode && (
                    <div className="absolute top-full mt-1 sm:mt-2 left-1/2 transform -translate-x-1/2 bg-card border-card rounded-lg sm:rounded-xl p-1.5 sm:p-2 min-w-28 sm:min-w-32 shadow-lg sm:shadow-xl z-30">
                      {GAME_MODE_GROUPS[mainMode].map((mode) => (
                        <button
                          key={mode}
                          onClick={() => handleSubModeSelect(mode)}
                          className={`w-full text-left px-2 sm:px-3 py-1.5 sm:py-2 rounded-md sm:rounded-lg font-medium transition-all duration-200 text-xs sm:text-sm block ${
                            selectedMode === mode
                              ? 'shadow-sm'
                              : 'hover:bg-card-hover'
                          }`}
                          style={{
                            backgroundColor: selectedMode === mode ? getBrandColor(mode) : 'transparent',
                            color: selectedMode === mode ? 'white' : 'var(--text-primary)',
                          }}
                        >
                          {GAME_MODE_NAMES[mode]}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Tooltip */}
            {(Object.keys(GAME_MODE_GROUPS) as MainGameMode[]).map((mainMode) => (
              <ReactTooltip
                key={`tooltip-${mainMode}`}
                id={`main-mode-${mainMode}`}
                place="top"
                variant="dark"
                offset={10}
                delayShow={300}
              />
            ))}
          </div>

          {/* 筛选选项 */}
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 xl:flex-1">
            <div className="w-full sm:w-48">
              <RankingTypeSelector
                value={rankingType}
                onChange={setRankingType}
              />
            </div>
          </div>
        </div>

        {/* 排行榜内容 */}
        <div className="-mx-4 sm:mx-0 sm:bg-card sm:rounded-xl sm:shadow-sm sm:border-card sm:p-6">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-16 px-4 sm:px-0">
              <LoadingSpinner size="lg" className="mb-4" />
              <p className="text-gray-500 dark:text-gray-400 font-medium">{t('teams.loadingTeams')}</p>
            </div>
          ) : (
            <TeamRankingsList
              rankings={teamRankings}
              currentPage={currentPage}
              selectedMode={selectedMode}
              rankingType={rankingType}
            />
          )}

          {/* 分页 */}
          {!isLoading && (
            <PaginationControls
              total={teamRankings?.total || 0}
              currentPage={currentPage}
              onPageChange={handlePageChange}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default TeamsPage;
