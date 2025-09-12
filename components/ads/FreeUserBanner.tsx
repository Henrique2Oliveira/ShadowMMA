import Constants from 'expo-constants';
import React, { useEffect, useState } from 'react';
import { Platform, View } from 'react-native';

type Props = {
  unitId?: string;
};

export default function FreeUserBanner({ unitId }: Props) {
  const [Ads, setAds] = useState<any>(null);

  useEffect(() => {
    let mounted = true;
    // Only attempt on Android and outside Expo Go (needs Dev Client/Prod)
    if (Platform.OS === 'android' && Constants.appOwnership !== 'expo') {
      import('react-native-google-mobile-ads')
        .then(mod => { if (mounted) setAds(mod); })
        .catch(() => {});
    }
    return () => { mounted = false; };
  }, []);

  if (!Ads) return null;

  const bannerUnitId = unitId || (__DEV__ ? Ads.TestIds.BANNER : 'ca-app-pub-xxxxxxxx/zzzzzzzzzz');

  return (
    <View style={{ alignItems: 'center', marginVertical: 8 }}>
      <Ads.BannerAd
        unitId={bannerUnitId}
        size={Ads.BannerAdSize.ANCHORED_ADAPTIVE_BANNER}
        requestOptions={{
          requestNonPersonalizedAdsOnly: false,
          networkExtras: { collapsible: 'bottom' },
        }}
      />
    </View>
  );
}
