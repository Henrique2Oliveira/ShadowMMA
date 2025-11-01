import { useAds } from '@/hooks/useAds';
import Constants from 'expo-constants';
import React, { useEffect, useState } from 'react';
import { View } from 'react-native';

type Props = {
	bottomOffset?: number;
	inline?: boolean;
};

export default function TopBanner({ bottomOffset = 96, inline = false }: Props) {
	const { shouldShowAds, requestOptions, bannerUnitId, sdkAvailable } = useAds();
	const [AdsComponents, setAdsComponents] = useState<null | {
		BannerAd: any;
		BannerAdSize: any;
	}>(null);

	useEffect(() => {
		// Avoid importing the native module in Expo Go
		if (!sdkAvailable || Constants.appOwnership === 'expo') return;
		let mounted = true;
		(async () => {
			try {
				const mod = (await import('react-native-google-mobile-ads')) as any;
				if (mounted) setAdsComponents({ BannerAd: mod.BannerAd, BannerAdSize: mod.BannerAdSize });
			} catch {}
		})();
		return () => { mounted = false; };
	}, [sdkAvailable]);

	// Apply centralized gating
	if (!shouldShowAds || !AdsComponents) return null;
	const { BannerAd, BannerAdSize } = AdsComponents;
	const unitId = bannerUnitId;
	if (!unitId || unitId.includes('xxxxxxxx')) return null;

	return (
		<View
			pointerEvents="auto"
			style={inline
				? { alignItems: 'center', width: '100%', marginVertical: 8 }
				: { position: 'absolute', left: 0, right: 0, bottom: bottomOffset, alignItems: 'center', zIndex: 999 }}
		>
			<BannerAd
				unitId={unitId}
				size={BannerAdSize.ANCHORED_ADAPTIVE_BANNER}
				requestOptions={requestOptions}
			/>
		</View>
	);
}

