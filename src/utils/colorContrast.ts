const HEX_COLOR = /^#([0-9a-f]{6})$/i;

const channelLuminance = (channel: number): number => {
  const normalized = channel / 255;
  return normalized <= .03928
    ? normalized / 12.92
    : ((normalized + .055) / 1.055) ** 2.4;
};

const luminance = (hex: string): number | null => {
  const match = hex.trim().match(HEX_COLOR);
  if (!match) return null;
  const value = Number.parseInt(match[1], 16);
  const red = (value >> 16) & 255;
  const green = (value >> 8) & 255;
  const blue = value & 255;
  return .2126 * channelLuminance(red) + .7152 * channelLuminance(green) + .0722 * channelLuminance(blue);
};

export const colorContrastRatio = (foreground: string, background = "#ffffff"): number => {
  const foregroundLuminance = luminance(foreground);
  const backgroundLuminance = luminance(background);
  if (foregroundLuminance === null || backgroundLuminance === null) return 1;
  const lighter = Math.max(foregroundLuminance, backgroundLuminance);
  const darker = Math.min(foregroundLuminance, backgroundLuminance);
  return (lighter + .05) / (darker + .05);
};

export const isReadableBodyColor = (color: string): boolean =>
  colorContrastRatio(color) >= 4.5;

export const SAFE_BODY_TEXT_COLOR = "#1f2937";

export const ensureReadableBodyColor = (color: string): string =>
  isReadableBodyColor(color) ? color : SAFE_BODY_TEXT_COLOR;
