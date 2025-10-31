import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';
import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';

export type AdConsentStatus = 'unknown' | 'granted' | 'denied';

type ConsentContextType = {
  status: AdConsentStatus;
  loading: boolean;
  setGranted: () => Promise<void>;
  setDenied: () => Promise<void>;
  requestConsentUpdate: () => Promise<void>;
  // Returns true if a native UMP consent form was displayed, false otherwise
  showConsentForm: () => Promise<boolean>;
};

const STORAGE_KEY = 'shadowmma_ad_consent_v1';

const ConsentContext = createContext<ConsentContextType | undefined>(undefined);

export const ConsentProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [status, setStatus] = useState<AdConsentStatus>('unknown');
  const [loading, setLoading] = useState(true);
  const adsModuleRef = useRef<any | null>(null);

  const persist = useCallback(async (next: AdConsentStatus) => {
    setStatus(next);
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify({ status: next }));
    } catch {}
  }, []);

  const setGranted = useCallback(async () => {
    await persist('granted');
  }, [persist]);

  const setDenied = useCallback(async () => {
    await persist('denied');
  }, [persist]);

  // Map google-mobile-ads consent state to our simplified status
  const syncFromUMP = useCallback(
    async (mod: any) => {
      try {
        const AdsConsent = mod?.AdsConsent || mod?.default?.AdsConsent;
        if (!AdsConsent) return;

        const statusVal = (await AdsConsent.getStatus?.()) ?? (await AdsConsent.getConsentStatus?.());
        const typeVal = await AdsConsent.getConsentType?.();

        // status: UNKNOWN | REQUIRED | NOT_REQUIRED | OBTAINED
        // type: UNKNOWN | NON_PERSONALIZED | PERSONALIZED
        if (typeVal === 'PERSONALIZED' || typeVal === 2) {
          await persist('granted');
        } else if (typeVal === 'NON_PERSONALIZED' || typeVal === 1) {
          await persist('denied');
        } else if (statusVal === 'NOT_REQUIRED' || statusVal === 2) {
          // In regions where consent is not required, default to personalized
          await persist('granted');
        } else {
          await persist('unknown');
        }
      } catch {
        // Ignore sync errors; keep current status
      }
    },
    [persist]
  );

  const initializeUMP = useCallback(
    async (mod: any) => {
      try {
        const AdsConsent = mod?.AdsConsent || mod?.default?.AdsConsent;
        if (!AdsConsent) return;
        const AdsConsentDebugGeography = mod?.AdsConsentDebugGeography || mod?.default?.AdsConsentDebugGeography;

        // Update consent info; in dev force EEA and mark emulator as test device
        const debugOptions = __DEV__
          ? { debugGeography: AdsConsentDebugGeography?.EEA ?? 1, testDeviceIdentifiers: ['EMULATOR'] }
          : {};
        if (AdsConsent.requestInfoUpdate) {
          await AdsConsent.requestInfoUpdate(debugOptions);
        } else if (AdsConsent.requestConsentInfoUpdate) {
          await AdsConsent.requestConsentInfoUpdate(debugOptions);
        }

        // Load and show if required
        if (AdsConsent.loadAndShowConsentFormIfRequired) {
          await AdsConsent.loadAndShowConsentFormIfRequired();
        } else if (AdsConsent.showForm) {
          const isAvailable = await AdsConsent.isConsentFormAvailable?.();
          if (isAvailable) {
            await AdsConsent.showForm();
          }
        }

        await syncFromUMP(mod);
      } catch {
        // Gracefully continue
      }
    },
    [syncFromUMP]
  );

  const requestConsentUpdate = useCallback(
    async () => {
      try {
        if (Constants.appOwnership === 'expo') return;
        const mod = adsModuleRef.current ?? (await import('react-native-google-mobile-ads'));
        adsModuleRef.current = mod;
        const AdsConsent = (mod as any)?.AdsConsent || (mod as any)?.default?.AdsConsent;
        const AdsConsentDebugGeography = (mod as any)?.AdsConsentDebugGeography || (mod as any)?.default?.AdsConsentDebugGeography;
        if (!AdsConsent) return;
        const debugOptions = __DEV__
          ? { debugGeography: AdsConsentDebugGeography?.EEA ?? 1, testDeviceIdentifiers: ['EMULATOR'] }
          : {};
        if (AdsConsent.requestInfoUpdate) {
          await AdsConsent.requestInfoUpdate(debugOptions);
        } else if (AdsConsent.requestConsentInfoUpdate) {
          await AdsConsent.requestConsentInfoUpdate(debugOptions);
        }
        await syncFromUMP(mod);
      } catch {
        // ignore
      }
    },
    [syncFromUMP]
  );

  const showConsentForm = useCallback(
    async (): Promise<boolean> => {
      try {
        if (Constants.appOwnership === 'expo') {
          if (__DEV__) console.warn('[Consent] UMP not available in Expo Go. Showing fallback.');
          return false;
        }
        const mod = adsModuleRef.current ?? (await import('react-native-google-mobile-ads'));
        adsModuleRef.current = mod;
        const AdsConsent = (mod as any)?.AdsConsent || (mod as any)?.default?.AdsConsent;
        const AdsConsentDebugGeography = (mod as any)?.AdsConsentDebugGeography || (mod as any)?.default?.AdsConsentDebugGeography;
        if (!AdsConsent) {
          if (__DEV__) console.warn('[Consent] AdsConsent module not found. Rebuild Dev Client after installing react-native-google-mobile-ads.');
          return false;
        }

        // Refresh consent info before attempting to show
        const debugOptions = __DEV__
          ? { debugGeography: AdsConsentDebugGeography?.EEA ?? 1, testDeviceIdentifiers: ['EMULATOR'] }
          : {};
        if (AdsConsent.requestInfoUpdate) {
          await AdsConsent.requestInfoUpdate(debugOptions);
        } else if (AdsConsent.requestConsentInfoUpdate) {
          await AdsConsent.requestConsentInfoUpdate(debugOptions);
        }

        let shown = false;
        if (AdsConsent.loadAndShowConsentFormIfRequired) {
          const available = (await AdsConsent.isConsentFormAvailable?.()) ?? true;
          await AdsConsent.loadAndShowConsentFormIfRequired();
          shown = !!available;
        } else if (AdsConsent.showForm) {
          const isAvailable = await AdsConsent.isConsentFormAvailable?.();
          if (isAvailable) {
            await AdsConsent.showForm();
            shown = true;
          } else if (__DEV__) {
            try {
              const s = await (AdsConsent.getStatus?.() ?? AdsConsent.getConsentStatus?.());
              const t = await AdsConsent.getConsentType?.();
              console.warn('[Consent] Consent form not available. status=', s, 'type=', t);
            } catch {}
          }
        }
        await syncFromUMP(mod);
        return shown;
      } catch {
        return false;
      }
    },
    [syncFromUMP]
  );

  const value = useMemo<ConsentContextType>(
    () => ({ status, loading, setGranted, setDenied, requestConsentUpdate, showConsentForm }),
    [status, loading, setGranted, setDenied, requestConsentUpdate, showConsentForm]
  );

  // Initialize consent on mount (after callbacks are defined)
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const saved = await AsyncStorage.getItem(STORAGE_KEY);
        if (mounted && saved) {
          const parsed = JSON.parse(saved) as { status: AdConsentStatus };
          if (parsed?.status === 'granted' || parsed?.status === 'denied') {
            setStatus(parsed.status);
          }
        }
      } catch {}
      try {
        if (Constants.appOwnership !== 'expo') {
          const mod = (await import('react-native-google-mobile-ads')) as any;
          adsModuleRef.current = mod;
          await initializeUMP(mod);
        }
      } catch {
        // ignore
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [initializeUMP]);

  return <ConsentContext.Provider value={value}>{children}</ConsentContext.Provider>;
};

export const useAdConsent = () => {
  const ctx = useContext(ConsentContext);
  if (!ctx) throw new Error('useAdConsent must be used within ConsentProvider');
  return ctx;
};
