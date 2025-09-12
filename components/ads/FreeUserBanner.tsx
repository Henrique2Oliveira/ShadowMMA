import Constants from 'expo-constants';
import React, { useEffect, useState } from 'react';
import { View } from 'react-native';

type Props = {
	bottomOffset?: number;
};

export default function FreeUserBanner({ bottomOffset = 96 }: Props) {
	const [AdsComponents, setAdsComponents] = useState<null | {
		BannerAd: any;
		BannerAdSize: any;
		TestIds: any;
	}>(null);

	useEffect(() => {
		// Avoid importing the native module in Expo Go
		if (Constants.appOwnership === 'expo') return;
		let mounted = true;
		(async () => {
			try {
				const mod = (await import('react-native-google-mobile-ads')) as any;
				if (mounted) setAdsComponents({ BannerAd: mod.BannerAd, BannerAdSize: mod.BannerAdSize, TestIds: mod.TestIds });
			} catch {}
		})();
		return () => { mounted = false; };
	}, []);

	if (!AdsComponents) return null;
	const { BannerAd, BannerAdSize, TestIds } = AdsComponents;

	// Use Google test banner in dev; replace with your production banner unit ID when ready
	const unitId = __DEV__ ? TestIds.BANNER : 'ca-app-pub-xxxxxxxx/zzzzzzzzzz';
	if (!unitId || unitId.includes('xxxxxxxx')) {
		// No valid production unit configured yet
		if (!__DEV__) return null;
	}

	return (
		<View
			pointerEvents="auto"
			style={{ position: 'absolute', left: 0, right: 0, bottom: bottomOffset, alignItems: 'center', zIndex: 999 }}
		>
			<BannerAd
				unitId={unitId}
				size={BannerAdSize.ANCHORED_ADAPTIVE_BANNER}
				requestOptions={{ requestNonPersonalizedAdsOnly: false }}
			/>
		</View>
	);
}

