export const ANDROID_PACKAGE_NAME = 'com.belsonsan.ShadowMMA';

// TODO: Set your App Store ID when you ship iOS (e.g., '1234567890')
export const IOS_APP_ID: string | null = null;

// When to first ask and how often to remind
export const RATING_THRESHOLD_INITIAL_FIGHTS = 3; // first prompt after N completed fights
export const RATING_REMIND_AFTER_FIGHTS = 8;      // re-prompt after N more fights
export const RATING_MIN_DAYS_BETWEEN_PROMPTS = 7; // and at least N days between prompts