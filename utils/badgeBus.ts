// Lightweight in-memory badge bus for global, reactive flags/counters
// No external deps; works across modules in the same JS runtime.

import AsyncStorage from '@react-native-async-storage/async-storage';
export type Listener<T> = (value: T) => void;

class SimpleStore<T> {
  private value: T;
  private listeners = new Set<Listener<T>>();

  constructor(initial: T) {
    this.value = initial;
  }

  get() {
    return this.value;
  }

  set(next: T) {
    if (Object.is(this.value, next)) return;
    this.value = next;
    this.listeners.forEach((fn) => {
      try {
        fn(this.value);
      } catch {
        // no-op; isolate listener errors
      }
    });
  }

  subscribe(fn: Listener<T>) {
    this.listeners.add(fn);
    return () => {
      this.listeners.delete(fn);
    };
  }
}

// Numeric counter for "new combos" badge
const newCombosCountStore = new SimpleStore<number>(0);
const STORAGE_KEY = 'new_combos_badge_count_v1';

// Count-based API
export const getNewCombosCount = () => newCombosCountStore.get();
export const setNewCombosCount = (val: number) => {
  const n = Math.max(0, Math.floor(val || 0));
  newCombosCountStore.set(n);
  // fire-and-forget persistence
  void AsyncStorage.setItem(STORAGE_KEY, String(n)).catch(() => {});
};
export const incrementNewCombosCount = (delta: number = 1) => {
  const next = Math.max(0, getNewCombosCount() + Math.floor(delta || 0));
  newCombosCountStore.set(next);
  void AsyncStorage.setItem(STORAGE_KEY, String(next)).catch(() => {});
};
export const subscribeNewCombosCount = (fn: Listener<number>) => newCombosCountStore.subscribe(fn);

// Backward-compatible boolean API (derived from count)
export const getNewCombos = () => getNewCombosCount() > 0;
export const setNewCombos = (val: boolean) => setNewCombosCount(val ? Math.max(1, getNewCombosCount() || 1) : 0);
export const subscribeNewCombos = (fn: Listener<boolean>) =>
  newCombosCountStore.subscribe((n) => fn(n > 0));

// Hydrate from AsyncStorage (call once on app start or when UI mounts)
export const hydrateNewCombosCount = async () => {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    if (raw == null) return;
    const parsed = parseInt(raw, 10);
    const n = Number.isFinite(parsed) && parsed >= 0 ? parsed : 0;
    newCombosCountStore.set(n);
  } catch {
    // ignore storage errors; keep default 0
  }
};
