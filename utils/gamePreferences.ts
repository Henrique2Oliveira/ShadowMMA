import AsyncStorage from '@react-native-async-storage/async-storage';

export const GAME_PREFS_KEY = 'shadowmma_game_preferences';

export interface GamePreferences {
  isMuted: boolean;
  animationMode: 'none' | 'old' | 'new';
  stance: 'orthodox' | 'southpaw';
  showComboCarousel: boolean;
  speedMultiplier: number;
}

export async function saveGamePreferences(prefs: GamePreferences) {
  try {
    await AsyncStorage.setItem(GAME_PREFS_KEY, JSON.stringify(prefs));
  } catch (e) {
    // handle error
    console.error('Failed to save game preferences', e);
  }
}

export async function loadGamePreferences(): Promise<GamePreferences | null> {
  try {
    const raw = await AsyncStorage.getItem(GAME_PREFS_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch (e) {
    console.error('Failed to load game preferences', e);
    return null;
  }
}
