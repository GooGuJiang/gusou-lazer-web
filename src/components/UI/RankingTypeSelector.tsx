import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { FiChevronDown, FiTrendingUp, FiAward } from 'react-icons/fi';
import type { RankingType } from '../../types';

interface RankingTypeSelectorProps {
  value: RankingType;
  onChange: (value: RankingType) => void;
  className?: string;
}

const RankingTypeSelector: React.FC<RankingTypeSelectorProps> = ({
  value,
  onChange,
  className = ''
}) => {
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const [dropdownPosition, setDropdownPosition] = useState<'bottom' | 'top'>('bottom');
  const dropdownRef = useRef<HTMLDivElement>(null);

  // 检查下拉菜单应该向上还是向下展开
  useEffect(() => {
    if (isOpen && dropdownRef.current) {
      const rect = dropdownRef.current.getBoundingClientRect();
      const spaceBelow = window.innerHeight - rect.bottom;
      const spaceAbove = rect.top;
      const dropdownHeight = 200; // 估计下拉菜单高度

      // 如果下方空间不足且上方空间更多，则向上展开
      if (spaceBelow < dropdownHeight && spaceAbove > spaceBelow) {
        setDropdownPosition('top');
      } else {
        setDropdownPosition('bottom');
      }
    }
  }, [isOpen]);

  // 点击外部关闭下拉菜单
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // 键盘导航
  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'Escape') {
      setIsOpen(false);
    }
  };

  const handleToggle = () => {
    setIsOpen(!isOpen);
  };

  const handleSelect = (selectedValue: RankingType) => {
    onChange(selectedValue);
    setIsOpen(false);
  };

  const rankingTypes = [
    {
      value: 'performance' as RankingType,
      label: t('rankings.rankingTypes.performance'),
      icon: FiTrendingUp,
      description: 'pp'
    },
    {
      value: 'score' as RankingType,
      label: t('rankings.rankingTypes.score'),
      icon: FiAward,
      description: 'Total Score'
    }
  ];

  const currentType = rankingTypes.find(type => type.value === value);
  const shouldExpand = isOpen;

  return (
    <div 
      className={`relative ${className}`} 
      ref={dropdownRef}
      onKeyDown={handleKeyDown}
    >
      {/* 排行类型选择按钮 */}
      <motion.button
        onClick={handleToggle}
        animate={{ 
          width: shouldExpand ? '160px' : '140px'
        }}
        transition={{ duration: 0.25, ease: [0.25, 0.46, 0.45, 0.94] }}
        className={`
          flex items-center justify-between px-3 sm:px-4 py-2 sm:py-2.5 
          border border-gray-200 dark:border-gray-700 rounded-lg sm:rounded-xl
          bg-card text-gray-900 dark:text-white 
          shadow-sm min-h-[44px] sm:min-h-[48px] font-medium text-sm sm:text-base
          transition-all duration-200 group
          ${isOpen
            ? 'ring-2 ring-profile-color border-transparent'
            : 'hover:border-profile-color hover:ring-1 hover:ring-profile-color/50'
          }
        `}
        aria-label="Ranking Type Selector"
        aria-expanded={isOpen}
        aria-haspopup="listbox"
      >
        <div className="flex items-center space-x-2">
          {currentType && (
            <>
              <currentType.icon size={16} className="text-profile-color" />
              <span>{currentType.label}</span>
            </>
          )}
        </div>

        {/* 下拉箭头 */}
        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.2, ease: [0.25, 0.46, 0.45, 0.94] }}
        >
          <FiChevronDown size={14} className="text-gray-500 dark:text-gray-400" />
        </motion.div>
      </motion.button>

      {/* 下拉菜单 */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.2, ease: [0.25, 0.46, 0.45, 0.94] }}
            className={`
              absolute left-0 right-0 z-50
              bg-card border border-gray-200 dark:border-gray-700
              rounded-lg sm:rounded-xl shadow-lg min-w-full
              py-1
              ${dropdownPosition === 'bottom' ? 'top-full mt-1' : 'bottom-full mb-1'}
            `}
          >
          {rankingTypes.map((type) => {
            const isSelected = type.value === value;
            const IconComponent = type.icon;
            
            return (
              <button
                key={type.value}
                onClick={() => handleSelect(type.value)}
                className={`
                  w-full px-3 sm:px-4 py-2.5 sm:py-3 text-left
                  transition-colors duration-150
                  flex items-center justify-between
                  ${isSelected
                    ? 'bg-profile-color/10 text-profile-color'
                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700/50'
                  }
                `}
                role="option"
                aria-selected={isSelected}
              >
                <div className="flex items-center space-x-2">
                  <IconComponent size={16} className={isSelected ? 'text-profile-color' : 'text-gray-500'} />
                  <div className="flex flex-col">
                    <span className="font-medium text-sm sm:text-base">
                      {type.label}
                    </span>
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      {type.description}
                    </span>
                  </div>
                </div>
              </button>
            );
          })}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default RankingTypeSelector;
