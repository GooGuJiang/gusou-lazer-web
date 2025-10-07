import React, { useState, useEffect } from 'react';
import { FiCheck } from 'react-icons/fi';
import { useTranslation } from 'react-i18next';
import toast from 'react-hot-toast';
import { Sketch } from '@uiw/react-color';
import { preferencesAPI } from '../../utils/api';
import GameModeSelector from '../UI/GameModeSelector';
import CustomSelect from '../UI/CustomSelect';
import { useDebounce } from '../../hooks/useDebounce';
import type { 
  UserPreferences, 
  BeatmapsetCardSize, 
  BeatmapDownload
} from '../../types';

const UserPreferencesSection: React.FC = () => {
  const { t } = useTranslation();
  const [isLoading, setIsLoading] = useState(true);
  const [preferences, setPreferences] = useState<UserPreferences>({});
  const [originalPreferences, setOriginalPreferences] = useState<UserPreferences>({});
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [savingFields, setSavingFields] = useState<Set<string>>(new Set());

  // Load preferences on mount
  useEffect(() => {
    loadPreferences();
  }, []);

  const loadPreferences = async () => {
    setIsLoading(true);
    try {
      const data = await preferencesAPI.getPreferences();
      setPreferences(data);
      setOriginalPreferences(data);
    } catch (error) {
      console.error('Failed to load preferences:', error);
      toast.error(t('settings.preferences.loadError'));
    } finally {
      setIsLoading(false);
    }
  };

  // 单独保存某个设置项
  const savePreference = async <K extends keyof UserPreferences>(
    key: K,
    value: UserPreferences[K]
  ) => {
    setSavingFields(prev => new Set(prev).add(key as string));
    try {
      await preferencesAPI.updatePreferences({ [key]: value });
      setPreferences(prev => ({ ...prev, [key]: value }));
      setOriginalPreferences(prev => ({ ...prev, [key]: value }));
      toast.success(t('settings.preferences.saveSuccess'));
    } catch (error) {
      console.error(`Failed to save ${key}:`, error);
      toast.error(t('settings.preferences.saveError'));
    } finally {
      setSavingFields(prev => {
        const next = new Set(prev);
        next.delete(key as string);
        return next;
      });
    }
  };

  // 检查字段是否有修改
  const hasFieldChanged = (key: keyof UserPreferences): boolean => {
    return preferences[key] !== originalPreferences[key];
  };

  // 立即更新并保存（用于开关和滑块）
  const updateAndSave = async <K extends keyof UserPreferences>(
    key: K,
    value: UserPreferences[K]
  ) => {
    setPreferences(prev => ({ ...prev, [key]: value }));
    await savePreference(key, value);
  };

  // 防抖保存颜色（600ms 延迟）
  const debouncedSaveColor = useDebounce(
    (color: string) => savePreference('profile_colour', color),
    600
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-osu-pink"></div>
        <span className="ml-3 text-gray-600 dark:text-gray-400">
          {t('settings.preferences.loading')}
        </span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Game Mode Settings */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white">
          {t('settings.preferences.gameMode.title')}
        </h3>
        
        <div className="space-y-3">
          {/* Default Game Mode */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {t('settings.preferences.gameMode.playmode')}
            </label>
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-4">
              {t('settings.preferences.gameMode.playmodeDescription')}
            </p>
            <GameModeSelector
              selectedMode={preferences.playmode ?? 'osu'}
              onModeChange={(mode) => updateAndSave('playmode', mode)}
              variant="compact"
              mainModesOnly={false}
            />
          </div>
        </div>
      </div>

      {/* Beatmapset Settings */}
      <div className="border-t border-gray-200 dark:border-gray-700 pt-6 space-y-4">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white">
          {t('settings.preferences.beatmapset.title')}
        </h3>

        <div className="space-y-3">
          {/* Card Size */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {t('settings.preferences.beatmapset.cardSize')}
            </label>
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">
              {t('settings.preferences.beatmapset.cardSizeDescription')}
            </p>
            <CustomSelect
              value={preferences.beatmapset_card_size ?? 'normal'}
              onChange={(value) => updateAndSave('beatmapset_card_size', value as BeatmapsetCardSize)}
              disabled={savingFields.has('beatmapset_card_size')}
              options={[
                { value: 'normal', label: t('settings.preferences.beatmapset.normal') },
                { value: 'large', label: t('settings.preferences.beatmapset.large') }
              ]}
            />
          </div>

          {/* Download Option */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {t('settings.preferences.beatmapset.download')}
            </label>
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">
              {t('settings.preferences.beatmapset.downloadDescription')}
            </p>
            <CustomSelect
              value={preferences.beatmap_download ?? 'all'}
              onChange={(value) => updateAndSave('beatmap_download', value as BeatmapDownload)}
              disabled={savingFields.has('beatmap_download')}
              options={[
                { value: 'all', label: t('settings.preferences.beatmapset.downloadAll') },
                { value: 'no_video', label: t('settings.preferences.beatmapset.downloadNoVideo') },
                { value: 'direct', label: t('settings.preferences.beatmapset.downloadDirect') }
              ]}
            />
          </div>

          {/* Show NSFW */}
          <div className="flex items-center justify-between">
            <div>
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                {t('settings.preferences.beatmapset.showNsfw')}
              </label>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {t('settings.preferences.beatmapset.showNsfwDescription')}
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={preferences.beatmapset_show_nsfw ?? false}
                onChange={(e) => updateAndSave('beatmapset_show_nsfw', e.target.checked)}
                disabled={savingFields.has('beatmapset_show_nsfw')}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-osu-pink/20 dark:peer-focus:ring-osu-pink/40 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-osu-pink peer-disabled:opacity-50 peer-disabled:cursor-not-allowed"></div>
            </label>
          </div>
        </div>
      </div>

      {/* Profile Settings */}
      <div className="border-t border-gray-200 dark:border-gray-700 pt-6 space-y-4">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white">
          {t('settings.preferences.profile.title')}
        </h3>

        <div className="space-y-3">
          {/* Legacy Score Only */}
          <div className="flex items-center justify-between">
            <div>
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                {t('settings.preferences.profile.legacyScoreOnly')}
              </label>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {t('settings.preferences.profile.legacyScoreOnlyDescription')}
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={preferences.legacy_score_only ?? false}
                onChange={(e) => updateAndSave('legacy_score_only', e.target.checked)}
                disabled={savingFields.has('legacy_score_only')}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-osu-pink/20 dark:peer-focus:ring-osu-pink/40 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-osu-pink peer-disabled:opacity-50 peer-disabled:cursor-not-allowed"></div>
            </label>
          </div>

          {/* Cover Expanded */}
          <div className="flex items-center justify-between">
            <div>
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                {t('settings.preferences.profile.coverExpanded')}
              </label>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {t('settings.preferences.profile.coverExpandedDescription')}
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={preferences.profile_cover_expanded ?? false}
                onChange={(e) => updateAndSave('profile_cover_expanded', e.target.checked)}
                disabled={savingFields.has('profile_cover_expanded')}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-osu-pink/20 dark:peer-focus:ring-osu-pink/40 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-osu-pink peer-disabled:opacity-50 peer-disabled:cursor-not-allowed"></div>
            </label>
          </div>

          {/* Profile Colour */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {t('settings.preferences.profile.colour')}
            </label>
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">
              {t('settings.preferences.profile.colourDescription')}
            </p>
            <div className="relative">
              <button
                type="button"
                onClick={() => setShowColorPicker(!showColorPicker)}
                className="h-10 px-4 rounded-lg border border-gray-300 dark:border-gray-600 cursor-pointer flex items-center gap-3 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
              >
                <div 
                  className="w-6 h-6 rounded border border-gray-300 dark:border-gray-500"
                  style={{ backgroundColor: preferences.profile_colour ?? '#FF66AB' }}
                />
                <span className="text-sm font-mono text-gray-700 dark:text-gray-300">
                  {preferences.profile_colour ?? '#FF66AB'}
                </span>
              </button>
              
              {showColorPicker && (
                <div className="absolute z-10 mt-2">
                  <div 
                    className="fixed inset-0" 
                    onClick={() => setShowColorPicker(false)}
                  />
                  <Sketch
                    color={preferences.profile_colour ?? '#FF66AB'}
                    onChange={(color) => {
                      const newColor = color.hex;
                      setPreferences(prev => ({ ...prev, profile_colour: newColor }));
                      // 防抖保存，避免频繁调用 API
                      debouncedSaveColor(newColor);
                    }}
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Personal Information */}
      <div className="border-t border-gray-200 dark:border-gray-700 pt-6 space-y-4">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white">
          {t('settings.preferences.personalInfo.title')}
        </h3>

        <div className="space-y-3">
          {/* Interests */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {t('settings.preferences.personalInfo.interests')}
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={preferences.interests ?? ''}
                onChange={(e) => setPreferences(prev => ({ ...prev, interests: e.target.value }))}
                placeholder={t('settings.preferences.personalInfo.interestsPlaceholder')}
                className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-osu-pink focus:border-transparent"
              />
              {hasFieldChanged('interests') && (
                <button
                  onClick={() => savePreference('interests', preferences.interests ?? '')}
                  disabled={savingFields.has('interests')}
                  className="px-4 py-2 bg-osu-pink hover:bg-osu-pink-dark text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <FiCheck className="w-5 h-5" />
                </button>
              )}
            </div>
          </div>

          {/* Location */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {t('settings.preferences.personalInfo.location')}
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={preferences.location ?? ''}
                onChange={(e) => setPreferences(prev => ({ ...prev, location: e.target.value }))}
                placeholder={t('settings.preferences.personalInfo.locationPlaceholder')}
                className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-osu-pink focus:border-transparent"
              />
              {hasFieldChanged('location') && (
                <button
                  onClick={() => savePreference('location', preferences.location ?? '')}
                  disabled={savingFields.has('location')}
                  className="px-4 py-2 bg-osu-pink hover:bg-osu-pink-dark text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <FiCheck className="w-5 h-5" />
                </button>
              )}
            </div>
          </div>

          {/* Occupation */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {t('settings.preferences.personalInfo.occupation')}
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={preferences.occupation ?? ''}
                onChange={(e) => setPreferences(prev => ({ ...prev, occupation: e.target.value }))}
                placeholder={t('settings.preferences.personalInfo.occupationPlaceholder')}
                className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-osu-pink focus:border-transparent"
              />
              {hasFieldChanged('occupation') && (
                <button
                  onClick={() => savePreference('occupation', preferences.occupation ?? '')}
                  disabled={savingFields.has('occupation')}
                  className="px-4 py-2 bg-osu-pink hover:bg-osu-pink-dark text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <FiCheck className="w-5 h-5" />
                </button>
              )}
            </div>
          </div>

          {/* Twitter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {t('settings.preferences.personalInfo.twitter')}
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={preferences.twitter ?? ''}
                onChange={(e) => setPreferences(prev => ({ ...prev, twitter: e.target.value }))}
                placeholder={t('settings.preferences.personalInfo.twitterPlaceholder')}
                className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-osu-pink focus:border-transparent"
              />
              {hasFieldChanged('twitter') && (
                <button
                  onClick={() => savePreference('twitter', preferences.twitter ?? '')}
                  disabled={savingFields.has('twitter')}
                  className="px-4 py-2 bg-osu-pink hover:bg-osu-pink-dark text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <FiCheck className="w-5 h-5" />
                </button>
              )}
            </div>
          </div>

          {/* Website */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {t('settings.preferences.personalInfo.website')}
            </label>
            <div className="flex gap-2">
              <input
                type="url"
                value={preferences.website ?? ''}
                onChange={(e) => setPreferences(prev => ({ ...prev, website: e.target.value }))}
                placeholder={t('settings.preferences.personalInfo.websitePlaceholder')}
                className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-osu-pink focus:border-transparent"
              />
              {hasFieldChanged('website') && (
                <button
                  onClick={() => savePreference('website', preferences.website ?? '')}
                  disabled={savingFields.has('website')}
                  className="px-4 py-2 bg-osu-pink hover:bg-osu-pink-dark text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <FiCheck className="w-5 h-5" />
                </button>
              )}
            </div>
          </div>

          {/* Discord */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {t('settings.preferences.personalInfo.discord')}
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={preferences.discord ?? ''}
                onChange={(e) => setPreferences(prev => ({ ...prev, discord: e.target.value }))}
                placeholder={t('settings.preferences.personalInfo.discordPlaceholder')}
                className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-osu-pink focus:border-transparent"
              />
              {hasFieldChanged('discord') && (
                <button
                  onClick={() => savePreference('discord', preferences.discord ?? '')}
                  disabled={savingFields.has('discord')}
                  className="px-4 py-2 bg-osu-pink hover:bg-osu-pink-dark text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <FiCheck className="w-5 h-5" />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserPreferencesSection;

