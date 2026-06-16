export type ModType =
  | 'Automation'
  | 'DifficultyIncrease'
  | 'DifficultyReduction'
  | 'Conversion'
  | 'Fun'
  | 'System'
  | 'None';

export interface ModSettingDefinition {
  name: string;
  type: string;
  label: string;
  description: string;
}

export interface ModDefinition {
  acronym: string;
  name: string;
  description: string;
  type: ModType;
  icon: string;
  settings: readonly ModSettingDefinition[];
}

export interface ScoreMod {
  acronym: string;
  settings?: Record<string, unknown>;
}
