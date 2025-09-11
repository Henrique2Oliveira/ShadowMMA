import { Dimensions } from 'react-native';

/**
 * Centralized UI scaling helpers so tablet sizing stays consistent across screens.
 * Breakpoints chosen for common device classes (phone / small tablet / large tablet).
 */
const getWidth = () => Dimensions.get('window').width;

export type DeviceBucket = 'xSmallPhone' | 'smallPhone' | 'phone' | 'phablet' | 'tablet' | 'largeTablet';

export const getDeviceBucket = (): DeviceBucket => {
  const w = getWidth();
  // Add buckets for very small/narrow phones so we can scale down slightly
  if (w >= 1024) return 'largeTablet';
  if (w >= 768) return 'tablet';
  if (w >= 600) return 'phablet';
  if (w < 340) return 'xSmallPhone'; // e.g., iPhone SE, older Androids
  if (w < 375) return 'smallPhone'; // narrow/compact phones
  return 'phone';
};

const baseMultipliers: Record<DeviceBucket, number> = {
  xSmallPhone: 0.86,
  smallPhone: 0.92,
  phone: 1,
  phablet: 1.08,
  tablet: 1.25,
  largeTablet: 1.45,
};

const iconExtra: Record<DeviceBucket, number> = {
  xSmallPhone: -0.02,
  smallPhone: -0.01,
  phone: 0,
  phablet: 0.05,
  tablet: 0.12,
  largeTablet: 0.18,
};

export interface ScaleOptions {
  category?: 'font' | 'icon' | 'button' | 'spacing';
  /** Hard cap to avoid cartoonishly large UI on very big external displays */
  max?: number;
  /** Minimum scale (mostly for safety) */
  min?: number;
}

export const uiScale = (size: number, opts: ScaleOptions = {}) => {
  const bucket = getDeviceBucket();
  let mult = baseMultipliers[bucket];
  if (opts.category === 'icon') mult += iconExtra[bucket];
  if (opts.category === 'button') mult += 0.05; // buttons a hair larger
  if (opts.category === 'spacing') mult -= 0.02; // avoid too airy spacing
  const max = opts.max ?? 1.8;
  // Allow a small downscale on compact devices by default
  const min = opts.min ?? 0.85;
  mult = Math.min(max, Math.max(min, mult));
  return Math.round(size * mult);
};

export const ensureTouchSize = (value: number) => Math.max(48, value); // 48dp recommended min

export const scaledHitSlop = (base = 8) => {
  const v = uiScale(base, { category: 'spacing' });
  return { top: v, bottom: v, left: v, right: v } as const;
};

export default { uiScale, ensureTouchSize, getDeviceBucket, scaledHitSlop };
