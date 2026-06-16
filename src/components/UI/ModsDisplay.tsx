import { useId } from 'react';
import { Tooltip } from 'react-tooltip';
import 'react-tooltip/dist/react-tooltip.css';
import type { ModDefinition, ModSettingDefinition, ScoreMod } from '../../types/mods';
import { getModDefinition, getModTypeColor } from '../../data/mods';

type ModIconSize = 'sm' | 'md' | 'lg';

interface ModsDisplayProps {
  mods?: readonly ScoreMod[];
  className?: string;
  iconClassName?: string;
  size?: ModIconSize;
  showNoMod?: boolean;
}

const MOD_ICON_SIZE_CLASS: Record<ModIconSize, string> = {
  sm: 'h-[18px] w-[26px]',
  md: 'h-[21px] w-[30px]',
  lg: 'h-[28px] w-10',
};

const MOD_EXTENDED_ICON_SIZE_CLASS: Record<ModIconSize, string> = {
  sm: 'h-[18px] w-[56px]',
  md: 'h-[21px] w-[66px]',
  lg: 'h-[28px] w-[88px]',
};

const MOD_EXTENDER_SIZE_CLASS: Record<ModIconSize, string> = {
  sm: 'h-[18px] w-10 -ml-[9px] pl-[9px] pr-[3px] pb-px text-[9px]',
  md: 'h-[21px] w-[46px] -ml-[10px] pl-[10px] pr-[3px] pb-px text-[10px]',
  lg: 'h-[28px] w-[62px] -ml-[14px] pl-[14px] pr-[4px] pb-px text-[13px]',
};

const DA_EXTENDED_SETTING_LABELS: Record<string, string> = {
  approach_rate: 'AR',
  circle_size: 'CS',
  drain_rate: 'HP',
  extended_limits: 'EX',
  hard_rock_offsets: 'HR',
  overall_difficulty: 'OD',
  scroll_speed: 'SV',
};

const MOD_ICON_BACKGROUND_URL = '/image/mods/blanks/mod-icon.svg';
const MOD_ICON_EXTENDER_BACKGROUND_URL = '/image/mods/blanks/mod-icon-extender.svg';

const escapeAcronym = (acronym: string): string => acronym.trim().toUpperCase();

const formatSettingName = (name: string): string =>
  name
    .split('_')
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');

const formatSettingValue = (value: unknown): string => {
  if (typeof value === 'boolean') {
    return value ? '开启' : '关闭';
  }

  if (typeof value === 'number' || typeof value === 'string') {
    return String(value);
  }

  if (value === null) {
    return 'null';
  }

  if (Array.isArray(value)) {
    return value.map((item) => formatSettingValue(item)).join(', ');
  }

  if (typeof value === 'object') {
    try {
      return JSON.stringify(value);
    } catch {
      return String(value);
    }
  }

  return String(value);
};

const findSettingDefinition = (
  settingDefinitions: readonly ModSettingDefinition[],
  name: string
): ModSettingDefinition | undefined =>
  settingDefinitions.find((settingDefinition) => settingDefinition.name === name);

const mixHexWithBlack = (hex: string, amount: number): string => {
  const normalizedHex = hex.replace('#', '');
  const red = parseInt(normalizedHex.slice(0, 2), 16);
  const green = parseInt(normalizedHex.slice(2, 4), 16);
  const blue = parseInt(normalizedHex.slice(4, 6), 16);
  const formatChannel = (value: number): string =>
    Math.round(value * amount)
      .toString(16)
      .padStart(2, '0');

  return `#${formatChannel(red)}${formatChannel(green)}${formatChannel(blue)}`;
};

const parseFiniteNumber = (value: unknown): number | null => {
  if (typeof value === 'number') {
    return Number.isFinite(value) ? value : null;
  }

  if (typeof value === 'string') {
    const numberValue = Number(value);
    return Number.isFinite(numberValue) ? numberValue : null;
  }

  return null;
};

const formatCompactNumber = (value: number): string =>
  value.toFixed(2).replace(/\.0+$|(?<=\.\d)0$/u, '');

const formatCompactSettingValue = (value: unknown): string => {
  const numberValue = parseFiniteNumber(value);

  if (numberValue !== null) {
    return formatCompactNumber(numberValue);
  }

  if (typeof value === 'boolean') {
    return value ? 'ON' : 'OFF';
  }

  return formatSettingValue(value);
};

const buildSpeedExtensionText = (
  settings: Record<string, unknown> | undefined,
  defaultRate: number
): string | null => {
  const speedChange = parseFiniteNumber(settings?.speed_change);

  if (speedChange === null || Math.abs(speedChange - defaultRate) < 0.001) {
    return null;
  }

  return `${formatCompactNumber(speedChange)}x`;
};

const getModExtensionText = (mod: ScoreMod, acronym: string): string | null => {
  const settings = mod.settings;

  if (acronym === 'DT' || acronym === 'NC') {
    return buildSpeedExtensionText(settings, 1.5);
  }

  if (acronym === 'HT' || acronym === 'DC') {
    return buildSpeedExtensionText(settings, 0.75);
  }

  const settingsEntries = Object.entries(settings ?? {}).filter(
    ([, value]) => value !== undefined && value !== null
  );

  if (acronym !== 'DA' || settingsEntries.length !== 1) {
    return null;
  }

  const [settingName, settingValue] = settingsEntries[0];
  if (!settingName) {
    return null;
  }

  return `${DA_EXTENDED_SETTING_LABELS[settingName] ?? formatSettingName(settingName)}${formatCompactSettingValue(settingValue)}`;
};

