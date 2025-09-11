import Constants from 'expo-constants';
import { useEffect, useRef } from 'react';
import { AppState, AppStateStatus, Platform } from 'react-native';

// Replace with your real ad unit ID. During development you can set useTestIds=true
const APP_OPEN_AD_UNIT_ID = 'ca-app-pub-6678510991963006/5962114285';

export default function AppOpenAdManager({ enabled = true, useTestIds = false }: { enabled?: boolean; useTestIds?: boolean }) {
  const appState = useRef(AppState.currentState);

  useEffect(() => {
    if (!enabled) return;
    // Only support Android for now (no iOS App ID configured yet)
    if (Platform.OS !== 'android') return;
    // Don't attempt to import or initialize in Expo Go
    if (Constants.appOwnership === 'expo') return;

    let unsubAppState: (() => void) | undefined;

    const setup = async () => {
      // Dynamically import to avoid touching the native module in Expo Go
      const {
        default: mobileAds,
        AppOpenAd,
        AdEventType,
        TestIds,
      } = (await import('react-native-google-mobile-ads')) as any;

      const adUnitId = (useTestIds || __DEV__) ? TestIds.APP_OPEN : APP_OPEN_AD_UNIT_ID;

      await mobileAds().initialize();

      // Load and show an app open ad on first launch
      const initialAd = AppOpenAd.createForAdRequest(adUnitId, { requestNonPersonalizedAdsOnly: false });
      const onLoaded = () => {
        try { if (initialAd.loaded) initialAd.show(); } catch {}
      };
      const onError = () => {
        // No-op; it will attempt again on next foreground
      };
      initialAd.addAdEventListener(AdEventType.LOADED, onLoaded);
      initialAd.addAdEventListener(AdEventType.ERROR, onError);
      initialAd.load();

      const sub = AppState.addEventListener('change', (nextAppState: AppStateStatus) => {
        if (appState.current.match(/inactive|background/) && nextAppState === 'active') {
          const ad = AppOpenAd.createForAdRequest(adUnitId, { requestNonPersonalizedAdsOnly: false });
          const showIfLoaded = () => {
            try { if (ad.loaded) ad.show(); } catch {}
          };
          const onAdLoaded = () => showIfLoaded();
          const onAdFailed = () => { ad.load(); };
          ad.addAdEventListener(AdEventType.LOADED, onAdLoaded);
          ad.addAdEventListener(AdEventType.ERROR, onAdFailed);
          ad.load();
        }
        appState.current = nextAppState;
      });
      unsubAppState = () => sub.remove();
    };

    setup();

    return () => {
      try { unsubAppState?.(); } catch {}
    };
  }, [enabled, useTestIds]);

  return null;
}
