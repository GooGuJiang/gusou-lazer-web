import React, { useState, useEffect, useRef, useMemo } from 'react';
import { FiCheck } from 'react-icons/fi';
import { useTranslation } from 'react-i18next';
import toast from 'react-hot-toast';
import HueSlider from '../UI/HueSlider';
import { preferencesAPI } from '../../utils/api';
import GameModeSelector from '../UI/GameModeSelector';
import CustomSelect from '../UI/CustomSelect';
import { useDebounce } from '../../hooks/useDebounce';
import { useProfileColor } from '../../contexts/ProfileColorContext';
import type { 
  UserPreferences, 
  BeatmapsetCardSize, 
  BeatmapDownload
} from '../../types';

// 辅助函数：将 HEX 颜色转换为 HSL
const hexToHue = (hex: string): number => {
  // 移除 # 符号
  const color = hex.replace('#', '');
  
  // 转换为 RGB
  const r = parseInt(color.substring(0, 2), 16) / 255;
  const g = parseInt(color.substring(2, 4), 16) / 255;
  const b = parseInt(color.substring(4, 6), 16) / 255;
  
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const delta = max - min;
  
  let h = 0;
  
  if (delta !== 0) {
    if (max === r) {
      h = ((g - b) / delta + (g < b ? 6 : 0)) / 6;
    } else if (max === g) {
      h = ((b - r) / delta + 2) / 6;
    } else {
      h = ((r - g) / delta + 4) / 6;
    }
  }
  
  return Math.round(h * 360);
};

// 辅助函数：OKLCH 转 RGB（参照 fuwari 颜色系统）
const oklchToRgb = (l: number, c: number, h: number): [number, number, number] => {
  // 将 OKLCH 转换为 OKLab
  const hRad = (h * Math.PI) / 180;
  const labA = c * Math.cos(hRad);
  const labB = c * Math.sin(hRad);
  
  // OKLab 到 线性 RGB
  const l_ = l + 0.3963377774 * labA + 0.2158037573 * labB;
  const m_ = l - 0.1055613458 * labA - 0.0638541728 * labB;
  const s_ = l - 0.0894841775 * labA - 1.2914855480 * labB;
  
  const l3 = l_ * l_ * l_;
  const m3 = m_ * m_ * m_;
  const s3 = s_ * s_ * s_;
  
  const r_linear = +4.0767416621 * l3 - 3.3077115913 * m3 + 0.2309699292 * s3;
  const g_linear = -1.2684380046 * l3 + 2.6097574011 * m3 - 0.3413193965 * s3;
  const b_linear = -0.0041960863 * l3 - 0.7034186147 * m3 + 1.7076147010 * s3;
  
  // 线性 RGB 到 sRGB
  const toSrgb = (val: number) => {
    const abs = Math.abs(val);
    if (abs <= 0.0031308) return val * 12.92;
    return (Math.sign(val) || 1) * (1.055 * Math.pow(abs, 1 / 2.4) - 0.055);
  };
  
  const r = Math.max(0, Math.min(1, toSrgb(r_linear)));
  const g = Math.max(0, Math.min(1, toSrgb(g_linear)));
  const b = Math.max(0, Math.min(1, toSrgb(b_linear)));
  
  return [
    Math.round(r * 255),
    Math.round(g * 255),
    Math.round(b * 255),
  ];
};

