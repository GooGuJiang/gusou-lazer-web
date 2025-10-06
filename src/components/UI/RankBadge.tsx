import React from 'react';

interface RankBadgeProps {
  rank: number;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

interface RankStyle {
  bg: string;
  text: string;
  border?: string;
  shadow?: string;
}

const RankBadge: React.FC<RankBadgeProps> = ({ 
  rank, 
  size = 'md', 
  className = '' 
}) => {
  const sizeClasses = {
    sm: 'w-12 h-6 text-xs',
    md: 'w-14 h-7 text-sm',
    lg: 'w-16 h-8 text-base',
  } as const;

  const getRankStyle = (): RankStyle => {
    if (rank <= 3) {
      switch (rank) {
        case 1:
          return {
            bg: 'bg-gradient-to-br from-yellow-400 via-yellow-500 to-amber-500',
            text: 'text-white',
            shadow: 'shadow-lg shadow-yellow-500/30',
          };
        case 2:
          return {
            bg: 'bg-gradient-to-br from-gray-300 via-gray-400 to-gray-500',
            text: 'text-white',
            shadow: 'shadow-lg shadow-gray-400/30',
          };
        case 3:
          return {
            bg: 'bg-gradient-to-br from-orange-400 via-orange-500 to-orange-600',
            text: 'text-white',
            shadow: 'shadow-lg shadow-orange-500/30',
          };
      }
    }
    
    return {
      bg: 'bg-gray-100 dark:bg-gray-700/80',
      text: 'text-gray-700 dark:text-gray-300',
      shadow: 'shadow-sm',
    };
  };

  const style = getRankStyle();

  return (
    <div
      className={`
        inline-flex items-center justify-center rounded-lg font-bold
        ${sizeClasses[size]} 
        ${style.bg} 
        ${style.text}
        ${style.shadow || ''}
        transition-all duration-200 hover:scale-105
        ${className}
      `.replace(/\s+/g, ' ').trim()}
    >
      #{rank}
    </div>
  );
};

export default RankBadge;