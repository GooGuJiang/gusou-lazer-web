export type DifficultySpectrumStop = readonly [number, string];

const STAR_DIFFICULTY_DEFINED_COLOUR_CUTOFF = 6.5;
const STAR_DIFFICULTY_TEXT_GRADIENT_CUTOFF = 9.0;

const STAR_DIFFICULTY_SPECTRUM: DifficultySpectrumStop[] = [
  [0.1, '#4290fb'],
  [1.25, '#4fc0ff'],
  [2.0, '#4fffd5'],
  [2.5, '#7cff4f'],
  [3.3, '#f6f05c'],
  [4.2, '#ff8068'],
  [4.9, '#ff4e6f'],
  [5.8, '#c645b8'],
  [6.7, '#6563de'],
  [7.7, '#18158e'],
  [9.0, '#000000'],
  [10.0, '#000000'],
];

const STAR_DIFFICULTY_TEXT_SPECTRUM: DifficultySpectrumStop[] = [
  [9.0, '#f6f05c'],
  [9.9, '#ff8068'],
  [10.6, '#ff4e6f'],
  [11.5, '#c645b8'],
  [12.4, '#6563de'],
];

const hexToRgb = (hex: string): { r: number; g: number; b: number } => ({
  r: parseInt(hex.slice(1, 3), 16),
  g: parseInt(hex.slice(3, 5), 16),
  b: parseInt(hex.slice(5, 7), 16),
});

const rgbToHex = ({ r, g, b }: { r: number; g: number; b: number }): string =>
  `#${[r, g, b].map((value) => Math.round(value).toString(16).padStart(2, '0')).join('')}`;

const sampleSpectrum = (spectrum: DifficultySpectrumStop[], value: number): string => {
  const roundedValue = Math.round(value * 100) / 100;
  const firstStop = spectrum[0];
  const lastStop = spectrum[spectrum.length - 1];

  if (!firstStop || !lastStop) return '#ffffff';
  if (roundedValue <= firstStop[0]) return firstStop[1];
  if (roundedValue >= lastStop[0]) return lastStop[1];

  for (let index = 1; index < spectrum.length; index += 1) {
    const previous = spectrum[index - 1];
    const current = spectrum[index];
    if (!previous || !current || roundedValue > current[0]) continue;

    const progress = (roundedValue - previous[0]) / (current[0] - previous[0]);
    const from = hexToRgb(previous[1]);
    const to = hexToRgb(current[1]);

    return rgbToHex({
      r: from.r + (to.r - from.r) * progress,
      g: from.g + (to.g - from.g) * progress,
      b: from.b + (to.b - from.b) * progress,
    });
  }

  return lastStop[1];
};

export const getStarDifficultyColor = (stars: number): string =>
  sampleSpectrum(STAR_DIFFICULTY_SPECTRUM, stars);

export const getStarDifficultyTextColor = (stars: number): string => {
  if (stars < STAR_DIFFICULTY_DEFINED_COLOUR_CUTOFF) return 'rgba(0, 0, 0, 0.75)';
  if (stars < STAR_DIFFICULTY_TEXT_GRADIENT_CUTOFF) return '#ff8068';
  return sampleSpectrum(STAR_DIFFICULTY_TEXT_SPECTRUM, stars);
};
