import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

export type AdConsentStatus = 'unknown' | 'granted' | 'denied';

type ConsentContextType = {
  status: AdConsentStatus;
  loading: boolean;
  setGranted: () => Promise<void>;
  setDenied: () => Promise<void>;
};

const STORAGE_KEY = 'shadowmma_ad_consent_v1';

const ConsentContext = createContext<ConsentContextType | undefined>(undefined);

export const ConsentProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [status, setStatus] = useState<AdConsentStatus>('unknown');
  const [loading, setLoading] = useState(true);

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
      finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, []);

  const persist = useCallback(async (next: AdConsentStatus) => {
    setStatus(next);
    try { await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify({ status: next })); } catch {}
  }, []);

  const setGranted = useCallback(async () => {
    await persist('granted');
  }, [persist]);

  const setDenied = useCallback(async () => {
    await persist('denied');
  }, [persist]);

  const value = useMemo<ConsentContextType>(() => ({ status, loading, setGranted, setDenied }), [status, loading, setGranted, setDenied]);

  return (
    <ConsentContext.Provider value={value}>
      {children}
    </ConsentContext.Provider>
  );
};

export const useAdConsent = () => {
  const ctx = useContext(ConsentContext);
  if (!ctx) throw new Error('useAdConsent must be used within ConsentProvider');
  return ctx;
};
