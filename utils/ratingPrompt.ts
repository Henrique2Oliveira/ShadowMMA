import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform, Linking } from 'react-native';
import { ANDROID_PACKAGE_NAME, IOS_APP_ID, RATING_MIN_DAYS_BETWEEN_PROMPTS, RATING_REMIND_AFTER_FIGHTS, RATING_THRESHOLD_INITIAL_FIGHTS } from '@/config/rating';

const KEYS = {
  TOTAL_FIGHTS: 'rp_totalFights',
  FIGHTS_SINCE_PROMPT: 'rp_fightsSincePrompt',
  LAST_PROMPT_TS: 'rp_lastPromptTs',
  HAS_RATED: 'rp_hasRated',
  NEVER_ASK: 'rp_neverAsk'
} as const;

export type RatingDecision = {
  show: boolean;
  reason: 'initial-threshold' | 'remind-fights' | 'remind-days' | 'suppress';
};

export async function recordFightCompleted(): Promise<void> {
  try {
    const [totalRaw, sinceRaw] = await AsyncStorage.multiGet([KEYS.TOTAL_FIGHTS, KEYS.FIGHTS_SINCE_PROMPT]);
    const total = parseInt(totalRaw[1] || '0', 10) || 0;
    const since = parseInt(sinceRaw[1] || '0', 10) || 0;
    await AsyncStorage.multiSet([
      [KEYS.TOTAL_FIGHTS, String(total + 1)],
      [KEYS.FIGHTS_SINCE_PROMPT, String(since + 1)],
    ]);
  } catch {}
}

export async function shouldShowPrompt(): Promise<RatingDecision> {
  try {
    const entries = await AsyncStorage.multiGet([
      KEYS.TOTAL_FIGHTS,
      KEYS.FIGHTS_SINCE_PROMPT,
      KEYS.LAST_PROMPT_TS,
      KEYS.HAS_RATED,
      KEYS.NEVER_ASK,
    ]);
    const map = Object.fromEntries(entries);
    const hasRated = map[KEYS.HAS_RATED] === 'true';
    const neverAsk = map[KEYS.NEVER_ASK] === 'true';
    if (hasRated || neverAsk) return { show: false, reason: 'suppress' };

    const totalFights = parseInt(map[KEYS.TOTAL_FIGHTS] || '0', 10) || 0;
    const fightsSincePrompt = parseInt(map[KEYS.FIGHTS_SINCE_PROMPT] || '0', 10) || 0;
    const lastPromptTs = parseInt(map[KEYS.LAST_PROMPT_TS] || '0', 10) || 0;

    const now = Date.now();
    const daysSincePrompt = lastPromptTs > 0 ? (now - lastPromptTs) / (1000 * 60 * 60 * 24) : Infinity;

    if (totalFights >= RATING_THRESHOLD_INITIAL_FIGHTS && lastPromptTs === 0) {
      return { show: true, reason: 'initial-threshold' };
    }

    if (fightsSincePrompt >= RATING_REMIND_AFTER_FIGHTS) {
      if (daysSincePrompt >= RATING_MIN_DAYS_BETWEEN_PROMPTS) {
        return { show: true, reason: 'remind-fights' };
      }
    }

    if (daysSincePrompt >= RATING_MIN_DAYS_BETWEEN_PROMPTS && totalFights >= RATING_THRESHOLD_INITIAL_FIGHTS) {
      return { show: true, reason: 'remind-days' };
    }

    return { show: false, reason: 'suppress' };
  } catch {
    return { show: false, reason: 'suppress' };
  }
}

export async function markPromptShown(): Promise<void> {
  try {
    await AsyncStorage.multiSet([
      [KEYS.LAST_PROMPT_TS, String(Date.now())],
      [KEYS.FIGHTS_SINCE_PROMPT, '0']
    ]);
  } catch {}
}

export async function markRated(): Promise<void> {
  try {
    await AsyncStorage.multiSet([
      [KEYS.HAS_RATED, 'true'],
      [KEYS.NEVER_ASK, 'true']
    ]);
  } catch {}
}

export async function snooze(): Promise<void> {
  await markPromptShown();
}

export async function neverAskAgain(): Promise<void> {
  try { await AsyncStorage.setItem(KEYS.NEVER_ASK, 'true'); } catch {}
}

export async function openStoreListing(): Promise<void> {
  if (Platform.OS === 'android') {
    const pkg = ANDROID_PACKAGE_NAME;
    const marketUrl = `market://details?id=${pkg}`;
    const webUrl = `https://play.google.com/store/apps/details?id=${pkg}`;
    try {
      const supported = await Linking.canOpenURL(marketUrl);
      await Linking.openURL(supported ? marketUrl : webUrl);
    } catch {
      try { await Linking.openURL(webUrl); } catch {}
    }
  } else if (Platform.OS === 'ios') {
    if (IOS_APP_ID) {
      const url = `itms-apps://apps.apple.com/app/id${IOS_APP_ID}?action=write-review`;
      try { await Linking.openURL(url); } catch {}
    } else {
      // iOS app id not configured yet
    }
  }
}