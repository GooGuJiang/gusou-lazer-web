import React, { useState, useRef, useEffect } from 'react';
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
  const dropdownRef = useRef<HTMLDivElement>(null);

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

  return (
    <div 
      className={`relative ${className}`} 
      ref={dropdownRef}
      onKeyDown={handleKeyDown}
    >
      {/* 排行类型选择按钮 */}
      <button
        onClick={handleToggle}
        className={`
          flex items-center justify-between w-full px-3 sm:px-4 py-2 sm:py-2.5 
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
        <div
          className={`transform transition-transform duration-200 ${
            isOpen ? 'rotate-180' : 'rotate-0'
          }`}
        >
          <FiChevronDown size={14} className="text-gray-500 dark:text-gray-400" />
        </div>
      </button>

      {/* 下拉菜单 */}
      {isOpen && (
        <div
          className={`
            absolute top-full left-0 right-0 mt-1 z-50
            bg-card border border-gray-200 dark:border-gray-700
            rounded-lg sm:rounded-xl shadow-lg min-w-full
            py-1 origin-top animate-in fade-in-0 zoom-in-95 duration-100
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
        </div>
      )}
    </div>
  );
};

export default RankingTypeSelector;
