import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { rankingsAPI, handleApiError } from '../utils/api';
import CountrySelect from '../components/UI/CountrySelect';
import RankingTypeSelector from '../components/UI/RankingTypeSelector';
import UserRankingsList from '../components/Rankings/UserRankingsList';
import CountryRankingsList from '../components/Rankings/CountryRankingsList';
import PaginationControls from '../components/Rankings/PaginationControls';
import LoadingSpinner from '../components/UI/LoadingSpinner';
import GameModeSelector from '../components/UI/GameModeSelector';
import { useAvailableCountries } from '../hooks/useAvailableCountries';
import type {
  GameMode,
  TopUsersResponse,
  CountryResponse,
  TabType,
  RankingType
} from '../types';

const RankingsPage: React.FC = () => {
  const { t } = useTranslation();
  const [selectedMode, setSelectedMode] = useState<GameMode>('osu');
  const [selectedTab, setSelectedTab] = useState<TabType>('users');
  const [rankingType, setRankingType] = useState<RankingType>('performance');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedCountry, setSelectedCountry] = useState<string>('');
  
  const [userRankings, setUserRankings] = useState<TopUsersResponse | null>(null);
  const [countryRankings, setCountryRankings] = useState<CountryResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  
  // 使用 ref 跟踪请求，防止竞态条件
  const abortControllerRef = useRef<AbortController | null>(null);
  
  // 获取可用国家列表
  const { countries: availableCountries, isLoading: isLoadingCountries } = useAvailableCountries(selectedMode);
  
  // Load user rankings with request cancellation
  const loadUserRankings = useCallback(async () => {
    // 取消之前的请求
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    
    const abortController = new AbortController();
    abortControllerRef.current = abortController;
    
    setIsLoading(true);
    try {
      const response = await rankingsAPI.getUserRankings(
        selectedMode, 
        rankingType, 
        selectedCountry || undefined, 
        currentPage
      );
      
      // 只有当请求未被取消时才更新状态
      if (!abortController.signal.aborted) {
        setUserRankings(response);
      }
    } catch (error) {
      if (!abortController.signal.aborted) {
        handleApiError(error);
        console.error(t('rankings.errors.loadFailed'), error);
      }
    } finally {
      if (!abortController.signal.aborted) {
        setIsLoading(false);
      }
    }
  }, [selectedMode, rankingType, selectedCountry, currentPage, t]);

  // Load country rankings with request cancellation
  const loadCountryRankings = useCallback(async () => {
    // 取消之前的请求
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    
    const abortController = new AbortController();
    abortControllerRef.current = abortController;
    
    setIsLoading(true);
    try {
      const response = await rankingsAPI.getCountryRankings(selectedMode, currentPage);
      
      // 只有当请求未被取消时才更新状态
      if (!abortController.signal.aborted) {
        setCountryRankings(response);
      }
    } catch (error) {
      if (!abortController.signal.aborted) {
        handleApiError(error);
        console.error(t('rankings.errors.loadFailed'), error);
      }
    } finally {
      if (!abortController.signal.aborted) {
        setIsLoading(false);
      }
    }
  }, [selectedMode, currentPage, t]);

  // Reset pagination and load data
  useEffect(() => {
    setCurrentPage(1);
    // 滚动到顶部
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [selectedMode, selectedTab, rankingType, selectedCountry]);

  // Load data when dependencies change
  useEffect(() => {
    if (selectedTab === 'users') {
      loadUserRankings();
    } else {
      loadCountryRankings();
    }
    
    // 清理函数：取消请求
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [selectedTab, loadUserRankings, loadCountryRankings]);

  // 页面切换时滚动到顶部
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
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
          <div className="bg-card rounded-lg shadow-sm border-card p-2">
            <GameModeSelector
              selectedMode={selectedMode}
              onModeChange={setSelectedMode}
              variant="compact"
              className=""
            />
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
                  countries={availableCountries}
                  isLoading={isLoadingCountries}
                />
              </div>
            </div>
          )}
          </div>
        </div>

        {/* Rankings content */}
        <div className="-mx-4 sm:mx-0 sm:bg-card sm:rounded-xl sm:shadow-sm sm:border-card sm:p-6">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-16 px-4 sm:px-0">
              <LoadingSpinner size="lg" className="mb-4" />
              <p className="text-gray-500 dark:text-gray-400 font-medium">{t('common.loading')}</p>
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