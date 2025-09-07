import { Dimensions, PixelRatio } from 'react-native';

// Base reference dimensions for scaling (iPhone X as a common baseline)
const { width, height } = Dimensions.get('window');
const guidelineBaseWidth = 375; // px
const guidelineBaseHeight = 812; // px

// Width/Height percentage helpers
export const wp = (percent: number) => (width * percent) / 100;
export const hp = (percent: number) => (height * percent) / 100;

// Responsive font size based on screen width
export const rf = (fontSize: number) => {
	const scale = width / guidelineBaseWidth;
	const newSize = fontSize * scale;
	return Math.round(PixelRatio.roundToNearestPixel(newSize));
};

// Optionally, a moderate scale for margins/paddings (not used yet)
export const ms = (size: number, factor = 0.5) => size + (wp(100) / guidelineBaseWidth - 1) * size * factor;

export default {
	wp,
	hp,
	rf,
	ms,
};