// 辅助函数：将 Hue 值转换为 HEX 颜色（使用 OKLCH，参照 fuwari 标准）
const hueToHex = (hue: number): string => {
  // fuwari 使用 oklch(0.70-0.75, 0.14, var(--hue)) 作为主色
  // 亮度 0.70，色度 0.14，让颜色更柔和自然
  const l = 0.70;  // 亮度 70%
  const c = 0.14;  // 色度 14% (远低于之前的 80%，更柔和)
  
  const [r, g, b] = oklchToRgb(l, c, hue);
  
  const toHex = (n: number) => {
    const hex = n.toString(16);
    return hex.length === 1 ? '0' + hex : hex;
  };
  
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`.toUpperCase();
};

const UserPreferencesSection: React.FC = () => {
  const { t } = useTranslation();
  const { setProfileColorLocal, setProfileColor } = useProfileColor();
  const [isLoading, setIsLoading] = useState(true);
  const [preferences, setPreferences] = useState<UserPreferences>({});
  const [originalPreferences, setOriginalPreferences] = useState<UserPreferences>({});
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [savingFields, setSavingFields] = useState<Set<string>>(new Set());
  
  // 使用独立的 hue 状态来确保滑块跟手
  const [currentHue, setCurrentHue] = useState<number>(0);

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
      // 初始化 hue 值
      const initialHue = hexToHue(data.profile_colour ?? '#FF66AB');
      setCurrentHue(initialHue);
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

  // 使用 ref 来存储最新的颜色值，避免频繁更新状态
  const pendingColorRef = useRef<string | null>(null);
  
  // 防抖保存颜色（600ms 延迟）
  const debouncedSaveColor = useDebounce(
    async (color: string) => {
      try {
        // 使用 ProfileColorContext 的 setProfileColor 方法
        // 这会同时保存到服务器和本地存储
        await setProfileColor(color);
        setPreferences(prev => ({ ...prev, profile_colour: color }));
        setOriginalPreferences(prev => ({ ...prev, profile_colour: color }));
        pendingColorRef.current = null;
        toast.success(t('settings.preferences.saveSuccess'));
      } catch (error) {
        console.error('Failed to save profile_colour:', error);
        toast.error(t('settings.preferences.saveError'));
      }
    },
    600
  );

  // 优化：使用 useMemo 缓存颜色变化的回调函数
  const handleHueChange = useMemo(() => (newHue: number) => {
    // 立即更新滑块位置
    setCurrentHue(newHue);
    // 转换为颜色（只计算一次）
    const newColor = hueToHex(newHue);
    // 存储到 ref，避免频繁更新状态
    pendingColorRef.current = newColor;
    // 立即应用颜色到 CSS 变量（实时预览），但不触发状态更新
    setProfileColorLocal(newColor);
    // 防抖保存，避免频繁调用 API
    debouncedSaveColor(newColor);
  }, [setProfileColorLocal, debouncedSaveColor]);

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
                <div className="absolute z-10 mt-2 p-5 bg-card rounded-xl shadow-xl border border-gray-200 dark:border-gray-700 min-w-[320px]">
                  <div 
                    className="fixed inset-0" 
                    onClick={() => setShowColorPicker(false)}
                  />
                  <div className="relative space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="text-sm font-bold text-gray-700 dark:text-gray-300">
                        {t('settings.preferences.profile.colour')}
                      </div>
                      <div className="text-xs font-mono text-gray-500 dark:text-gray-400">
                        {currentHue}°
                      </div>
                    </div>
                    
                    {/* 彩虹渐变滑块 */}
                    <HueSlider
                      hue={currentHue}
                      onChange={handleHueChange}
                    />
                    
                    {/* 颜色预览 */}
                    <div className="flex items-center gap-3 pt-1">
                      <div 
                        className="w-12 h-12 rounded-lg border-2 shadow-sm"
                        style={{ 
                          backgroundColor: pendingColorRef.current || preferences.profile_colour || '#FF66AB',
                          borderColor: pendingColorRef.current || preferences.profile_colour || '#FF66AB',
                          transition: 'background-color 0.1s ease, border-color 0.1s ease'
                        }}
                      />
                      <div className="flex flex-col gap-1">
                        <span className="text-sm font-mono text-gray-700 dark:text-gray-300">
                          {pendingColorRef.current || preferences.profile_colour || '#FF66AB'}
                        </span>
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          OKLCH (L: 0.70, C: 0.14)
                        </span>
                      </div>
                    </div>
                  </div>
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
                  className="px-4 py-2 bg-osu-pink hover:opacity-90 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
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
                  className="px-4 py-2 bg-osu-pink hover:opacity-90 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
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
                  className="px-4 py-2 bg-osu-pink hover:opacity-90 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
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
                  className="px-4 py-2 bg-osu-pink hover:opacity-90 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
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
                  className="px-4 py-2 bg-osu-pink hover:opacity-90 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
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

