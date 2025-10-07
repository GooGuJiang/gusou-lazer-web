import React, { useState, useEffect, useRef } from 'react';
import { FiLoader } from 'react-icons/fi';
import { Tooltip as ReactTooltip } from 'react-tooltip';
import { useTranslation } from 'react-i18next';
import { rankingsAPI, handleApiError } from '../utils/api';
import CountrySelect from '../components/UI/CountrySelect';
import RankingTypeSelector from '../components/UI/RankingTypeSelector';
import UserRankingsList from '../components/Rankings/UserRankingsList';
import CountryRankingsList from '../components/Rankings/CountryRankingsList';
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
  TopUsersResponse,
  CountryResponse,
  TabType,
  RankingType
} from '../types';
import { useProfileColor } from '../contexts/ProfileColorContext';

const RankingsPage: React.FC = () => {
  const { t } = useTranslation();
  const { profileColor } = useProfileColor();
  const [selectedMode, setSelectedMode] = useState<GameMode>('osu');
  const [selectedMainMode, setSelectedMainMode] = useState<MainGameMode>('osu');
  const [showSubModes, setShowSubModes] = useState<MainGameMode | null>(null);
  const [selectedTab, setSelectedTab] = useState<TabType>('users');
  const [rankingType, setRankingType] = useState<RankingType>('performance');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedCountry, setSelectedCountry] = useState<string>('');
  const modeSelectRef = useRef<HTMLDivElement>(null);
  
  const [userRankings, setUserRankings] = useState<TopUsersResponse | null>(null);
  const [countryRankings, setCountryRankings] = useState<CountryResponse | null>(null);
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

  // Click outside to close sub-mode menu
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

  // Handle main mode switching
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

  // Handle sub-mode selection
  const handleSubModeSelect = (mode: GameMode) => {
    setSelectedMode(mode);
    setShowSubModes(null);
  };
  
  // Load user rankings
  const loadUserRankings = async () => {
    setIsLoading(true);
    try {
      const response = await rankingsAPI.getUserRankings(
        selectedMode, 
        rankingType, 
        selectedCountry || undefined, 
        currentPage
      );
      setUserRankings(response);
    } catch (error) {
      handleApiError(error);
      console.error(t('rankings.errors.loadFailed'), error);
    } finally {
      setIsLoading(false);
    }
  };

  // Load country rankings
  const loadCountryRankings = async () => {
    setIsLoading(true);
    try {
      const response = await rankingsAPI.getCountryRankings(selectedMode, currentPage);
      setCountryRankings(response);
    } catch (error) {
      handleApiError(error);
      console.error(t('rankings.errors.loadFailed'), error);
    } finally {
      setIsLoading(false);
    }
  };

  // Reset pagination and load data
  const resetAndLoad = () => {
    setCurrentPage(1);
    if (selectedTab === 'users') {
      loadUserRankings();
    } else {
      loadCountryRankings();
    }
  };

  // Reset and load data when mode changes
  useEffect(() => {
    resetAndLoad();
  }, [selectedMode, selectedTab, rankingType, selectedCountry]);

  // Load data when pagination changes
  useEffect(() => {
    if (selectedTab === 'users') {
      loadUserRankings();
    } else {
      loadCountryRankings();
    }
  }, [currentPage]);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  return (
    <div className="min-h-screen" style={{ background: 'var(--bg-primary)' }}>
      <div className="max-w-7xl mx-auto px-4 lg:px-6 py-6 sm:py-8">
        {/* Page title */}
        <div className="mb-6 sm:mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-2">
            {t('rankings.title')}
          </h1>
          <p className="text-base sm:text-lg text-gray-600 dark:text-gray-400">
            {t('nav.rankings')}
          </p>
        </div>

        {/* Control panel: mode selection + tabs and filter options */}
        <div className="flex flex-col xl:flex-row xl:items-center gap-4 sm:gap-6 mb-4 sm:mb-6">
          
          {/* Game mode selection */}
          <div className="flex justify-start relative" ref={modeSelectRef}>
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

                  {/* Sub-mode popup options */}
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

          {/* Tabs and filter options */}
          <div className="flex flex-col lg:flex-row lg:items-center gap-3 sm:gap-4 xl:flex-1">
          {/* Tab switching */}
          <div className="flex-1">
            <div className="inline-flex bg-card rounded-lg sm:rounded-xl p-1.5 sm:p-2 shadow-sm border-card min-h-[44px] sm:min-h-[48px] items-center">
              <button
                onClick={() => setSelectedTab('users')}
                className={`px-3 sm:px-4 py-2 sm:py-2.5 rounded-md sm:rounded-lg font-medium transition-colors text-sm sm:text-base ${
                  selectedTab === 'users'
                    ? 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-gray-700/50'
                }`}
              >
                {t('rankings.tabs.users')}
              </button>
              <button
                onClick={() => setSelectedTab('countries')}
                className={`px-3 sm:px-4 py-2 sm:py-2.5 rounded-md sm:rounded-lg font-medium transition-colors text-sm sm:text-base ${
                  selectedTab === 'countries'
                    ? 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-gray-700/50'
                }`}
              >
                {t('rankings.tabs.countries')}
              </button>
            </div>
          </div>

          {/* Filter options for user rankings */}
          {selectedTab === 'users' && (
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
              <div className="w-full sm:w-48">
                <RankingTypeSelector
                  value={rankingType}
                  onChange={setRankingType}
                />
              </div>

              <div className="w-full sm:w-64">
                <CountrySelect
                  value={selectedCountry}
                  onChange={setSelectedCountry}
                  placeholder={t('rankings.filters.country')}
                />
              </div>
            </div>
          )}
          </div>
        </div>

        {/* Rankings content */}
        <div className="-mx-4 sm:mx-0 sm:bg-card sm:rounded-xl sm:shadow-sm sm:border-card sm:p-6">
          {isLoading ? (
            <div className="flex items-center justify-center py-16 px-4 sm:px-0">
              <div className="text-center">
                <FiLoader className="animate-spin h-12 w-12 text-blue-500 mx-auto mb-4" />
                <p className="text-gray-500 dark:text-gray-400 font-medium">{t('common.loading')}</p>
              </div>
            </div>
          ) : selectedTab === 'users' ? (
            <UserRankingsList
              rankings={userRankings}
              currentPage={currentPage}
              selectedMode={selectedMode}
              rankingType={rankingType}
            />
          ) : (
            <CountryRankingsList
              rankings={countryRankings}
              currentPage={currentPage}
              selectedMode={selectedMode}
            />
          )}

          {/* Pagination */}
          {!isLoading && (
            <PaginationControls
              total={selectedTab === 'users' ? userRankings?.total || 0 : countryRankings?.total || 0}
              currentPage={currentPage}
              onPageChange={handlePageChange}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default RankingsPage;