const buildModTooltip = (mod: ScoreMod, definition: ModDefinition | undefined): string => {
  const acronym = escapeAcronym(mod.acronym);
  const lines = [`${definition?.name ?? acronym} (${acronym})`];
  const settingsEntries = Object.entries(mod.settings ?? {}).filter(
    ([, value]) => value !== undefined && value !== null
  );

  settingsEntries.forEach(([name, value]) => {
    const settingDefinition = findSettingDefinition(definition?.settings ?? [], name);
    const label = settingDefinition?.label || formatSettingName(name);
    lines.push(`• ${label}: ${formatSettingValue(value)}`);
  });

  return lines.join('\n');
};

const ModBadge = ({
  mod,
  tooltipId,
  size,
  iconClassName = '',
}: {
  mod: ScoreMod;
  tooltipId: string;
  size: ModIconSize;
  iconClassName?: string;
}) => {
  const acronym = escapeAcronym(mod.acronym);
  const definition = getModDefinition(acronym);
  const backgroundColor = getModTypeColor(definition?.type);
  const iconColor = mixHexWithBlack(backgroundColor, 0.1);
  const extenderColor = mixHexWithBlack(backgroundColor, 1 / 3.8);
  const extensionText = getModExtensionText(mod, acronym);
  const hasExtension = extensionText !== null;
  const tooltipContent = buildModTooltip(mod, definition);

  return (
    <span
      className={`relative inline-flex ${hasExtension ? MOD_EXTENDED_ICON_SIZE_CLASS[size] : MOD_ICON_SIZE_CLASS[size]} shrink-0 cursor-help items-center justify-center align-middle transition-transform duration-150 hover:-translate-y-0.5 ${iconClassName}`}
      data-tooltip-id={tooltipId}
      data-tooltip-content={tooltipContent}
      aria-label={definition ? `${definition.name} (${acronym})` : acronym}
    >
      <span className={`relative z-10 ${MOD_ICON_SIZE_CLASS[size]} shrink-0`}>
        <span
          className="absolute inset-0 drop-shadow-[0_1px_1px_rgba(0,0,0,0.3)]"
          style={{
            backgroundColor,
            mask: `url(${MOD_ICON_BACKGROUND_URL}) center / contain no-repeat`,
            WebkitMask: `url(${MOD_ICON_BACKGROUND_URL}) center / contain no-repeat`,
          }}
        />
        {definition ? (
          <span
            className="absolute inset-0 opacity-90 drop-shadow-[0_1px_0_rgba(255,255,255,0.18)]"
            style={{
              backgroundColor: iconColor,
              mask: `url(${definition.icon}) center / contain no-repeat`,
              WebkitMask: `url(${definition.icon}) center / contain no-repeat`,
            }}
          />
        ) : (
          <span
            className="absolute inset-0 flex items-center justify-center px-1 text-[9px] font-black leading-none drop-shadow-[0_1px_0_rgba(255,255,255,0.2)]"
            style={{ color: iconColor }}
          >
            {acronym}
          </span>
        )}
      </span>
      {extensionText && (
        <span
          className={`relative z-0 flex ${MOD_EXTENDER_SIZE_CLASS[size]} shrink-0 items-center justify-center overflow-hidden whitespace-nowrap font-bold leading-none`}
          style={{
            backgroundColor: extenderColor,
            color: backgroundColor,
            mask: `url(${MOD_ICON_EXTENDER_BACKGROUND_URL}) center / contain no-repeat`,
            WebkitMask: `url(${MOD_ICON_EXTENDER_BACKGROUND_URL}) center / contain no-repeat`,
          }}
        >
          <span className="translate-x-[0.08em]">{extensionText}</span>
        </span>
      )}
    </span>
  );
};

export default function ModsDisplay({
  mods,
  className = '',
  iconClassName,
  size = 'md',
  showNoMod = true,
}: ModsDisplayProps) {
  const tooltipId = `mods-display-${useId().replace(/:/g, '')}`;
  const displayMods = mods && mods.length > 0 ? mods : showNoMod ? [{ acronym: 'NM' }] : [];

  if (displayMods.length === 0) {
    return null;
  }

  return (
    <div className={`flex flex-wrap items-center gap-1 ${className}`.trim()}>
      {displayMods.map((mod, index) => (
        <ModBadge
          key={`${escapeAcronym(mod.acronym)}-${index}`}
          mod={mod}
          tooltipId={tooltipId}
          size={size}
          iconClassName={iconClassName}
        />
      ))}
      <Tooltip
        id={tooltipId}
        place="top"
        positionStrategy="fixed"
        opacity={1}
        style={{
          backgroundColor: '#1e293b',
          color: '#fff',
          borderRadius: '0.5rem',
          padding: '0.55rem 0.75rem',
          fontSize: '0.75rem',
          lineHeight: '1.35',
          maxWidth: '20rem',
          whiteSpace: 'pre-line',
          zIndex: 9999,
        }}
      />
    </div>
  );
}
