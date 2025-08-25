import { type ComponentType } from 'react';

interface RankBadgeProps {
  rank: number;
  size?: 'sm' | 'md' | 'lg';
}

interface RankStyle {
  bg: string;
  text: string;
  shadow: string;
  icon?: ComponentType<{ className?: string }>;
  iconColor: string;
}

export default function RankBadge({ rank, size = 'md' }: RankBadgeProps) {
  const isTopThree = rank <= 3;

  const sizeClasses = {
    sm: 'w-8 h-8 text-xs',
    md: 'w-12 h-12 text-sm',
    lg: 'w-16 h-16 text-base',
  } as const;

  const iconSizes = {
    sm: 'w-3 h-3',
    md: 'w-4 h-4',
    lg: 'w-5 h-5',
  } as const;

  const getRankStyle = (): RankStyle => {
    switch (rank) {
      case 1:
        return {
          bg: 'bg-gradient-to-br from-yellow-400 to-yellow-600',
          text: 'text-yellow-900',
          shadow: 'shadow-lg shadow-yellow-400/50',
          iconColor: 'text-yellow-700',
        };
      case 2:
        return {
          bg: 'bg-gradient-to-br from-gray-300 to-gray-500',
          text: 'text-gray-900',
          shadow: 'shadow-lg shadow-gray-400/50',
          iconColor: 'text-gray-700',
        };
      case 3:
        return {
          bg: 'bg-gradient-to-br from-amber-600 to-amber-800',
          text: 'text-white',
          shadow: 'shadow-lg shadow-amber-600/50',
          iconColor: 'text-amber-200',
        };
      default:
        return {
          bg: 'bg-gray-100 dark:bg-gray-700',
          text: 'text-gray-600 dark:text-gray-300',
          shadow: '',
          iconColor: '',
        };
    }
  };

  const style = getRankStyle();
  const IconComponent = style.icon;

  return (
    <div
      className={`
        flex-shrink-0 rounded-full flex items-center justify-center font-bold relative
        ${sizeClasses[size]} ${style.bg} ${style.text}
        ${isTopThree ? style.shadow : ''}
        ${isTopThree ? 'ring-2 ring-white/30' : ''}
      `}
    >
      {IconComponent && (
        <div className="absolute -top-1 -right-1">
          <IconComponent className={`${iconSizes[size]} ${style.iconColor} drop-shadow-sm`} />
        </div>
      )}
      <span className="relative z-10">#{rank}</span>
    </div>
  );
}
