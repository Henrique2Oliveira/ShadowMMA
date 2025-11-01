import { useAdConsent } from '@/contexts/ConsentContext';
import { useUserData } from '@/contexts/UserDataContext';
import Constants from 'expo-constants';
import { useMemo } from 'react';

// Central ad rules
export const MIN_FIGHTS_FOR_ADS = 6; // show ads only after N lifetime rounds

// Official AdMob test unit IDs (avoid importing SDK for these)
const TEST_BANNER_ID = 'ca-app-pub-3940256099942544/6300978111';
const TEST_INTERSTITIAL_ID = 'ca-app-pub-3940256099942544/1033173712';

// Production unit IDs (existing in the project)
const PROD_BANNER_ID = 'ca-app-pub-6678510991963006/6604579282';
const PROD_INTERSTITIAL_ID = 'ca-app-pub-6678510991963006/4151420738';

export type AdRequestOptions = { requestNonPersonalizedAdsOnly?: boolean };

export function useAds() {
  const { userData } = useUserData();
  const { status: consentStatus, loading: consentLoading } = useAdConsent();

  const isFreePlan = ((userData?.plan ?? 'free') + '').toLowerCase() === 'free';
  const completedFights = userData?.lifetimeFightRounds ?? 0;
  const meetsThreshold = completedFights >= MIN_FIGHTS_FOR_ADS;
  const sdkAvailable = Constants.appOwnership !== 'expo';

  const personalized = consentStatus === 'granted';
  const requestOptions: AdRequestOptions = useMemo(
    () => ({ requestNonPersonalizedAdsOnly: !personalized }),
    [personalized]
  );

  const shouldShowAds = sdkAvailable && isFreePlan && meetsThreshold;

  const bannerUnitId = __DEV__ ? TEST_BANNER_ID : PROD_BANNER_ID;
  const interstitialUnitId = __DEV__ ? TEST_INTERSTITIAL_ID : PROD_INTERSTITIAL_ID;

  return {
    // gating
    shouldShowAds,
    isFreePlan,
    completedFights,
    consentLoading,
    // preferences
    personalized,
    requestOptions,
    // ids
    bannerUnitId,
    interstitialUnitId,
    // environment
    sdkAvailable,
  } as const;
}
