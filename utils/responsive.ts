import { Dimensions, PixelRatio } from 'react-native';

// Base reference dimensions for scaling (iPhone X as a common baseline)
const { width, height } = Dimensions.get('window');
const guidelineBaseWidth = 375; // px
const guidelineBaseHeight = 812; // px

// Determine if device is a (rough) tablet by width heuristic
export const isTablet = width >= 768; // simple heuristic good enough for now

// Width/Height percentage helpers
export const wp = (percent: number) => (width * percent) / 100;
export const hp = (percent: number) => (height * percent) / 100;

// Responsive font size based on screen width (capped to avoid over-scaling on large tablets)
export const rf = (fontSize: number, options?: { maxScale?: number; minScale?: number }) => {
	const rawScale = width / guidelineBaseWidth;
	const maxScale = options?.maxScale ?? 1.6;
	const minScale = options?.minScale ?? 1;
	const boundedScale = Math.min(maxScale, Math.max(minScale, rawScale));
	const newSize = fontSize * boundedScale;
	return Math.round(PixelRatio.roundToNearestPixel(newSize));
};

// General purpose responsive size (for widths/heights) with softer default cap
export const rs = (size: number, options?: { maxScale?: number; minScale?: number }) => {
	const rawScale = width / guidelineBaseWidth;
	const maxScale = options?.maxScale ?? 1.5; // keep UI balanced on very large devices
	const minScale = options?.minScale ?? 1;
	const boundedScale = Math.min(maxScale, Math.max(minScale, rawScale));
	return Math.round(PixelRatio.roundToNearestPixel(size * boundedScale));
};

// Moderate scale for spacing (gives a subtler growth)
export const ms = (size: number, factor = 0.5) => size + (wp(100) / guidelineBaseWidth - 1) * size * factor;

export default {
	isTablet,
	wp,
	hp,
	rf,
	rs,
	ms,
};
