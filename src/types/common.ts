export type GameMode =
  | 'osu'
  | 'taiko'
  | 'fruits'
  | 'mania'
  | 'osurx'
  | 'osuap'
  | 'taikorx'
  | 'fruitsrx';

export type MainGameMode = 'osu' | 'taiko' | 'fruits' | 'mania';

export const GAME_MODE_GROUPS: Record<MainGameMode, GameMode[]> = {
  osu: ['osu', 'osurx', 'osuap'],
  taiko: ['taiko', 'taikorx'],
  fruits: ['fruits', 'fruitsrx'],
  mania: ['mania'],
};

export const GAME_MODE_NAMES: Record<GameMode, string> = {
  osu: 'Standard',
  osurx: 'Relax',
  osuap: 'Auto Pilot',
  taiko: 'Taiko',
  taikorx: 'Taiko RX',
  fruits: 'Catch',
  fruitsrx: 'Catch RX',
  mania: 'Mania',
};

// 获取主题色的函数 - 直接从 CSS 变量读取
export const getProfileColor = () => {
  if (typeof window !== 'undefined') {
    const color = getComputedStyle(document.documentElement)
      .getPropertyValue('--profile-color')
      .trim();
    return color || '#5CA9E5';
  }
  return '#5CA9E5';
};

export const GAME_MODE_COLORS: Record<GameMode, string> = {
  osu: 'var(--profile-color, #5CA9E5)',
  osurx: 'var(--profile-color, #5CA9E5)',
  osuap: 'var(--profile-color, #5CA9E5)',
  taiko: 'var(--profile-color, #5CA9E5)',
  taikorx: 'var(--profile-color, #5CA9E5)',
  fruits: 'var(--profile-color, #5CA9E5)',
  fruitsrx: 'var(--profile-color, #5CA9E5)',
  mania: 'var(--profile-color, #5CA9E5)',
};

export type Theme = 'light' | 'dark' | 'system';

export const MAIN_MODE_ICONS: Record<MainGameMode, string> = {
  osu: 'fa-extra-mode-osu',
  taiko: 'fa-extra-mode-taiko',
  fruits: 'fa-extra-mode-fruits',
  mania: 'fa-extra-mode-mania',
};
