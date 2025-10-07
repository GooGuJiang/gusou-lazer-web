import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FiCheck } from 'react-icons/fi';
import { useTranslation } from 'react-i18next';
import toast from 'react-hot-toast';
import { preferencesAPI } from '../../utils/api';
import type { GameMode } from '../../types';

// 游戏模式配置
const GAME_MODES: { value: GameMode; iconClass: string }[] = [
  { value: 'osu', iconClass: 'fa-extra-mode-osu' },
  { value: 'osurx', iconClass: 'fa-extra-mode-osu' },
  { value: 'osuap', iconClass: 'fa-extra-mode-osu' },
  { value: 'taiko', iconClass: 'fa-extra-mode-taiko' },
  { value: 'taikorx', iconClass: 'fa-extra-mode-taiko' },
  { value: 'fruits', iconClass: 'fa-extra-mode-fruits' },
  { value: 'fruitsrx', iconClass: 'fa-extra-mode-fruits' },
  { value: 'mania', iconClass: 'fa-extra-mode-mania' },
];

const DefaultModeSelector: React.FC = () => {
  const { t } = useTranslation();
  const [currentMode, setCurrentMode] = useState<GameMode | null>(null);
  const [selectedMode, setSelectedMode] = useState<GameMode | null>(null);
  const [availableModes, setAvailableModes] = useState<GameMode[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  // 获取当前用户偏好设置
  const fetchUserPreferences = async () => {
    try {
      setIsLoading(true);
      const response = await preferencesAPI.getPreferences();
      const defaultMode = (response.playmode as GameMode) || 'osu';
      // 假设所有模式都可用，或者可以从其他 API 获取
      const availableModesFromAPI: GameMode[] = ['osu', 'osurx', 'osuap', 'taiko', 'taikorx', 'fruits', 'fruitsrx', 'mania'];
      
      setCurrentMode(defaultMode);
      setSelectedMode(defaultMode);
      setAvailableModes(availableModesFromAPI);
    } catch (error) {
      console.error('获取用户偏好设置失败:', error);
      // 如果获取失败，设置默认值
      setCurrentMode('osu');
      setSelectedMode('osu');
      setAvailableModes(['osu']);
    } finally {
      setIsLoading(false);
    }
  };

  // 保存默认游戏模式
  const handleSaveMode = async () => {
    if (!selectedMode || selectedMode === currentMode) {
      setIsEditing(false);
      return;
    }

    try {
      setIsSaving(true);
      await preferencesAPI.updatePreferences({ playmode: selectedMode });
      setCurrentMode(selectedMode);
      setIsEditing(false);
      toast.success(t('settings.preferences.defaultMode.success'));
    } catch (error) {
      console.error('保存默认游戏模式失败:', error);
      toast.error(t('settings.preferences.defaultMode.error'));
      // 恢复到当前模式
      setSelectedMode(currentMode);
    } finally {
      setIsSaving(false);
    }
  };

  // 取消编辑
  const handleCancelEdit = () => {
    setSelectedMode(currentMode);
    setIsEditing(false);
  };

  // 开始编辑
  const handleStartEdit = () => {
    setIsEditing(true);
  };

  // 获取模式显示名称
  const getModeName = (mode: GameMode) => {
    return t(`settings.preferences.defaultMode.modes.${mode}`, mode);
  };

  // 初始化时获取用户偏好设置
  useEffect(() => {
    fetchUserPreferences();
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-profile-color"></div>
        <span className="ml-3 text-gray-500 dark:text-gray-400">
          {t('common.loading', '加载中...')}
        </span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 当前默认模式显示 */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          {t('settings.preferences.defaultMode.current')}
        </label>
        {!isEditing ? (
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-profile-color/10 text-profile-color rounded-lg flex items-center justify-center">
                <i className={`${GAME_MODES.find(m => m.value === currentMode)?.iconClass || 'fa-extra-mode-osu'} text-lg`}></i>
              </div>
              <span className="text-lg font-medium text-gray-900 dark:text-white">
                {currentMode ? getModeName(currentMode) : 'osu!'}
              </span>
            </div>
            <button
              onClick={handleStartEdit}
              className="btn-secondary !px-4 !py-2 text-sm"
            >
              {t('settings.preferences.defaultMode.change')}
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {/* 游戏模式选择网格 */}
            <div className={`grid gap-3 ${
              availableModes.length <= 4 
                ? 'grid-cols-2 sm:grid-cols-4' 
                : 'grid-cols-2 sm:grid-cols-3 md:grid-cols-4'
            }`}>
              {GAME_MODES.filter(mode => availableModes.includes(mode.value)).map((mode) => (
                <motion.button
                  key={mode.value}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setSelectedMode(mode.value)}
                  className={`relative p-4 rounded-lg border-2 transition-all ${
                    selectedMode === mode.value
                      ? 'border-profile-color bg-profile-color/10 text-profile-color'
                      : 'border-gray-200 dark:border-gray-700 bg-card text-gray-700 dark:text-gray-300 hover:border-profile-color/50'
                  }`}
                >
                  <div className="flex flex-col items-center gap-2">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                      selectedMode === mode.value
                        ? 'bg-profile-color text-white'
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
                    }`}>
                      <i className={`${mode.iconClass} text-base`}></i>
                    </div>
                    <span className="text-sm font-medium text-center">
                      {getModeName(mode.value)}
                    </span>
                  </div>
                  {selectedMode === mode.value && (
                    <div className="absolute top-2 right-2">
                      <FiCheck className="w-4 h-4 text-profile-color" />
                    </div>
                  )}
                </motion.button>
              ))}
            </div>

            {/* 操作按钮 */}
            <div className="flex gap-3">
              <button
                onClick={handleSaveMode}
                disabled={isSaving || selectedMode === currentMode}
                className="flex items-center gap-2 btn-primary !px-4 !py-2 !text-sm !inline-flex disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <FiCheck className="w-4 h-4" />
                {isSaving ? t('settings.preferences.defaultMode.saving') : t('settings.preferences.defaultMode.save')}
              </button>
              <button
                onClick={handleCancelEdit}
                disabled={isSaving}
                className="flex items-center gap-2 btn-secondary !px-4 !py-2 !text-sm !inline-flex disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {t('settings.username.cancel')}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* 描述信息 */}
      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
        <p className="text-sm text-blue-700 dark:text-blue-300">
          {t('settings.preferences.defaultMode.description')}
        </p>
        {availableModes.length > 0 && (
          <p className="text-xs text-blue-600 dark:text-blue-400 mt-2">
            {t('settings.preferences.defaultMode.availableModes', { count: availableModes.length })}
          </p>
        )}
      </div>
    </div>
  );
};

export default DefaultModeSelector;
