import React, { useId, useMemo } from "react";
import { Tooltip } from "react-tooltip";

/**
 * LevelProgress
 * A responsive progress component:
 * - Mobile: Circular progress ring
 * - Desktop: Linear progress bar
 * Both with tooltip + label (Lv.X · Y%).
 *
 * Requirements:
 * - TailwindCSS enabled in your app
 * - `react-tooltip` installed
 */
export type LevelProgressProps = {
  /** Current level number shown in the label */
  levelCurrent: number;
  /** Progress percentage for the current level (0-100) */
  levelProgress: number;
  /** Bar fill color. Accepts any valid CSS color string */
  tint?: string;
  /** Add or override container classes (width/spacing etc.) */
  className?: string;
  /**
   * Height of the linear bar (e.g. '1rem', '8px').
   * If omitted, Tailwind classes control the height via `h-4` on the bar container.
   */
  barHeight?: string;
  /** Overall width of the linear bar container (e.g. '12rem'). If omitted, use Tailwind width classes. */
  barWidth?: string;
  /** Size of the circular progress (e.g. '80px'). Default: '64px' */
  circleSize?: string;
  /** Stroke width for circular progress. Default: 4 */
  circleStrokeWidth?: number;
  /** Show the right-side label "Lv.X · Y%" */
  showLabel?: boolean;
  /** Optional custom label renderer */
  renderLabel?: (levelCurrent: number, clampedProgress: number) => React.ReactNode;
  /** Tooltip placement, per `react-tooltip` */
  tooltipPlace?: "top" | "bottom" | "left" | "right";
};

export default function LevelProgress({
  levelCurrent,
  levelProgress,
  tint = "var(--profile-color, #ED8EA6)", // default to dynamic profile color
  className = "",
  barHeight,
  barWidth,
  circleSize = "64px",
  circleStrokeWidth = 4,
  showLabel = true,
  renderLabel,
  tooltipPlace = "top",
}: LevelProgressProps) {
  // Ensure progress stays between 0 and 100
  const clamped = useMemo(
    () => Math.max(0, Math.min(100, Number.isFinite(levelProgress) ? levelProgress : 0)),
    [levelProgress]
  );

  // A stable, unique tooltip id per component instance
  const tooltipId = useId();

  // Inline styles for height/width overrides if provided
  const barContainerStyle: React.CSSProperties = {};
  if (barHeight) barContainerStyle.height = barHeight;
  if (barWidth) barContainerStyle.width = barWidth;

  const progressStyle: React.CSSProperties = {
    width: `${clamped}%`,
    backgroundColor: tint,
  };

  // Circular progress calculations
  const numericSize = parseInt(circleSize);
  const radius = (numericSize - circleStrokeWidth * 2) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (clamped / 100) * circumference;

  // Accessible label for screen readers
  const ariaLabel = `Level ${levelCurrent}, ${clamped}% complete`;

  // Default label content
  const labelContent = renderLabel ? renderLabel(levelCurrent, clamped) : (
    <>Lv.{levelCurrent}</>
  );

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      {/* Linear Progress Bar - Hidden on mobile */}
      <div
        className="relative w-48 h-4 bg-gray-200 dark:bg-gray-800 rounded-full overflow-hidden shadow-inner hidden sm:block"
        style={barContainerStyle}
        role="progressbar"
        aria-valuenow={clamped}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={ariaLabel}
        data-tooltip-id={tooltipId}
        data-tooltip-content={`${clamped}%`}
      >
        <div
          className="absolute top-0 left-0 h-full shadow-inner transition-all duration-500 ease-out"
          style={progressStyle}
        />
      </div>

      {/* Circular Progress Ring - Visible only on mobile */}
      <div
        className="relative flex items-center justify-center sm:hidden"
        style={{ width: circleSize, height: circleSize }}
        role="progressbar"
        aria-valuenow={clamped}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={ariaLabel}
        data-tooltip-id={tooltipId}
        data-tooltip-content={`${clamped}%`}
      >
        <svg
          width={circleSize}
          height={circleSize}
          className="transform -rotate-90"
        >
          {/* Background circle */}
          <circle
            cx={numericSize / 2}
            cy={numericSize / 2}
            r={radius}
            stroke="currentColor"
            strokeWidth={circleStrokeWidth}
            fill="none"
            className="text-gray-200 dark:text-gray-700"
          />
          {/* Progress circle */}
          <circle
            cx={numericSize / 2}
            cy={numericSize / 2}
            r={radius}
            stroke={tint}
            strokeWidth={circleStrokeWidth}
            fill="none"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            className="transition-all duration-500 ease-out"
          />
        </svg>
        {/* Center label for mobile */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-xs font-semibold text-gray-700 dark:text-gray-300">
            Lv.{levelCurrent}
          </span>
          <span className="text-xs text-gray-500 dark:text-gray-400">
            {clamped}%
          </span>
        </div>
      </div>

      {/* Right-side label - Hidden on mobile since it's in the center of circle */}
      {showLabel && (
        <span className="text-gray-800 dark:text-gray-100 font-semibold whitespace-nowrap hidden sm:inline">
          {labelContent}
        </span>
      )}

      {/* Tooltip (render once per component instance) */}
      <Tooltip id={tooltipId} place={tooltipPlace} />
    </div>
  );
}