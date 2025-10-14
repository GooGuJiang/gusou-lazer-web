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
  const [dropdownPosition, setDropdownPosition] = useState<'bottom' | 'top'>('bottom');
  const dropdownRef = useRef<HTMLDivElement>(null);
  // 选择后触发按钮收缩动画
  const [isClosing, setIsClosing] = useState(false);
  const closingTimerRef = useRef<number | null>(null);

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

  // 卸载/状态变更时清理定时器，避免内存泄漏
  useEffect(() => {
    return () => {
      if (closingTimerRef.current) {
        window.clearTimeout(closingTimerRef.current);
        closingTimerRef.current = null;
      }
    };
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
    // 先触发按钮“收缩”动画，再关闭下拉
    setIsClosing(true);
    // 立即关闭下拉（不影响按钮自身动画）
    setIsOpen(false);
    onChange(selectedValue);
    // 在过渡时间后复位动画状态
    if (closingTimerRef.current) {
      window.clearTimeout(closingTimerRef.current);
    }
    closingTimerRef.current = window.setTimeout(() => {
      setIsClosing(false);
      closingTimerRef.current = null;
    }, 200); // 与按钮 transition duration 对齐
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
          transition-all duration-200 transform group
          ${isClosing ? 'scale-95' : ''}
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
            absolute left-0 right-0 z-50
            bg-card border border-gray-200 dark:border-gray-700
            rounded-lg sm:rounded-xl shadow-lg min-w-full
            py-1 origin-top animate-in fade-in-0 zoom-in-95 duration-100
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
        </div>
      )}
    </div>
  );
};

export default RankingTypeSelector;
