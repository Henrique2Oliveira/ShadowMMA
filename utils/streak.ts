// Centralized streak utilities: date handling (UTC), messaging, emoji, notification title/body
// and light-weight telemetry helpers for offline vs server increments.

import AsyncStorage from '@react-native-async-storage/async-storage';

export const getUTCDateKey = (d: Date = new Date()): string => {
  // Always use the first 10 chars of ISO string: YYYY-MM-DD (UTC based)
  return d.toISOString().slice(0, 10);
};

// Tiered messaging logic reused across hook, modal, notifications
export const getStreakMessage = (streak: number): string => {
  if (streak <= 0) return 'Start your streak!';
  if (streak === 1) return 'Great start! 🔥';
  if (streak < 7) return `${streak} day${streak === 1 ? '' : 's'} streak! 🔥`;
  if (streak < 30) return `${streak} day${streak === 1 ? '' : 's'} streak! 🚀`;
  return `${streak} day${streak === 1 ? '' : 's'} streak! You\'re a legend! 👑`;
};

export const getStreakEmoji = (streak: number): string => {
  if (streak <= 0) return '💪';
  if (streak < 3) return '🔥';
  if (streak < 7) return '⚡';
  if (streak < 30) return '🚀';
  return '👑';
};

export const getNotificationTitleBody = (streak: number): { title: string; body: string } => {
  // Mirrors previous notification logic but unified
  if (streak === 0) return { title: 'Start Your Journey! 🥊', body: 'Begin your training streak today and become unstoppable!' };
  if (streak === 1) return { title: 'Keep It Going! 🔥', body: 'You started strong! Don\'t lose momentum on day 2.' };
  if (streak < 7) return { title: `${streak} Day Streak! 🔥`, body: 'You\'re building momentum! Keep your streak alive.' };
  if (streak < 30) return { title: `${streak} Day Streak! 🚀`, body: 'Amazing dedication! Don\'t let this streak end now.' };
  return { title: `${streak} Day Legend! 👑`, body: 'You\'re a true champion! Maintain your legendary streak.' };
};

// Telemetry: track offline vs server driven increments
export interface StreakTelemetry {
  offlineIncrements: number;
  serverIncrements: number;
  lastSampleLogged?: number; // timestamp
}

export const incrementTelemetry = async (uid: string, type: 'offline' | 'server') => {
  const key = `streakTelemetry_${uid}`;
  try {
    const raw = await AsyncStorage.getItem(key);
    const telemetry: StreakTelemetry = raw ? JSON.parse(raw) : { offlineIncrements: 0, serverIncrements: 0 };
    if (type === 'offline') telemetry.offlineIncrements += 1; else telemetry.serverIncrements += 1;
    // Occasionally log ratio (every 10 total increments)
    const total = telemetry.offlineIncrements + telemetry.serverIncrements;
    if (total > 0 && total % 10 === 0) {
      const ratio = (telemetry.offlineIncrements / total * 100).toFixed(1);
      console.log(`[StreakTelemetry] Offline increment ratio: ${ratio}% (${telemetry.offlineIncrements}/${total})`);
      telemetry.lastSampleLogged = Date.now();
    }
    await AsyncStorage.setItem(key, JSON.stringify(telemetry));
  } catch (e) {
    // Non-fatal
  }
};

export const getTelemetry = async (uid: string): Promise<StreakTelemetry | null> => {
  try {
    const raw = await AsyncStorage.getItem(`streakTelemetry_${uid}`);
    return raw ? JSON.parse(raw) : null;
  } catch { return null; }
};
