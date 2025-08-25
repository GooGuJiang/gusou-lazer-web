import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiCircle, FiMusic, FiTarget, FiGrid } from 'react-icons/fi';
import type { IconType } from 'react-icons';
import type { GameMode, MainGameMode } from '../../types';
import { 
  GAME_MODE_NAMES, 
  GAME_MODE_COLORS, 
  GAME_MODE_GROUPS
} from '../../types';

interface GameModeSelectorProps {
  selectedMode?: GameMode;
  onModeChange: (mode: GameMode) => void;
  className?: string;
  variant?: 'compact' | 'full';
}

// 主模式图标映射
const MAIN_MODE_ICON_COMPONENTS: Record<MainGameMode, IconType> = {
  osu: FiCircle,
  taiko: FiMusic,
  fruits: FiTarget,
  mania: FiGrid
};

const GameModeSelector: React.FC<GameModeSelectorProps> = ({
  selectedMode = 'osu',
  onModeChange,
  className = '',
  variant = 'full'
}) => {
  const [showSubModes, setShowSubModes] = useState<MainGameMode | null>(null);
  const modeSelectRef = useRef<HTMLDivElement>(null);

  // 获取当前选中的主模式
  const selectedMainMode = (Object.keys(GAME_MODE_GROUPS) as MainGameMode[])
    .find(mainMode => GAME_MODE_GROUPS[mainMode].includes(selectedMode)) || 'osu';

  // 点击外部关闭子模式选择
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (modeSelectRef.current && !modeSelectRef.current.contains(event.target as Node)) {
        setShowSubModes(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // 处理主模式点击
  const handleMainModeClick = (mainMode: MainGameMode) => {
    if (showSubModes === mainMode) {
      setShowSubModes(null);
    } else {
      setShowSubModes(mainMode);
    }
  };

  // 处理子模式选择
  const handleSubModeSelect = (mode: GameMode) => {
    onModeChange(mode);
    setShowSubModes(null);
  };

  if (variant === 'compact') {
    // 紧凑版本 - 类似ProfilePage的实现
    return (
      <div className={`relative ${className}`} ref={modeSelectRef}>
        <div className="flex gap-2">
          {(Object.keys(GAME_MODE_GROUPS) as MainGameMode[]).map((mainMode) => {
            const IconComponent = MAIN_MODE_ICON_COMPONENTS[mainMode];
            return (
              <div key={mainMode} className="relative">
                <button
                  onClick={() => handleMainModeClick(mainMode)}
                  className={`relative p-2 rounded-lg transition-all duration-300 group ${
                    selectedMainMode === mainMode
                      ? 'scale-110 shadow-lg'
                      : 'hover:scale-105 opacity-80 hover:opacity-100'
                  }`}
                  style={{
                    background: selectedMainMode === mainMode
                      ? `linear-gradient(135deg, ${GAME_MODE_COLORS[GAME_MODE_GROUPS[mainMode][0]]} 0%, ${GAME_MODE_COLORS[GAME_MODE_GROUPS[mainMode][0]]}CC 100%)`
                      : 'rgba(255,255,255,0.1)',
                    backdropFilter: 'blur(10px)',
                    border: selectedMainMode === mainMode ? '2px solid rgba(255,255,255,0.3)' : '2px solid rgba(255,255,255,0.1)'
                  }}
                >
                  <IconComponent
                    size={20}
                    className="transition-colors duration-300"
                    style={{
                      color: selectedMainMode === mainMode ? '#fff' : 'rgba(255,255,255,0.85)'
                    }}
                  />
                </button>

                {/* 子模式下拉菜单 */}
                <AnimatePresence>
                  {showSubModes === mainMode && (
                    <motion.div
                      initial={{ opacity: 0, y: -10, scale: 0.9 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -10, scale: 0.9 }}
                      className="absolute top-full mt-2 right-0 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-2 min-w-32 shadow-xl z-30"
                    >
                      {GAME_MODE_GROUPS[mainMode].map((mode) => (
                        <button
                          key={mode}
                          onClick={() => handleSubModeSelect(mode)}
                          className={`w-full text-left px-3 py-2 rounded-md font-medium transition-all duration-200 text-sm ${
                            selectedMode === mode
                              ? 'text-white shadow-md'
                              : 'text-gray-700 dark:text-gray-300 hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700'
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
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  // 完整版本 - 显示所有模式
  const allModes: GameMode[] = ['osu', 'taiko', 'fruits', 'mania', 'osurx', 'osuap', 'taikorx', 'fruitsrx'];

  return (
    <div className={`grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3 ${className}`}>
      {allModes.map((mode) => {
        const mainMode = (Object.keys(GAME_MODE_GROUPS) as MainGameMode[])
          .find(m => GAME_MODE_GROUPS[m].includes(mode));
        const IconComponent = mainMode ? MAIN_MODE_ICON_COMPONENTS[mainMode] : FiCircle;
        
        return (
          <motion.button
            key={mode}
            onClick={() => onModeChange(mode)}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className={`relative px-3 py-3 rounded-xl font-medium transition-all duration-300 border-2 flex flex-col items-center gap-2 ${
              selectedMode === mode
                ? 'text-white shadow-lg border-transparent'
                : 'bg-gray-50 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600 border-gray-200 dark:border-gray-600'
            }`}
            style={{
              backgroundColor: selectedMode === mode ? GAME_MODE_COLORS[mode] : undefined,
              borderColor: selectedMode === mode ? GAME_MODE_COLORS[mode] : undefined,
            }}
          >
            {selectedMode === mode && (
              <motion.div 
                layoutId="selected-bg"
                className="absolute inset-0 rounded-xl opacity-20"
                style={{ backgroundColor: GAME_MODE_COLORS[mode] }}
              />
            )}
            
            <IconComponent 
              size={18} 
              className="relative z-10"
              style={{ 
                color: selectedMode === mode ? '#fff' : GAME_MODE_COLORS[mode] 
              }}
            />
            
            <span className="relative z-10 text-xs font-medium">
              {GAME_MODE_NAMES[mode]}
            </span>
          </motion.button>
        );
      })}
    </div>
  );
};

export default GameModeSelector;
