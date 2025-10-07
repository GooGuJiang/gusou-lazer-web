import React, { memo, useCallback } from 'react';

interface HueSliderProps {
  hue: number;
  onChange: (hue: number) => void;
  className?: string;
}

/**
 * HueSlider - 色相滑块组件
 * 参照 fuwari 的实现，使用 OKLCH 颜色空间
 * 使用 memo 优化，避免不必要的重渲染
 */
const HueSlider: React.FC<HueSliderProps> = memo(({ hue, onChange, className = '' }) => {
  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(Number(e.target.value));
  }, [onChange]);

  return (
    <div className={`hue-slider-wrapper ${className}`}>
      <input
        type="range"
        min="0"
        max="360"
        step="1"
        value={hue}
        onChange={handleChange}
        className="hue-slider"
        aria-label="Hue selector"
      />
    </div>
  );
});

HueSlider.displayName = 'HueSlider';

export default HueSlider;

