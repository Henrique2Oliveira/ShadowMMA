// Shared avatar types and option pools for DiceBear Open Peeps avatars
// Keep this the single source of truth for avatar customization across the app

export type AvatarOptions = {
  head?: string;
  skinColor?: string; // hex without '#'
  accessories?: string;
  facialHair?: string;
  face?: string;
  backgroundColor?: string; // hex without '#'
  headContrastColor?: string; // hair color hex without '#'
  clothingColor?: string; // hex without '#'
  gender?: 'male' | 'female';
};

// Full option sets used throughout the app
export const HEAD_OPTIONS = [
  'afro', 'bangs', 'bangs2', 'bantuKnots', 'bear', 'bun', 'bun2', 'buns', 'cornrows', 'cornrows2', 'dreads1', 'dreads2', 'flatTop', 'flatTopLong', 'grayBun', 'grayMedium', 'grayShort', 'hatBeanie', 'hatHip', 'hijab', 'long', 'longAfro', 'longBangs', 'longCurly', 'medium1', 'medium2', 'medium3', 'mediumBangs', 'mediumBangs2', 'mediumBangs3', 'mediumStraight', 'mohawk', 'mohawk2', 'noHair1', 'noHair2', 'short1', 'short2', 'short3', 'short4'
] as const;

export const SKIN_OPTIONS = ['694d3d', 'ae5d29', 'd08b5b', 'edb98a', 'ffdbb4'] as const;

export const ACCESSORIES_OPTIONS = ['eyepatch', 'glasses', 'glasses2', 'glasses3', 'glasses4', 'glasses5', 'sunglasses', 'sunglasses2'] as const;

export const FACIAL_HAIR_OPTIONS = ['chin', 'full', 'goatee1', 'moustache1', 'moustache2', 'moustache3'] as const;

// Added extra expressive faces as requested: veryAngry, suspicious, serious, rage, driven
// Note: 'serious' already existed; keep a single entry to avoid duplicates.
export const FACE_OPTIONS = [
  'smile', 'smileTeethGap', 'smileBig', 'smileLOL',
  'serious', 'angryWithFang', 'cute', 'eyesClosed', 'awe',
  'veryAngry', 'suspicious', 'rage', 'driven'
] as const;

export const BG_OPTIONS = ['b6e3f4', 'c0aede', 'd1d4f9', 'ffd5dc', 'ffdfbf', 'ffffe0', 'd0f4de', 'f0f0f0', '000000', 'ffffff'] as const;

export const HAIR_COLOR_OPTIONS = ['2c1b18', '4a312c', '724133', 'a55728', 'b58143', 'c93305', 'd6b370', 'e8e1e1', 'ecdcbf', 'f59797'] as const;

export const CLOTHING_COLOR_OPTIONS = ['8fa7df', '9ddadb', '78e185', 'e279c7', 'e78276', 'fdea6b', 'ffcf77'] as const;

export const MALE_HEAD_OPTIONS = [
  'noHair1', 'noHair2', 'afro', 'flatTop', 'flatTopLong', 'mohawk', 'mohawk2', 'short1', 'short2', 'short3', 'short4', 'cornrows', 'cornrows2', 'dreads1', 'dreads2', 'hatBeanie', 'hatHip'
] as const;

export const FEMALE_HEAD_OPTIONS = [
  'bun', 'bun2', 'buns', 'long', 'longAfro', 'longBangs', 'longCurly', 'medium1', 'medium2', 'medium3', 'mediumStraight', 'mediumBangs', 'mediumBangs2', 'mediumBangs3', 'grayBun', 'grayMedium', 'grayShort', 'hijab'
] as const;
