import { Star } from 'lucide-react';
import { getStarDifficultyColor, getStarDifficultyTextColor } from '../../utils/starRating';

type StarRatingBadgeSize = 'xs' | 'sm' | 'md';

const SIZE_CLASSES: Record<
  StarRatingBadgeSize,
  { container: string; star: string; modeIcon: string }
> = {
  xs: { container: 'px-2 py-0.5 text-xs', star: 'h-3 w-3', modeIcon: 'text-xs' },
  sm: { container: 'px-3 py-1 text-sm', star: 'h-3.5 w-3.5', modeIcon: 'text-sm' },
  md: { container: 'px-3.5 py-1.5 text-base', star: 'h-4 w-4', modeIcon: 'text-base' },
};

interface StarRatingBadgeProps {
  stars: number;
  size?: StarRatingBadgeSize;
  modeIconClass?: string;
  className?: string;
  title?: string;
}

const StarRatingBadge: React.FC<StarRatingBadgeProps> = ({
  stars,
  size = 'xs',
  modeIconClass,
  className = '',
  title,
}) => {
  const sizeClass = SIZE_CLASSES[size];

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full font-black shadow-sm ${sizeClass.container} ${className}`}
      style={{
        backgroundColor: getStarDifficultyColor(stars),
        color: getStarDifficultyTextColor(stars),
      }}
      title={title}
    >
      {modeIconClass && (
        <i className={`${modeIconClass} ${sizeClass.modeIcon}`} aria-hidden="true" />
      )}
      <Star className={`fill-current ${sizeClass.star}`} aria-hidden="true" />
      {stars.toFixed(2)}
    </span>
  );
};

export default StarRatingBadge;
