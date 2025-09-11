import { useEffect, useRef } from 'react';
import { AppState, AppStateStatus } from 'react-native';
import mobileAds, { AdEventType, AppOpenAd, TestIds } from 'react-native-google-mobile-ads';

// Replace with your real ad unit ID. During development you can set useTestIds=true
const APP_OPEN_AD_UNIT_ID = 'ca-app-pub-6678510991963006/5962114285';

export default function AppOpenAdManager({ enabled = true, useTestIds = false }: { enabled?: boolean; useTestIds?: boolean }) {
  const appState = useRef(AppState.currentState);
  const adUnitId = (useTestIds || __DEV__) ? TestIds.APP_OPEN : APP_OPEN_AD_UNIT_ID;

  useEffect(() => {
    if (!enabled) return;

    // Initialize the Google Mobile Ads SDK
    mobileAds()
      .initialize()
      .then(() => {
        // Load and show an app open ad on first launch
        const initialAd = AppOpenAd.createForAdRequest(adUnitId, { requestNonPersonalizedAdsOnly: false });
        const onLoaded = () => {
          if (initialAd.loaded) initialAd.show();
        };
        const onError = () => {
          // No-op; it will attempt again on next foreground
        };
        initialAd.addAdEventListener(AdEventType.LOADED, onLoaded);
        initialAd.addAdEventListener(AdEventType.ERROR, onError);
        initialAd.load();
      });

    const subscription = AppState.addEventListener('change', (nextAppState: AppStateStatus) => {
      // When app comes to foreground, try to show an App Open Ad
      if (appState.current.match(/inactive|background/) && nextAppState === 'active') {
        const ad = AppOpenAd.createForAdRequest(adUnitId, { requestNonPersonalizedAdsOnly: false });

        const showIfLoaded = () => {
          if (ad.loaded) {
            ad.show();
          }
        };

        const onAdLoaded = () => showIfLoaded();
        const onAdFailed = () => {
          // Try to load for next time
          ad.load();
        };

        ad.addAdEventListener(AdEventType.LOADED, onAdLoaded);
        ad.addAdEventListener(AdEventType.ERROR, onAdFailed);
        ad.load();
      }
      appState.current = nextAppState;
    });

    return () => {
      subscription.remove();
    };
  }, [adUnitId, enabled]);

  return null;
}
