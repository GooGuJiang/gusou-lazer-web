import React from 'react';

interface HueSliderProps {
  hue: number;
  onChange: (hue: number) => void;
  className?: string;
}

/**
 * HueSlider - 色相滑块组件
 * 参照 fuwari 的实现，使用 OKLCH 颜色空间
 */
const HueSlider: React.FC<HueSliderProps> = ({ hue, onChange, className = '' }) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(Number(e.target.value));
  };

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
};

export default HueSlider;

