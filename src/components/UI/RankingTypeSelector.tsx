import React, { useState, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { FiChevronDown, FiTrendingUp, FiAward } from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  useFloating, 
  autoUpdate, 
  offset, 
  flip, 
  shift,
  useDismiss,
  useInteractions,
  FloatingFocusManager,
} from '@floating-ui/react';
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
  const buttonRef = useRef<HTMLButtonElement>(null);

  const { refs, floatingStyles, context } = useFloating({
    open: isOpen,
    onOpenChange: setIsOpen,
    placement: 'bottom-start',
    strategy: 'absolute',
    elements: {
      reference: buttonRef.current,
    },
    middleware: [
      offset(8),
      flip({
        fallbackPlacements: ['top-start', 'bottom-end', 'top-end'],
        padding: 8,
      }),
      shift({ padding: 8 }),
    ],
    whileElementsMounted: autoUpdate,
  });

  const dismiss = useDismiss(context);
  const { getFloatingProps } = useInteractions([dismiss]);

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
      onKeyDown={handleKeyDown}
    >
      {/* 排行类型选择按钮 */}
      <motion.button
        ref={buttonRef}
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
        whileHover={{ scale: 1.01 }}
        whileTap={{ scale: 0.98 }}
        animate={{ 
          scale: isOpen ? 0.98 : 1,
        }}
        transition={{ duration: 0.2, ease: [0.25, 0.46, 0.45, 0.94] }}
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
          <FloatingFocusManager context={context} modal={false}>
            <motion.div
              ref={refs.setFloating}
              initial={{ opacity: 0, scale: 0.95, y: -10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -10 }}
              transition={{ duration: 0.2, ease: [0.25, 0.46, 0.45, 0.94] }}
              className="z-50 min-w-full rounded-lg sm:rounded-xl shadow-lg py-1 backdrop-blur-xl"
              style={{
                ...floatingStyles,
                background: 'var(--card-bg)',
                border: '1px solid var(--border-color)',
                marginTop: '40px',
              }}
              {...getFloatingProps()}
            >
              {rankingTypes.map((type, index) => {
                const isSelected = type.value === value;
                const IconComponent = type.icon;
                
                return (
                  <motion.button
                    key={type.value}
                    onClick={() => handleSelect(type.value)}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: index * 0.05, duration: 0.2 }}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
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
                  </motion.button>
                );
              })}
            </motion.div>
          </FloatingFocusManager>
        )}
      </AnimatePresence>
    </div>
  );
};

export default RankingTypeSelector;
