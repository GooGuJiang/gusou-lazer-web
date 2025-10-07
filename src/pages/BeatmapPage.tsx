import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Tooltip } from 'react-tooltip';
import 'react-tooltip/dist/react-tooltip.css';
import { beatmapAPI } from '../utils/api';
import type { Beatmapset, Beatmap } from '../types';
import { formatDuration, formatNumber } from '../utils/format';
import { GAME_MODE_NAMES } from '../types';
import { AudioPlayButton, AudioPlayerControls } from '../components/UI/AudioPlayer';
import toast from 'react-hot-toast';

const BeatmapPage: React.FC = () => {
  const { beatmapId, beatmapsetId } = useParams<{ beatmapId?: string; beatmapsetId?: string }>();
  const navigate = useNavigate();
  const { t } = useTranslation();
  
  const [beatmapset, setBeatmapset] = useState<Beatmapset | null>(null);
  const [selectedBeatmap, setSelectedBeatmap] = useState<Beatmap | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchBeatmapData = async () => {
      // 从 URL hash 获取 beatmap ID （用于 beatmapsets 路由）
      const hashMatch = window.location.hash.match(/#[^/]+\/(\d+)/);
      const hashBeatmapId = hashMatch ? parseInt(hashMatch[1], 10) : null;
      
      const targetBeatmapId = beatmapId ? parseInt(beatmapId, 10) : hashBeatmapId;
      const targetBeatmapsetId = beatmapsetId ? parseInt(beatmapsetId, 10) : null;

      if (!targetBeatmapId && !targetBeatmapsetId) {
        setError(t('beatmap.notFound'));
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        let beatmapsetData: Beatmapset;

        if (targetBeatmapsetId) {
          // 使用 beatmapset ID 查询
          beatmapsetData = await beatmapAPI.getBeatmapset(targetBeatmapsetId);
        } else if (targetBeatmapId) {
          // 使用 beatmap ID 查询
          if (isNaN(targetBeatmapId)) {
            throw new Error(t('beatmap.notFound'));
          }
          
          try {
            beatmapsetData = await beatmapAPI.getBeatmapByBeatmapId(targetBeatmapId);
          } catch (error: any) {
            if (error.message === 'Beatmap not found') {
              throw new Error(t('beatmap.notFound'));
            }
            throw error;
          }
        } else {
          throw new Error(t('beatmap.notFound'));
        }

        setBeatmapset(beatmapsetData);
        
        // 找到对应的beatmap
        let targetBeatmap: Beatmap | undefined;
        
        if (targetBeatmapId) {
          targetBeatmap = beatmapsetData.beatmaps.find(
            (beatmap) => beatmap.id === targetBeatmapId
          );
        }
        
        if (targetBeatmap) {
          setSelectedBeatmap(targetBeatmap);
          // 更新 URL 为标准格式
          const mode = targetBeatmap.mode || 'osu';
          const newUrl = `/beatmapsets/${beatmapsetData.id}#${mode}/${targetBeatmap.id}`;
          if (window.location.pathname + window.location.hash !== newUrl) {
            navigate(newUrl, { replace: true });
          }
        } else {
          // 如果没找到，选择第一个
          const firstBeatmap = beatmapsetData.beatmaps[0];
          if (firstBeatmap) {
            setSelectedBeatmap(firstBeatmap);
            const mode = firstBeatmap.mode || 'osu';
            const newUrl = `/beatmapsets/${beatmapsetData.id}#${mode}/${firstBeatmap.id}`;
            navigate(newUrl, { replace: true });
          }
        }

      } catch (error: any) {
        console.error('Failed to fetch beatmap data:', error);
        setError(error.message || t('beatmap.error'));
        toast.error(error.message || t('beatmap.error'));
      } finally {
        setLoading(false);
      }
    };

    fetchBeatmapData();
  }, [beatmapId, beatmapsetId, navigate, t]);

  const handleDifficultySelect = (beatmap: Beatmap) => {
    setSelectedBeatmap(beatmap);
    // 更新URL为标准格式
    if (beatmapset) {
      const mode = beatmap.mode || 'osu';
      navigate(`/beatmapsets/${beatmapset.id}#${mode}/${beatmap.id}`, { replace: true });
    }
  };

  const formatBPM = (bpm: number) => {
    return Number.isInteger(bpm) ? bpm.toString() : bpm.toFixed(1);
  };

  const getDifficultyColor = (stars: number) => {
    if (stars < 1.5) return 'text-gray-500';
    if (stars < 2.25) return 'text-blue-500';
    if (stars < 3.75) return 'text-green-500';
    if (stars < 5.25) return 'text-yellow-500';
    if (stars < 6.75) return 'text-orange-500';
    return 'text-red-500';
  };

  // 根据难度星级返回从浅到深的 osu-pink 色调
  const getDifficultyPinkShade = (stars: number) => {
    // 0-2星: 很浅的粉色
    if (stars < 2) return '#FFF0F4';
    // 2-3星: 浅粉色
    if (stars < 3) return '#FFD9E5';
    // 3-4星: 中等浅粉
    if (stars < 4) return '#FFC2D6';
    // 4-5星: 中等粉色
    if (stars < 5) return '#FFABC7';
    // 5-6星: 标准 osu-pink
    if (stars < 6) return '#ED8EA6';
    // 6-7星: 深粉色
    if (stars < 7) return '#E06B8A';
    // 7-8星: 更深的粉色
    if (stars < 8) return '#D34871';
    // 8星以上: 最深的粉色
    return '#C62558';
  };

  const getDifficultyTextColor = (stars: number) => {
    // 浅色背景使用深色文字，深色背景使用浅色文字
    if (stars < 4) return '#9D2449'; // 深色文字
    return '#FFFFFF'; // 白色文字
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (error || !beatmapset) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">
            {error || t('beatmap.notFound')}
          </h1>
          <button
            onClick={() => navigate(-1)}
            className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
          >
            {t('beatmap.goBack')}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      {/* Hero Section Container */}
      <div className="px-4 lg:px-6 pt-0 pb-6">
        <div className="max-w-7xl mx-auto">
          <div 
            className="relative h-72 overflow-hidden rounded-2xl shadow-lg"
            style={{
              backgroundImage: `linear-gradient(rgba(0,0,0,0.5), rgba(0,0,0,0.7)), url(${beatmapset.covers.cover})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
            }}
          >
            <div className="absolute inset-0 bg-gradient-to-b from-transparent to-slate-900/60" />
            <div className="relative px-6 lg:px-8 h-full flex flex-col justify-end pb-6">
              <div className="text-white">
                {/* Badges */}
                <div className="flex items-center gap-2 mb-3">
                  <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-osu-pink/90 text-white">
                    {beatmapset.status}
                  </span>
                  {beatmapset.video && (
                    <span className="px-3 py-1 bg-red-500/90 text-white rounded-full text-xs font-bold uppercase tracking-wider">
                      VIDEO
                    </span>
                  )}
                  {beatmapset.storyboard && (
                    <span className="px-3 py-1 bg-purple-500/90 text-white rounded-full text-xs font-bold uppercase tracking-wider">
                      STORYBOARD
                    </span>
                  )}
                </div>
                
                {/* Title and Artist */}
                <div className="flex items-end justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-1 truncate">
                      {beatmapset.title_unicode || beatmapset.title}
                    </h1>
                    <p className="text-lg sm:text-xl opacity-95 mb-1">
                      by <span className="font-semibold">{beatmapset.artist_unicode || beatmapset.artist}</span>
                    </p>
                    <p className="text-base opacity-80">
                      mapped by <span className="font-medium hover:text-osu-pink transition-colors cursor-pointer">{beatmapset.creator}</span>
                    </p>
                  </div>
                  
                  {/* Audio Preview Button */}
                  {beatmapset.preview_url && (
                    <div className="flex-shrink-0">
                      <AudioPlayButton
                        audioUrl={beatmapset.preview_url}
                        size="lg"
                        showProgress={true}
                        className="shadow-2xl hover:scale-105 transition-transform"
                      />
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 lg:px-6 py-6 lg:py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Difficulty Selection - Horizontal List */}
            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
              <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50">
                <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <span className="text-osu-pink">●</span>
                  {t('beatmap.difficulties')}
                </h2>
              </div>
              <div className="p-4">
                <div className="flex flex-wrap gap-2">
                  {beatmapset.beatmaps
                    .sort((a, b) => a.difficulty_rating - b.difficulty_rating)
                    .map((beatmap) => {
                      const isSelected = selectedBeatmap?.id === beatmap.id;
                      const bgColor = getDifficultyPinkShade(beatmap.difficulty_rating);
                      const textColor = getDifficultyTextColor(beatmap.difficulty_rating);
                      
                      return (
                        <button
                          key={beatmap.id}
                          onClick={() => handleDifficultySelect(beatmap)}
                          data-tooltip-id="difficulty-tooltip"
                          data-tooltip-content={`${beatmap.version} - ${beatmap.difficulty_rating.toFixed(2)}★`}
                          className={`group relative px-4 py-3 rounded-lg transition-all duration-200 font-medium text-sm border-2 ${
                            isSelected
                              ? 'border-osu-pink shadow-lg scale-105'
                              : 'border-transparent hover:border-osu-pink/30 hover:scale-102'
                          }`}
                          style={{
                            backgroundColor: bgColor,
                            color: textColor,
                          }}
                        >
                          <div className="flex items-center gap-2">
                            {/* 星数显示 */}
                            <div className="flex items-center gap-1">
                              <span className="font-bold text-base">
                                {beatmap.difficulty_rating.toFixed(2)}
                              </span>
                              <span className="text-sm">★</span>
                            </div>
                            
                          </div>
                          
                          {/* 选中指示器 */}
                          {isSelected && (
                            <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-3 h-3 rotate-45 border-r-2 border-b-2 border-osu-pink"
                                 style={{ backgroundColor: bgColor }}
                            />
                          )}
                        </button>
                      );
                    })}
                </div>
                
                {/* Tooltip 组件 */}
                <Tooltip 
                  id="difficulty-tooltip"
                  place="top"
                  style={{
                    backgroundColor: '#1e293b',
                    color: '#fff',
                    borderRadius: '0.5rem',
                    padding: '0.5rem 0.75rem',
                    fontSize: '0.875rem',
                    fontWeight: '500',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
                  }}
                />
              </div>
            </div>

            {/* Selected Beatmap Details */}
            {selectedBeatmap && (
              <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
                <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-700 bg-gradient-to-r from-osu-pink/10 to-transparent">
                  <div className="flex items-center justify-between">
                    <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                      {selectedBeatmap.version}
                    </h2>
                    <span className={`text-xl font-bold ${getDifficultyColor(selectedBeatmap.difficulty_rating)}`}>
                      {selectedBeatmap.difficulty_rating.toFixed(2)}★
                    </span>
                  </div>
                </div>

                <div className="p-6 space-y-6">
                  {/* Main Stats */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center p-4 bg-slate-50 dark:bg-slate-900/50 rounded-lg">
                      <div className="text-2xl font-bold text-osu-pink mb-1">
                        {formatDuration(selectedBeatmap.total_length)}
                      </div>
                      <div className="text-xs text-slate-600 dark:text-slate-400 uppercase tracking-wide">
                        {t('beatmap.length')}
                      </div>
                    </div>
                    <div className="text-center p-4 bg-slate-50 dark:bg-slate-900/50 rounded-lg">
                      <div className="text-2xl font-bold text-osu-pink mb-1">
                        {formatBPM(selectedBeatmap.bpm)}
                      </div>
                      <div className="text-xs text-slate-600 dark:text-slate-400 uppercase tracking-wide">
                        {t('beatmap.bpm')}
                      </div>
                    </div>
                    <div className="text-center p-4 bg-slate-50 dark:bg-slate-900/50 rounded-lg">
                      <div className="text-2xl font-bold text-osu-pink mb-1">
                        {formatNumber(selectedBeatmap.max_combo)}
                      </div>
                      <div className="text-xs text-slate-600 dark:text-slate-400 uppercase tracking-wide">
                        {t('beatmap.maxCombo')}
                      </div>
                    </div>
                    <div className="text-center p-4 bg-slate-50 dark:bg-slate-900/50 rounded-lg">
                      <div className="text-2xl font-bold text-osu-pink mb-1">
                        {GAME_MODE_NAMES[selectedBeatmap.mode as keyof typeof GAME_MODE_NAMES] || selectedBeatmap.mode}
                      </div>
                      <div className="text-xs text-slate-600 dark:text-slate-400 uppercase tracking-wide">
                        {t('beatmap.mode')}
                      </div>
                    </div>
                  </div>

                  {/* Difficulty Stats */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center p-3 border border-slate-200 dark:border-slate-700 rounded-lg">
                      <div className="text-lg font-semibold text-slate-900 dark:text-white mb-1">
                        {selectedBeatmap.cs}
                      </div>
                      <div className="text-xs text-slate-600 dark:text-slate-400">
                        {t('beatmap.circleSize')}
                      </div>
                    </div>
                    <div className="text-center p-3 border border-slate-200 dark:border-slate-700 rounded-lg">
                      <div className="text-lg font-semibold text-slate-900 dark:text-white mb-1">
                        {selectedBeatmap.ar}
                      </div>
                      <div className="text-xs text-slate-600 dark:text-slate-400">
                        {t('beatmap.approachRate')}
                      </div>
                    </div>
                    <div className="text-center p-3 border border-slate-200 dark:border-slate-700 rounded-lg">
                      <div className="text-lg font-semibold text-slate-900 dark:text-white mb-1">
                        {selectedBeatmap.accuracy}
                      </div>
                      <div className="text-xs text-slate-600 dark:text-slate-400">
                        {t('beatmap.overallDifficulty')}
                      </div>
                    </div>
                    <div className="text-center p-3 border border-slate-200 dark:border-slate-700 rounded-lg">
                      <div className="text-lg font-semibold text-slate-900 dark:text-white mb-1">
                        {selectedBeatmap.drain}
                      </div>
                      <div className="text-xs text-slate-600 dark:text-slate-400">
                        {t('beatmap.hpDrain')}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Beatmapset Info */}
            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
              <div className="px-6 py-4 bg-gradient-to-r from-osu-pink to-osu-pink/80">
                <h3 className="text-lg font-bold text-white">
                  {t('beatmap.information')}
                </h3>
              </div>
              <div className="p-6 space-y-4 text-sm">
                <div className="flex justify-between items-start">
                  <span className="text-slate-600 dark:text-slate-400 font-medium">{t('beatmap.creator')}</span>
                  <span className="font-semibold text-slate-900 dark:text-white hover:text-osu-pink transition-colors cursor-pointer">
                    {beatmapset.creator}
                  </span>
                </div>
                <div className="h-px bg-slate-200 dark:bg-slate-700" />
                
                <div className="flex justify-between items-start">
                  <span className="text-slate-600 dark:text-slate-400 font-medium">{t('beatmap.source')}</span>
                  <span className="font-semibold text-slate-900 dark:text-white text-right">
                    {beatmapset.source || 'N/A'}
                  </span>
                </div>
                <div className="h-px bg-slate-200 dark:bg-slate-700" />
                
                <div className="flex justify-between items-start">
                  <span className="text-slate-600 dark:text-slate-400 font-medium">{t('beatmap.submitted')}</span>
                  <span className="font-semibold text-slate-900 dark:text-white">
                    {new Date(beatmapset.submitted_date).toLocaleDateString()}
                  </span>
                </div>
                {beatmapset.ranked_date && (
                  <>
                    <div className="h-px bg-slate-200 dark:bg-slate-700" />
                    <div className="flex justify-between items-start">
                      <span className="text-slate-600 dark:text-slate-400 font-medium">{t('beatmap.ranked')}</span>
                      <span className="font-semibold text-slate-900 dark:text-white">
                        {new Date(beatmapset.ranked_date).toLocaleDateString()}
                      </span>
                    </div>
                  </>
                )}
                <div className="h-px bg-slate-200 dark:bg-slate-700" />
                
                <div className="flex justify-between items-start">
                  <span className="text-slate-600 dark:text-slate-400 font-medium">{t('beatmap.lastUpdated')}</span>
                  <span className="font-semibold text-slate-900 dark:text-white">
                    {new Date(beatmapset.last_updated).toLocaleDateString()}
                  </span>
                </div>
                <div className="h-px bg-slate-200 dark:bg-slate-700" />
                
                <div className="flex justify-between items-start">
                  <span className="text-slate-600 dark:text-slate-400 font-medium">{t('beatmap.playCount')}</span>
                  <span className="font-semibold text-osu-pink">
                    {formatNumber(beatmapset.play_count)}
                  </span>
                </div>
                <div className="h-px bg-slate-200 dark:bg-slate-700" />
                
                <div className="flex justify-between items-start">
                  <span className="text-slate-600 dark:text-slate-400 font-medium">{t('beatmap.favouriteCount')}</span>
                  <span className="font-semibold text-osu-pink flex items-center gap-1">
                    <span>❤</span>
                    {formatNumber(beatmapset.favourite_count)}
                  </span>
                </div>
              </div>
            </div>

            {/* Tags */}
            {beatmapset.tags && (
              <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
                <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-700">
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                    {t('beatmap.tags')}
                  </h3>
                </div>
                <div className="p-6">
                  <div className="flex flex-wrap gap-2">
                    {beatmapset.tags.split(' ').filter(tag => tag.trim()).map((tag, index) => (
                      <span
                        key={index}
                        className="px-3 py-1.5 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-full text-sm font-medium hover:bg-osu-pink/10 hover:text-osu-pink transition-colors cursor-pointer"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
              <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-700">
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                  {t('beatmap.actions')}
                </h3>
              </div>
              <div className="p-6 space-y-3">
                <a
                  href={`https://osu.ppy.sh/beatmapsets/${beatmapset.id}/download`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block w-full text-center px-4 py-3 bg-osu-pink hover:bg-osu-pink/90 text-white font-semibold rounded-lg transition-all shadow-md hover:shadow-lg transform hover:scale-[1.02]"
                >
                  <span className="flex items-center justify-center gap-2">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                    </svg>
                    {t('beatmap.download')}
                  </span>
                </a>
                {beatmapset.preview_url && (
                  <a
                    href={beatmapset.preview_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block w-full text-center px-4 py-3 bg-green-500 hover:bg-green-600 text-white font-semibold rounded-lg transition-all shadow-md hover:shadow-lg transform hover:scale-[1.02]"
                  >
                    <span className="flex items-center justify-center gap-2">
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M8 5v14l11-7z"/>
                      </svg>
                      {t('beatmap.preview')}
                    </span>
                  </a>
                )}
                <a
                  href={`https://osu.ppy.sh/beatmapsets/${beatmapset.id}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block w-full text-center px-4 py-3 bg-slate-600 hover:bg-slate-700 text-white font-semibold rounded-lg transition-all shadow-md hover:shadow-lg transform hover:scale-[1.02]"
                >
                  <span className="flex items-center justify-center gap-2">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                    {t('beatmap.viewOnOsu')}
                  </span>
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Audio Player Controls */}
      <AudioPlayerControls />
    </div>
  );
};

export default BeatmapPage;
